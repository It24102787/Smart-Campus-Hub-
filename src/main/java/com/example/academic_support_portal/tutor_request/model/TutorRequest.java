package com.example.academic_support_portal.tutor_request.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tutor_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// Mongo document storing one tutoring help request submitted by a student.
public class TutorRequest {
  @Id
  private String id;

  private String studentId;

  @NotBlank(message = "Student name is required")
  private String studentName;

  @NotBlank(message = "Student email is required")
  @Email(message = "Student email must be valid")
  private String studentEmail;

  private String tutorId;

  @NotBlank(message = "Tutor name is required")
  private String tutorName;

  @NotBlank(message = "Tutor email is required")
  @Email(message = "Tutor email must be valid")
  private String tutorEmail;

  @NotBlank(message = "Subject is required")
  private String subject;

  @NotBlank(message = "Message is required")
  private String message;

  @NotBlank(message = "Preferred day/date is required")
  private String preferredDay;

  @NotBlank(message = "Preferred start time is required")
  private String preferredTimeFrom;

  @NotBlank(message = "Preferred end time is required")
  private String preferredTimeTo;

  // Request lifecycle status used in student/tutor dashboards.
  private String status; // PENDING, ACCEPTED, REJECTED

  private String sessionDateTime;
  private String joinLink;

  private String createdAt;
  private String updatedAt;
}
