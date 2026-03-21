package com.example.academic_support_portal.study_group.controller;

import com.example.academic_support_portal.study_group.model.GroupMessage;
import com.example.academic_support_portal.study_group.model.StudyGroup;
import com.example.academic_support_portal.study_group.repository.GroupMessageRepository;
import com.example.academic_support_portal.study_group.repository.StudyGroupRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class StudyGroupController {

  private final StudyGroupRepository groupRepository;
  private final GroupMessageRepository messageRepository;

  @GetMapping
  public List<StudyGroup> getAllGroups() {
    return groupRepository.findAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<StudyGroup> getGroupById(@PathVariable String id) {
    return groupRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  public StudyGroup createGroup(@Valid @RequestBody StudyGroup group) {
    return groupRepository.save(group);
  }

  @PostMapping("/{id}/join")
  public ResponseEntity<StudyGroup> joinGroup(@PathVariable String id, @RequestParam String userId) {
    if (userId == null || userId.isBlank()) {
      throw new ResponseStatusException(BAD_REQUEST, "User ID is required");
    }

    return groupRepository.findById(id)
        .map(group -> {
          if (group.getMembers().contains(userId)) {
            throw new ResponseStatusException(BAD_REQUEST, "You are already a member of this group");
          }
          if (group.getMembers().size() >= group.getMaxMembers()) {
            throw new ResponseStatusException(BAD_REQUEST, "This group is already full");
          }
          group.getMembers().add(userId);
          return ResponseEntity.ok(groupRepository.save(group));
        })
        .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/{id}/messages")
  public List<GroupMessage> getMessages(@PathVariable String id) {
    return messageRepository.findByGroupIdOrderByTimestampAsc(id);
  }

  @PostMapping("/{id}/messages")
  public GroupMessage sendMessage(@PathVariable String id, @Valid @RequestBody GroupMessage message) {
    message.setGroupId(id);
    message.setTimestamp(LocalDateTime.now());
    return messageRepository.save(message);
  }
}
