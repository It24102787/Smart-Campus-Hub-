package com.example.academic_support_portal.tutor_request.repository;

import com.example.academic_support_portal.tutor_request.model.TutorRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

// Repository for tutor request reads/writes with dashboard-specific finder methods.
public interface TutorRequestRepository extends MongoRepository<TutorRequest, String> {
  // Student history list.
  List<TutorRequest> findByStudentId(String studentId);
  // Tutor lookup by assigned email.
  List<TutorRequest> findByTutorEmailIgnoreCase(String tutorEmail);
  // Tutor inbox variants with optional status filtering.
  List<TutorRequest> findByTutorEmailIgnoreCaseOrderByCreatedAtDesc(String tutorEmail);
  List<TutorRequest> findByTutorEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(String tutorEmail, String status);
  // Alternate tutor matching using tutor profile id.
  List<TutorRequest> findByTutorIdOrderByCreatedAtDesc(String tutorId);
  List<TutorRequest> findByTutorIdAndStatusOrderByCreatedAtDesc(String tutorId, String status);
  // Alternate tutor matching using tutor display name.
  List<TutorRequest> findByTutorNameIgnoreCaseOrderByCreatedAtDesc(String tutorName);
  List<TutorRequest> findByTutorNameIgnoreCaseAndStatusOrderByCreatedAtDesc(String tutorName, String status);
  // Status-only listing used by generic moderation/reporting screens.
  List<TutorRequest> findByStatusOrderByCreatedAtDesc(String status);
}
