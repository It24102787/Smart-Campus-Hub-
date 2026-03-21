package com.example.academic_support_portal.equipment.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "equipment_bookings")
public class EquipmentBooking {

  @Id
  private String id;

  private String equipmentId;

  @NotBlank(message = "User ID is required")
  private String userId;

  @NotBlank(message = "Start date is required")
  private String startDate;

  @NotBlank(message = "End date is required")
  private String endDate;

  @NotBlank(message = "Purpose is required")
  private String purpose;

  private String status; // PENDING, APPROVED, DECLINED, CHECKED_OUT, RETURNED

  private String qrToken; // A unique token for generating the QR code

  private String conditionReportBefore;

  private String conditionReportAfter;

  private String returnedAt;
}
