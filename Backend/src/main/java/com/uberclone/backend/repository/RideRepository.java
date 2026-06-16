package com.uberclone.backend.repository;

import com.uberclone.backend.model.Ride;
import com.uberclone.backend.model.User;
import com.uberclone.backend.model.Captain;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RideRepository extends MongoRepository<Ride, String> {
    Page<Ride> findByUser(User user, Pageable pageable);
    Page<Ride> findByCaptain(Captain captain, Pageable pageable);
    List<Ride> findByUser(User user);
    List<Ride> findByCaptain(Captain captain);
}
