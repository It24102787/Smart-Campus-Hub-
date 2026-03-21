package com.example.academic_support_portal.tutor_request.service;

import com.example.academic_support_portal.notification.EmailService;
import com.example.academic_support_portal.tutor.model.Tutor;
import com.example.academic_support_portal.tutor.repository.TutorRepository;
import com.example.academic_support_portal.tutor_request.dto.TutorRequestActionResponse;
import com.example.academic_support_portal.tutor_request.dto.TutorRequestStatusUpdateRequest;
import com.example.academic_support_portal.tutor_request.model.TutorRequest;
import com.example.academic_support_portal.tutor_request.repository.TutorRequestRepository;
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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
@Slf4j
// Business logic for tutor requests: filtering, role checks, status transitions, and notifications.
public class TutorRequestService {
  private final TutorRequestRepository repository;
  private final TutorRepository tutorRepository;
  private final UserRepository userRepository;
  private final EmailService emailService;

  // Student dashboard query for requests submitted by one student.
  public List<TutorRequest> getByStudentId(String studentId) {
    return repository.findByStudentId(studentId);
  }

  // Tutor query by tutor email (case-insensitive).
  public List<TutorRequest> getByTutorEmail(String tutorEmail) {
    return repository.findByTutorEmailIgnoreCase(tutorEmail);
  }

  // Consolidates request lookup using tutor email, tutor profile id, and tutor name for reliable tutor inbox results.
  public List<TutorRequest> getForCurrentTutor(String tutorEmail, String status) {
    User currentUser = getCurrentUser();
    if (currentUser == null || !hasRole(currentUser, Role.TUTOR)) {
      throw new ResponseStatusException(FORBIDDEN, "Only tutors can access tutor requests");
    }

    String effectiveEmail = StringUtils.hasText(tutorEmail) ? tutorEmail.trim() : currentUser.getEmail();
    String effectiveTutorName = StringUtils.hasText(currentUser.getName()) ? currentUser.getName().trim() : null;
    String normalizedStatus = StringUtils.hasText(status) ? status.trim().toUpperCase(Locale.ROOT) : null;
    boolean filterByStatus = StringUtils.hasText(normalizedStatus) && !"ALL".equals(normalizedStatus);

    Tutor tutorProfile = tutorRepository.findByEmailIgnoreCase(currentUser.getEmail()).orElse(null);
    String tutorId = tutorProfile != null ? tutorProfile.getId() : null;

    List<TutorRequest> byEmail = filterByStatus
        ? repository.findByTutorEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(effectiveEmail, normalizedStatus)
        : repository.findByTutorEmailIgnoreCaseOrderByCreatedAtDesc(effectiveEmail);

    List<TutorRequest> byTutorId = (!StringUtils.hasText(tutorId))
        ? List.of()
        : filterByStatus
            ? repository.findByTutorIdAndStatusOrderByCreatedAtDesc(tutorId, normalizedStatus)
            : repository.findByTutorIdOrderByCreatedAtDesc(tutorId);

    List<TutorRequest> byTutorName = (!StringUtils.hasText(effectiveTutorName))
        ? List.of()
        : filterByStatus
            ? repository.findByTutorNameIgnoreCaseAndStatusOrderByCreatedAtDesc(effectiveTutorName, normalizedStatus)
            : repository.findByTutorNameIgnoreCaseOrderByCreatedAtDesc(effectiveTutorName);

    Map<String, TutorRequest> merged = new LinkedHashMap<>();
    for (TutorRequest request : byEmail) {
      merged.put(request.getId(), request);
    }
    for (TutorRequest request : byTutorId) {
      merged.put(request.getId(), request);
    }
    for (TutorRequest request : byTutorName) {
      merged.put(request.getId(), request);
    }

    List<TutorRequest> requests = new ArrayList<>(merged.values());
    log.info(
        "Tutor dashboard fetch - userEmail={} effectiveEmail={} tutorId={} tutorName={} status={} resultCount={}",
        currentUser.getEmail(),
        effectiveEmail,
        tutorId,
        effectiveTutorName,
        normalizedStatus,
        requests.size());
    return requests;
  }

  // Generic list endpoint used by admin/generic views.
  public List<TutorRequest> getAll() {
    return repository.findAll();
  }

  // Creates a tutor request, enriches it with authenticated student data, and attempts email notification.
  public TutorRequestActionResponse create(TutorRequest request) {
    log.info("Starting tutor request creation");
    log.info("Incoming tutor request payload: {}", request);

    User currentUser = getCurrentUser();
    if (currentUser != null) {
      request.setStudentId(currentUser.getId());
      request.setStudentName(currentUser.getName());
      request.setStudentEmail(currentUser.getEmail());
    }

    if (StringUtils.hasText(request.getTutorId())) {
      Tutor tutor = tutorRepository.findById(request.getTutorId())
          .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tutor not found"));
      if (StringUtils.hasText(request.getTutorEmail()) && tutor.getEmail() != null
          && !request.getTutorEmail().trim().equalsIgnoreCase(tutor.getEmail().trim())) {
        log.warn("Tutor email overridden from tutorId mapping. payloadTutorEmail={}, tutorEmailFromDb={}",
            request.getTutorEmail(), tutor.getEmail());
      }
      request.setTutorName(tutor.getName());
      if (StringUtils.hasText(tutor.getEmail())) {
        request.setTutorEmail(tutor.getEmail().trim());
      }
    }

    log.info("Tutor request target tutorEmail={}", request.getTutorEmail());

    if (!StringUtils.hasText(request.getTutorEmail())) {
      throw new ResponseStatusException(BAD_REQUEST, "Tutor email is required");
    }

    request.setStatus("PENDING");
    request.setCreatedAt(Instant.now().toString());
    request.setUpdatedAt(Instant.now().toString());

    TutorRequest saved = repository.save(request);
    log.info("Tutor request DB save succeeded. id={} tutorEmail={}", saved.getId(), saved.getTutorEmail());

    String message = "Request saved successfully";
    String warning = null;
    try {
      log.info("Starting tutor request email send. requestId={} tutorEmail={}", saved.getId(), saved.getTutorEmail());
      emailService.sendTutorRequestEmailToTutor(saved);
      log.info("Tutor request email send succeeded. requestId={} tutorEmail={}", saved.getId(), saved.getTutorEmail());
    } catch (Exception ex) {
      warning = "Request saved, but notification could not be sent";
      message = "Request saved successfully";
      log.error(
          "Tutor request email send failed. requestId={} tutorEmail={} exceptionMessage={}",
          saved.getId(),
          saved.getTutorEmail(),
          ex.getMessage(),
          ex);
    }

    return TutorRequestActionResponse.builder()
        .request(saved)
        .message(message)
        .warning(warning)
        .build();
  }

