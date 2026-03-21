package com.example.academic_support_portal.tutor.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tutoring_sessions")
public class TutoringSession {

  @Id
  private String id;

  private String tutorId;

  private String tutorUserId;

  private String tutorName;

  private String tutorEmail;

  private String studentId;

  private String studentName;

  private String studentEmail;

  @NotBlank(message = "Subject is required")
  private String subject;

  @NotBlank(message = "Date is required")
  private String date;

  @NotBlank(message = "Time is required")
  private String time;

  @NotBlank(message = "Mode is required")
  private String mode; // Online, On-Campus

  private String note;

  private String tutorNote;

  private String joinLink;

  private String status; // REQUESTED, CONFIRMED, CANCELLED, COMPLETED
}
