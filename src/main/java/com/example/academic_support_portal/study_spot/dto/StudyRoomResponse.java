package com.example.academic_support_portal.study_spot.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class StudyRoomResponse {
  String id;
  String name;
  String roomName;
  String building;
  String floor;
  String zone;
  Integer capacity;
  String status;
  String deviceId;
  String sensorDeviceId;
  Integer currentOccupancy;
  Double occupancyPercent;
  Double temperature;
  String temperatureStatus;
  String description;
  String imageUrl;
  String qrCodeValue;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}
