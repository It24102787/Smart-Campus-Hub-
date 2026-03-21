package com.example.academic_support_portal.equipment.repository;

import com.example.academic_support_portal.equipment.model.Equipment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface EquipmentRepository extends MongoRepository<Equipment, String> {
  List<Equipment> findByAvailable(boolean available);

  List<Equipment> findByCategory(String category);
}
