package com.example.academic_support_portal.tutor.service;

import com.example.academic_support_portal.notification.EmailService;
import com.example.academic_support_portal.tutor.dto.SessionStatusUpdateRequest;
import com.example.academic_support_portal.tutor.dto.TutorCreateRequest;
import com.example.academic_support_portal.tutor.dto.TutorRatingSummaryResponse;
import com.example.academic_support_portal.tutor.dto.TutorResponse;
import com.example.academic_support_portal.tutor.dto.TutorReviewRequest;
import com.example.academic_support_portal.tutor.dto.TutorReviewResponse;
import com.example.academic_support_portal.tutor.dto.TutorUpdateRequest;
import com.example.academic_support_portal.tutor.model.Tutor;
import com.example.academic_support_portal.tutor.model.TutorReview;
import com.example.academic_support_portal.tutor.model.TutoringSession;
import com.example.academic_support_portal.tutor.repository.TutorRepository;
import com.example.academic_support_portal.tutor.repository.TutorReviewRepository;
import com.example.academic_support_portal.tutor.repository.TutoringSessionRepository;
import com.example.academic_support_portal.user.model.Role;
import com.example.academic_support_portal.user.model.User;
import com.example.academic_support_portal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
@Slf4j
public class TutorService {

  private final TutorRepository tutorRepository;
  private final TutorReviewRepository tutorReviewRepository;
  private final UserRepository userRepository;
  private final TutoringSessionRepository sessionRepository;
  private final EmailService emailService;

  private static final List<String> SESSION_STATUS_UPDATES = List.of("ACCEPTED", "REJECTED", "CONFIRMED");

  public List<TutorResponse> getTutors(String subject, String availability, String mode) {
    String filterSubject = normalize(subject);
    String filterAvailability = normalize(availability);
    String filterMode = normalize(mode);

    return tutorRepository.findAll().stream()
        .filter(tutor -> matchesSubject(tutor.getSubjects(), filterSubject))
        .filter(tutor -> matchesText(tutor.getAvailability(), filterAvailability))
        .filter(tutor -> matchesText(tutor.getMode(), filterMode))
        .map(this::toResponse)
        .toList();
  }

  public TutorResponse getTutorById(String id) {
    return toResponse(getTutorEntity(id));
  }

  public TutorResponse createTutor(TutorCreateRequest req) {
    String email = req.getEmail().trim();
    if (tutorRepository.findByEmailIgnoreCase(email).isPresent()) {
      throw new ResponseStatusException(CONFLICT, "A tutor with this email already exists");
    }

    Tutor tutor = Tutor.builder()
        .name(req.getName().trim())
        .email(email)
        .subjects(sanitizeSubjects(req.getSubjects()))
        .availability(req.getAvailability().trim())
        .mode(req.getMode().trim())
        .bio(sanitizeOptional(req.getBio()))
        .qualifications(sanitizeOptional(req.getQualifications()))
        .averageRating(0.0)
        .totalReviews(0)
        .build();

    return toResponse(tutorRepository.save(tutor));
  }

  public TutorResponse updateTutor(String id, TutorUpdateRequest req) {
    Tutor tutor = getTutorEntity(id);

    if (StringUtils.hasText(req.getName())) tutor.setName(req.getName().trim());
    if (StringUtils.hasText(req.getEmail())) tutor.setEmail(req.getEmail().trim());
    if (req.getSubjects() != null && !req.getSubjects().isEmpty()) tutor.setSubjects(sanitizeSubjects(req.getSubjects()));
    if (StringUtils.hasText(req.getAvailability())) tutor.setAvailability(req.getAvailability().trim());
    if (StringUtils.hasText(req.getMode())) tutor.setMode(req.getMode().trim());
    if (req.getBio() != null) tutor.setBio(sanitizeOptional(req.getBio()));
    if (req.getQualifications() != null) tutor.setQualifications(sanitizeOptional(req.getQualifications()));

    return toResponse(tutorRepository.save(tutor));
  }

  public void deleteTutor(String id) {
    if (!tutorRepository.existsById(id)) {
      throw new ResponseStatusException(NOT_FOUND, "Tutor not found");
    }
    tutorReviewRepository.deleteByTutorId(id);
    tutorRepository.deleteById(id);
  }

  public TutorReviewResponse createOrUpdateReview(String tutorId, TutorReviewRequest request) {
    Tutor tutor = getTutorEntity(tutorId);
    User student = getCurrentUser();

    if (!hasRole(student, Role.STUDENT)) {
      throw new ResponseStatusException(FORBIDDEN, "Only students can submit reviews");
    }

    TutorReview review = tutorReviewRepository.findByTutorIdAndStudentId(tutor.getId(), student.getId())
        .orElseGet(() -> TutorReview.builder()
            .tutorId(tutor.getId())
            .studentId(student.getId())
            .createdAt(Instant.now())
            .build());

    review.setRating(request.getRating());
    review.setComment(sanitizeOptional(request.getComment()));
    review.setUpdatedAt(Instant.now());

    TutorReview saved = tutorReviewRepository.save(review);
    recalculateTutorRating(tutor.getId());
    return toReviewResponse(saved);
  }

