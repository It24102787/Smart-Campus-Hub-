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
public class AuthUserDto {
  private String id;
  private String name;
  private String email;
  private Role role;
  private Set<Role> roles;
}
