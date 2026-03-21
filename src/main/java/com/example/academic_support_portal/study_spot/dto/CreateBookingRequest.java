package com.example.academic_support_portal.study_spot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Data;

@Data
public class CreateBookingRequest {

  @NotBlank(message = "roomId is required")
  private String roomId;

  @NotNull(message = "bookingDate is required")
  private LocalDate bookingDate;

  @NotNull(message = "startTime is required")
  private LocalTime startTime;

  @NotNull(message = "endTime is required")
  private LocalTime endTime;
}
