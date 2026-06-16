package com.uberclone.backend.service;

import com.uberclone.backend.model.User;
import com.uberclone.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @CachePut(value = "users", key = "#result.id")
    public User createUser(User user) {
        if (user.getFullname() == null || user.getFullname().getFirstname() == null ||
                user.getEmail() == null || user.getPassword() == null) {
            throw new IllegalArgumentException("All fields are required");
        }

        Optional<User> existing = userRepository.findByEmail(user.getEmail());
        if (existing.isPresent()) {
            throw new IllegalStateException("User already exist");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Cacheable(value = "users", key = "#id", unless = "#result == null")
    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    @CacheEvict(value = "users", key = "#user.id")
    public User save(User user) {
        return userRepository.save(user);
    }
}
