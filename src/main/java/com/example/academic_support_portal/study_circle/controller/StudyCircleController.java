package com.example.academic_support_portal.study_circle.controller;

import com.example.academic_support_portal.study_circle.dto.CreateStudyCircleRequest;
import com.example.academic_support_portal.study_circle.dto.MyStudyCircleResponse;
import com.example.academic_support_portal.study_circle.dto.StudyCircleDetailsResponse;
import com.example.academic_support_portal.study_circle.dto.StudyCircleResponse;
import com.example.academic_support_portal.study_circle.dto.UpdateStudyCircleRequest;
import com.example.academic_support_portal.study_circle.service.StudyCircleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Controller for study-circle collaboration features used in student support.
@RestController
@RequestMapping("/api/study-circles")
@RequiredArgsConstructor
public class StudyCircleController {

  private final StudyCircleService studyCircleService;

  // Lists active circles for discovery page cards.
  @GetMapping
  public List<StudyCircleResponse> getAllCircles() {
    return studyCircleService.getAllActiveCircles();
  }

  // Returns one circle with member details.
  @GetMapping("/{id}")
  public StudyCircleDetailsResponse getCircleDetails(@PathVariable String id) {
    return studyCircleService.getCircleDetails(id);
  }

  // Creates a new study circle owned by the authenticated user.
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public StudyCircleDetailsResponse createCircle(@Valid @RequestBody CreateStudyCircleRequest request) {
    return studyCircleService.createCircle(request);
  }

  // Joins current user to circle when capacity and status checks pass.
  @PostMapping("/{id}/join")
  public StudyCircleDetailsResponse joinCircle(@PathVariable String id) {
    return studyCircleService.joinCircle(id);
  }

  // Leaves circle; owner handoff is handled in service if needed.
  @DeleteMapping("/{id}/leave")
  public StudyCircleDetailsResponse leaveCircle(@PathVariable String id) {
    return studyCircleService.leaveCircle(id);
  }

  // Lists circles where current user is already a member.
  @GetMapping("/my")
  public List<MyStudyCircleResponse> getMyCircles() {
    return studyCircleService.getMyCircles();
  }

  // Updates editable circle metadata (owner only).
  @PutMapping("/{id}")
  public StudyCircleDetailsResponse updateCircle(
      @PathVariable String id,
      @Valid @RequestBody UpdateStudyCircleRequest request) {
    return studyCircleService.updateCircle(id, request);
  }

  // Soft-deactivates a circle from discovery lists.
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deactivateCircle(@PathVariable String id) {
    studyCircleService.deactivateCircle(id);
    return ResponseEntity.noContent().build();
  }
}
