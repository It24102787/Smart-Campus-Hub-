package com.example.academic_support_portal.iot.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CardTapResponse {
  String studentName;
  String roomName;
  String action;
  Integer currentOccupancy;
  Double occupancyPercent;
}
