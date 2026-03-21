package com.example.academic_support_portal.notification.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TutorRequestEmailData {
  private String studentName;
  private String subject;
  private String sessionDate;
  private String startTime;
  private String endTime;
  private String message;
}
