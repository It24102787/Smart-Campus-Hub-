package com.example.academic_support_portal.study_group.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyGroupResponse {
  private String id;
  private String name;
  private String subject;
  private String description;
  private String day;
  private String time;
  private String createdBy;
  private List<String> members;
  private Integer maxMembers;
}
