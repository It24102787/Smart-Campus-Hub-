package com.example.academic_support_portal.iot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "students")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Student {

  @Id
  private String id;

  @Indexed(unique = true)
  private String studentId;

  private String name;

  private String email;

  @Indexed(unique = true)
  private String cardUid;

  private String faculty;

  @Default
  private StudentStatus status = StudentStatus.ACTIVE;
}
