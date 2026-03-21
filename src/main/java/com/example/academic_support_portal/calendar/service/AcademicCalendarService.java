package com.example.academic_support_portal.calendar.service;

import com.example.academic_support_portal.calendar.model.AcademicCalendarEvent;
import com.example.academic_support_portal.calendar.repository.AcademicCalendarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AcademicCalendarService {
  private final AcademicCalendarRepository repository;

  public List<AcademicCalendarEvent> getAll() {
    return repository.findAll();
  }

  public List<AcademicCalendarEvent> getByCategory(String category) {
    return repository.findByCategory(category);
  }

  public AcademicCalendarEvent create(AcademicCalendarEvent event) {
    return repository.save(event);
  }

  public void delete(String id) {
    repository.deleteById(id);
  }
}
