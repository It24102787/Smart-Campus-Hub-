package com.example.academic_support_portal.study_group.repository;

import com.example.academic_support_portal.study_group.model.StudyGroup;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StudyGroupRepository extends MongoRepository<StudyGroup, String> {
  List<StudyGroup> findBySubject(String subject);
}
