package com.example.academic_support_portal.equipment.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "equipment")
public class Equipment {

  @Id
  private String id;

  @NotBlank(message = "Equipment name is required")
  private String name;

  @NotBlank(message = "Category is required")
  private String category; // Laptop, Projector, Camera, Lab Kit

  @NotBlank(message = "Description is required")
  private String description;

  private String imageUrl;

  private boolean available;

  private String status; // AVAILABLE, MAINTENANCE, RESERVED

  private List<String> conditionsNotes;
}
