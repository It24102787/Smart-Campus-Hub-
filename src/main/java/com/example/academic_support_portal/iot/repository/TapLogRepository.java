package com.example.academic_support_portal.iot.repository;

import com.example.academic_support_portal.iot.model.TapLog;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TapLogRepository extends MongoRepository<TapLog, String> {
  Optional<TapLog> findTopByStudentIdOrderByTimestampDesc(String studentId);
}
