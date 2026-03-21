package com.example.academic_support_portal.iot.model;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tap_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TapLog {

  @Id
  private String id;

  private String studentId;

  private String cardUid;

  private String deviceId;

  private String roomId;

  private TapAction action;

  @Default
  private LocalDateTime timestamp = LocalDateTime.now();
}
