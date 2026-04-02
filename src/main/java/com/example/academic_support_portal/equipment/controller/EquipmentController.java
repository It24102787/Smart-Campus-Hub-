package com.example.academic_support_portal.equipment.controller;

import com.example.academic_support_portal.equipment.model.Equipment;
import com.example.academic_support_portal.equipment.model.EquipmentBooking;
import com.example.academic_support_portal.equipment.repository.EquipmentBookingRepository;
import com.example.academic_support_portal.equipment.repository.EquipmentRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

  private final EquipmentRepository equipmentRepository;
  private final EquipmentBookingRepository bookingRepository;

  @GetMapping
  public List<Equipment> getAllEquipment() {
    return equipmentRepository.findAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<Equipment> getEquipmentById(@PathVariable String id) {
    return equipmentRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping("/{id}/book")
  @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
  public ResponseEntity<EquipmentBooking> bookEquipment(@PathVariable String id,
      @Valid @RequestBody EquipmentBooking booking) {
    // Enrich with equipment name so admin panel can display it without extra lookups
    equipmentRepository.findById(id).ifPresent(eq -> booking.setEquipmentName(eq.getName()));
    booking.setEquipmentId(id);
    booking.setStatus("PENDING");
    booking.setCreatedAt(java.time.LocalDateTime.now().toString());
    booking.setQrToken(UUID.randomUUID().toString());
    return ResponseEntity.ok(bookingRepository.save(booking));
  }

  @PatchMapping("/bookings/{id}/approve")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<EquipmentBooking> approveBooking(@PathVariable String id, @RequestParam boolean approved) {
    return bookingRepository.findById(id)
        .map(booking -> {
          booking.setStatus(approved ? "APPROVED" : "DECLINED");
          return ResponseEntity.ok(bookingRepository.save(booking));
        })
        .orElse(ResponseEntity.notFound().build());
  }

  /** Admin: list ALL bookings across all users and statuses */
  @GetMapping("/bookings")
  @PreAuthorize("hasRole('ADMIN')")
  public List<EquipmentBooking> getAllBookings() {
    return bookingRepository.findAll();
  }

  @GetMapping("/bookings/my")
  public List<EquipmentBooking> getMyBookings(@RequestParam String userId) {
    return bookingRepository.findByUserId(userId);
  }

  @GetMapping("/bookings/pending")
  @PreAuthorize("hasRole('ADMIN')")
  public List<EquipmentBooking> getPendingBookings() {
    return bookingRepository.findByStatus("PENDING");
  }
}
