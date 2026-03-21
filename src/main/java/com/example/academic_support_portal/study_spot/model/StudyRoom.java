package com.example.academic_support_portal.study_spot.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "study_rooms")
public class StudyRoom {

  @Id
  private String id;

  private String name;

  @NotBlank(message = "Room name is required")
  private String roomName;

  @NotBlank(message = "Building is required")
  private String building;

  @NotBlank(message = "Floor is required")
  private String floor;

  @NotBlank(message = "Zone is required")
  private String zone;

  @NotNull(message = "Capacity is required")
  @Min(value = 1, message = "Capacity must be at least 1")
  private Integer capacity;

  @NotNull(message = "Status is required")
  private StudyRoomStatus status;

  private String description;

  private String imageUrl;

  @Indexed(unique = true)
  private String qrCodeValue;

  @Indexed(unique = true, sparse = true)
  private String deviceId;

  @Indexed(unique = true, sparse = true)
  private String sensorDeviceId;

  @Default
  private Integer currentOccupancy = 0;

  @Default
  private Double temperature = 24.0;

  @Default
  private Double occupancyPercent = 0.0;

  @Default
  private LocalDateTime createdAt = LocalDateTime.now();

  @Default
  private LocalDateTime updatedAt = LocalDateTime.now();

  public String displayName() {
    if (roomName != null && !roomName.isBlank()) {
      return roomName;
    }
    if (name != null && !name.isBlank()) {
      return name;
    }
    return "Study Room";
  }

  public void normalizeNameFields() {
    if ((name == null || name.isBlank()) && roomName != null) {
      name = roomName.trim();
    }
    if ((roomName == null || roomName.isBlank()) && name != null) {
      roomName = name.trim();
    }
    if (roomName != null) {
      roomName = roomName.trim();
    }
    if (name != null) {
      name = name.trim();
    }
  }
}
