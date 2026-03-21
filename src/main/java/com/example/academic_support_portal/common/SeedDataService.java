package com.example.academic_support_portal.common;

import com.example.academic_support_portal.environment.model.SensorReading;
import com.example.academic_support_portal.environment.repository.SensorReadingRepository;
import com.example.academic_support_portal.equipment.model.Equipment;
import com.example.academic_support_portal.equipment.repository.EquipmentRepository;
import com.example.academic_support_portal.iot.model.Student;
import com.example.academic_support_portal.iot.model.StudentStatus;
import com.example.academic_support_portal.iot.repository.StudentRepository;
import com.example.academic_support_portal.study_spot.model.StudyRoom;
import com.example.academic_support_portal.study_spot.model.StudyRoomStatus;
import com.example.academic_support_portal.study_spot.model.StudyReservation;
import com.example.academic_support_portal.study_spot.model.StudyReservationStatus;
import com.example.academic_support_portal.study_spot.model.BookingSource;
import com.example.academic_support_portal.study_spot.repository.RoomBookingRepository;
import com.example.academic_support_portal.study_spot.repository.StudyRoomRepository;
import com.example.academic_support_portal.user.model.Role;
import com.example.academic_support_portal.user.model.User;
import com.example.academic_support_portal.user.repository.UserRepository;
import com.example.academic_support_portal.tutor.model.Tutor;
import com.example.academic_support_portal.tutor.repository.TutorRepository;
import com.example.academic_support_portal.study_group.model.StudyGroup;
import com.example.academic_support_portal.study_group.repository.StudyGroupRepository;
import com.example.academic_support_portal.study_circle.model.StudyCircle;
import com.example.academic_support_portal.study_circle.model.StudyCircleMember;
import com.example.academic_support_portal.study_circle.model.StudyCircleRole;
import com.example.academic_support_portal.study_circle.repository.StudyCircleMemberRepository;
import com.example.academic_support_portal.study_circle.repository.StudyCircleRepository;
import com.example.academic_support_portal.resource.model.AcademicResource;
import com.example.academic_support_portal.resource.repository.AcademicResourceRepository;
import com.example.academic_support_portal.calendar.model.AcademicCalendarEvent;
import com.example.academic_support_portal.calendar.repository.AcademicCalendarRepository;
import com.example.academic_support_portal.issue.model.CampusIssue;
import com.example.academic_support_portal.issue.model.IssuePriority;
import com.example.academic_support_portal.issue.model.IssueStatus;
import com.example.academic_support_portal.issue.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class SeedDataService implements CommandLineRunner {

        private final UserRepository userRepository;
        private final StudyRoomRepository studyRoomRepository;
        private final RoomBookingRepository bookingRepository;
        private final EquipmentRepository equipmentRepository;
        private final TutorRepository tutorRepository;
        private final SensorReadingRepository readingRepository;
        private final StudentRepository studentRepository;
        private final StudyGroupRepository groupRepository;
        private final StudyCircleRepository studyCircleRepository;
        private final StudyCircleMemberRepository studyCircleMemberRepository;
        private final AcademicResourceRepository resourceRepository;
        private final AcademicCalendarRepository calendarRepository;
        private final IssueRepository issueRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) throws Exception {
                if (userRepository.count() == 0) {
                        userRepository.save(User.builder()
                                        .email("admin@campus.com")
                                        .password(passwordEncoder.encode("admin123"))
                                        .name("Main Admin")
                                        .role(Role.ADMIN)
                                        .roles(Set.of(Role.ADMIN))
                                        .active(true)
                                        .build());

                        userRepository.save(User.builder()
                                        .email("student@campus.com")
                                        .password(passwordEncoder.encode("student123"))
                                        .name("John Doe")
                                        .role(Role.STUDENT)
                                        .roles(Set.of(Role.STUDENT))
                                        .active(true)
                                        .build());

                        userRepository.save(User.builder()
                                        .email("tutor@campus.com")
                                        .password(passwordEncoder.encode("tutor123"))
                                        .name("Dr. Tutor User")
                                        .role(Role.TUTOR)
                                        .roles(Set.of(Role.TUTOR))
                                        .active(true)
                                        .build());

                        userRepository.save(User.builder()
                                        .email("test@gmail.com")
                                        .password(passwordEncoder.encode("password123"))
                                        .name("Test User")
                                        .phone("1234567890")
                                        .role(Role.STUDENT)
                                        .roles(Set.of(Role.STUDENT))
                                        .active(true)
                                        .build());
                }

                if (studyRoomRepository.count() == 0) {
                        studyRoomRepository.saveAll(List.of(
                                        StudyRoom.builder()
                                                        .name("Library Room 1")
                                                        .roomName("Library Room 1")
                                                        .building("Library")
                                                        .floor("1")
                                                        .zone("Library District")
                                                        .capacity(6)
                                                        .status(StudyRoomStatus.AVAILABLE)
                                                        .deviceId("RFID-LIB-01")
                                                        .sensorDeviceId("LIB-01")
                                                        .temperature(26.1)
                                                        .currentOccupancy(2)
                                                        .occupancyPercent(33.3)
                                                        .description("Quiet study room near the reference section.")
                                                        .imageUrl("https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=900")
                                                        .qrCodeValue("QR-LIB-RM1")
                                                        .build(),
                                        StudyRoom.builder()
                                                        .name("Silent Pod A")
                                                        .roomName("Silent Pod A")
                                                        .building("Library")
                                                        .floor("3")
                                                        .zone("Library District")
                                                        .capacity(1)
                                                        .status(StudyRoomStatus.AVAILABLE)
                                                        .deviceId("RFID-LIB-02")
                                                        .sensorDeviceId("LIB-02")
                                                        .temperature(24.4)
                                                        .currentOccupancy(0)
                                                        .occupancyPercent(0.0)
                                                        .description("Single-person silent pod with noise isolation.")
                                                        .imageUrl("https://images.unsplash.com/photo-1517504734587-2890819debab?auto=format&fit=crop&q=80&w=900")
                                                        .qrCodeValue("QR-LIB-POD-A")
                                                        .build(),
                                        StudyRoom.builder()
                                                        .name("Library Room 2")
                                                        .roomName("Library Room 2")
                                                        .building("Library")
                                                        .floor("2")
                                                        .zone("Library District")
                                                        .capacity(8)
                                                        .status(StudyRoomStatus.ACTIVE)
                                                        .deviceId("RFID-LIB-03")
                                                        .sensorDeviceId("LIB-03")
                                                        .temperature(26.8)
                                                        .currentOccupancy(4)
                                                        .occupancyPercent(50.0)
                                                        .description("Medium collaborative room with power outlets and whiteboard.")
                                                        .imageUrl("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=900")
                                                        .qrCodeValue("QR-LIB-RM2")
                                                        .build(),
                                        StudyRoom.builder()
                                                        .name("Group Room B")
                                                        .roomName("Group Room B")
                                                        .building("IT Center")
                                                        .floor("2")
                                                        .zone("Tech Hub")
                                                        .capacity(10)
                                                        .status(StudyRoomStatus.AVAILABLE)
                                                        .deviceId("RFID-IT-01")
                                                        .sensorDeviceId("IT-01")
                                                        .temperature(27.2)
                                                        .currentOccupancy(6)
                                                        .occupancyPercent(60.0)
                                                        .description("Collaborative room with whiteboard and display.")
                                                        .imageUrl("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=900")
                                                        .qrCodeValue("QR-IT-GRB")
                                                        .build(),
                                        StudyRoom.builder()
                                                        .name("New Building Room 101")
                                                        .roomName("New Building Room 101")
                                                        .building("New Building")
                                                        .floor("1")
                                                        .zone("Innovation Wing")
                                                        .capacity(8)
                                                        .status(StudyRoomStatus.AVAILABLE)
                                                        .deviceId("RFID-NB-01")
                                                        .sensorDeviceId("NB-01")
                                                        .temperature(28.3)
                                                        .currentOccupancy(7)
                                                        .occupancyPercent(87.5)
                                                        .description("Bright room with natural light and charging ports.")
                                                        .imageUrl("https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=900")
                                                        .qrCodeValue("QR-NB-101")
                                                        .build(),
                                        StudyRoom.builder()
                                                        .name("Main Building Room 202")
                                                        .roomName("Main Building Room 202")
                                                        .building("Main Building")
                                                        .floor("2")
                                                        .zone("Main Hall")
                                                        .capacity(12)
                                                        .status(StudyRoomStatus.MAINTENANCE)
                                                        .deviceId("RFID-MB-01")
                                                        .sensorDeviceId("MB-01")
                                                        .temperature(23.0)
                                                        .currentOccupancy(0)
                                                        .occupancyPercent(0.0)
                                                        .description("Large room for team sessions (currently under maintenance).")
                                                        .imageUrl("https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=900")
                                                        .qrCodeValue("QR-MB-202")
                                                        .build()));
                }

                if (bookingRepository.count() == 0 && userRepository.count() > 0 && studyRoomRepository.count() > 0) {
                        User sampleStudent = userRepository.findByEmail("student@campus.com").orElse(null);
                        StudyRoom sampleRoom = studyRoomRepository.findAll().stream().findFirst().orElse(null);
                        if (sampleStudent != null && sampleRoom != null) {
                                bookingRepository.saveAll(List.of(
                                                StudyReservation.builder()
                                                                .studentId(sampleStudent.getId())
                                                                .studentName(sampleStudent.getName())
                                                                .studentEmail(sampleStudent.getEmail())
                                                                .roomId(sampleRoom.getId())
                                                                .roomName(sampleRoom.displayName())
                                                                .bookingDate(LocalDateTime.now().plusDays(1).toLocalDate())
                                                                .startTime(java.time.LocalTime.of(10, 0))
                                                                .endTime(java.time.LocalTime.of(12, 0))
                                                                .status(StudyReservationStatus.BOOKED)
                                                                .source(BookingSource.APP)
                                                                .build(),
                                                StudyReservation.builder()
                                                                .studentId(sampleStudent.getId())
                                                                .studentName(sampleStudent.getName())
                                                                .studentEmail(sampleStudent.getEmail())
                                                                .roomId(sampleRoom.getId())
                                                                .roomName(sampleRoom.displayName())
                                                                .bookingDate(LocalDateTime.now().plusDays(2).toLocalDate())
                                                                .startTime(java.time.LocalTime.of(14, 0))
                                                                .endTime(java.time.LocalTime.of(16, 0))
                                                                .status(StudyReservationStatus.BOOKED)
                                                                .source(BookingSource.APP)
                                                                .build()));
                        }
                }

                if (studentRepository.count() == 0) {
                        studentRepository.saveAll(List.of(
                                        Student.builder()
                                                        .studentId("STU0001")
                                                        .name("Alicia Perera")
                                                        .email("alicia.perera@university.edu")
                                                        .cardUid("04A8C13299")
                                                        .faculty("Computing")
                                                        .status(StudentStatus.ACTIVE)
                                                        .build(),
                                        Student.builder()
                                                        .studentId("STU0002")
                                                        .name("Ravin Nandasena")
                                                        .email("ravin.nandasena@university.edu")
                                                        .cardUid("04F1B8731A")
                                                        .faculty("Engineering")
                                                        .status(StudentStatus.ACTIVE)
                                                        .build(),
                                        Student.builder()
                                                        .studentId("STU0003")
                                                        .name("Maya Fernando")
                                                        .email("maya.fernando@university.edu")
                                                        .cardUid("0422DD117C")
                                                        .faculty("Business")
                                                        .status(StudentStatus.INACTIVE)
                                                        .build()));
                }

                List<Equipment> campusEquipmentCatalog = List.of(
                                Equipment.builder().name("MacBook Pro").category("Laptops")
                                                .description("M2 Chip, 16GB RAM")
                                                .imageUrl("https://picsum.photos/seed/macbookpro/800/800")
                                                .available(true)
                                                .status("AVAILABLE")
                                                .build(),
                                Equipment.builder().name("Dell XPS 15").category("Laptops")
                                                .description("Intel i7, 32GB RAM, NVIDIA GPU")
                                                .imageUrl("https://picsum.photos/seed/dellxps15/800/800")
                                                .available(true)
                                                .status("AVAILABLE")
                                                .build(),
                                Equipment.builder().name("iPad Pro 12.9").category("Tablets")
                                                .description("Apple Pencil support for design work")
                                                .imageUrl("https://picsum.photos/seed/ipadpro/800/800")
                                                .available(true)
                                                .status("AVAILABLE")
                                                .build(),
                                Equipment.builder().name("Canon DSLR").category("Cameras")
                                                .description("4K Video, 24MP")
                                                .imageUrl("https://picsum.photos/seed/canondslr/800/800")
                                                .available(true)
                                                .status("AVAILABLE")
                                                .build(),
                                Equipment.builder().name("Sony Mirrorless A7").category("Cameras")
                                                .description("Full-frame photo and video camera")
                                                .imageUrl("https://picsum.photos/seed/sonya7/800/800")
                                                .available(true)
                                                .status("AVAILABLE")
                                                .build(),
                                Equipment.builder().name("Projector Portable").category("Accessories")
                                                .description("HDMI/Wireless")
                                                .imageUrl("https://picsum.photos/seed/projectorportable/800/800")
                                                .available(false)
                                                .status("RESERVED")
                                                .build(),
                                Equipment.builder().name("Wireless Presenter").category("Accessories")
                                                .description("Laser pointer with slide control")
                                                .imageUrl("https://picsum.photos/seed/wirelesspresenter/800/800")
                                                .available(true)
                                                .status("AVAILABLE")
                                                .build(),
                                Equipment.builder().name("Audio Recorder Zoom H4n").category("Audio")
                                                .description("Portable field recorder for interviews")
                                                .imageUrl("https://picsum.photos/seed/zoomh4n/800/800")
                                                .available(true)
                                                .status("AVAILABLE")
                                                .build(),
                                Equipment.builder().name("Raspberry Pi Lab Kit").category("Lab Kits")
                                                .description("Sensors, breadboard, and cables included")
                                                .imageUrl("https://picsum.photos/seed/raspberrypilabkit/800/800")
                                                .available(true)
                                                .status("AVAILABLE")
                                                .build(),
                                Equipment.builder().name("VR Headset Quest").category("Simulation")
                                                .description("Standalone VR kit for immersive labs")
                                                .imageUrl("https://picsum.photos/seed/vrquest/800/800")
                                                .available(false)
                                                .status("MAINTENANCE")
                                                .build());

                Set<String> existingEquipmentNames = new HashSet<>();
                equipmentRepository.findAll().forEach(item -> existingEquipmentNames.add(item.getName()));

                List<Equipment> missingEquipment = campusEquipmentCatalog.stream()
                                .filter(item -> !existingEquipmentNames.contains(item.getName()))
                                .toList();

                if (!missingEquipment.isEmpty()) {
                        equipmentRepository.saveAll(missingEquipment);
                }

                if (tutorRepository.count() == 0) {
                        tutorRepository.saveAll(List.of(
                                        Tutor.builder().name("Dr. Sarah Wilson")
                                                        .email("tutor@campus.com")
                                                        .subjects(List.of("Physics"))
                                                        .availability("Monday 09:00-12:00")
                                                        .mode("On-Campus")
                                                        .bio("PhD in Applied Physics with 8 years of tutoring experience.")
                                                        .qualifications("PhD Applied Physics")
                                                        .averageRating(0.0)
                                                        .totalReviews(0)
                                                        .build(),
                                        Tutor.builder().name("James Miller")
                                                        .email("james.tutor@campus.com")
                                                        .subjects(List.of("Computer Science"))
                                                        .availability("Tuesday 14:00-17:00")
                                                        .mode("Online")
                                                        .bio("Software engineering mentor focused on data structures and OOP.")
                                                        .qualifications("MSc Computer Science")
                                                        .averageRating(0.0)
                                                        .totalReviews(0)
                                                        .build()));
                }

                if (readingRepository.count() == 0) {
                        LocalDateTime now = LocalDateTime.now();
                        readingRepository.saveAll(List.of(
                                        SensorReading.builder().roomId("all").metric("TEMPERATURE").value(22.0)
                                                        .timestamp(now).build(),
                                        SensorReading.builder().roomId("all").metric("NOISE").value(40.0).timestamp(now)
                                                        .build(),
                                        SensorReading.builder().roomId("all").metric("OCCUPANCY").value(30.0)
                                                        .timestamp(now).build(),
                                        SensorReading.builder().roomId("all").metric("CO2").value(450.0).timestamp(now)
                                                        .build()));
                }

                if (groupRepository.count() == 0) {
                        groupRepository.saveAll(List.of(
                                        StudyGroup.builder().name("Software Engineering").subject("CS101")
                                                        .moduleCode("SWE101")
                                                        .description("Preparing for final exam")
                                                        .members(new ArrayList<>()).maxMembers(10).build(),
                                        StudyGroup.builder().name("Quantum Mechanics").subject("Physics")
                                                        .moduleCode("PHY302")
                                                        .description("Weekly study session").members(new ArrayList<>())
                                                        .maxMembers(5).build()));
                }

                if (studyCircleRepository.count() == 0) {
                        User owner = userRepository.findByEmail("student@campus.com").orElse(null);
                        User memberOne = userRepository.findByEmail("test@gmail.com").orElse(null);
                        User memberTwo = userRepository.findByEmail("tutor@campus.com").orElse(null);

                        if (owner != null) {
                                LocalDateTime now = LocalDateTime.now();

                                StudyCircle seCircle = studyCircleRepository.save(StudyCircle.builder()
                                                .title("Software Engineering")
                                                .description("Preparing for final exam")
                                                .subject("SE")
                                                .createdByUserId(owner.getId())
                                                .createdByName(owner.getName())
                                                .meetingDay("Friday")
                                                .meetingTime("16:00")
                                                .maxMembers(10)
                                                .isActive(true)
                                                .createdAt(now.minusDays(3))
                                                .updatedAt(now.minusDays(3))
                                                .build());

                                StudyCircle qmCircle = studyCircleRepository.save(StudyCircle.builder()
                                                .title("Quantum Mechanics")
                                                .description("Weekly study session")
                                                .subject("Physics")
                                                .createdByUserId(owner.getId())
                                                .createdByName(owner.getName())
                                                .meetingDay("Wednesday")
                                                .meetingTime("14:00")
                                                .maxMembers(12)
                                                .isActive(true)
                                                .createdAt(now.minusDays(2))
                                                .updatedAt(now.minusDays(2))
                                                .build());

                                StudyCircle dbCircle = studyCircleRepository.save(StudyCircle.builder()
                                                .title("Database Systems")
                                                .description("ER diagrams and normalization practice")
                                                .subject("DBMS")
                                                .createdByUserId(owner.getId())
                                                .createdByName(owner.getName())
                                                .meetingDay("Monday")
                                                .meetingTime("18:00")
                                                .maxMembers(8)
                                                .isActive(true)
                                                .createdAt(now.minusDays(1))
                                                .updatedAt(now.minusDays(1))
                                                .build());

                                List<StudyCircleMember> memberships = new ArrayList<>();
                                memberships.add(StudyCircleMember.builder()
                                                .circleId(seCircle.getId())
                                                .userId(owner.getId())
                                                .userName(owner.getName())
                                                .userEmail(owner.getEmail())
                                                .joinedAt(now.minusDays(3))
                                                .role(StudyCircleRole.OWNER)
                                                .build());

                                memberships.add(StudyCircleMember.builder()
                                                .circleId(qmCircle.getId())
                                                .userId(owner.getId())
                                                .userName(owner.getName())
                                                .userEmail(owner.getEmail())
                                                .joinedAt(now.minusDays(2))
                                                .role(StudyCircleRole.OWNER)
                                                .build());

                                memberships.add(StudyCircleMember.builder()
                                                .circleId(dbCircle.getId())
                                                .userId(owner.getId())
                                                .userName(owner.getName())
                                                .userEmail(owner.getEmail())
                                                .joinedAt(now.minusDays(1))
                                                .role(StudyCircleRole.OWNER)
                                                .build());

                                if (memberOne != null) {
                                        memberships.add(StudyCircleMember.builder()
                                                        .circleId(seCircle.getId())
                                                        .userId(memberOne.getId())
                                                        .userName(memberOne.getName())
                                                        .userEmail(memberOne.getEmail())
                                                        .joinedAt(now.minusDays(2))
                                                        .role(StudyCircleRole.MEMBER)
                                                        .build());
                                        memberships.add(StudyCircleMember.builder()
                                                        .circleId(qmCircle.getId())
                                                        .userId(memberOne.getId())
                                                        .userName(memberOne.getName())
                                                        .userEmail(memberOne.getEmail())
                                                        .joinedAt(now.minusDays(1))
                                                        .role(StudyCircleRole.MEMBER)
                                                        .build());
                                }

                                if (memberTwo != null) {
                                        memberships.add(StudyCircleMember.builder()
                                                        .circleId(qmCircle.getId())
                                                        .userId(memberTwo.getId())
                                                        .userName(memberTwo.getName())
                                                        .userEmail(memberTwo.getEmail())
                                                        .joinedAt(now.minusHours(18))
                                                        .role(StudyCircleRole.MEMBER)
                                                        .build());
                                }

                                studyCircleMemberRepository.saveAll(memberships);
                        }
                }

                if (resourceRepository.count() == 0) {
                        resourceRepository.saveAll(List.of(
                                        AcademicResource.builder().title("Database Systems Notes").subject("CS")
                                                        .description("Comprehensive notes on SQL and NoSQL")
                                                        .fileName("db_notes.pdf").build(),
                                        AcademicResource.builder().title("Algorithm Cheat Sheet").subject("CS")
                                                        .description("Quick reference for common algorithms")
                                                        .fileName("algo_sheet.pdf").build()));
                }

                if (calendarRepository.count() == 0) {
                        calendarRepository.saveAll(List.of(
                                        AcademicCalendarEvent.builder().name("Final Exams").date("2026-05-15")
                                                        .category("Exam").description("General exam period starts")
                                                        .build(),
                                        AcademicCalendarEvent.builder().name("Spring Break").date("2026-04-01")
                                                        .category("Holiday").description("No lectures").build()));
                }

                if (issueRepository.count() == 0) {
                        issueRepository.saveAll(List.of(
                                        CampusIssue.builder()
                                                        .title("Broken AC in Library")
                                                        .category("Maintenance")
                                                        .description("AC in 2nd floor silent zone is leaking.")
                                                        .building("Library")
                                                        .locationText("Library 2nd floor")
                                                        .priority(IssuePriority.MEDIUM)
                                                        .status(IssueStatus.OPEN)
                                                        .createdByUserId(null)
                                                        .createdByName("System Seed")
                                                        .createdAt(LocalDateTime.now())
                                                        .updatedAt(LocalDateTime.now())
                                                        .build()));
                }
        }
}
