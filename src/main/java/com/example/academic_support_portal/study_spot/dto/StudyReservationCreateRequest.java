package com.example.academic_support_portal.study_spot.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Data;

@Data
public class StudyReservationCreateRequest {
  @NotNull(message = "Room ID is required")
  private String roomId;

  @NotNull(message = "Date is required")
  private LocalDate date;

  @NotNull(message = "Start time is required")
  private LocalTime startTime;

  @NotNull(message = "End time is required")
  private LocalTime endTime;
}
