package com.example.academic_support_portal.study_circle.service;

import com.example.academic_support_portal.study_circle.dto.CreateStudyCircleRequest;
import com.example.academic_support_portal.study_circle.dto.MyStudyCircleResponse;
import com.example.academic_support_portal.study_circle.dto.StudyCircleDetailsResponse;
import com.example.academic_support_portal.study_circle.dto.StudyCircleMemberResponse;
import com.example.academic_support_portal.study_circle.dto.StudyCircleResponse;
import com.example.academic_support_portal.study_circle.dto.UpdateStudyCircleRequest;
import com.example.academic_support_portal.study_circle.model.StudyCircle;
import com.example.academic_support_portal.study_circle.model.StudyCircleMember;
import com.example.academic_support_portal.study_circle.model.StudyCircleRole;
import com.example.academic_support_portal.study_circle.repository.StudyCircleMemberRepository;
import com.example.academic_support_portal.study_circle.repository.StudyCircleRepository;
import com.example.academic_support_portal.user.model.User;
import com.example.academic_support_portal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Handles study-circle lifecycle: discovery, membership, owner permissions, and response mapping.
public class StudyCircleService {

  private final StudyCircleRepository circleRepository;
  private final StudyCircleMemberRepository memberRepository;
  private final UserRepository userRepository;

  // Fetches all active circles and marks which circles the current user already joined.
  public List<StudyCircleResponse> getAllActiveCircles() {
    User currentUser = getCurrentUser();
    List<StudyCircle> circles = circleRepository.findByIsActiveTrueOrderByCreatedAtDesc();

    return circles.stream()
        .map(circle -> toListResponse(circle, currentUser.getId()))
        .toList();
  }

  // Returns full details for one circle, including current member roster.
  public StudyCircleDetailsResponse getCircleDetails(String id) {
    User currentUser = getCurrentUser();
    StudyCircle circle = getExistingCircle(id);
    List<StudyCircleMember> members = memberRepository.findByCircleIdOrderByJoinedAtAsc(id);

    return toDetailsResponse(circle, members, currentUser.getId());
  }

  // Creates circle metadata and auto-adds creator as OWNER member.
  public StudyCircleDetailsResponse createCircle(CreateStudyCircleRequest request) {
    User currentUser = getCurrentUser();
    Integer normalizedMaxMembers = normalizeMaxMembers(request.getMaxMembers());
    LocalDateTime now = LocalDateTime.now();

    StudyCircle circle = StudyCircle.builder()
        .title(trim(request.getTitle()))
        .description(trim(request.getDescription()))
        .subject(trim(request.getSubject()))
        .createdByUserId(currentUser.getId())
        .createdByName(currentUser.getName())
        .meetingDay(trimToNull(request.getMeetingDay()))
        .meetingTime(trimToNull(request.getMeetingTime()))
        .maxMembers(normalizedMaxMembers)
        .isActive(true)
        .createdAt(now)
        .updatedAt(now)
        .build();

    StudyCircle savedCircle = circleRepository.save(circle);

    StudyCircleMember ownerMember = StudyCircleMember.builder()
        .circleId(savedCircle.getId())
        .userId(currentUser.getId())
        .userName(currentUser.getName())
        .userEmail(currentUser.getEmail())
        .joinedAt(now)
        .role(StudyCircleRole.OWNER)
        .build();

    memberRepository.save(ownerMember);

    List<StudyCircleMember> members = memberRepository.findByCircleIdOrderByJoinedAtAsc(savedCircle.getId());
    return toDetailsResponse(savedCircle, members, currentUser.getId());
  }

  // Adds current user as MEMBER after active/duplicate/capacity checks.
  public StudyCircleDetailsResponse joinCircle(String id) {
    User currentUser = getCurrentUser();
    StudyCircle circle = getExistingCircle(id);

    if (!circle.isActive()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Circle is inactive");
    }

    if (memberRepository.existsByCircleIdAndUserId(id, currentUser.getId())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "You are already a member of this circle");
    }

    long currentCount = memberRepository.countByCircleId(id);
    if (circle.getMaxMembers() != null && currentCount >= circle.getMaxMembers()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Circle is full");
    }

