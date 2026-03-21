package com.example.academic_support_portal.auth.dto;

import com.example.academic_support_portal.user.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
  private String token;
  private AuthUserDto user;

  // Backward-compatible fields for existing frontend code paths.
  private String id;
  private String email;
  private String name;
  private Role role;
  private Set<Role> roles;
}
