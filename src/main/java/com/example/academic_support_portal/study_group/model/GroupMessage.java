package com.example.academic_support_portal.study_group.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "group_messages")
public class GroupMessage {

  @Id
  private String id;

  private String groupId;

  @NotBlank(message = "Sender ID is required")
  private String senderId;

  @NotBlank(message = "Sender name is required")
  private String senderName;

  @NotBlank(message = "Message content cannot be empty")
  private String content;

  private LocalDateTime timestamp;
}
