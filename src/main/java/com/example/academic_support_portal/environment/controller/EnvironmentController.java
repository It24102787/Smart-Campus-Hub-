package com.example.academic_support_portal.environment.controller;

import com.example.academic_support_portal.environment.model.Alert;
import com.example.academic_support_portal.environment.model.SensorReading;
import com.example.academic_support_portal.environment.repository.AlertRepository;
import com.example.academic_support_portal.environment.repository.SensorReadingRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sensors")
@RequiredArgsConstructor
public class EnvironmentController {

  private final SensorReadingRepository readingRepository;
  private final AlertRepository alertRepository;

  @GetMapping("/live")
  public List<SensorReading> getLiveReadings() {
    return readingRepository.findByTimestampAfter(LocalDateTime.now().minusMinutes(5));
  }

  @GetMapping("/history/{roomId}")
  public List<SensorReading> getHistory(@PathVariable String roomId, @RequestParam String range) {
    // Range could be "1H", "24H", "7D"
    LocalDateTime start = LocalDateTime.now().minusHours(1);
    if ("24H".equals(range))
      start = LocalDateTime.now().minusDays(1);
    if ("7D".equals(range))
      start = LocalDateTime.now().minusDays(7);
    return readingRepository.findByRoomIdAndTimestampBetween(roomId, start, LocalDateTime.now());
  }

  @PostMapping("/alerts")
  public Alert createAlert(@Valid @RequestBody Alert alert) {
    alert.setCreatedAt(LocalDateTime.now());
    alert.setActive(true);
    return alertRepository.save(alert);
  }

  @GetMapping("/alerts/my")
  public List<Alert> getMyAlerts(@RequestParam String userId) {
    return alertRepository.findByUserId(userId);
  }

  @PatchMapping("/alerts/{id}/toggle")
  public ResponseEntity<Alert> toggleAlert(@PathVariable String id) {
    return alertRepository.findById(id)
        .map(alert -> {
          alert.setActive(!alert.isActive());
          return ResponseEntity.ok(alertRepository.save(alert));
        })
        .orElse(ResponseEntity.notFound().build());
  }
}
