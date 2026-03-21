package com.example.academic_support_portal.tutor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TutorRatingSummaryResponse {
  private String tutorId;
  private Double averageRating;
  private Integer totalReviews;
}
