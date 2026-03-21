package com.example.academic_support_portal.study_circle.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudyCircleResponse {
  private String id;
  private String title;
  private String description;
  private String subject;
  private int memberCount;
  private Integer maxMembers;
  private boolean joined;
  private String meetingDay;
  private String meetingTime;
  private String createdByName;
}
