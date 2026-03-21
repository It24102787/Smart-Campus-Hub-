package com.example.academic_support_portal.tutor.repository;

import com.example.academic_support_portal.tutor.model.TutoringSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TutoringSessionRepository extends MongoRepository<TutoringSession, String> {
  List<TutoringSession> findByTutorId(String tutorId);
  List<TutoringSession> findByTutorEmailIgnoreCase(String tutorEmail);
  List<TutoringSession> findByTutorNameIgnoreCase(String tutorName);

  List<TutoringSession> findByStudentId(String studentId);
}
