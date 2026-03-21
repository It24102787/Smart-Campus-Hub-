package com.example.academic_support_portal.issue.controller;

import com.example.academic_support_portal.issue.dto.IssueAssignRequest;
import com.example.academic_support_portal.issue.dto.IssueCommentRequest;
import com.example.academic_support_portal.issue.dto.IssueCommentResponse;
import com.example.academic_support_portal.issue.dto.IssueCreateRequest;
import com.example.academic_support_portal.issue.dto.IssueResponse;
import com.example.academic_support_portal.issue.dto.IssueStatusUpdateRequest;
import com.example.academic_support_portal.issue.dto.IssueUpdateRequest;
import com.example.academic_support_portal.issue.model.IssuePriority;
import com.example.academic_support_portal.issue.model.IssueStatus;
import com.example.academic_support_portal.issue.service.IssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class CampusIssueController {

  private final IssueService issueService;

  @GetMapping
  public List<IssueResponse> getAllIssues(
      @RequestParam(required = false) IssueStatus status,
      @RequestParam(required = false) String category,
      @RequestParam(required = false) String building,
      @RequestParam(required = false) IssuePriority priority,
      @RequestParam(required = false) String assignedToUserId,
      @RequestParam(required = false) String createdByUserId,
      @RequestParam(required = false) String keyword) {
    return issueService.getAllIssues(status, category, building, priority, assignedToUserId, createdByUserId, keyword);
  }

  @GetMapping("/{id}")
  public IssueResponse getIssueById(@PathVariable String id) {
    return issueService.getIssueById(id);
  }

  @PostMapping
  @PreAuthorize("isAuthenticated()")
  public IssueResponse createIssue(@Valid @RequestBody IssueCreateRequest request) {
    return issueService.createIssue(request);
  }

  @PutMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public IssueResponse updateIssue(@PathVariable String id, @Valid @RequestBody IssueUpdateRequest request) {
    return issueService.updateIssue(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public void deleteIssue(@PathVariable String id) {
    issueService.deleteIssue(id);
  }

  @PatchMapping("/{id}/assign")
  @PreAuthorize("hasRole('ADMIN')")
  public IssueResponse assignIssue(@PathVariable String id, @Valid @RequestBody IssueAssignRequest request) {
    return issueService.assignIssue(id, request);
  }

  @PatchMapping("/{id}/status")
  @PreAuthorize("hasRole('ADMIN')")
  public IssueResponse updateStatus(@PathVariable String id, @Valid @RequestBody IssueStatusUpdateRequest request) {
    return issueService.updateStatus(id, request);
  }

  @PostMapping("/{id}/comments")
  @PreAuthorize("isAuthenticated()")
  public IssueCommentResponse addComment(@PathVariable String id, @Valid @RequestBody IssueCommentRequest request) {
    return issueService.addComment(id, request);
  }

  @GetMapping("/{id}/comments")
  public List<IssueCommentResponse> getComments(@PathVariable String id) {
    return issueService.getCommentsByIssue(id);
  }
}
