package com.example.academic_support_portal.study_spot.dto;

import com.example.academic_support_portal.study_spot.model.StudyReservationStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class StudyReservationResponse {
  String id;
  String userId;
  String roomId;
  String roomName;
  String building;
  LocalDate date;
  LocalTime startTime;
  LocalTime endTime;
  StudyReservationStatus status;
  LocalDateTime createdAt;
}
