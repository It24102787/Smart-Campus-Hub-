package com.example.academic_support_portal.environment.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "alerts")
public class Alert {

  @Id
  private String id;

  @NotBlank(message = "User ID is required")
  private String userId;

  @NotBlank(message = "Room ID is required")
  private String roomId;

  @NotBlank(message = "Metric is required")
  private String metric; // TEMPERATURE, NOISE, OCCUPANCY, CO2

  @NotNull(message = "Threshold is required")
  private double threshold;

  @NotBlank(message = "Condition is required")
  private String condition; // ABOVE, BELOW, EQUALS

  private boolean active;

  private LocalDateTime createdAt;
}
