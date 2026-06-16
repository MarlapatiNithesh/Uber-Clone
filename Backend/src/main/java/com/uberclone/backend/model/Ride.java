package com.uberclone.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "rides")
public class Ride {

    @Id
    private String id;

    @DocumentReference
    private User user;

    @DocumentReference
    private Captain captain;

    private String pickup;
    private String destination;
    private Double fare;

    @Builder.Default
    private String status = "pending"; // pending, accepted, ongoing, completed, cancelled

    private Integer duration;
    private Double distance;
    private Double rating;
    private String paymentID;
    private String orderID;
    private String signature;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String otp;

    private java.time.LocalDateTime createdAt;
}
