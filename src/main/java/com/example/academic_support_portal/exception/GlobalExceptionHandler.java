package com.example.academic_support_portal.exception;

import com.example.academic_support_portal.study_spot.exception.ForbiddenReservationActionException;
import com.example.academic_support_portal.study_spot.exception.ReservationConflictException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.NoSuchElementException;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException e) {
    log.warn("Login attempt with invalid credentials");
    Map<String, String> res = new HashMap<>();
    res.put("message", "Login failed. Please check your credentials.");
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
  }

  @ExceptionHandler(UsernameNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleUserNotFound(UsernameNotFoundException e) {
    log.warn("Login attempt with non-existent user: {}", e.getMessage());
    Map<String, String> res = new HashMap<>();
    res.put("message", "Login failed. Please check your credentials.");
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
  }

  @ExceptionHandler(InternalAuthenticationServiceException.class)
  public ResponseEntity<Map<String, String>> handleInternalAuthException(InternalAuthenticationServiceException e) {
    log.warn("Internal authentication error: {}", e.getMessage());
    Map<String, String> res = new HashMap<>();
    res.put("message", "Login failed. Please check your credentials.");
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<Map<String, String>> handleAuthenticationException(AuthenticationException e) {
    log.warn("Authentication failed: {}", e.getMessage());
    Map<String, String> res = new HashMap<>();
    res.put("message", "Login failed. Please check your credentials.");
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException e) {
    log.warn("Request failed with status {}: {}", e.getStatusCode(), e.getReason());
    Map<String, String> res = new HashMap<>();
    res.put("message", e.getReason() != null ? e.getReason() : "Request failed");
    return ResponseEntity.status(e.getStatusCode()).body(res);
  }

  @ExceptionHandler(NoSuchElementException.class)
  public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException e) {
    Map<String, String> res = new HashMap<>();
    res.put("message", e.getMessage() != null ? e.getMessage() : "Resource not found");
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
  }

  @ExceptionHandler(ReservationConflictException.class)
  public ResponseEntity<Map<String, String>> handleConflict(ReservationConflictException e) {
    Map<String, String> res = new HashMap<>();
    res.put("message", e.getMessage());
    return ResponseEntity.status(HttpStatus.CONFLICT).body(res);
  }

  @ExceptionHandler(ForbiddenReservationActionException.class)
  public ResponseEntity<Map<String, String>> handleForbidden(ForbiddenReservationActionException e) {
    Map<String, String> res = new HashMap<>();
    res.put("message", e.getMessage());
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(res);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
    Map<String, String> res = new HashMap<>();
    res.put("message", e.getMessage());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
  }

  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException e) {
    log.error("Unhandled runtime exception: {}", e.getMessage(), e);
    Map<String, String> res = new HashMap<>();
    res.put("message", e.getMessage() != null ? e.getMessage() : "An unexpected error occurred");
    return ResponseEntity.status(INTERNAL_SERVER_ERROR).body(res);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException e) {
    log.debug("Validation error: {}", e.getMessage());
    Map<String, String> errors = new HashMap<>();
    e.getBindingResult().getFieldErrors().forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
    return ResponseEntity.badRequest().body(errors);
  }

  @ExceptionHandler(DuplicateKeyException.class)
  public ResponseEntity<Map<String, String>> handleDuplicateKey(DuplicateKeyException e) {
    log.warn("Duplicate key error: {}", e.getMessage());
    Map<String, String> res = new HashMap<>();
    res.put("message", "A record with the same unique value already exists");
    return ResponseEntity.status(HttpStatus.CONFLICT).body(res);
  }
}




