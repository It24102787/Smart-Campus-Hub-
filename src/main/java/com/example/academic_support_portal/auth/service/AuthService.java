package com.example.academic_support_portal.auth.service;

import com.example.academic_support_portal.auth.dto.AuthRequest;
import com.example.academic_support_portal.auth.dto.AuthResponse;
import com.example.academic_support_portal.auth.dto.AuthUserDto;
import com.example.academic_support_portal.auth.dto.RegisterRequest;
import com.example.academic_support_portal.security.JwtService;
import com.example.academic_support_portal.user.model.Role;
import com.example.academic_support_portal.user.model.User;
import com.example.academic_support_portal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

  private static final Pattern STUDENT_EMAIL_REGEX = Pattern.compile("^[A-Za-z0-9._%+-]+@(university|univercity)\\.com$");
  private static final Pattern VALID_EMAIL_REGEX = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;
  private final UserDetailsService userDetailsService;

  public AuthResponse register(RegisterRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
      log.warn("Registration attempt with existing email: {}", request.getEmail());
      throw new ResponseStatusException(CONFLICT, "Email already exists");
    }
    Set<Role> resolvedRoles = resolveRoles(request.getRoles());
    Role primaryRole = resolvePrimaryRole(null, resolvedRoles);
    validateEmailByRole(request.getEmail(), primaryRole);

    User user = User.builder()
        .name(request.getName())
        .email(request.getEmail())
        .password(passwordEncoder.encode(request.getPassword()))
        .phone(request.getPhone())
        .role(primaryRole)
        .roles(resolvedRoles)
        .active(true)
        .build();
    userRepository.save(user);
    log.info("User registered successfully: {}", request.getEmail());

    UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
    String jwtToken = generateTokenForUser(user, userDetails);

    return buildAuthResponse(jwtToken, user);
  }

  public AuthResponse login(AuthRequest request) {
    log.info("Login attempt for user: {}", request.getEmail());

    if (!VALID_EMAIL_REGEX.matcher(request.getEmail()).matches()) {
      throw new ResponseStatusException(BAD_REQUEST, "Please enter a valid tutor email address.");
    }

    userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
      Role primaryRole = resolvePrimaryRole(user.getRole(), resolveRoles(user.getRoles()));
      validateEmailByRole(request.getEmail(), primaryRole);
    });

    try {
      authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(
              request.getEmail(),
              request.getPassword()));
      log.debug("Authentication successful for user: {}", request.getEmail());
    } catch (AuthenticationException e) {
      log.warn("Authentication failed for user: {} - {}", request.getEmail(), e.getMessage());
      throw new BadCredentialsException("Invalid email or password", e);
    }

    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> {
          log.warn("User not found after successful authentication: {}", request.getEmail());
          return new RuntimeException("User not found");
        });

    if (!user.isActive()) {
      log.warn("Login attempt for inactive user: {}", request.getEmail());
      throw new RuntimeException("User account is inactive");
    }

    UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
    String jwtToken = generateTokenForUser(user, userDetails);
    log.info("JWT token generated successfully for user: {}", request.getEmail());

    return buildAuthResponse(jwtToken, user);
  }

  public AuthResponse refreshToken(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      log.warn("Refresh token request without valid Bearer token");
      throw new RuntimeException("Refresh token missing");
    }
    String jwt = authHeader.substring(7);
    String userEmail = jwtService.extractUsername(jwt);
    User user = userRepository.findByEmail(userEmail)
        .orElseThrow(() -> new RuntimeException("User not found"));

    UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
    if (jwtService.isTokenValid(jwt, userDetails)) {
      String newToken = generateTokenForUser(user, userDetails);
      log.info("Token refreshed successfully for user: {}", userEmail);
      return buildAuthResponse(newToken, user);
    }
    log.warn("Invalid token refresh attempt for user: {}", userEmail);
    throw new RuntimeException("Invalid token");
  }

  private AuthResponse buildAuthResponse(String token, User user) {
    Set<Role> resolvedRoles = resolveRoles(user.getRoles());
    Role primaryRole = resolvePrimaryRole(user.getRole(), resolvedRoles);

    AuthUserDto userDto = AuthUserDto.builder()
        .id(user.getId())
        .name(user.getName())
        .email(user.getEmail())
        .role(primaryRole)
        .roles(resolvedRoles)
        .build();

    return AuthResponse.builder()
        .token(token)
        .user(userDto)
        .id(user.getId())
        .name(user.getName())
        .email(user.getEmail())
        .role(primaryRole)
        .roles(resolvedRoles)
        .build();
  }

  private Set<Role> resolveRoles(Set<Role> roles) {
    if (roles == null || roles.isEmpty()) {
      return new LinkedHashSet<>(Set.of(Role.STUDENT));
    }
    return new LinkedHashSet<>(roles);
  }

  private Role resolvePrimaryRole(Role explicitRole, Set<Role> roles) {
    if (explicitRole != null) {
      return explicitRole;
    }
    if (roles.contains(Role.TUTOR)) {
      return Role.TUTOR;
    }
    if (roles.contains(Role.ADMIN)) {
      return Role.ADMIN;
    }
    return Role.STUDENT;
  }

  private void validateEmailByRole(String email, Role role) {
    if (role == Role.STUDENT && !STUDENT_EMAIL_REGEX.matcher(email).matches()) {
      throw new ResponseStatusException(BAD_REQUEST, "Students must use a @university.com or @univercity.com email address.");
    }
    if (role == Role.TUTOR && !VALID_EMAIL_REGEX.matcher(email).matches()) {
      throw new ResponseStatusException(BAD_REQUEST, "Please enter a valid tutor email address.");
    }
    if ((role == Role.ADMIN || role == null) && !VALID_EMAIL_REGEX.matcher(email).matches()) {
      throw new ResponseStatusException(BAD_REQUEST, "Invalid email format");
    }
  }

  private String generateTokenForUser(User user, UserDetails userDetails) {
    Set<Role> resolvedRoles = resolveRoles(user.getRoles());
    Role primaryRole = resolvePrimaryRole(user.getRole(), resolvedRoles);

    Map<String, Object> claims = new HashMap<>();
    claims.put("role", primaryRole.name());
    claims.put("roles", resolvedRoles.stream().map(Role::name).toList());

    return jwtService.generateToken(claims, userDetails);
  }
}
