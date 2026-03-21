package com.example.academic_support_portal.issue.dto;

import com.example.academic_support_portal.issue.model.IssueTimelineType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class IssueCommentResponse {
  private String id;
  private String issueId;
  private String userId;
  private String userName;
  private String message;
  private IssueTimelineType type;
  private LocalDateTime createdAt;
}
