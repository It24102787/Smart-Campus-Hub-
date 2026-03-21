package com.example.academic_support_portal.calendar.controller;

import com.example.academic_support_portal.calendar.model.AcademicCalendarEvent;
import com.example.academic_support_portal.calendar.service.AcademicCalendarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class AcademicCalendarController {
  private final AcademicCalendarService service;

  @GetMapping
  public List<AcademicCalendarEvent> getAll(@RequestParam(required = false) String category) {
    if (category != null && !category.isEmpty()) {
      return service.getByCategory(category);
    }
    return service.getAll();
  }

  @PostMapping
  public AcademicCalendarEvent create(@Valid @RequestBody AcademicCalendarEvent event) {
    return service.create(event);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable String id) {
    service.delete(id);
  }
}
