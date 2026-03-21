package com.example.academic_support_portal.progress.repository;

import com.example.academic_support_portal.progress.model.ProgressRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProgressRecordRepository extends MongoRepository<ProgressRecord, String> {
  List<ProgressRecord> findByStudentId(String studentId);
}
