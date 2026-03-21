package com.example.academic_support_portal.tutor.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tutor_reviews")
public class TutorReview {
  @Id
  private String id;

  @NotBlank(message = "Tutor ID is required")
  private String tutorId;

  @NotBlank(message = "Student ID is required")
  private String studentId;

  @Min(value = 1, message = "Rating must be at least 1")
  @Max(value = 5, message = "Rating must be at most 5")
  private Integer rating;

  private String comment;
  private Instant createdAt;
  private Instant updatedAt;
}
