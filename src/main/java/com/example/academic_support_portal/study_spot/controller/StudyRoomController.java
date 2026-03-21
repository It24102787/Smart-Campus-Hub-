package com.example.academic_support_portal.study_spot.controller;

import com.example.academic_support_portal.study_spot.dto.RoomAvailabilityResponse;
import com.example.academic_support_portal.study_spot.dto.StudyRoomResponse;
import com.example.academic_support_portal.study_spot.dto.StudyRoomStatusSummaryResponse;
import com.example.academic_support_portal.study_spot.service.StudySpotService;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/study-rooms")
@RequiredArgsConstructor
public class StudyRoomController {

  private final StudySpotService studySpotService;

  @GetMapping
  public List<StudyRoomResponse> getRooms(
      @RequestParam(required = false) String building,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) Integer capacity,
      @RequestParam(required = false, name = "q") String search) {
    return studySpotService.getRooms(building, status, capacity, search);
  }

  @GetMapping("/{id}")
  public StudyRoomResponse getRoomById(@PathVariable String id) {
    return studySpotService.getRoomById(id);
  }

  @GetMapping("/status/summary")
  public StudyRoomStatusSummaryResponse getStatusSummary() {
    return studySpotService.getStatusSummary();
  }

  @GetMapping("/search")
  public List<StudyRoomResponse> searchRooms(
      @RequestParam(required = false) String building,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) Integer capacity,
      @RequestParam(required = false, name = "q") String query) {
    return studySpotService.getRooms(building, status, capacity, query);
  }

  @GetMapping("/qr/{qrCodeValue}")
  public StudyRoomResponse getRoomByQr(@PathVariable String qrCodeValue) {
    return studySpotService.getRoomByQrCode(qrCodeValue);
  }

  @GetMapping("/{id}/availability")
  public RoomAvailabilityResponse getAvailability(
      @PathVariable String id,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    return studySpotService.getRoomAvailability(id, date);
  }
}
