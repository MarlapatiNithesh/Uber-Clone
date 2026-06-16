package com.uberclone.backend.security;

import com.uberclone.backend.model.Captain;
import com.uberclone.backend.model.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final int MAX_REQUESTS_PER_MINUTE = 60;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Skip rate limiting for static endpoints or basic checks if needed
        String path = request.getRequestURI();
        if (path.equals("/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String identifier = getClientIdentifier(request);
        String redisKey = "rate_limit:" + identifier;

        try {
            Long currentRequests = redisTemplate.opsForValue().increment(redisKey, 1);
            
            if (currentRequests != null && currentRequests == 1) {
                // Set TTL of 1 minute on first request
                redisTemplate.expire(redisKey, Duration.ofMinutes(1));
            }

            if (currentRequests != null && currentRequests > MAX_REQUESTS_PER_MINUTE) {
                response.setStatus(429); // HTTP 429 Too Many Requests
                response.setContentType("application/json");
                response.getWriter().write("{\"message\": \"Too many requests. Please try again after a minute.\"}");
                return;
            }
        } catch (Exception e) {
            // Log warning but let the request pass in case Redis is down
            System.err.println("Rate limiting filter Redis error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIdentifier(HttpServletRequest request) {
        // Try to identify using authenticated user/captain
        Object principal = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getPrincipal()
                : null;

        if (principal instanceof User) {
            return "user:" + ((User) principal).getEmail();
        } else if (principal instanceof Captain) {
            return "captain:" + ((Captain) principal).getEmail();
        }

        // Fallback to Client IP address
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        return "ip:" + ipAddress;
    }
}
