package com.example.academic_support_portal.study_circle.dto;

import com.example.academic_support_portal.study_circle.model.StudyCircleRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class StudyCircleMemberResponse {
  private String id;
  private String circleId;
  private String userId;
  private String userName;
  private String userEmail;
  private LocalDateTime joinedAt;
  private StudyCircleRole role;
}
