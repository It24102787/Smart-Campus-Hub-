package com.example.academic_support_portal.study_circle.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "study_circle_members")
@CompoundIndex(name = "circle_user_unique", def = "{'circleId': 1, 'userId': 1}", unique = true)
// Membership document that links users to circles with role and join timestamp.
public class StudyCircleMember {
  @Id
  private String id;

  private String circleId;
  private String userId;
  private String userName;
  private String userEmail;
  private LocalDateTime joinedAt;
  private StudyCircleRole role;
}
