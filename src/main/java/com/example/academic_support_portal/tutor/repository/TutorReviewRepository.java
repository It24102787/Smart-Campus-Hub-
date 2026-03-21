package com.example.academic_support_portal.tutor.repository;

import com.example.academic_support_portal.tutor.model.TutorReview;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TutorReviewRepository extends MongoRepository<TutorReview, String> {
  List<TutorReview> findByTutorIdOrderByUpdatedAtDesc(String tutorId);

  Optional<TutorReview> findByTutorIdAndStudentId(String tutorId, String studentId);

  void deleteByTutorId(String tutorId);
}
