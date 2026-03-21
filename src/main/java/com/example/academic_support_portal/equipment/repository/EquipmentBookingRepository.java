package com.example.academic_support_portal.equipment.repository;

import com.example.academic_support_portal.equipment.model.EquipmentBooking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface EquipmentBookingRepository extends MongoRepository<EquipmentBooking, String> {
  List<EquipmentBooking> findByUserId(String userId);

  List<EquipmentBooking> findByStatus(String status);

  Optional<EquipmentBooking> findByQrToken(String qrToken);
}
