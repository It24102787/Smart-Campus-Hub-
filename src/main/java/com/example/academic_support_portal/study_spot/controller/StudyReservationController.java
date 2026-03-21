package com.example.academic_support_portal.study_spot.controller;

import com.example.academic_support_portal.study_spot.dto.BookingResponse;
import com.example.academic_support_portal.study_spot.dto.BookingSummaryResponse;
import com.example.academic_support_portal.study_spot.dto.CreateBookingRequest;
import com.example.academic_support_portal.study_spot.service.StudySpotService;
import com.example.academic_support_portal.user.model.User;
import com.example.academic_support_portal.user.repository.UserRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class StudyReservationController {

  private final StudySpotService studySpotService;
  private final UserRepository userRepository;

  @PostMapping
  @PreAuthorize("isAuthenticated()")
  public BookingResponse createBooking(
      @Valid @RequestBody CreateBookingRequest request,
      Authentication authentication) {
    User user = resolveUser(authentication);
    return studySpotService.createBooking(user, request);
  }

  @GetMapping("/my")
  @PreAuthorize("isAuthenticated()")
  public List<BookingSummaryResponse> getMyBookings(Authentication authentication) {
    User user = resolveUser(authentication);
    return studySpotService.getMyBookings(user);
  }

  @GetMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public BookingResponse getBooking(@PathVariable String id, Authentication authentication) {
    User user = resolveUser(authentication);
    return studySpotService.getBookingById(id, user);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public void cancelBooking(@PathVariable String id, Authentication authentication) {
    User user = resolveUser(authentication);
    studySpotService.cancelBooking(id, user);
  }

  private User resolveUser(Authentication authentication) {
    return userRepository.findByEmail(authentication.getName())
        .orElseThrow(() -> new NoSuchElementException("Authenticated user not found"));
  }
}
