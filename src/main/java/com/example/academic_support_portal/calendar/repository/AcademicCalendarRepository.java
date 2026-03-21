package com.example.academic_support_portal.calendar.repository;

import com.example.academic_support_portal.calendar.model.AcademicCalendarEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AcademicCalendarRepository extends MongoRepository<AcademicCalendarEvent, String> {
  List<AcademicCalendarEvent> findByCategory(String category);
}
