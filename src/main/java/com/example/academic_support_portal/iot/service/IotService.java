package com.example.academic_support_portal.iot.service;

import com.example.academic_support_portal.dashboard.dto.EnvironmentDashboardResponse;
import com.example.academic_support_portal.iot.dto.CardTapRequest;
import com.example.academic_support_portal.iot.dto.CardTapResponse;
import com.example.academic_support_portal.iot.dto.EnvironmentReadingRequest;
import com.example.academic_support_portal.iot.dto.EnvironmentReadingResponse;
import com.example.academic_support_portal.iot.model.EnvironmentReading;
import com.example.academic_support_portal.iot.model.Student;
import com.example.academic_support_portal.iot.model.StudentPresence;
import com.example.academic_support_portal.iot.model.StudentStatus;
import com.example.academic_support_portal.iot.model.TapAction;
import com.example.academic_support_portal.iot.model.TapLog;
import com.example.academic_support_portal.iot.repository.EnvironmentReadingRepository;
import com.example.academic_support_portal.iot.repository.StudentPresenceRepository;
import com.example.academic_support_portal.iot.repository.StudentRepository;
import com.example.academic_support_portal.iot.repository.TapLogRepository;
import com.example.academic_support_portal.study_spot.model.StudyRoom;
import com.example.academic_support_portal.study_spot.model.StudyRoomStatus;
import com.example.academic_support_portal.study_spot.repository.StudyRoomRepository;
import com.example.academic_support_portal.study_spot.service.StudySpotService;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class IotService {

  private static final long TAP_DEBOUNCE_SECONDS = 3;

  private final StudentRepository studentRepository;
  private final StudyRoomRepository studyRoomRepository;
  private final TapLogRepository tapLogRepository;
  private final StudentPresenceRepository studentPresenceRepository;
  private final EnvironmentReadingRepository environmentReadingRepository;

  @Transactional
  public CardTapResponse processCardTap(CardTapRequest request) {
    Student student = studentRepository.findByCardUidAndStatus(request.getCardUid(), StudentStatus.ACTIVE)
        .orElseThrow(() -> new NoSuchElementException("No active student found for tapped card UID."));

    StudyRoom tappedRoom = studyRoomRepository.findByDeviceId(request.getDeviceId())
        .orElseThrow(() -> new NoSuchElementException("No study room found for the device ID."));

    validateDebounce(student.getStudentId());

    LocalDateTime now = LocalDateTime.now();
    StudentPresence presence = studentPresenceRepository.findByStudentId(student.getStudentId()).orElse(null);

    TapAction action;
    StudyRoom affectedRoom;
    if (presence == null) {
      if (StudySpotService.deriveOccupancyStatus(tappedRoom).equals("FULL")) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Room is full. Check-in rejected.");
      }
      action = TapAction.CHECK_IN;
      affectedRoom = tappedRoom;
      studentPresenceRepository.save(StudentPresence.builder()
          .studentId(student.getStudentId())
          .roomId(affectedRoom.getId())
          .enteredAt(now)
          .build());
      applyOccupancy(affectedRoom, Math.min(affectedRoom.getCapacity(), safe(affectedRoom.getCurrentOccupancy()) + 1));
    } else {
      action = TapAction.CHECK_OUT;
      affectedRoom = studyRoomRepository.findById(presence.getRoomId()).orElse(tappedRoom);
      studentPresenceRepository.delete(presence);
      applyOccupancy(affectedRoom, Math.max(0, safe(affectedRoom.getCurrentOccupancy()) - 1));
    }

    tapLogRepository.save(TapLog.builder()
        .studentId(student.getStudentId())
        .cardUid(request.getCardUid())
        .deviceId(request.getDeviceId())
        .roomId(affectedRoom.getId())
        .action(action)
        .timestamp(now)
        .build());

    return CardTapResponse.builder()
        .studentName(student.getName())
        .roomName(affectedRoom.displayName())
        .action(action.name())
        .currentOccupancy(affectedRoom.getCurrentOccupancy())
        .occupancyPercent(affectedRoom.getOccupancyPercent())
        .build();
  }

  @Transactional
  public EnvironmentReadingResponse saveEnvironmentReading(EnvironmentReadingRequest request) {
    StudyRoom room = studyRoomRepository.findBySensorDeviceId(request.getSensorDeviceId())
        .orElseThrow(() -> new NoSuchElementException("No study room found for sensor device ID."));

    int occupancy = Math.max(0, request.getOccupancyCount());
    applyOccupancy(room, occupancy);
    room.setTemperature(request.getTemperature());
    room.setUpdatedAt(LocalDateTime.now());
    studyRoomRepository.save(room);

    environmentReadingRepository.save(EnvironmentReading.builder()
        .roomId(room.getId())
        .sensorDeviceId(request.getSensorDeviceId())
        .temperature(request.getTemperature())
        .occupancyCount(occupancy)
        .occupancyPercent(room.getOccupancyPercent())
        .recordedAt(LocalDateTime.now())
        .build());

    return EnvironmentReadingResponse.builder()
        .roomId(room.getId())
        .roomName(room.displayName())
        .sensorDeviceId(request.getSensorDeviceId())
        .temperature(room.getTemperature())
        .occupancyPercent(room.getOccupancyPercent())
        .currentOccupancy(room.getCurrentOccupancy())
        .status(StudySpotService.deriveOccupancyStatus(room))
        .build();
  }

  @Transactional(readOnly = true)
  public EnvironmentDashboardResponse getEnvironmentDashboard() {
    List<StudyRoom> rooms = studyRoomRepository.findAll();
    if (rooms.isEmpty()) {
      return EnvironmentDashboardResponse.builder()
          .averageTemperature(0.0)
          .totalOccupancy(0)
          .availableRooms(0L)
          .occupiedRooms(0L)
          .build();
    }

    double avgTemp = rooms.stream().map(StudyRoom::getTemperature).filter(v -> v != null).mapToDouble(Double::doubleValue).average().orElse(0.0);
    int totalOccupancy = rooms.stream().mapToInt(room -> safe(room.getCurrentOccupancy())).sum();
    long available = rooms.stream().filter(room -> "AVAILABLE".equals(StudySpotService.deriveOccupancyStatus(room))).count();
    long occupied = rooms.size() - available;

    return EnvironmentDashboardResponse.builder()
        .averageTemperature(Math.round(avgTemp * 10.0) / 10.0)
        .totalOccupancy(totalOccupancy)
        .availableRooms(available)
        .occupiedRooms(occupied)
        .build();
  }

  private void validateDebounce(String studentId) {
    TapLog lastTap = tapLogRepository.findTopByStudentIdOrderByTimestampDesc(studentId).orElse(null);
    if (lastTap == null || lastTap.getTimestamp() == null) {
      return;
    }
    long secondsBetween = Duration.between(lastTap.getTimestamp(), LocalDateTime.now()).getSeconds();
    if (secondsBetween < TAP_DEBOUNCE_SECONDS) {
      throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Duplicate tap detected. Please wait 3 seconds.");
    }
  }

  private void applyOccupancy(StudyRoom room, int occupancy) {
    int safeCapacity = room.getCapacity() == null || room.getCapacity() <= 0 ? 1 : room.getCapacity();
    int bounded = Math.max(0, Math.min(occupancy, safeCapacity));
    room.setCurrentOccupancy(bounded);
    room.setOccupancyPercent(StudySpotService.calculateOccupancyPercent(bounded, safeCapacity));
    if (room.getStatus() != StudyRoomStatus.MAINTENANCE) {
      String derived = StudySpotService.deriveOccupancyStatus(room, bounded);
      if ("FULL".equals(derived)) {
        room.setStatus(StudyRoomStatus.FULL);
      } else if ("NEARLY_FULL".equals(derived)) {
        room.setStatus(StudyRoomStatus.NEARLY_FULL);
      } else if ("ACTIVE".equals(derived)) {
        room.setStatus(StudyRoomStatus.ACTIVE);
      } else {
        room.setStatus(StudyRoomStatus.AVAILABLE);
      }
    }
    room.setUpdatedAt(LocalDateTime.now());
    studyRoomRepository.save(room);
  }

  private int safe(Integer value) {
    return Math.max(0, value == null ? 0 : value);
  }
}
