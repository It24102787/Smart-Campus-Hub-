package com.example.academic_support_portal.iot.repository;

import com.example.academic_support_portal.iot.model.EnvironmentReading;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EnvironmentReadingRepository extends MongoRepository<EnvironmentReading, String> {
}
