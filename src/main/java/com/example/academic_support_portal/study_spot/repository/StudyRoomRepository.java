package com.example.academic_support_portal.study_spot.repository;

import com.example.academic_support_portal.study_spot.model.StudyRoom;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudyRoomRepository extends MongoRepository<StudyRoom, String> {
  Optional<StudyRoom> findByQrCodeValue(String qrCodeValue);
  Optional<StudyRoom> findByDeviceId(String deviceId);
  Optional<StudyRoom> findBySensorDeviceId(String sensorDeviceId);
}
