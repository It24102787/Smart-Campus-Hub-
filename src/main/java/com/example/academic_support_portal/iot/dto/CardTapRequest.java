package com.example.academic_support_portal.iot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CardTapRequest {

  @NotBlank(message = "cardUid is required")
  private String cardUid;

  @NotBlank(message = "deviceId is required")
  private String deviceId;
}
