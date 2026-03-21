package com.example.academic_support_portal.resource.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// Mongo document for study library resources uploaded for student support.
public class AcademicResource {
  @Id
  private String id;

  @NotBlank(message = "Title is required")
  private String title;

  @NotBlank(message = "Subject is required")
  private String subject;

  private String type;
  private String description;
  private String uploaderId;
  private String uploaderName;
  private String uploadedAt;
  private String mimeType;
  private Long fileSize;
  private boolean downloadable;

  // Hide binary payload from normal JSON list/detail responses.
  @JsonIgnore
  private byte[] fileContent;
  private String fileName;
}
