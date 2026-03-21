package com.example.academic_support_portal.environment.repository;

import com.example.academic_support_portal.environment.model.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AlertRepository extends MongoRepository<Alert, String> {
  List<Alert> findByUserId(String userId);

  List<Alert> findByUserIdAndActive(String userId, boolean active);
}
