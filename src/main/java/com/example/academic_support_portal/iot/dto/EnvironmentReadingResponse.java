package com.example.academic_support_portal.iot.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class EnvironmentReadingResponse {
  String roomId;
  String roomName;
  String sensorDeviceId;
  Double temperature;
  Double occupancyPercent;
  Integer currentOccupancy;
  String status;
}
