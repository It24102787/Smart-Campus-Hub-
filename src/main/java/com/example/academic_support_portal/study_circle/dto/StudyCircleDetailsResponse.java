package com.example.academic_support_portal.study_circle.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class StudyCircleDetailsResponse {
  private String id;
  private String title;
  private String description;
  private String subject;
  private String createdByUserId;
  private String createdByName;
  private String meetingDay;
  private String meetingTime;
  private Integer maxMembers;
  private int memberCount;
  private boolean joined;
  private boolean active;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private List<StudyCircleMemberResponse> members;
}
