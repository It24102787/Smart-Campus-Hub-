package com.example.academic_support_portal.study_circle.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "study_circles")
// Core study-circle document used for discovery and membership workflows.
public class StudyCircle {
  @Id
  private String id;

  private String title;
  private String description;
  private String subject;

  private String createdByUserId;
  private String createdByName;

  private String meetingDay;
  private String meetingTime;
  private Integer maxMembers;

  // Soft-delete/discovery flag; inactive circles remain in DB but are hidden from active listings.
  @Builder.Default
  private boolean isActive = true;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
