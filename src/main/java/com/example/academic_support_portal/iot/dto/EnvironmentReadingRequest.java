package com.example.academic_support_portal.iot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EnvironmentReadingRequest {

  @NotBlank(message = "sensorDeviceId is required")
  private String sensorDeviceId;

  @NotNull(message = "temperature is required")
  private Double temperature;

  @NotNull(message = "occupancyCount is required")
  private Integer occupancyCount;
}
