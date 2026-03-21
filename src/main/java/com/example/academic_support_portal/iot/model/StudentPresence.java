package com.example.academic_support_portal.iot.model;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "student_presence")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentPresence {

  @Id
  private String id;

  @Indexed(unique = true)
  private String studentId;

  private String roomId;

  @Default
  private LocalDateTime enteredAt = LocalDateTime.now();
}
