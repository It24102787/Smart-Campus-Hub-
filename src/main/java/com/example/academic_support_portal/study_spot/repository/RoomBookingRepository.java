package com.example.academic_support_portal.study_spot.repository;

import com.example.academic_support_portal.study_spot.model.StudyReservation;
import com.example.academic_support_portal.study_spot.model.StudyReservationStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomBookingRepository extends MongoRepository<StudyReservation, String> {

  List<StudyReservation> findByStudentIdOrderByBookingDateDescStartTimeDesc(String studentId);

  List<StudyReservation> findByStudentIdAndBookingDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
      String studentId,
      LocalDate bookingDate,
      List<StudyReservationStatus> statuses,
      LocalTime endTime,
      LocalTime startTime);

  List<StudyReservation> findByRoomIdAndBookingDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
      String roomId,
      LocalDate bookingDate,
      List<StudyReservationStatus> statuses,
      LocalTime endTime,
      LocalTime startTime);

  List<StudyReservation> findByBookingDateAndStatusInAndStartTimeLessThanEqualAndEndTimeGreaterThan(
      LocalDate bookingDate,
      List<StudyReservationStatus> statuses,
      LocalTime time1,
      LocalTime time2);

  long countByRoomIdAndBookingDateAndStatusInAndStartTimeLessThanEqualAndEndTimeGreaterThan(
      String roomId,
      LocalDate bookingDate,
      List<StudyReservationStatus> statuses,
      LocalTime time1,
      LocalTime time2);

  List<StudyReservation> findByRoomIdAndBookingDateAndStatusInOrderByStartTimeAsc(
      String roomId,
      LocalDate bookingDate,
      List<StudyReservationStatus> statuses);

  Optional<StudyReservation> findByIdAndStudentId(String id, String studentId);
}
