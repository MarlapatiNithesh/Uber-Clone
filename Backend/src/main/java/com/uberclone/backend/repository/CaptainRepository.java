package com.uberclone.backend.repository;

import com.uberclone.backend.model.Captain;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CaptainRepository extends MongoRepository<Captain, String> {
    Optional<Captain> findByEmail(String email);

    // Geospatial query using longitude, latitude, and radius in radians (radius / 6371.0)
    // Mongoose code: $centerSphere: [[lat, lng], radius / 6371]
    // We match that pattern here
    @Query("{ 'location' : { $geoWithin : { $centerSphere : [ [ ?1, ?0 ], ?2 ] } } }")
    List<Captain> findCaptainsInRadius(Double lat, Double lng, Double radiusInRadians);
}
