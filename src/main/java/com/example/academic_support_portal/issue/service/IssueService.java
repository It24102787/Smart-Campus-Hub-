package com.example.academic_support_portal.issue.service;

import com.example.academic_support_portal.issue.dto.IssueAssignRequest;
import com.example.academic_support_portal.issue.dto.IssueCommentRequest;
import com.example.academic_support_portal.issue.dto.IssueCommentResponse;
import com.example.academic_support_portal.issue.dto.IssueCreateRequest;
import com.example.academic_support_portal.issue.dto.IssueResponse;
import com.example.academic_support_portal.issue.dto.IssueStatusUpdateRequest;
import com.example.academic_support_portal.issue.dto.IssueUpdateRequest;
import com.example.academic_support_portal.issue.model.CampusIssue;
import com.example.academic_support_portal.issue.model.IssueComment;
import com.example.academic_support_portal.issue.model.IssuePriority;
import com.example.academic_support_portal.issue.model.IssueStatus;
import com.example.academic_support_portal.issue.model.IssueTimelineType;
import com.example.academic_support_portal.issue.repository.IssueCommentRepository;
import com.example.academic_support_portal.issue.repository.IssueRepository;
import com.example.academic_support_portal.user.model.Role;
import com.example.academic_support_portal.user.model.User;
import com.example.academic_support_portal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IssueService {

  private final IssueRepository issueRepository;
  private final IssueCommentRepository commentRepository;
  private final UserRepository userRepository;
  private final MongoTemplate mongoTemplate;

  public IssueResponse createIssue(IssueCreateRequest request) {
    User user = getCurrentUser();
    ensureLocationProvided(request.getBuilding(), request.getLocationText());

    IssuePriority priority = Optional.ofNullable(request.getPriority()).orElse(IssuePriority.MEDIUM);
    LocalDateTime now = LocalDateTime.now();

    CampusIssue issue = CampusIssue.builder()
        .title(request.getTitle())
        .category(request.getCategory())
        .description(request.getDescription())
        .imageUrl(request.getImageUrl())
        .building(request.getBuilding())
        .locationText(request.getLocationText())
        .latitude(request.getLatitude())
        .longitude(request.getLongitude())
        .priority(priority)
        .status(IssueStatus.OPEN)
        .createdByUserId(user.getId())
        .createdByName(user.getName())
        .createdAt(now)
        .updatedAt(now)
        .build();

    CampusIssue saved = issueRepository.save(issue);
    commentRepository.save(IssueComment.builder()
        .issueId(saved.getId())
        .userId(user.getId())
        .userName(user.getName())
        .message("Issue created")
        .type(IssueTimelineType.STATUS_CHANGE)
        .createdAt(now)
        .build());

    return toResponse(saved);
  }

  public List<IssueResponse> getAllIssues(
      IssueStatus status,
      String category,
      String building,
      IssuePriority priority,
      String assignedToUserId,
      String createdByUserId,
      String keyword) {

    Query query = new Query();
    List<Criteria> criteria = new ArrayList<>();

    if (status != null) {
      criteria.add(Criteria.where("status").is(status));
    }
    if (StringUtils.hasText(category)) {
      criteria.add(Criteria.where("category").is(category));
    }
    if (StringUtils.hasText(building)) {
      criteria.add(Criteria.where("building").is(building));
    }
    if (priority != null) {
      criteria.add(Criteria.where("priority").is(priority));
    }
    if (StringUtils.hasText(assignedToUserId)) {
      criteria.add(Criteria.where("assignedToUserId").is(assignedToUserId));
    }
    if (StringUtils.hasText(createdByUserId)) {
      criteria.add(Criteria.where("createdByUserId").is(createdByUserId));
    }
    if (StringUtils.hasText(keyword)) {
      criteria.add(new Criteria().orOperator(
          Criteria.where("title").regex(keyword, "i"),
          Criteria.where("description").regex(keyword, "i")));
    }

    if (!criteria.isEmpty()) {
      query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
    }

    List<CampusIssue> issues = mongoTemplate.find(query, CampusIssue.class);
    return issues.stream().map(this::toResponse).toList();
  }

  public IssueResponse getIssueById(String id) {
    CampusIssue issue = issueRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));
    return toResponse(issue);
  }

  public IssueResponse updateIssue(String id, IssueUpdateRequest request) {
    CampusIssue issue = issueRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));
    User user = getCurrentUser();

    boolean isAdmin = isAdmin(user);
    boolean isOwner = issue.getCreatedByUserId() != null && issue.getCreatedByUserId().equals(user.getId());
    if (!isAdmin && !(isOwner && issue.getStatus() == IssueStatus.OPEN)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to update this issue");
    }

    if (StringUtils.hasText(request.getTitle())) {
      issue.setTitle(request.getTitle());
    }
    if (StringUtils.hasText(request.getCategory())) {
      issue.setCategory(request.getCategory());
    }
    if (StringUtils.hasText(request.getDescription())) {
      issue.setDescription(request.getDescription());
    }
    if (request.getImageUrl() != null) {
      issue.setImageUrl(request.getImageUrl());
    }
    if (request.getBuilding() != null) {
      issue.setBuilding(request.getBuilding());
    }
    if (request.getLocationText() != null) {
      issue.setLocationText(request.getLocationText());
    }
    if (request.getLatitude() != null) {
      issue.setLatitude(request.getLatitude());
    }
    if (request.getLongitude() != null) {
      issue.setLongitude(request.getLongitude());
    }
    if (request.getPriority() != null) {
      issue.setPriority(request.getPriority());
    }
    if (isAdmin && request.getAdminNotes() != null) {
      issue.setAdminNotes(request.getAdminNotes());
    }

    ensureLocationProvided(issue.getBuilding(), issue.getLocationText());
    issue.setUpdatedAt(LocalDateTime.now());

    CampusIssue saved = issueRepository.save(issue);
    return toResponse(saved);
  }

  public void deleteIssue(String id) {
    CampusIssue issue = issueRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));
    User user = getCurrentUser();
    boolean isAdmin = isAdmin(user);
    boolean isOwner = issue.getCreatedByUserId() != null && issue.getCreatedByUserId().equals(user.getId());
    if (!isAdmin && !(isOwner && issue.getStatus() == IssueStatus.OPEN)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to delete this issue");
    }
    issueRepository.deleteById(id);
    commentRepository.findByIssueIdOrderByCreatedAtAsc(id)
        .forEach(commentRepository::delete);
  }

  public IssueResponse assignIssue(String id, IssueAssignRequest request) {
    CampusIssue issue = issueRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));
    User admin = requireAdmin();

    User assignee = userRepository.findById(request.getAssignedToUserId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigned user not found"));

    issue.setAssignedToUserId(assignee.getId());
    issue.setAssignedToName(assignee.getName());
    if (issue.getStatus() == IssueStatus.OPEN) {
      issue.setStatus(IssueStatus.IN_PROGRESS);
    }
    issue.setUpdatedAt(LocalDateTime.now());

    CampusIssue saved = issueRepository.save(issue);
    commentRepository.save(IssueComment.builder()
        .issueId(saved.getId())
        .userId(admin.getId())
        .userName(admin.getName())
        .message("Assigned to " + assignee.getName())
        .type(IssueTimelineType.ASSIGNMENT)
        .createdAt(LocalDateTime.now())
        .build());

    return toResponse(saved);
  }

  public IssueResponse updateStatus(String id, IssueStatusUpdateRequest request) {
    CampusIssue issue = issueRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));
    User admin = requireAdmin();

    issue.setStatus(request.getStatus());
    if (request.getAdminNotes() != null) {
      issue.setAdminNotes(request.getAdminNotes());
    }
    issue.setUpdatedAt(LocalDateTime.now());

    CampusIssue saved = issueRepository.save(issue);

    String note = StringUtils.hasText(request.getNote())
        ? request.getNote()
        : "Status updated to " + request.getStatus();
    commentRepository.save(IssueComment.builder()
        .issueId(saved.getId())
        .userId(admin.getId())
        .userName(admin.getName())
        .message(note)
        .type(IssueTimelineType.STATUS_CHANGE)
        .createdAt(LocalDateTime.now())
        .build());

    return toResponse(saved);
  }

  public IssueCommentResponse addComment(String issueId, IssueCommentRequest request) {
    CampusIssue issue = issueRepository.findById(issueId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));
    User user = getCurrentUser();

    IssueTimelineType type = Optional.ofNullable(request.getType()).orElse(IssueTimelineType.COMMENT);
    if (type == IssueTimelineType.NOTE && !isAdmin(user)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can add notes");
    }

    IssueComment comment = commentRepository.save(IssueComment.builder()
        .issueId(issue.getId())
        .userId(user.getId())
        .userName(user.getName())
        .message(request.getMessage())
        .type(type)
        .createdAt(LocalDateTime.now())
        .build());

    issue.setUpdatedAt(LocalDateTime.now());
    issueRepository.save(issue);

    return toCommentResponse(comment);
  }

  public List<IssueCommentResponse> getCommentsByIssue(String issueId) {
    issueRepository.findById(issueId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));
    return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId)
        .stream()
        .map(this::toCommentResponse)
        .toList();
  }

  private void ensureLocationProvided(String building, String locationText) {
    if (!StringUtils.hasText(building) && !StringUtils.hasText(locationText)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Building or location text is required");
    }
  }

  private User getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
    }
    String email = authentication.getName();
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
  }

  private boolean isAdmin(User user) {
    if (user == null) {
      return false;
    }
    if (user.getRoles() != null && user.getRoles().contains(Role.ADMIN)) {
      return true;
    }
    return user.getRole() == Role.ADMIN;
  }

  private User requireAdmin() {
    User user = getCurrentUser();
    if (!isAdmin(user)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
    }
    return user;
  }

  private IssueResponse toResponse(CampusIssue issue) {
    return IssueResponse.builder()
        .id(issue.getId())
        .title(issue.getTitle())
        .category(issue.getCategory())
        .description(issue.getDescription())
        .imageUrl(issue.getImageUrl())
        .building(issue.getBuilding())
        .locationText(issue.getLocationText())
        .latitude(issue.getLatitude())
        .longitude(issue.getLongitude())
        .status(issue.getStatus())
        .priority(issue.getPriority())
        .createdByUserId(issue.getCreatedByUserId())
        .createdByName(issue.getCreatedByName())
        .assignedToUserId(issue.getAssignedToUserId())
        .assignedToName(issue.getAssignedToName())
        .adminNotes(issue.getAdminNotes())
        .createdAt(issue.getCreatedAt())
        .updatedAt(issue.getUpdatedAt())
        .build();
  }

  private IssueCommentResponse toCommentResponse(IssueComment comment) {
    return IssueCommentResponse.builder()
        .id(comment.getId())
        .issueId(comment.getIssueId())
        .userId(comment.getUserId())
        .userName(comment.getUserName())
        .message(comment.getMessage())
        .type(comment.getType())
        .createdAt(comment.getCreatedAt())
        .build();
  }
}
