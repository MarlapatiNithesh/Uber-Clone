package com.uberclone.backend.service;

import com.uberclone.backend.model.Captain;
import com.uberclone.backend.repository.CaptainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CaptainService {

    private final CaptainRepository captainRepository;
    private final PasswordEncoder passwordEncoder;

    @CachePut(value = "captains", key = "#result.id")
    public Captain createCaptain(Captain captain) {
        if (captain.getFullname() == null || captain.getFullname().getFirstname() == null ||
                captain.getEmail() == null || captain.getPassword() == null ||
                captain.getVehicle() == null || captain.getVehicle().getColor() == null ||
                captain.getVehicle().getPlate() == null || captain.getVehicle().getCapacity() == null ||
                captain.getVehicle().getVehicleType() == null) {
            throw new IllegalArgumentException("All fields are required");
        }

        Optional<Captain> existing = captainRepository.findByEmail(captain.getEmail());
        if (existing.isPresent()) {
            throw new IllegalStateException("Captain already exists");
        }

        captain.setPassword(passwordEncoder.encode(captain.getPassword()));
        return captainRepository.save(captain);
    }

    public Optional<Captain> findByEmail(String email) {
        return captainRepository.findByEmail(email);
    }

    @Cacheable(value = "captains", key = "#id", unless = "#result == null")
    public Optional<Captain> findById(String id) {
        return captainRepository.findById(id);
    }

    @CacheEvict(value = "captains", key = "#captain.id")
    public Captain save(Captain captain) {
        return captainRepository.save(captain);
    }
}
