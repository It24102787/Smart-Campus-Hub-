package com.example.academic_support_portal.study_circle.repository;

import com.example.academic_support_portal.study_circle.model.StudyCircleMember;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

// Repository for study-circle membership records and membership checks.
public interface StudyCircleMemberRepository extends MongoRepository<StudyCircleMember, String> {
  // Member roster for one circle.
  List<StudyCircleMember> findByCircleIdOrderByJoinedAtAsc(String circleId);

  // Specific membership lookup for join/leave/permission logic.
  Optional<StudyCircleMember> findByCircleIdAndUserId(String circleId, String userId);

  // Fast exists query used by join checks.
  boolean existsByCircleIdAndUserId(String circleId, String userId);

  // Count used for capacity checks and UI member count.
  long countByCircleId(String circleId);

  // Membership list for "my circles" page.
  List<StudyCircleMember> findByUserIdOrderByJoinedAtDesc(String userId);
}
