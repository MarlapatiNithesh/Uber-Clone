package com.uberclone.backend.service;

import com.uberclone.backend.model.Captain;
import com.uberclone.backend.model.Ride;
import com.uberclone.backend.model.User;
import com.uberclone.backend.repository.RideRepository;
import com.uberclone.backend.repository.CaptainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RideService {

    private final RideRepository rideRepository;
    private final CaptainRepository captainRepository;
    private final MapService mapService;
    private final MongoTemplate mongoTemplate;

    public Map<String, Double> getFare(String pickup, String destination) {
        if (pickup == null || destination == null) {
            throw new IllegalArgumentException("Pickup and Destination are required");
        }

        try {
            Map<String, Object> distanceTime = mapService.getDistanceTime(pickup, destination);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> distance = (Map<String, Object>) distanceTime.get("distance");
            @SuppressWarnings("unchecked")
            Map<String, Object> duration = (Map<String, Object>) distanceTime.get("duration");

            if (distance == null || duration == null) {
                throw new RuntimeException("Invalid distance or duration from API");
            }

            double distanceInKm = ((Number) distance.get("value")).doubleValue() / 1000.0;
            double durationInMinutes = ((Number) duration.get("value")).doubleValue() / 60.0;

            Map<String, Double> baseFare = Map.of("auto", 30.0, "car", 50.0, "moto", 20.0);
            Map<String, Double> perKmRate = Map.of("auto", 10.0, "car", 15.0, "moto", 8.0);
            Map<String, Double> perMinuteRate = Map.of("auto", 2.0, "car", 3.0, "moto", 1.5);

            Map<String, Double> fares = new HashMap<>();
            fares.put("auto", baseFare.get("auto") + (distanceInKm * perKmRate.get("auto")) + (durationInMinutes * perMinuteRate.get("auto")));
            fares.put("car", baseFare.get("car") + (distanceInKm * perKmRate.get("car")) + (durationInMinutes * perMinuteRate.get("car")));
            fares.put("moto", baseFare.get("moto") + (distanceInKm * perKmRate.get("moto")) + (durationInMinutes * perMinuteRate.get("moto")));

            return fares;
        } catch (Exception e) {
            System.err.println("Error calculating fare: " + e.getMessage());
            throw new RuntimeException("Unable to calculate fare", e);
        }
    }

    private String getOtp(int length) {
        SecureRandom random = new SecureRandom();
        int max = (int) Math.pow(10, length);
        int otpVal = random.nextInt(max);
        return String.format("%0" + length + "d", otpVal);
    }

    @org.springframework.cache.annotation.Caching(evict = {
        @org.springframework.cache.annotation.CacheEvict(value = "rideHistory", allEntries = true),
        @org.springframework.cache.annotation.CacheEvict(value = "rideStats", allEntries = true)
    })
    public Ride createRide(User user, String pickup, String destination, String vehicleType) {
        if (user == null || pickup == null || destination == null || vehicleType == null) {
            throw new IllegalArgumentException("User, Pickup, Destination, and Vehicle Type are required");
        }

        Map<String, Double> fares = getFare(pickup, destination);
        if (!fares.containsKey(vehicleType)) {
            throw new IllegalArgumentException("Invalid vehicle type selected");
        }

        Ride ride = Ride.builder()
                .user(user)
                .pickup(pickup)
                .destination(destination)
                .otp(getOtp(6))
                .fare(fares.get(vehicleType))
                .status("pending")
                .createdAt(java.time.LocalDateTime.now())
                .build();

        return rideRepository.save(ride);
    }

    @org.springframework.cache.annotation.Caching(evict = {
        @org.springframework.cache.annotation.CacheEvict(value = "rideHistory", allEntries = true),
        @org.springframework.cache.annotation.CacheEvict(value = "rideStats", allEntries = true)
    })
    public Ride confirmRide(String rideId, String captainId) {
        if (rideId == null || captainId == null) {
            throw new IllegalArgumentException("Ride ID and Captain ID are required");
        }

        Captain captain = captainRepository.findById(captainId)
                .orElseThrow(() -> new RuntimeException("Captain not found"));

        // Atomic lock check: update only if current status is "pending"
        Query query = new Query(Criteria.where("id").is(rideId).and("status").is("pending"));
        Update update = new Update().set("status", "accepted").set("captain", captain);
        
        Ride ride = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                Ride.class
        );

        if (ride == null) {
            // Check if it exists at all
            Ride existing = rideRepository.findById(rideId).orElse(null);
            if (existing == null) {
                throw new RuntimeException("Ride not found");
            } else {
                throw new RuntimeException("Ride has already been accepted by another captain");
            }
        }

        return ride;
    }

    @org.springframework.cache.annotation.Caching(evict = {
        @org.springframework.cache.annotation.CacheEvict(value = "rideHistory", allEntries = true),
        @org.springframework.cache.annotation.CacheEvict(value = "rideStats", allEntries = true)
    })
    public Ride startRide(String rideId, String otp) {
        if (rideId == null || otp == null) {
            throw new IllegalArgumentException("Ride ID and OTP are required");
        }

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!"accepted".equals(ride.getStatus())) {
            throw new RuntimeException("Ride status is not accepted");
        }

        if (ride.getOtp() == null || !ride.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        ride.setStatus("ongoing");
        return rideRepository.save(ride);
    }

    @org.springframework.cache.annotation.Caching(evict = {
        @org.springframework.cache.annotation.CacheEvict(value = "rideHistory", allEntries = true),
        @org.springframework.cache.annotation.CacheEvict(value = "rideStats", allEntries = true)
    })
    public Ride endRide(String rideId, Captain captain) {
        if (rideId == null || captain == null) {
            throw new IllegalArgumentException("Ride ID and Captain are required");
        }

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getCaptain() == null || !ride.getCaptain().getId().equals(captain.getId())) {
            throw new RuntimeException("Ride not found for this captain");
        }

        if (!"ongoing".equals(ride.getStatus())) {
            throw new RuntimeException("Ride status is not ongoing");
        }

        ride.setStatus("completed");
        return rideRepository.save(ride);
    }

    @org.springframework.cache.annotation.Cacheable(value = "rideHistory", key = "#user.id + '-' + #pageable.pageNumber", unless = "#result == null")
    public java.util.List<Ride> getUserRideHistory(User user, org.springframework.data.domain.Pageable pageable) {
        return rideRepository.findByUser(user, pageable).getContent();
    }

    @org.springframework.cache.annotation.Cacheable(value = "rideHistory", key = "#captain.id + '-' + #pageable.pageNumber", unless = "#result == null")
    public java.util.List<Ride> getCaptainRideHistory(Captain captain, org.springframework.data.domain.Pageable pageable) {
        return rideRepository.findByCaptain(captain, pageable).getContent();
    }

    @org.springframework.cache.annotation.Cacheable(value = "rideStats", key = "#user.id", unless = "#result == null")
    public java.util.Map<String, Object> getUserRideStats(User user) {
        java.util.List<Ride> rides = rideRepository.findByUser(user);
        long completedCount = rides.stream().filter(r -> "completed".equals(r.getStatus())).count();
        double totalSpend = rides.stream().filter(r -> "completed".equals(r.getStatus())).mapToDouble(r -> r.getFare() != null ? r.getFare() : 0.0).sum();
        return java.util.Map.of("completedRides", completedCount, "totalSpend", totalSpend);
    }

    @org.springframework.cache.annotation.Cacheable(value = "rideStats", key = "#captain.id", unless = "#result == null")
    public java.util.Map<String, Object> getCaptainRideStats(Captain captain) {
        java.util.List<Ride> rides = rideRepository.findByCaptain(captain);
        java.util.List<Ride> completedRides = rides.stream()
                .filter(r -> "completed".equals(r.getStatus()))
                .collect(java.util.stream.Collectors.toList());

        long completedCount = completedRides.size();
        double totalEarnings = completedRides.stream()
                .mapToDouble(r -> r.getFare() != null ? r.getFare() : 0.0)
                .sum();

        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        // 1. Daily Stats (Last 7 Days)
        java.util.List<java.util.Map<String, Object>> dailyStats = new java.util.ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate date = now.minusDays(i).toLocalDate();
            double earnings = completedRides.stream()
                    .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().toLocalDate().equals(date))
                    .mapToDouble(r -> r.getFare() != null ? r.getFare() : 0.0)
                    .sum();
            long count = completedRides.stream()
                    .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().toLocalDate().equals(date))
                    .count();
            dailyStats.add(java.util.Map.of(
                "label", date.getDayOfWeek().name().substring(0, 3), 
                "earnings", earnings,
                "rides", (double) count
            ));
        }

        // 2. Weekly Stats (Last 4 Weeks)
        java.util.List<java.util.Map<String, Object>> weeklyStats = new java.util.ArrayList<>();
        for (int i = 3; i >= 0; i--) {
            java.time.LocalDate end = now.minusWeeks(i).toLocalDate();
            java.time.LocalDate start = end.minusDays(6);
            double earnings = completedRides.stream()
                    .filter(r -> {
                        if (r.getCreatedAt() == null) return false;
                        java.time.LocalDate rDate = r.getCreatedAt().toLocalDate();
                        return !rDate.isBefore(start) && !rDate.isAfter(end);
                    })
                    .mapToDouble(r -> r.getFare() != null ? r.getFare() : 0.0)
                    .sum();
            long count = completedRides.stream()
                    .filter(r -> {
                        if (r.getCreatedAt() == null) return false;
                        java.time.LocalDate rDate = r.getCreatedAt().toLocalDate();
                        return !rDate.isBefore(start) && !rDate.isAfter(end);
                    })
                    .count();
            weeklyStats.add(java.util.Map.of(
                "label", "Wk " + (4 - i), 
                "earnings", earnings,
                "rides", (double) count
            ));
        }

        // 3. Monthly Stats (Last 6 Months)
        java.util.List<java.util.Map<String, Object>> monthlyStats = new java.util.ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            java.time.YearMonth yearMonth = java.time.YearMonth.from(now.minusMonths(i));
            double earnings = completedRides.stream()
                    .filter(r -> r.getCreatedAt() != null && java.time.YearMonth.from(r.getCreatedAt()).equals(yearMonth))
                    .mapToDouble(r -> r.getFare() != null ? r.getFare() : 0.0)
                    .sum();
            long count = completedRides.stream()
                    .filter(r -> r.getCreatedAt() != null && java.time.YearMonth.from(r.getCreatedAt()).equals(yearMonth))
                    .count();
            monthlyStats.add(java.util.Map.of(
                "label", yearMonth.getMonth().name().substring(0, 3), 
                "earnings", earnings,
                "rides", (double) count
            ));
        }

        // 4. Yearly Stats (Last 3 Years)
        java.util.List<java.util.Map<String, Object>> yearlyStats = new java.util.ArrayList<>();
        for (int i = 2; i >= 0; i--) {
            int year = now.minusYears(i).getYear();
            double earnings = completedRides.stream()
                    .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().getYear() == year)
                    .mapToDouble(r -> r.getFare() != null ? r.getFare() : 0.0)
                    .sum();
            long count = completedRides.stream()
                    .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().getYear() == year)
                    .count();
            yearlyStats.add(java.util.Map.of(
                "label", String.valueOf(year), 
                "earnings", earnings,
                "rides", (double) count
            ));
        }

        return java.util.Map.of(
            "completedRides", completedCount, 
            "totalSpend", totalEarnings,
            "daily", dailyStats,
            "weekly", weeklyStats,
            "monthly", monthlyStats,
            "yearly", yearlyStats
        );
    }
}
