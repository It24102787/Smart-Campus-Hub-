package com.example.academic_support_portal.study_circle.dto;

import com.example.academic_support_portal.study_circle.model.StudyCircleRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MyStudyCircleResponse {
  private String id;
  private String title;
  private String description;
  private String subject;
  private int memberCount;
  private Integer maxMembers;
  private String meetingDay;
  private String meetingTime;
  private String createdByName;
  private StudyCircleRole myRole;
}
