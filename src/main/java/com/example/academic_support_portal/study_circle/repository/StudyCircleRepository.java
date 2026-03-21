package com.example.academic_support_portal.study_circle.repository;

import com.example.academic_support_portal.study_circle.model.StudyCircle;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

// Repository for study-circle records with active-list and member-list use cases.
public interface StudyCircleRepository extends MongoRepository<StudyCircle, String> {
  // Discovery list sorted newest-first.
  List<StudyCircle> findByIsActiveTrueOrderByCreatedAtDesc();

  // "My circles" list for active circles by id set.
  List<StudyCircle> findByIdInAndIsActiveTrueOrderByCreatedAtDesc(List<String> ids);
}
