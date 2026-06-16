package com.uberclone.backend.controller;

import com.uberclone.backend.model.User;
import com.uberclone.backend.security.JwtTokenProvider;
import com.uberclone.backend.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, Object> redisTemplate;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        User user = User.builder()
                .fullname(User.FullName.builder()
                        .firstname(request.getFullname().getFirstname())
                        .lastname(request.getFullname().getLastname())
                        .build())
                .email(request.getEmail())
                .password(request.getPassword())
                .build();

        try {
            User savedUser = userService.createUser(user);
            String token = jwtTokenProvider.generateToken(savedUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("token", token, "user", savedUser));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        User user = userService.findByEmail(request.getEmail()).orElse(null);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            // JS status code on invalid email/pass was 401 or 501 in user.controllers.js (line 40/46)
            // We return 401 Unauthorized here
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }

        String token = jwtTokenProvider.generateToken(user.getId());

        // Set token cookie
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(86400); // 24 hours
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of("token", token, "user", user));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestAttribute(value = "authenticatedUser", required = false) User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request, HttpServletResponse response) {
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
            // Blacklist for 24 hours (token expiration time)
            redisTemplate.opsForValue().set(blacklistKey, "true", Duration.ofHours(24));
        }

        return ResponseEntity.ok(Map.of("message", "Logged out successfullly"));
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
        @Size(min = 8, message = "password must be at least 8 character long")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FullNameDTO {
        @NotBlank(message = "First name must be at least 3 character long")
        @Size(min = 3, message = "First name must be at least 3 character long")
        private String firstname;
        private String lastname;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Invalid Email")
        @Email(message = "Invalid Email")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "password must be at least 8 character long")
        private String password;
    }
}
