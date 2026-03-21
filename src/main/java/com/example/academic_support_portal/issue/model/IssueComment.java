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
@Document(collection = "issue_comments")
public class IssueComment {

  @Id
  private String id;

  private String issueId;

  private String userId;

  private String userName;

  private String message;

  private IssueTimelineType type;

  private LocalDateTime createdAt;
}
