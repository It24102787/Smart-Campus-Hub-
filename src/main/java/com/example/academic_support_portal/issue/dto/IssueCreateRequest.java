package com.example.academic_support_portal.issue.dto;

import com.example.academic_support_portal.issue.model.IssuePriority;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class IssueCreateRequest {

  @NotBlank(message = "Title is required")
  @Size(min = 5, message = "Title must be at least 5 characters")
  private String title;

  @NotBlank(message = "Category is required")
  private String category;

  @NotBlank(message = "Description is required")
  @Size(min = 10, message = "Description must be at least 10 characters")
  private String description;

  private String imageUrl;

  private String building;

  private String locationText;

  private Double latitude;

  private Double longitude;

  private IssuePriority priority;

  @AssertTrue(message = "Building or location text is required")
  public boolean isLocationProvided() {
    return (building != null && !building.isBlank())
        || (locationText != null && !locationText.isBlank());
  }
}
