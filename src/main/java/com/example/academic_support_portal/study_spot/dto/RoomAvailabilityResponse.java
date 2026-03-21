package com.example.academic_support_portal.study_spot.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RoomAvailabilityResponse {
  String roomId;
  String roomName;
  LocalDate date;
  List<TimeWindow> bookedSlots;
  List<TimeWindow> availableWindows;

  @Value
  @Builder
  public static class TimeWindow {
    String startTime;
    String endTime;
  }
}
