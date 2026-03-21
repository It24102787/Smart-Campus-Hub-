package com.example.academic_support_portal.issue.model;

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
@Document(collection = "issues")
public class CampusIssue {

  @Id
  private String id;

  private String title;

  private String category;

  private String description;

  private String imageUrl;

  private String building;

  private String locationText;

  private Double latitude;

  private Double longitude;

  private IssueStatus status;

  private IssuePriority priority;

  private String createdByUserId;

  private String createdByName;

  private String assignedToUserId;

  private String assignedToName;

  private String adminNotes;

  private LocalDateTime createdAt;

  private LocalDateTime updatedAt;
}
