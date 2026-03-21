package com.example.academic_support_portal.tutor.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TutorReviewRequest {
  @NotNull(message = "Rating is required")
  @Min(value = 1, message = "Rating must be at least 1")
  @Max(value = 5, message = "Rating must be at most 5")
  private Integer rating;

  private String comment;
}
