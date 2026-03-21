package com.example.academic_support_portal.auth.controller;

import com.example.academic_support_portal.auth.dto.AuthRequest;
import com.example.academic_support_portal.auth.dto.AuthResponse;
import com.example.academic_support_portal.auth.dto.RegisterRequest;
import com.example.academic_support_portal.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(authService.register(request));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }

  @PostMapping("/refresh")
  public ResponseEntity<AuthResponse> refresh(@RequestHeader("Authorization") String authHeader) {
    return ResponseEntity.ok(authService.refreshToken(authHeader));
  }
}
