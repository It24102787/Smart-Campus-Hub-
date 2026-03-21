package com.example.academic_support_portal.dashboard.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class EnvironmentDashboardResponse {
  Double averageTemperature;
  Integer totalOccupancy;
  Long availableRooms;
  Long occupiedRooms;
}
