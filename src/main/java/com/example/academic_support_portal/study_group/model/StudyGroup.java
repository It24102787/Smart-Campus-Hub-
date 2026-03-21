package com.example.academic_support_portal.study_group.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "study_groups")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyGroup {
  @Id
  private String id;

  @NotBlank(message = "Group name is required")
  private String name;

  @NotBlank(message = "Subject is required")
  private String subject;

  private String moduleCode;

  @NotBlank(message = "Description is required")
  private String description;

  private String day;
  private String time;
  private String createdBy; // username or student ID

  @Builder.Default
  private List<String> members = new ArrayList<>();

  @Builder.Default
  @NotNull(message = "Max members is required")
  @Min(value = 2, message = "Group must allow at least 2 members")
  private Integer maxMembers = 10;
}
