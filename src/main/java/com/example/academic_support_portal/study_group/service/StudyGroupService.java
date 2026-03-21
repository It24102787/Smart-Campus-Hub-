package com.example.academic_support_portal.study_group.service;

import com.example.academic_support_portal.study_group.dto.StudyGroupResponse;
import com.example.academic_support_portal.study_group.model.StudyGroup;
import com.example.academic_support_portal.study_group.repository.StudyGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyGroupService {
  private final StudyGroupRepository repository;

  public List<StudyGroupResponse> getAll() {
    return repository.findAll().stream().map(this::toResponse).toList();
  }

  public List<StudyGroupResponse> getBySubject(String subject) {
    return repository.findBySubject(subject).stream().map(this::toResponse).toList();
  }

  public StudyGroupResponse create(StudyGroup sg) {
    if (sg.getMembers() == null) {
      sg.setMembers(new ArrayList<>());
    }
    if (sg.getMembers().isEmpty() && sg.getCreatedBy() != null) {
      sg.getMembers().add(sg.getCreatedBy());
    }
    return toResponse(repository.save(sg));
  }

  public StudyGroupResponse join(String groupId, String username) {
    StudyGroup sg = repository.findById(groupId)
        .orElseThrow(() -> new RuntimeException("Study Group not found"));

    if (!sg.getMembers().contains(username) && sg.getMembers().size() < sg.getMaxMembers()) {
      sg.getMembers().add(username);
      return toResponse(repository.save(sg));
    }
    return toResponse(sg);
  }

  public void delete(String id) {
    if (!repository.existsById(id)) {
      throw new RuntimeException("Study Group not found");
    }
    repository.deleteById(id);
  }

  private StudyGroupResponse toResponse(StudyGroup sg) {
    return StudyGroupResponse.builder()
        .id(sg.getId())
        .name(sg.getName())
        .subject(sg.getSubject())
        .description(sg.getDescription())
        .day(sg.getDay())
        .time(sg.getTime())
        .createdBy(sg.getCreatedBy())
        .members(sg.getMembers())
        .maxMembers(sg.getMaxMembers())
        .build();
  }
}
