package com.example.academic_support_portal.tutor_request.controller;

import com.example.academic_support_portal.tutor_request.dto.TutorRequestActionResponse;
import com.example.academic_support_portal.tutor_request.dto.TutorRequestStatusUpdateRequest;
import com.example.academic_support_portal.tutor_request.model.TutorRequest;
import com.example.academic_support_portal.tutor_request.service.TutorRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// REST endpoints for student-tutor request lifecycle: create, fetch, accept/reject, and status updates.
@RestController
@RequestMapping("/api/tutor-requests")
@RequiredArgsConstructor
public class TutorRequestController {
  private final TutorRequestService service;

  // Supports dashboard filtering by studentId or tutorEmail; falls back to full list when no filter is provided.
  @GetMapping
  public List<TutorRequest> getAll(
      @RequestParam(required = false) String studentId,
      @RequestParam(required = false) String tutorEmail) {
    if (studentId != null && !studentId.isEmpty()) {
      return service.getByStudentId(studentId);
    }
    if (tutorEmail != null && !tutorEmail.isEmpty()) {
      return service.getByTutorEmail(tutorEmail);
    }
    return service.getAll();
  }

  // Student creates a new tutoring request payload.
  @PostMapping
  public TutorRequestActionResponse create(@Valid @RequestBody TutorRequest request) {
    return service.create(request);
  }

  // Tutor-only endpoint for listing requests assigned to the currently authenticated tutor.
  @GetMapping("/tutor")
  @PreAuthorize("hasRole('TUTOR')")
  public List<TutorRequest> getTutorRequests(
      @RequestParam(required = false) String email,
      @RequestParam(required = false) String status) {
    return service.getForCurrentTutor(email, status);
  }

  // Generic status patch endpoint; ACCEPTED is delegated to accept flow for extra validation.
  @PatchMapping("/{id}/status")
  public TutorRequestActionResponse updateStatus(
      @PathVariable String id,
      @RequestParam String status,
      @RequestBody(required = false) TutorRequestStatusUpdateRequest payload) {
    return service.updateStatus(id, status, payload);
  }

  // Tutor acceptance endpoint enforces ownership and session/join-link requirements.
  @PatchMapping("/{id}/accept")
  @PreAuthorize("hasRole('TUTOR')")
  public TutorRequestActionResponse acceptRequest(
      @PathVariable String id,
      @RequestBody TutorRequestStatusUpdateRequest payload) {
    return service.acceptRequest(id, payload);
  }

  // Tutor rejection endpoint for declining a request assigned to the tutor.
  @PatchMapping("/{id}/reject")
  @PreAuthorize("hasRole('TUTOR')")
  public TutorRequestActionResponse rejectRequest(@PathVariable String id) {
    return service.rejectRequest(id);
  }

  // Administrative delete support for cleanup/manual moderation.
  @DeleteMapping("/{id}")
  public void delete(@PathVariable String id) {
    service.delete(id);
  }
}
