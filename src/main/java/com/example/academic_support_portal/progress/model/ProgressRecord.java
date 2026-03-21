package com.example.academic_support_portal.progress.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "academic_progress")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressRecord {
  @Id
  private String id;

  @NotBlank(message = "Student ID is required")
  private String studentId;

  @NotBlank(message = "Module code is required")
  private String moduleCode;

  @NotBlank(message = "Module name is required")
  private String moduleName;

  @NotBlank(message = "Status is required")
  private String status; // Completed, In Progress, Not Started

  private String grade;
  private Double gpaContribution;
}
