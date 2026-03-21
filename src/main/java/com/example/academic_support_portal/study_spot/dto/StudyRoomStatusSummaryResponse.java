package com.example.academic_support_portal.study_spot.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class StudyRoomStatusSummaryResponse {
  long availableCount;
  long activeCount;
  long nearlyFullCount;
  long fullCount;
  long totalCount;
}
