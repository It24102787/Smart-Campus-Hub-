package com.example.academic_support_portal.environment.repository;

import com.example.academic_support_portal.environment.model.SensorReading;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface SensorReadingRepository extends MongoRepository<SensorReading, String> {
  List<SensorReading> findByRoomIdOrderByTimestampDesc(String roomId);

  List<SensorReading> findByRoomIdAndTimestampBetween(String roomId, LocalDateTime start, LocalDateTime end);

  List<SensorReading> findByTimestampAfter(LocalDateTime timestamp);
}
