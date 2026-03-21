package com.example.academic_support_portal.calendar.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "academic_calendar_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicCalendarEvent {
  @Id
  private String id;

  @NotBlank(message = "Event name is required")
  private String name;

  @NotBlank(message = "Date is required")
  private String date;

  @NotBlank(message = "Category is required")
  private String category; // Exam, Assignment, Lecture, Holiday, etc.

  private String description;
}
