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
@Document(collection = "sensor_readings")
public class SensorReading {

  @Id
  private String id;

  @NotBlank(message = "Room ID is required")
  private String roomId;

  @NotBlank(message = "Metric is required")
  private String metric; // TEMPERATURE, NOISE, LIGHT, OCCUPANCY

  @NotNull(message = "Reading value is required")
  private double value;

  @NotBlank(message = "Unit is required")
  private String unit;

  @NotNull(message = "Timestamp is required")
  private LocalDateTime timestamp;
}
