package com.example.academic_support_portal.iot.repository;

import com.example.academic_support_portal.iot.model.StudentPresence;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentPresenceRepository extends MongoRepository<StudentPresence, String> {
  Optional<StudentPresence> findByStudentId(String studentId);
}
