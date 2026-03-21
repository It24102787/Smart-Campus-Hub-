package com.example.academic_support_portal.user.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

  @Id
  private String id;

  @Indexed(unique = true)
  private String email;

  private String password;

  private String name;

  private String phone;

  private Role role;

  private Set<Role> roles;

  @Builder.Default
  private boolean active = true;
}
