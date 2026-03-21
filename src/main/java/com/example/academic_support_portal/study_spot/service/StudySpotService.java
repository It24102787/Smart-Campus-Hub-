package com.example.academic_support_portal.study_spot.service;

import com.example.academic_support_portal.study_spot.dto.BookingResponse;
import com.example.academic_support_portal.study_spot.dto.BookingSummaryResponse;
import com.example.academic_support_portal.study_spot.dto.CreateBookingRequest;
import com.example.academic_support_portal.study_spot.dto.RoomAvailabilityResponse;
import com.example.academic_support_portal.study_spot.dto.StudyRoomResponse;
import com.example.academic_support_portal.study_spot.dto.StudyRoomStatusSummaryResponse;
import com.example.academic_support_portal.study_spot.exception.ReservationConflictException;
import com.example.academic_support_portal.study_spot.model.BookingSource;
import com.example.academic_support_portal.study_spot.model.StudyReservation;
import com.example.academic_support_portal.study_spot.model.StudyReservationStatus;
import com.example.academic_support_portal.study_spot.model.StudyRoom;
import com.example.academic_support_portal.study_spot.model.StudyRoomStatus;
import com.example.academic_support_portal.study_spot.repository.RoomBookingRepository;
import com.example.academic_support_portal.study_spot.repository.StudyRoomRepository;
import com.example.academic_support_portal.user.model.Role;
import com.example.academic_support_portal.user.model.User;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class StudySpotService {

  private static final List<StudyReservationStatus> BLOCKING_STATUSES =
      List.of(StudyReservationStatus.BOOKED, StudyReservationStatus.ACTIVE);

  private final StudyRoomRepository studyRoomRepository;
  private final RoomBookingRepository bookingRepository;

  @Transactional(readOnly = true)
  public List<StudyRoomResponse> getRooms(String building, String occupancyStatus, Integer minCapacity, String search) {
    LocalDate today = LocalDate.now();
    LocalTime now = LocalTime.now();

    Map<String, Long> bookedNowByRoom = new HashMap<>();
    bookingRepository.findByBookingDateAndStatusInAndStartTimeLessThanEqualAndEndTimeGreaterThan(
            today, BLOCKING_STATUSES, now, now)
        .forEach(booking -> bookedNowByRoom.merge(booking.getRoomId(), 1L, Long::sum));

    return studyRoomRepository.findAll().stream()
        .peek(StudyRoom::normalizeNameFields)
        .map(room -> {
          int bookingAwareOccupancy = Math.max(safe(room.getCurrentOccupancy()), bookedNowByRoom.getOrDefault(room.getId(), 0L).intValue());
          return toRoomResponse(room, bookingAwareOccupancy);
        })
        .filter(room -> building == null || building.isBlank() || room.getBuilding().equalsIgnoreCase(building))
        .filter(room -> minCapacity == null || room.getCapacity() >= minCapacity)
        .filter(room -> occupancyStatus == null || occupancyStatus.isBlank() || room.getStatus().equalsIgnoreCase(occupancyStatus))
        .filter(room -> search == null || search.isBlank() || room.getRoomName().toLowerCase(Locale.ROOT).contains(search.toLowerCase(Locale.ROOT)))
        .sorted(Comparator.comparing(StudyRoomResponse::getBuilding).thenComparing(StudyRoomResponse::getRoomName))
        .toList();
  }

  @Transactional(readOnly = true)
  public StudyRoomResponse getRoomById(String roomId) {
    StudyRoom room = studyRoomRepository.findById(roomId)
        .orElseThrow(() -> new NoSuchElementException("Study room not found"));
    room.normalizeNameFields();
    return toRoomResponse(room, safe(room.getCurrentOccupancy()));
  }

  @Transactional(readOnly = true)
  public StudyRoomResponse getRoomByQrCode(String qrCodeValue) {
    StudyRoom room = studyRoomRepository.findByQrCodeValue(qrCodeValue)
        .orElseThrow(() -> new NoSuchElementException("No room found for QR code"));
    room.normalizeNameFields();
    return toRoomResponse(room, safe(room.getCurrentOccupancy()));
  }

  @Transactional(readOnly = true)
  public StudyRoomStatusSummaryResponse getStatusSummary() {
    List<StudyRoom> rooms = studyRoomRepository.findAll();
    long total = rooms.size();

    long available = rooms.stream().filter(room -> "AVAILABLE".equals(deriveOccupancyStatus(room, safe(room.getCurrentOccupancy())))).count();
    long active = rooms.stream().filter(room -> "ACTIVE".equals(deriveOccupancyStatus(room, safe(room.getCurrentOccupancy())))).count();
    long nearlyFull = rooms.stream().filter(room -> "NEARLY_FULL".equals(deriveOccupancyStatus(room, safe(room.getCurrentOccupancy())))).count();
    long full = rooms.stream().filter(room -> "FULL".equals(deriveOccupancyStatus(room, safe(room.getCurrentOccupancy())))).count();

    return StudyRoomStatusSummaryResponse.builder()
        .totalCount(total)
        .availableCount(available)
        .activeCount(active)
        .nearlyFullCount(nearlyFull)
        .fullCount(full)
        .build();
  }

  @Transactional
  public BookingResponse createBooking(User user, CreateBookingRequest request) {
    StudyRoom room = studyRoomRepository.findById(request.getRoomId())
        .orElseThrow(() -> new NoSuchElementException("Room not found"));

    validateCreateRequest(room, request, user.getId());

    StudyReservation booking = StudyReservation.builder()
        .studentId(user.getId())
        .studentName(user.getName())
        .studentEmail(user.getEmail())
        .roomId(room.getId())
        .roomName(room.displayName())
        .bookingDate(request.getBookingDate())
        .startTime(request.getStartTime())
        .endTime(request.getEndTime())
        .status(StudyReservationStatus.BOOKED)
        .source(BookingSource.APP)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();

    return toBookingResponse(bookingRepository.save(booking));
  }

  @Transactional
  public List<BookingSummaryResponse> getMyBookings(User user) {
    List<StudyReservation> bookings = bookingRepository.findByStudentIdOrderByBookingDateDescStartTimeDesc(user.getId());
    refreshStatuses(bookings);
    LocalDateTime now = LocalDateTime.now();

    return bookings.stream()
        .sorted((a, b) -> compareForStudentList(a, b, now))
        .map(booking -> toBookingSummary(booking, canCancelBooking(booking, user)))
        .toList();
  }

  @Transactional
  public BookingResponse getBookingById(String bookingId, User user) {
    StudyReservation booking = bookingRepository.findById(bookingId)
        .orElseThrow(() -> new NoSuchElementException("Booking not found"));

    if (!isAdmin(user) && !booking.getStudentId().equals(user.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized to access this booking.");
    }

    refreshStatus(booking);
    return toBookingResponse(booking);
  }

  @Transactional
  public void cancelBooking(String bookingId, User user) {
    StudyReservation booking = bookingRepository.findById(bookingId)
        .orElseThrow(() -> new NoSuchElementException("Booking not found"));

    boolean owner = booking.getStudentId().equals(user.getId());
    if (!owner && !isAdmin(user)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized to cancel this booking.");
    }

    if (!canCancelBooking(booking, user)) {
      throw new IllegalArgumentException("Booking cannot be cancelled at this stage.");
    }

    booking.setStatus(StudyReservationStatus.CANCELLED);
    booking.setUpdatedAt(LocalDateTime.now());
    bookingRepository.save(booking);
  }

  @Transactional(readOnly = true)
  public RoomAvailabilityResponse getRoomAvailability(String roomId, LocalDate date) {
    StudyRoom room = studyRoomRepository.findById(roomId)
        .orElseThrow(() -> new NoSuchElementException("Room not found"));

    List<StudyReservation> bookings = bookingRepository.findByRoomIdAndBookingDateAndStatusInOrderByStartTimeAsc(
        roomId,
        date,
        BLOCKING_STATUSES);

    List<RoomAvailabilityResponse.TimeWindow> bookedSlots = bookings.stream()
        .map(booking -> RoomAvailabilityResponse.TimeWindow.builder()
            .startTime(booking.getStartTime().toString())
            .endTime(booking.getEndTime().toString())
            .build())
        .toList();

    LocalTime dayStart = LocalTime.of(8, 0);
    LocalTime dayEnd = LocalTime.of(22, 0);
    LocalTime cursor = dayStart;
    List<RoomAvailabilityResponse.TimeWindow> windows = new ArrayList<>();

    for (StudyReservation booking : bookings) {
      if (cursor.isBefore(booking.getStartTime())) {
        windows.add(RoomAvailabilityResponse.TimeWindow.builder()
            .startTime(cursor.toString())
            .endTime(booking.getStartTime().toString())
            .build());
      }
      if (cursor.isBefore(booking.getEndTime())) {
        cursor = booking.getEndTime();
      }
    }

    if (cursor.isBefore(dayEnd)) {
      windows.add(RoomAvailabilityResponse.TimeWindow.builder()
          .startTime(cursor.toString())
          .endTime(dayEnd.toString())
          .build());
    }

    return RoomAvailabilityResponse.builder()
        .roomId(room.getId())
        .roomName(room.displayName())
        .date(date)
        .bookedSlots(bookedSlots)
        .availableWindows(windows)
        .build();
  }

  private void validateCreateRequest(StudyRoom room, CreateBookingRequest request, String studentId) {
    LocalDate today = LocalDate.now();
    LocalDateTime now = LocalDateTime.now();

    if (request.getBookingDate().isBefore(today)) {
      throw new IllegalArgumentException("Booking date cannot be in the past.");
    }
    if (!request.getEndTime().isAfter(request.getStartTime())) {
      throw new IllegalArgumentException("End time must be after start time.");
    }

    long minutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
    if (minutes > 4 * 60) {
      throw new IllegalArgumentException("Booking duration cannot exceed 4 hours.");
    }

    LocalDateTime startDateTime = LocalDateTime.of(request.getBookingDate(), request.getStartTime());
    if (!startDateTime.isAfter(now)) {
      throw new IllegalArgumentException("Booking start time must be in the future.");
    }

    if (room.getStatus() == StudyRoomStatus.MAINTENANCE) {
      throw new IllegalArgumentException("Room is under maintenance and cannot be booked.");
    }

    boolean roomConflict = !bookingRepository.findByRoomIdAndBookingDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            request.getRoomId(),
            request.getBookingDate(),
            BLOCKING_STATUSES,
            request.getEndTime(),
            request.getStartTime())
        .isEmpty();

    if (roomConflict) {
      throw new ReservationConflictException("Room already booked for selected time range.");
    }

    boolean studentConflict = !bookingRepository.findByStudentIdAndBookingDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            studentId,
            request.getBookingDate(),
            BLOCKING_STATUSES,
            request.getEndTime(),
            request.getStartTime())
        .isEmpty();

    if (studentConflict) {
      throw new ReservationConflictException("You already have another booking during this time.");
    }
  }

  private void refreshStatuses(List<StudyReservation> bookings) {
    bookings.forEach(this::refreshStatus);
  }

  private void refreshStatus(StudyReservation booking) {
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime start = LocalDateTime.of(booking.getBookingDate(), booking.getStartTime());
    LocalDateTime end = LocalDateTime.of(booking.getBookingDate(), booking.getEndTime());
    StudyReservationStatus current = booking.getStatus();

    if (EnumSet.of(StudyReservationStatus.CANCELLED, StudyReservationStatus.COMPLETED, StudyReservationStatus.NO_SHOW).contains(current)) {
      return;
    }

    boolean changed = false;
    if (now.isAfter(end)) {
      StudyReservationStatus next = booking.getCheckInTime() == null ? StudyReservationStatus.NO_SHOW : StudyReservationStatus.COMPLETED;
      if (current != next) {
        booking.setStatus(next);
        changed = true;
      }
    } else if (booking.getCheckInTime() != null && now.isAfter(start) && current == StudyReservationStatus.BOOKED) {
      booking.setStatus(StudyReservationStatus.ACTIVE);
      changed = true;
    }

    if (changed) {
      booking.setUpdatedAt(LocalDateTime.now());
      bookingRepository.save(booking);
    }
  }

  private int compareForStudentList(StudyReservation a, StudyReservation b, LocalDateTime now) {
    boolean aUpcoming = isUpcoming(a, now);
    boolean bUpcoming = isUpcoming(b, now);
    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;

    int dateCompare = a.getBookingDate().compareTo(b.getBookingDate());
    if (aUpcoming) {
      if (dateCompare != 0) return dateCompare;
      return a.getStartTime().compareTo(b.getStartTime());
    }
    if (dateCompare != 0) return -dateCompare;
    return b.getStartTime().compareTo(a.getStartTime());
  }

  private boolean isUpcoming(StudyReservation booking, LocalDateTime now) {
    return LocalDateTime.of(booking.getBookingDate(), booking.getStartTime()).isAfter(now)
        && booking.getStatus() == StudyReservationStatus.BOOKED;
  }

  private boolean canCancelBooking(StudyReservation booking, User user) {
    if (booking.getStatus() != StudyReservationStatus.BOOKED) {
      return false;
    }
    LocalDateTime start = LocalDateTime.of(booking.getBookingDate(), booking.getStartTime());
    return start.isAfter(LocalDateTime.now());
  }

  private boolean isAdmin(User user) {
    if (user == null) {
      return false;
    }
    if (user.getRole() == Role.ADMIN) {
      return true;
    }
    return user.getRoles() != null && user.getRoles().contains(Role.ADMIN);
  }

  private StudyRoomResponse toRoomResponse(StudyRoom room, int occupancy) {
    double occupancyPercent = calculateOccupancyPercent(occupancy, room.getCapacity());
    return StudyRoomResponse.builder()
        .id(room.getId())
        .name(room.displayName())
        .roomName(room.displayName())
        .building(room.getBuilding())
        .floor(room.getFloor())
        .zone(room.getZone())
        .capacity(room.getCapacity())
        .status(deriveOccupancyStatus(room, occupancy))
        .deviceId(room.getDeviceId())
        .sensorDeviceId(room.getSensorDeviceId())
        .currentOccupancy(occupancy)
        .occupancyPercent(occupancyPercent)
        .temperature(room.getTemperature() == null ? 24.0 : room.getTemperature())
        .temperatureStatus(deriveTemperatureStatus(room.getTemperature()))
        .description(room.getDescription())
        .imageUrl(room.getImageUrl())
        .qrCodeValue(room.getQrCodeValue())
        .createdAt(room.getCreatedAt())
        .updatedAt(room.getUpdatedAt())
        .build();
  }

  private BookingSummaryResponse toBookingSummary(StudyReservation booking, boolean cancellable) {
    return BookingSummaryResponse.builder()
        .id(booking.getId())
        .roomId(booking.getRoomId())
        .roomName(booking.getRoomName())
        .bookingDate(booking.getBookingDate())
        .startTime(booking.getStartTime())
        .endTime(booking.getEndTime())
        .status(booking.getStatus())
        .cancellable(cancellable)
        .build();
  }

  private BookingResponse toBookingResponse(StudyReservation booking) {
    return BookingResponse.builder()
        .id(booking.getId())
        .studentId(booking.getStudentId())
        .studentName(booking.getStudentName())
        .studentEmail(booking.getStudentEmail())
        .roomId(booking.getRoomId())
        .roomName(booking.getRoomName())
        .bookingDate(booking.getBookingDate())
        .startTime(booking.getStartTime())
        .endTime(booking.getEndTime())
        .status(booking.getStatus())
        .checkInTime(booking.getCheckInTime())
        .checkOutTime(booking.getCheckOutTime())
        .source(booking.getSource())
        .createdAt(booking.getCreatedAt())
        .updatedAt(booking.getUpdatedAt())
        .build();
  }

  public static double calculateOccupancyPercent(Integer currentOccupancy, Integer capacity) {
    if (capacity == null || capacity <= 0) {
      return 0.0;
    }
    int safeOccupancy = Math.max(0, currentOccupancy == null ? 0 : currentOccupancy);
    return Math.min(100.0, (safeOccupancy * 100.0) / capacity);
  }

  public static String deriveOccupancyStatus(StudyRoom room) {
    return deriveOccupancyStatus(room, safe(room.getCurrentOccupancy()));
  }

  public static String deriveOccupancyStatus(StudyRoom room, int occupancy) {
    if (room.getStatus() == StudyRoomStatus.MAINTENANCE) {
      return "MAINTENANCE";
    }
    double occupancyPercent = calculateOccupancyPercent(occupancy, room.getCapacity());
    if (occupancyPercent == 0.0) {
      return "AVAILABLE";
    }
    if (occupancyPercent >= 100.0) {
      return "FULL";
    }
    if (occupancyPercent > 70.0) {
      return "NEARLY_FULL";
    }
    return "ACTIVE";
  }

  public static String deriveTemperatureStatus(Double temperature) {
    double temp = temperature == null ? 24.0 : temperature;
    if (temp < 22.0) {
      return "COOL";
    }
    if (temp > 28.0) {
      return "WARM";
    }
    return "OPTIMAL";
  }

  private static int safe(Integer value) {
    return Math.max(0, value == null ? 0 : value);
  }
}
