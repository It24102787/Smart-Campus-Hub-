package com.example.academic_support_portal.study_spot.dto;

import com.example.academic_support_portal.study_spot.model.BookingSource;
import com.example.academic_support_portal.study_spot.model.StudyReservationStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BookingResponse {
  String id;
  String studentId;
  String studentName;
  String studentEmail;
  String roomId;
  String roomName;
  LocalDate bookingDate;
  LocalTime startTime;
  LocalTime endTime;
  StudyReservationStatus status;
  LocalDateTime checkInTime;
  LocalDateTime checkOutTime;
  BookingSource source;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}