    memberRepository.save(StudyCircleMember.builder()
        .circleId(id)
        .userId(currentUser.getId())
        .userName(currentUser.getName())
        .userEmail(currentUser.getEmail())
        .joinedAt(LocalDateTime.now())
        .role(StudyCircleRole.MEMBER)
        .build());

    circle.setUpdatedAt(LocalDateTime.now());
    StudyCircle updated = circleRepository.save(circle);
    List<StudyCircleMember> members = memberRepository.findByCircleIdOrderByJoinedAtAsc(id);
    return toDetailsResponse(updated, members, currentUser.getId());
  }

  // Removes current user; if owner leaves, ownership is reassigned to earliest remaining member.
  public StudyCircleDetailsResponse leaveCircle(String id) {
    User currentUser = getCurrentUser();
    StudyCircle circle = getExistingCircle(id);

    StudyCircleMember membership = memberRepository.findByCircleIdAndUserId(id, currentUser.getId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "You are not a member of this circle"));

    if (membership.getRole() == StudyCircleRole.OWNER) {
      List<StudyCircleMember> members = memberRepository.findByCircleIdOrderByJoinedAtAsc(id);
      StudyCircleMember nextOwner = members.stream()
          .filter(member -> !member.getUserId().equals(currentUser.getId()))
          .min(Comparator.comparing(StudyCircleMember::getJoinedAt))
          .orElse(null);

      if (nextOwner == null) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "Owner cannot leave the circle unless another member exists");
      }

      nextOwner.setRole(StudyCircleRole.OWNER);
      memberRepository.save(nextOwner);

      circle.setCreatedByUserId(nextOwner.getUserId());
      circle.setCreatedByName(nextOwner.getUserName());
    }

    memberRepository.delete(membership);
    circle.setUpdatedAt(LocalDateTime.now());
    StudyCircle updated = circleRepository.save(circle);

    List<StudyCircleMember> remaining = memberRepository.findByCircleIdOrderByJoinedAtAsc(id);
    return toDetailsResponse(updated, remaining, currentUser.getId());
  }

  // Returns circles where current user is a member, including their role in each circle.
  public List<MyStudyCircleResponse> getMyCircles() {
    User currentUser = getCurrentUser();
    List<StudyCircleMember> memberships = memberRepository.findByUserIdOrderByJoinedAtDesc(currentUser.getId());
    List<String> circleIds = memberships.stream().map(StudyCircleMember::getCircleId).distinct().toList();

    if (circleIds.isEmpty()) {
      return List.of();
    }

    List<StudyCircle> circles = circleRepository.findByIdInAndIsActiveTrueOrderByCreatedAtDesc(circleIds);
    Map<String, StudyCircleRole> roleByCircleId = memberships.stream()
        .collect(Collectors.toMap(StudyCircleMember::getCircleId, StudyCircleMember::getRole, (a, b) -> a));

    return circles.stream()
        .map(circle -> MyStudyCircleResponse.builder()
            .id(circle.getId())
            .title(circle.getTitle())
            .description(circle.getDescription())
            .subject(circle.getSubject())
            .memberCount((int) memberRepository.countByCircleId(circle.getId()))
            .maxMembers(circle.getMaxMembers())
            .meetingDay(circle.getMeetingDay())
            .meetingTime(circle.getMeetingTime())
            .createdByName(circle.getCreatedByName())
            .myRole(roleByCircleId.get(circle.getId()))
            .build())
        .toList();
  }

  // Owner-only update path for circle metadata and membership limit changes.
  public StudyCircleDetailsResponse updateCircle(String id, UpdateStudyCircleRequest request) {
    User currentUser = getCurrentUser();
    StudyCircle circle = getExistingCircle(id);

    ensureOwner(circle, currentUser);

    circle.setTitle(trim(request.getTitle()));
    circle.setDescription(trim(request.getDescription()));
    circle.setSubject(trim(request.getSubject()));
    circle.setMeetingDay(trimToNull(request.getMeetingDay()));
    circle.setMeetingTime(trimToNull(request.getMeetingTime()));
    circle.setMaxMembers(normalizeMaxMembers(request.getMaxMembers()));
    circle.setUpdatedAt(LocalDateTime.now());

    long memberCount = memberRepository.countByCircleId(id);
    if (circle.getMaxMembers() != null && memberCount > circle.getMaxMembers()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Max members cannot be less than current member count");
    }

    StudyCircle updated = circleRepository.save(circle);
    List<StudyCircleMember> members = memberRepository.findByCircleIdOrderByJoinedAtAsc(id);
    return toDetailsResponse(updated, members, currentUser.getId());
  }

  // Owner-only soft delete by marking circle inactive.
  public void deactivateCircle(String id) {
    User currentUser = getCurrentUser();
    StudyCircle circle = getExistingCircle(id);

    ensureOwner(circle, currentUser);

    circle.setActive(false);
    circle.setUpdatedAt(LocalDateTime.now());
    circleRepository.save(circle);
  }

  // Shared helper for loading circle by id with consistent 404 behavior.
  private StudyCircle getExistingCircle(String id) {
    return circleRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Circle not found"));
  }

  // Resolves authenticated principal to a persisted user record.
  private User getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
    }

    return userRepository.findByEmail(authentication.getName())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
  }

  // Authorization guard for owner-only actions.
  private void ensureOwner(StudyCircle circle, User user) {
    if (!user.getId().equals(circle.getCreatedByUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the circle owner can perform this action");
    }
  }

  // Validation helper for optional member limit.
  private Integer normalizeMaxMembers(Integer maxMembers) {
    if (maxMembers == null) {
      return null;
    }
    if (maxMembers < 2) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Max members must be at least 2");
    }
    return maxMembers;
  }

  // Maps entity to list-card payload with computed joined/memberCount values.
  private StudyCircleResponse toListResponse(StudyCircle circle, String userId) {
    int memberCount = (int) memberRepository.countByCircleId(circle.getId());
    boolean joined = memberRepository.existsByCircleIdAndUserId(circle.getId(), userId);

    return StudyCircleResponse.builder()
        .id(circle.getId())
        .title(circle.getTitle())
        .description(circle.getDescription())
        .subject(circle.getSubject())
        .memberCount(memberCount)
        .maxMembers(circle.getMaxMembers())
        .joined(joined)
        .meetingDay(circle.getMeetingDay())
        .meetingTime(circle.getMeetingTime())
        .createdByName(circle.getCreatedByName())
        .build();
  }

  // Maps entity + members into detailed response used by circle detail screens.
  private StudyCircleDetailsResponse toDetailsResponse(
      StudyCircle circle,
      List<StudyCircleMember> members,
      String currentUserId) {

    List<StudyCircleMemberResponse> memberResponses = members.stream()
        .map(this::toMemberResponse)
        .toList();

    boolean joined = members.stream().anyMatch(member -> member.getUserId().equals(currentUserId));

    return StudyCircleDetailsResponse.builder()
        .id(circle.getId())
        .title(circle.getTitle())
        .description(circle.getDescription())
        .subject(circle.getSubject())
        .createdByUserId(circle.getCreatedByUserId())
        .createdByName(circle.getCreatedByName())
        .meetingDay(circle.getMeetingDay())
        .meetingTime(circle.getMeetingTime())
        .maxMembers(circle.getMaxMembers())
        .memberCount(members.size())
        .joined(joined)
        .active(circle.isActive())
        .createdAt(circle.getCreatedAt())
        .updatedAt(circle.getUpdatedAt())
        .members(memberResponses)
        .build();
  }

  // Maps member entity to API response DTO.
  private StudyCircleMemberResponse toMemberResponse(StudyCircleMember member) {
    return StudyCircleMemberResponse.builder()
        .id(member.getId())
        .circleId(member.getCircleId())
        .userId(member.getUserId())
        .userName(member.getUserName())
        .userEmail(member.getUserEmail())
        .joinedAt(member.getJoinedAt())
        .role(member.getRole())
        .build();
  }

  // Lightweight trimming helpers to normalize user-entered text.
  private String trim(String value) {
    if (value == null) {
      return null;
    }
    return value.trim();
  }

  private String trimToNull(String value) {
    String normalized = trim(value);
    return normalized == null || normalized.isBlank() ? null : normalized;
  }
}
