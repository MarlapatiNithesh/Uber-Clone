package com.uberclone.backend.controller;

import com.uberclone.backend.model.Captain;
import com.uberclone.backend.model.Ride;
import com.uberclone.backend.model.User;
import com.uberclone.backend.service.MapService;
import com.uberclone.backend.service.RideService;
import com.uberclone.backend.socket.SocketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;
    private final MapService mapService;
    private final SocketService socketService;

    @PostMapping("/create")
    public ResponseEntity<?> createRide(
            @RequestAttribute("authenticatedUser") User user,
            @Valid @RequestBody CreateRideRequest request) {
        
        try {
            Ride ride = rideService.createRide(user, request.getPickup(), request.getDestination(), request.getVehicleType());
            
            // Asynchronously look up captains and send socket events to nearby captains
            new Thread(() -> {
                try {
                    Map<String, Double> pickupCoordinates = mapService.getCoordinatesFromAddress(request.getPickup());
                    if (pickupCoordinates != null && pickupCoordinates.containsKey("lat") && pickupCoordinates.containsKey("lng")) {
                        Double lat = pickupCoordinates.get("lat");
                        Double lng = pickupCoordinates.get("lng");
                        
                        List<Captain> captainsInRadius = mapService.getCaptainsInTheRadius(lat, lng, 10.0);
                        
                        // Send message to each captain
                        // Hide OTP for captain messages by copying or clearing
                        Ride rideForCaptains = Ride.builder()
                                .id(ride.getId())
                                .user(ride.getUser())
                                .pickup(ride.getPickup())
                                .destination(ride.getDestination())
                                .fare(ride.getFare())
                                .status(ride.getStatus())
                                .otp("") // Clear OTP
                                .build();
                        
                        for (Captain captain : captainsInRadius) {
                            if (captain.getSocketId() != null && !captain.getSocketId().isEmpty()) {
                                System.out.println("Notifying captain: " + captain.getEmail() + " via socket: " + captain.getSocketId());
                                socketService.sendMessageToSocketId(captain.getSocketId(), "new-ride", rideForCaptains);
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error notifying nearby captains: " + e.getMessage());
                }
            }).start();

            return ResponseEntity.status(HttpStatus.CREATED).body(ride);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error", "error", e.getMessage()));
        }
    }

    @GetMapping("/get-fare")
    public ResponseEntity<?> getFare(
            @RequestParam @Size(min = 3, message = "Invalid pickup") String pickup,
            @RequestParam @Size(min = 3, message = "Invalid destination") String destination) {
        try {
            Map<String, Double> fares = rideService.getFare(pickup, destination);
            Map<String, Object> distanceTime = mapService.getDistanceTime(pickup, destination);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> distance = (Map<String, Object>) distanceTime.get("distance");
            @SuppressWarnings("unchecked")
            Map<String, Object> duration = (Map<String, Object>) distanceTime.get("duration");
            
            Map<String, Object> enrichedResponse = new java.util.HashMap<>();
            enrichedResponse.putAll(fares);
            enrichedResponse.put("distance", distance != null ? distance.get("text") : "N/A");
            enrichedResponse.put("duration", duration != null ? duration.get("text") : "N/A");
            
            return ResponseEntity.ok(enrichedResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch fare", "error", e.getMessage()));
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmRide(@Valid @RequestBody ConfirmRideRequest request) {
        try {
            Ride ride = rideService.confirmRide(request.getRideId(), request.getCaptainId());
            
            // Notify user
            if (ride.getUser() != null && ride.getUser().getSocketId() != null) {
                socketService.sendMessageToSocketId(ride.getUser().getSocketId(), "ride-confirmed", ride);
            }
            
            // Notify other captains in the radius that the ride has been accepted/taken
            new Thread(() -> {
                try {
                    Map<String, Double> pickupCoordinates = mapService.getCoordinatesFromAddress(ride.getPickup());
                    if (pickupCoordinates != null && pickupCoordinates.containsKey("lat") && pickupCoordinates.containsKey("lng")) {
                        Double lat = pickupCoordinates.get("lat");
                        Double lng = pickupCoordinates.get("lng");
                        List<Captain> captainsInRadius = mapService.getCaptainsInTheRadius(lat, lng, 10.0);
                        for (Captain cap : captainsInRadius) {
                            if (!cap.getId().equals(request.getCaptainId()) && cap.getSocketId() != null && !cap.getSocketId().isEmpty()) {
                                System.out.println("Notifying captain: " + cap.getEmail() + " that ride " + ride.getId() + " is taken.");
                                socketService.sendMessageToSocketId(cap.getSocketId(), "ride-taken", Map.of("rideId", ride.getId()));
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error notifying other captains about taken ride: " + e.getMessage());
                }
            }).start();
            
            return ResponseEntity.ok(ride);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/start-ride")
    public ResponseEntity<?> startRide(
            @RequestParam @NotBlank(message = "Invalid ride Id") String rideId,
            @RequestParam @Pattern(regexp = "^\\d{6}$", message = "Invalid otp") String otp) {
        try {
            Ride ride = rideService.startRide(rideId, otp);
            
            // Notify user
            if (ride.getUser() != null && ride.getUser().getSocketId() != null) {
                socketService.sendMessageToSocketId(ride.getUser().getSocketId(), "ride-started", ride);
            }
            
            return ResponseEntity.ok(ride);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/end-ride")
    public ResponseEntity<?> endRide(
            @RequestAttribute("authenticatedCaptain") Captain captain,
            @Valid @RequestBody EndRideRequest request) {
        try {
            Ride ride = rideService.endRide(request.getRideId(), captain);
            
            // Notify user
            if (ride.getUser() != null && ride.getUser().getSocketId() != null) {
                socketService.sendMessageToSocketId(ride.getUser().getSocketId(), "ride-ended", ride);
            }
            
            return ResponseEntity.ok(ride);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getRideHistory(
            @RequestAttribute(value = "authenticatedUser", required = false) User user,
            @RequestAttribute(value = "authenticatedCaptain", required = false) Captain captain,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        try {
            org.springframework.data.domain.Pageable pageable = 
                    org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending());
            
            if (user != null) {
                java.util.List<Ride> history = rideService.getUserRideHistory(user, pageable);
                return ResponseEntity.ok(history);
            } else if (captain != null) {
                java.util.List<Ride> history = rideService.getCaptainRideHistory(captain, pageable);
                return ResponseEntity.ok(history);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch ride history", "error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getRideStats(
            @RequestAttribute(value = "authenticatedUser", required = false) User user,
            @RequestAttribute(value = "authenticatedCaptain", required = false) Captain captain) {
        try {
            if (user != null) {
                return ResponseEntity.ok(rideService.getUserRideStats(user));
            } else if (captain != null) {
                return ResponseEntity.ok(rideService.getCaptainRideStats(captain));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch ride stats", "error", e.getMessage()));
        }
    }

    // DTOs
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRideRequest {
        @NotBlank(message = "Invalid pickup address")
        @Size(min = 3, message = "Invalid pickup address")
        private String pickup;

        @NotBlank(message = "Invalid destination address")
        @Size(min = 3, message = "Invalid destination address")
        private String destination;

        @NotBlank(message = "Invalid vehicle Type")
        @Pattern(regexp = "auto|car|moto", message = "Invalid vehicle Type")
        private String vehicleType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConfirmRideRequest {
        @NotBlank(message = "invalid ride id")
        private String rideId;

        @NotBlank(message = "invalid captain id")
        private String captainId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EndRideRequest {
        @NotBlank(message = "Invalid Ride Id")
        private String rideId;
    }
}
