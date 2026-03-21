package com.example.academic_support_portal.study_spot.dto;

import com.example.academic_support_portal.study_spot.model.StudyReservationStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BookingSummaryResponse {
  String id;
  String roomId;
  String roomName;
  LocalDate bookingDate;
  LocalTime startTime;
  LocalTime endTime;
  StudyReservationStatus status;
  boolean cancellable;
}
