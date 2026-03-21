package com.example.academic_support_portal.issue.dto;

import com.example.academic_support_portal.issue.model.IssuePriority;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class IssueUpdateRequest {

  @Size(min = 5, message = "Title must be at least 5 characters")
  private String title;

  private String category;

  @Size(min = 10, message = "Description must be at least 10 characters")
  private String description;

  private String imageUrl;

  private String building;

  private String locationText;

  private Double latitude;

  private Double longitude;

  private IssuePriority priority;

  private String adminNotes;
}
