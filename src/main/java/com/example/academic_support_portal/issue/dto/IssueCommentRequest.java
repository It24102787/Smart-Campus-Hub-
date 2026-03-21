package com.example.academic_support_portal.issue.dto;

import com.example.academic_support_portal.issue.model.IssueTimelineType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IssueCommentRequest {

  @NotBlank(message = "message is required")
  private String message;

  private IssueTimelineType type;
}
