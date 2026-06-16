package com.uberclone.backend.controller;

import com.uberclone.backend.service.MapService;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/maps")
@RequiredArgsConstructor
@Validated
public class MapController {

    private final MapService mapService;

    @GetMapping("/get-coordinates")
    public ResponseEntity<?> getCoordinates(
            @RequestParam @Size(min = 3, message = "Address must be at least 3 characters long") String address) {
        try {
            Map<String, Double> coordinates = mapService.getCoordinatesFromAddress(address);
            return ResponseEntity.ok(coordinates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Coordinates not found"));
        }
    }

    @GetMapping("/get-distance-time")
    public ResponseEntity<?> getDistanceTime(
            @RequestParam @Size(min = 3, message = "Origin must be at least 3 characters long") String origin,
            @RequestParam @Size(min = 3, message = "Destination must be at least 3 characters long") String destination) {
        try {
            Map<String, Object> distanceTime = mapService.getDistanceTime(origin, destination);
            return ResponseEntity.ok(distanceTime);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Distance/Time not found"));
        }
    }

    @GetMapping("/get-suggestions")
    public ResponseEntity<?> getSuggestions(
            @RequestParam @Size(min = 3, message = "Input must be at least 3 characters long") String input) {
        try {
            List<Map<String, Object>> suggestions = mapService.getAutoCompleteSuggestions(input);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Suggestions not found"));
        }
    }

    @GetMapping("/get-route")
    public ResponseEntity<?> getRoute(
            @RequestParam @Size(min = 3, message = "Pickup must be at least 3 characters long") String pickup,
            @RequestParam @Size(min = 3, message = "Destination must be at least 3 characters long") String destination) {
        try {
            Map<String, Object> route = mapService.getRoute(pickup, destination);
            return ResponseEntity.ok(route);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Route not found"));
        }
    }

    @GetMapping("/reverse-geocode")
    public ResponseEntity<?> reverseGeocode(
            @RequestParam Double lat,
            @RequestParam Double lng) {
        try {
            Map<String, String> address = mapService.getAddressFromCoordinates(lat, lng);
            return ResponseEntity.ok(address);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Address not found"));
        }
    }
}
