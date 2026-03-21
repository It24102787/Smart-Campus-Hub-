package com.example.academic_support_portal.study_circle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateStudyCircleRequest {
  @NotBlank(message = "Title is required")
  @Size(max = 120, message = "Title must be at most 120 characters")
  private String title;

  @NotBlank(message = "Description is required")
  @Size(max = 1000, message = "Description must be at most 1000 characters")
  private String description;

  @NotBlank(message = "Subject is required")
  @Size(max = 120, message = "Subject must be at most 120 characters")
  private String subject;

  @Size(max = 30, message = "Meeting day must be at most 30 characters")
  private String meetingDay;

  @Size(max = 20, message = "Meeting time must be at most 20 characters")
  private String meetingTime;

  private Integer maxMembers;
}
