package com.example.academic_support_portal.tutor.controller;

import com.example.academic_support_portal.tutor.dto.TutorCreateRequest;
import com.example.academic_support_portal.tutor.dto.TutorRatingSummaryResponse;
import com.example.academic_support_portal.tutor.dto.TutorResponse;
import com.example.academic_support_portal.tutor.dto.TutorReviewRequest;
import com.example.academic_support_portal.tutor.dto.TutorReviewResponse;
import com.example.academic_support_portal.tutor.dto.SessionStatusUpdateRequest;
import com.example.academic_support_portal.tutor.model.Tutor;
import com.example.academic_support_portal.tutor.dto.TutorUpdateRequest;
import com.example.academic_support_portal.tutor.model.TutoringSession;
import com.example.academic_support_portal.tutor.repository.TutorRepository;
import com.example.academic_support_portal.tutor.repository.TutoringSessionRepository;
import com.example.academic_support_portal.tutor.service.TutorService;
import com.example.academic_support_portal.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping("/api/tutors")
@RequiredArgsConstructor
public class TutorController {

  private final TutorService tutorService;
  private final TutoringSessionRepository sessionRepository;
  private final TutorRepository tutorRepository;
  private final UserRepository userRepository;

  @GetMapping
  public List<TutorResponse> getTutors(
      @RequestParam(required = false) String subject,
      @RequestParam(required = false) String availability,
      @RequestParam(required = false) String mode) {
    return tutorService.getTutors(subject, availability, mode);
  }

  @GetMapping("/{id}")
  public TutorResponse getTutor(@PathVariable String id) {
    return tutorService.getTutorById(id);
  }

  @PostMapping
  @PreAuthorize("hasAnyRole('ADMIN','TUTOR')")
  public TutorResponse createTutor(@Valid @RequestBody TutorCreateRequest req) {
    return tutorService.createTutor(req);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public TutorResponse updateTutor(@PathVariable String id, @Valid @RequestBody TutorUpdateRequest req) {
    return tutorService.updateTutor(id, req);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deleteTutor(@PathVariable String id) {
    tutorService.deleteTutor(id);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{id}/reviews")
  @PreAuthorize("hasRole('STUDENT')")
  public TutorReviewResponse createOrUpdateReview(@PathVariable String id, @Valid @RequestBody TutorReviewRequest request) {
    return tutorService.createOrUpdateReview(id, request);
  }

  @GetMapping("/{id}/reviews")
  @PreAuthorize("isAuthenticated()")
  public List<TutorReviewResponse> getTutorReviews(@PathVariable String id) {
    return tutorService.getReviewsForTutor(id);
  }

  @GetMapping("/{id}/rating")
  @PreAuthorize("isAuthenticated()")
  public TutorRatingSummaryResponse getTutorRatingSummary(@PathVariable String id) {
    return tutorService.getRatingSummary(id);
  }

  @PostMapping("/sessions/book")
  @PreAuthorize("hasRole('STUDENT')")
  public TutoringSession bookSession(@Valid @RequestBody TutoringSession session) {
    return tutorService.bookSession(session);
  }

  @GetMapping("/sessions/my")
  @PreAuthorize("isAuthenticated()")
  public List<TutoringSession> getMySessions(
      @RequestParam(required = false) String userId,
      @RequestParam String role) {
    if ("TUTOR".equalsIgnoreCase(role)) {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      String authEmail = auth != null && auth.isAuthenticated() ? auth.getName() : null;
      String authName = StringUtils.hasText(authEmail)
          ? userRepository.findByEmail(authEmail).map(user -> user.getName()).orElse(null)
          : null;

      String effectiveTutorId = StringUtils.hasText(userId) ? userId.trim() : null;
      String effectiveTutorEmail = StringUtils.hasText(authEmail) ? authEmail.trim() : null;
      String effectiveTutorName = StringUtils.hasText(authName) ? authName.trim() : null;

      if (StringUtils.hasText(effectiveTutorEmail)) {
        Tutor tutorProfile = tutorRepository.findByEmailIgnoreCase(effectiveTutorEmail).orElse(null);
        if (tutorProfile != null && StringUtils.hasText(tutorProfile.getId())) {
          effectiveTutorId = tutorProfile.getId();
        }
      }

      Map<String, TutoringSession> merged = new LinkedHashMap<>();
      if (StringUtils.hasText(effectiveTutorId)) {
        for (TutoringSession session : sessionRepository.findByTutorId(effectiveTutorId)) {
          tutorService.enrichSessionParticipantData(session);
          merged.put(mergeKeyForSession(session, "id"), session);
        }
      }
      if (StringUtils.hasText(effectiveTutorEmail)) {
        for (TutoringSession session : sessionRepository.findByTutorEmailIgnoreCase(effectiveTutorEmail)) {
          tutorService.enrichSessionParticipantData(session);
          merged.put(mergeKeyForSession(session, "email"), session);
        }
      }
      if (StringUtils.hasText(effectiveTutorName)) {
        for (TutoringSession session : sessionRepository.findByTutorNameIgnoreCase(effectiveTutorName)) {
          tutorService.enrichSessionParticipantData(session);
          merged.put(mergeKeyForSession(session, "name"), session);
        }
      }
      return List.copyOf(merged.values());
    }
    if (!StringUtils.hasText(userId)) {
      throw new ResponseStatusException(BAD_REQUEST, "userId is required for student session lookup");
    }
    return sessionRepository.findByStudentId(userId);
  }

  @PatchMapping("/sessions/{id}/status")
  @PreAuthorize("hasAnyRole('TUTOR','ADMIN')")
  public ResponseEntity<TutoringSession> updateSessionStatus(
      @PathVariable String id,
      @RequestParam String status,
      @RequestBody(required = false) SessionStatusUpdateRequest payload) {
    TutoringSession saved = tutorService.updateSessionStatus(id, status, payload);
    return ResponseEntity.ok(saved);
  }

  private String mergeKeyForSession(TutoringSession session, String source) {
    if (session == null) {
      return source + "-null";
    }
    return Objects.toString(
        session.getId(),
        source + "-" + Objects.toString(session.getTutorId(), "no-tutor")
            + "-" + Objects.toString(session.getStudentId(), "no-student")
            + "-" + Objects.toString(session.getDate(), "no-date")
            + "-" + Objects.toString(session.getTime(), "no-time"));
  }
}