  public List<TutorReviewResponse> getReviewsForTutor(String tutorId) {
    getTutorEntity(tutorId);
    return tutorReviewRepository.findByTutorIdOrderByUpdatedAtDesc(tutorId).stream()
        .map(this::toReviewResponse)
        .toList();
  }

  public TutorRatingSummaryResponse getRatingSummary(String tutorId) {
    Tutor tutor = getTutorEntity(tutorId);
    return TutorRatingSummaryResponse.builder()
        .tutorId(tutor.getId())
        .averageRating(tutor.getAverageRating())
        .totalReviews(tutor.getTotalReviews())
        .build();
  }

  public void recalculateTutorRating(String tutorId) {
    Tutor tutor = getTutorEntity(tutorId);
    List<TutorReview> reviews = tutorReviewRepository.findByTutorIdOrderByUpdatedAtDesc(tutorId);

    int totalReviews = reviews.size();
    double average = reviews.stream().mapToInt(TutorReview::getRating).average().orElse(0.0);

    tutor.setTotalReviews(totalReviews);
    tutor.setAverageRating(Math.round(average * 100.0) / 100.0);
    tutorRepository.save(tutor);
  }

  public TutoringSession bookSession(TutoringSession session) {
    if (session == null) {
      throw new ResponseStatusException(BAD_REQUEST, "Session payload is required");
    }

    User currentUser = getCurrentUser();
    if (!hasRole(currentUser, Role.STUDENT)) {
      throw new ResponseStatusException(FORBIDDEN, "Only students can book tutoring sessions");
    }

    String tutorId = session.getTutorId();
    if (!StringUtils.hasText(tutorId) && StringUtils.hasText(session.getTutorEmail())) {
      tutorId = tutorRepository.findByEmailIgnoreCase(session.getTutorEmail().trim())
          .map(Tutor::getId)
          .orElse(null);
      session.setTutorId(tutorId);
    }
    if (!StringUtils.hasText(tutorId)) {
      throw new ResponseStatusException(BAD_REQUEST, "Tutor ID is required");
    }

    Tutor tutor = tutorRepository.findById(tutorId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tutor not found"));
    session.setTutorName(tutor.getName());
    if (StringUtils.hasText(tutor.getEmail())) {
      session.setTutorEmail(tutor.getEmail().trim());
    }
    if (!StringUtils.hasText(session.getMode()) && StringUtils.hasText(tutor.getMode())) {
      session.setMode(tutor.getMode().trim());
    }

    session.setStudentId(currentUser.getId());
    session.setStudentName(currentUser.getName());
    if (StringUtils.hasText(currentUser.getEmail())) {
      session.setStudentEmail(currentUser.getEmail().trim());
    }

    if (StringUtils.hasText(session.getNote())) {
      session.setNote(session.getNote().trim());
    }

    session.setStatus("REQUESTED");
    if (StringUtils.hasText(session.getTutorEmail())) {
      userRepository.findByEmail(session.getTutorEmail().trim())
          .ifPresentOrElse(
              user -> session.setTutorUserId(user.getId()),
              () -> log.debug("No user record found for tutor email {} while booking", session.getTutorEmail()));
    }
    log.debug(
        "Booking session resolved tutorId={} tutorEmail={} tutorUserId={} studentId={}",
        session.getTutorId(),
        session.getTutorEmail(),
        session.getTutorUserId(),
        session.getStudentId());

    TutoringSession saved = sessionRepository.save(session);

    enrichSessionParticipantData(saved);
    try {
      emailService.notifyTutorOfNewRequest(saved);
    } catch (Exception ex) {
      log.error("Failed to send new tutoring request email. sessionId={}", saved.getId(), ex);
    }

    return saved;
  }

  public TutoringSession updateSessionStatus(String id, String status, SessionStatusUpdateRequest payload) {
    TutoringSession session = sessionRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Session not found"));

    User currentUser = getCurrentUser();
    backfillTutorUserId(session);
    log.debug(
        "Session status update attempt. authEmail={} authUserId={} sessionId={} tutorEmail={} tutorId={} tutorUserId={} currentStatus={}",
        currentUser.getEmail(),
        currentUser.getId(),
        session.getId(),
        session.getTutorEmail(),
        session.getTutorId(),
        session.getTutorUserId(),
        session.getStatus());
    boolean isTutor = hasRole(currentUser, Role.TUTOR);
    boolean isAdmin = hasRole(currentUser, Role.ADMIN);
    if (!isTutor && !isAdmin) {
      throw new ResponseStatusException(FORBIDDEN, "Only tutors or admins can update session status");
    }
    if (isTutor && !isOwnerTutor(session, currentUser)) {
      log.debug(
          "Tutor ownership check failed. authEmail={} authUserId={} sessionTutorEmail={} sessionTutorId={} sessionTutorUserId={}",
          currentUser.getEmail(),
          currentUser.getId(),
          session.getTutorEmail(),
          session.getTutorId(),
          session.getTutorUserId());
      throw new ResponseStatusException(FORBIDDEN, "Tutors can update only their own sessions");
    }

    String normalizedStatus = normalizeStatus(status);
    if (!SESSION_STATUS_UPDATES.contains(normalizedStatus)) {
      throw new ResponseStatusException(BAD_REQUEST, "Invalid status update");
    }

    String currentStatus = normalizeStatus(session.getStatus());
    if (!isValidStatusTransition(currentStatus, normalizedStatus)) {
      throw new ResponseStatusException(CONFLICT, "Invalid status transition");
    }

    if (payload != null) {
      if (StringUtils.hasText(payload.getJoinLink())) {
        session.setJoinLink(payload.getJoinLink().trim());
      }
      if (StringUtils.hasText(payload.getTutorNote())) {
        session.setTutorNote(payload.getTutorNote().trim());
      }
    }
    if (requiresJoinLink(normalizedStatus) && !StringUtils.hasText(session.getJoinLink())) {
      throw new ResponseStatusException(BAD_REQUEST, "joinLink is required to confirm a session");
    }

    session.setStatus(normalizedStatus);
    enrichSessionParticipantData(session);
    TutoringSession saved = sessionRepository.save(session);

    try {
      if ("REJECTED".equals(normalizedStatus)) {
        emailService.notifyStudentOfRejectedRequest(saved);
      } else {
        emailService.notifyStudentOfAcceptedRequest(saved);
      }
    } catch (Exception ex) {
      log.error("Failed to send tutoring status email. sessionId={} status={}", saved.getId(), normalizedStatus, ex);
    }

    return saved;
  }

  public void enrichSessionParticipantData(TutoringSession session) {
    if (session == null) {
      return;
    }

    if (!StringUtils.hasText(session.getTutorName()) || !StringUtils.hasText(session.getTutorEmail())) {
      if (StringUtils.hasText(session.getTutorId())) {
        tutorRepository.findById(session.getTutorId()).ifPresent(tutor -> {
          if (!StringUtils.hasText(session.getTutorName())) {
            session.setTutorName(tutor.getName());
          }
          if (!StringUtils.hasText(session.getTutorEmail()) && StringUtils.hasText(tutor.getEmail())) {
            session.setTutorEmail(tutor.getEmail().trim());
          }
        });
      }
    }

    if (!StringUtils.hasText(session.getTutorUserId()) && StringUtils.hasText(session.getTutorEmail())) {
      userRepository.findByEmail(session.getTutorEmail().trim())
          .ifPresent(user -> session.setTutorUserId(user.getId()));
    }

    if (!StringUtils.hasText(session.getTutorUserId())) {
      backfillTutorUserId(session);
    }

    if (!StringUtils.hasText(session.getStudentName()) || !StringUtils.hasText(session.getStudentEmail())) {
      if (StringUtils.hasText(session.getStudentId())) {
        userRepository.findById(session.getStudentId()).ifPresent(student -> {
          if (!StringUtils.hasText(session.getStudentName())) {
            session.setStudentName(student.getName());
          }
          if (!StringUtils.hasText(session.getStudentEmail()) && StringUtils.hasText(student.getEmail())) {
            session.setStudentEmail(student.getEmail().trim());
          }
        });
      }
    }
  }

  private Tutor getTutorEntity(String id) {
    return tutorRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tutor not found"));
  }

  private User getCurrentUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated() || !StringUtils.hasText(auth.getName())) {
      throw new ResponseStatusException(FORBIDDEN, "Authentication required");
    }
    return userRepository.findByEmail(auth.getName())
        .orElseThrow(() -> new ResponseStatusException(FORBIDDEN, "Authenticated user not found"));
  }

  private boolean hasRole(User user, Role role) {
    if (user == null || role == null) return false;
    if (user.getRole() == role) return true;
    return user.getRoles() != null && user.getRoles().contains(role);
  }

  private boolean isOwnerTutor(TutoringSession session, User tutorUser) {
    if (session == null || tutorUser == null) {
      return false;
    }
    if (StringUtils.hasText(session.getTutorUserId())
        && session.getTutorUserId().trim().equals(tutorUser.getId())) {
      return true;
    }
    if (StringUtils.hasText(session.getTutorEmail())
        && StringUtils.hasText(tutorUser.getEmail())
        && tutorUser.getEmail().trim().equalsIgnoreCase(session.getTutorEmail().trim())) {
      return true;
    }
    if (StringUtils.hasText(session.getTutorId())) {
      boolean matchesTutorProfile = tutorRepository.findByEmailIgnoreCase(tutorUser.getEmail())
          .map(tutor -> tutor.getId().equals(session.getTutorId()))
          .orElse(false);
      if (matchesTutorProfile) {
        return true;
      }
    }
    if (StringUtils.hasText(session.getTutorId())
        && StringUtils.hasText(tutorUser.getId())
        && tutorUser.getId().equals(session.getTutorId())) {
      return true;
    }
    return false;
  }

  private void backfillTutorUserId(TutoringSession session) {
    if (session == null || StringUtils.hasText(session.getTutorUserId())) {
      return;
    }
    if (StringUtils.hasText(session.getTutorId())) {
      userRepository.findById(session.getTutorId()).ifPresent(user -> {
        session.setTutorUserId(user.getId());
        log.debug("Backfilled tutorUserId from userId match. sessionId={} tutorUserId={}", session.getId(), user.getId());
      });
      if (StringUtils.hasText(session.getTutorUserId())) {
        return;
      }
      tutorRepository.findById(session.getTutorId()).ifPresent(tutor -> {
        if (StringUtils.hasText(tutor.getEmail())) {
          userRepository.findByEmail(tutor.getEmail().trim()).ifPresent(user -> {
            session.setTutorUserId(user.getId());
            log.debug("Backfilled tutorUserId from tutor profile. sessionId={} tutorUserId={}", session.getId(), user.getId());
          });
        }
      });
      if (StringUtils.hasText(session.getTutorUserId())) {
        return;
      }
    }
    if (StringUtils.hasText(session.getTutorEmail())) {
      userRepository.findByEmail(session.getTutorEmail().trim()).ifPresent(user -> {
        session.setTutorUserId(user.getId());
        log.debug("Backfilled tutorUserId from tutor email. sessionId={} tutorUserId={}", session.getId(), user.getId());
      });
    }
  }

  private String normalizeStatus(String value) {
    if (!StringUtils.hasText(value)) {
      return "";
    }
    return value.trim().toUpperCase(Locale.ROOT);
  }

  private boolean requiresJoinLink(String status) {
    return "ACCEPTED".equals(status) || "CONFIRMED".equals(status);
  }

  private boolean isValidStatusTransition(String currentStatus, String nextStatus) {
    if (!StringUtils.hasText(nextStatus)) {
      return false;
    }
    if ("REQUESTED".equals(currentStatus) || "PENDING".equals(currentStatus) || !StringUtils.hasText(currentStatus)) {
      return !"REQUESTED".equals(nextStatus) && !"PENDING".equals(nextStatus);
    }
    return false;
  }

  private TutorResponse toResponse(Tutor tutor) {
    return TutorResponse.builder()
        .id(tutor.getId())
        .name(tutor.getName())
        .email(tutor.getEmail())
        .subjects(tutor.getSubjects())
        .availability(tutor.getAvailability())
        .mode(tutor.getMode())
        .bio(tutor.getBio())
        .qualifications(tutor.getQualifications())
        .averageRating(tutor.getAverageRating())
        .totalReviews(tutor.getTotalReviews())
        .build();
  }

  private TutorReviewResponse toReviewResponse(TutorReview review) {
    return TutorReviewResponse.builder()
        .id(review.getId())
        .tutorId(review.getTutorId())
        .studentId(review.getStudentId())
        .rating(review.getRating())
        .comment(review.getComment())
        .createdAt(review.getCreatedAt())
        .updatedAt(review.getUpdatedAt())
        .build();
  }

  private List<String> sanitizeSubjects(List<String> subjects) {
    List<String> sanitized = new ArrayList<>();
    for (String subject : subjects) {
      if (StringUtils.hasText(subject)) sanitized.add(subject.trim());
    }
    if (sanitized.isEmpty()) {
      throw new ResponseStatusException(BAD_REQUEST, "At least one subject is required");
    }
    return sanitized;
  }

  private String sanitizeOptional(String value) {
    if (!StringUtils.hasText(value)) return null;
    return value.trim();
  }

  private String normalize(String value) {
    if (!StringUtils.hasText(value)) return null;
    return value.trim().toLowerCase(Locale.ROOT);
  }

  private boolean matchesText(String actual, String expected) {
    if (expected == null) return true;
    return actual != null && actual.trim().toLowerCase(Locale.ROOT).contains(expected);
  }

  private boolean matchesSubject(List<String> subjects, String expectedSubject) {
    if (expectedSubject == null) return true;
    if (subjects == null || subjects.isEmpty()) return false;
    return subjects.stream().anyMatch(subject -> matchesText(subject, expectedSubject));
  }
}
