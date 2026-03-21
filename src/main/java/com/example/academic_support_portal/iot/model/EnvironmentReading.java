package com.example.academic_support_portal.iot.model;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "environment_readings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentReading {

  @Id
  private String id;

  private String roomId;

  private String sensorDeviceId;

  private Double temperature;

  private Integer occupancyCount;

  private Double occupancyPercent;

  @Default
  private LocalDateTime recordedAt = LocalDateTime.now();
}
