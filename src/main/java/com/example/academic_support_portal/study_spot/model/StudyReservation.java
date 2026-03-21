package com.example.academic_support_portal.study_spot.model;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "room_bookings")
public class StudyReservation {

  @Id
  private String id;

  @NotNull(message = "Student ID is required")
  private String studentId;

  private String studentName;

  private String studentEmail;

  @NotNull(message = "Room ID is required")
  private String roomId;

  private String roomName;

  @NotNull(message = "Booking date is required")
  private LocalDate bookingDate;

  @NotNull(message = "Start time is required")
  private LocalTime startTime;

  @NotNull(message = "End time is required")
  private LocalTime endTime;

  @NotNull(message = "Status is required")
  private StudyReservationStatus status;

  private LocalDateTime checkInTime;

  private LocalDateTime checkOutTime;

  @Default
  private BookingSource source = BookingSource.APP;

  @Default
  private LocalDateTime createdAt = LocalDateTime.now();

  @Default
  private LocalDateTime updatedAt = LocalDateTime.now();
}