  // Updates request status; ACCEPTED routes through dedicated acceptance validation.
  public TutorRequestActionResponse updateStatus(String id, String status, TutorRequestStatusUpdateRequest payload) {
    TutorRequest req = repository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Request not found"));

    String normalizedStatus = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
    if ("ACCEPTED".equals(normalizedStatus)) {
      return acceptRequest(id, payload);
    }

    req.setStatus(normalizedStatus);
    req.setUpdatedAt(Instant.now().toString());
    TutorRequest saved = repository.save(req);

    return TutorRequestActionResponse.builder()
        .request(saved)
        .warning(null)
        .build();
  }

  // Accepts a request only if the current tutor owns it and required session details are present.
  public TutorRequestActionResponse acceptRequest(String id, TutorRequestStatusUpdateRequest payload) {
    TutorRequest req = repository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Request not found"));

    User currentUser = getCurrentUser();
    boolean isTutor = currentUser != null && hasRole(currentUser, Role.TUTOR);

    if (!isTutor) {
      throw new ResponseStatusException(FORBIDDEN, "Only tutors can accept requests");
    }
    if (currentUser != null && !isRequestOwnedByTutor(req, currentUser)) {
      throw new ResponseStatusException(FORBIDDEN, "Tutors can only accept their own requests");
    }

    if (payload != null && StringUtils.hasText(payload.getSessionDateTime())) {
      req.setSessionDateTime(payload.getSessionDateTime());
    }
    if (payload != null && StringUtils.hasText(payload.getJoinLink())) {
      req.setJoinLink(payload.getJoinLink());
    }

    if (!StringUtils.hasText(req.getJoinLink())) {
      throw new ResponseStatusException(BAD_REQUEST, "joinLink is required to accept");
    }
    if (!StringUtils.hasText(req.getSessionDateTime())) {
      throw new ResponseStatusException(BAD_REQUEST, "sessionDateTime is required to accept");
    }

    req.setStatus("ACCEPTED");
    req.setUpdatedAt(Instant.now().toString());
    TutorRequest saved = repository.save(req);

    String warning = null;
    try {
      emailService.sendAcceptanceEmailToStudent(saved);
    } catch (Exception ex) {
      warning = "Request accepted, but notification could not be sent.";
      log.error("Failed to send acceptance email for request {}", saved.getId(), ex);
    }

    return TutorRequestActionResponse.builder()
        .request(saved)
        .warning(warning)
        .build();
  }

  // Rejects a request with the same ownership guard as accept.
  public TutorRequestActionResponse rejectRequest(String id) {
    TutorRequest req = repository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Request not found"));

    User currentUser = getCurrentUser();
    boolean isTutor = currentUser != null && hasRole(currentUser, Role.TUTOR);

    if (!isTutor) {
      throw new ResponseStatusException(FORBIDDEN, "Only tutors can reject requests");
    }
    if (currentUser != null && !isRequestOwnedByTutor(req, currentUser)) {
      throw new ResponseStatusException(FORBIDDEN, "Tutors can only reject their own requests");
    }

    req.setStatus("REJECTED");
    req.setUpdatedAt(Instant.now().toString());
    TutorRequest saved = repository.save(req);

    return TutorRequestActionResponse.builder()
        .request(saved)
        .warning(null)
        .build();
  }

  // Hard delete for cleanup operations.
  public void delete(String id) {
    repository.deleteById(id);
  }

  // Resolves authenticated principal to a user entity for authorization decisions.
  private User getCurrentUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
      return null;
    }
    return userRepository.findByEmail(auth.getName()).orElse(null);
  }

  // Supports both single role and multi-role user storage styles.
  private boolean hasRole(User user, Role role) {
    if (user == null || role == null) {
      return false;
    }
    if (user.getRole() == role) {
      return true;
    }
    return user.getRoles() != null && user.getRoles().contains(role);
  }

  // Prevents tutors from accepting/rejecting requests that do not belong to them.
  private boolean isRequestOwnedByTutor(TutorRequest request, User tutorUser) {
    if (request == null || tutorUser == null || !StringUtils.hasText(tutorUser.getEmail())) {
      return false;
    }

    if (StringUtils.hasText(request.getTutorEmail())
        && tutorUser.getEmail().equalsIgnoreCase(request.getTutorEmail().trim())) {
      return true;
    }

    if (StringUtils.hasText(request.getTutorId())) {
      return tutorRepository.findByEmailIgnoreCase(tutorUser.getEmail())
          .map(tutor -> tutor.getId().equals(request.getTutorId()))
          .orElse(false);
    }

    return false;
  }
}
