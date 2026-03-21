package com.example.academic_support_portal.security;

import com.example.academic_support_portal.user.model.Role;
import com.example.academic_support_portal.user.model.User;
import com.example.academic_support_portal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

  private final UserRepository userRepository;

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

    Set<Role> resolvedRoles = new HashSet<>(user.getRoles() == null ? Collections.emptySet() : user.getRoles());
    if (resolvedRoles.isEmpty() && user.getRole() != null) {
      resolvedRoles.add(user.getRole());
    }
    if (resolvedRoles.isEmpty()) {
      resolvedRoles.add(Role.STUDENT);
    }

    return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
        .password(user.getPassword())
        .authorities(resolvedRoles.stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
            .collect(Collectors.toList()))
        .build();
  }
}
