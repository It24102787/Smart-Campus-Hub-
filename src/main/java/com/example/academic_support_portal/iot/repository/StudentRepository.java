package com.example.academic_support_portal.iot.repository;

import com.example.academic_support_portal.iot.model.Student;
import com.example.academic_support_portal.iot.model.StudentStatus;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentRepository extends MongoRepository<Student, String> {
  Optional<Student> findByCardUidAndStatus(String cardUid, StudentStatus status);
}
