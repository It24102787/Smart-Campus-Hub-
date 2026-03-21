package com.example.academic_support_portal.issue.dto;

import com.example.academic_support_portal.issue.model.IssueStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IssueStatusUpdateRequest {

  @NotNull(message = "status is required")
  private IssueStatus status;

  private String note;

  private String adminNotes;
}
