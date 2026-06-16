package com.uberclone.backend.controller;

import com.uberclone.backend.model.Captain;
import com.uberclone.backend.security.JwtTokenProvider;
import com.uberclone.backend.service.CaptainService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/captains")
@RequiredArgsConstructor
public class CaptainController {

    private final CaptainService captainService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, Object> redisTemplate;

    @PostMapping("/register")
    public ResponseEntity<?> registerCaptain(@Valid @RequestBody RegisterRequest request) {
        Captain captain = Captain.builder()
                .fullname(Captain.FullName.builder()
                        .firstname(request.getFullname().getFirstname())
                        .lastname(request.getFullname().getLastname())
                        .build())
                .email(request.getEmail())
                .password(request.getPassword())
                .vehicle(Captain.Vehicle.builder()
                        .color(request.getVehicle().getColor())
                        .plate(request.getVehicle().getPlate())
                        .capacity(request.getVehicle().getCapacity())
                        .vehicleType(request.getVehicle().getVehicleType())
                        .build())
                .build();

        try {
            Captain savedCaptain = captainService.createCaptain(captain);
            String token = jwtTokenProvider.generateToken(savedCaptain.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("token", token, "captain", savedCaptain));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginCaptain(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        Captain captain = captainService.findByEmail(request.getEmail()).orElse(null);
        if (captain == null || !passwordEncoder.matches(request.getPassword(), captain.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }

        String token = jwtTokenProvider.generateToken(captain.getId());

        // Set token cookie
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(86400); // 24 hours
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of("token", token, "captain", captain));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getCaptainProfile(@RequestAttribute(value = "authenticatedCaptain", required = false) Captain captain) {
        if (captain == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(captain);
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logoutCaptain(HttpServletRequest request, HttpServletResponse response) {
        // Clear cookie
        Cookie cookie = new Cookie("token", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        // Blacklist token in Redis
        String token = getJwtFromRequest(request);
        if (StringUtils.hasText(token)) {
            String blacklistKey = "blacklist:" + token;
            redisTemplate.opsForValue().set(blacklistKey, "true", Duration.ofHours(24));
        }

        return ResponseEntity.ok(Map.of("message", "logout successfully"));
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("token".equals(c.getName())) {
                    return c.getValue();
                }
            }
        }
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    // DTO Classes
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @Valid
        private FullNameDTO fullname;

        @NotBlank(message = "Invalid Email")
        @Email(message = "Invalid Email")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        private String password;

        @Valid
        @NotNull(message = "Vehicle details are required")
        private VehicleDTO vehicle;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FullNameDTO {
        @NotBlank(message = "First name must be at least 3 characters long")
        @Size(min = 3, message = "First name must be at least 3 characters long")
        private String firstname;
        private String lastname;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VehicleDTO {
        @NotBlank(message = "Color must be at least 3 characters long")
        @Size(min = 3, message = "Color must be at least 3 characters long")
        private String color;

        @NotBlank(message = "Plate must be at least 3 characters long")
        @Size(min = 3, message = "Plate must be at least 3 characters long")
        private String plate;

        @NotNull(message = "Capacity must be at least 1")
        @Min(value = 1, message = "Capacity must be at least 1")
        private Integer capacity;

        @NotBlank(message = "Vehicle Type must be at least 3 characters long")
        @Size(min = 3, message = "Vehicle Type must be at least 3 characters long")
        private String vehicleType; // car, moto, auto
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Invalid Email")
        @Email(message = "Invalid Email")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        private String password;
    }
}
