package com.example.academic_support_portal.tutor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TutorReviewResponse {
  private String id;
  private String tutorId;
  private String studentId;
  private Integer rating;
  private String comment;
  private Instant createdAt;
  private Instant updatedAt;
}
