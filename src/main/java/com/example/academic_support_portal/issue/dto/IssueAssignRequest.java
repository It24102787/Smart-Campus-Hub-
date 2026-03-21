package com.example.academic_support_portal.issue.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IssueAssignRequest {
  @NotBlank(message = "assignedToUserId is required")
  private String assignedToUserId;
}
