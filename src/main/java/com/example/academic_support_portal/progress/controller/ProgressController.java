package com.example.academic_support_portal.progress.controller;

import com.example.academic_support_portal.progress.model.ProgressRecord;
import com.example.academic_support_portal.progress.repository.ProgressRecordRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

  private final ProgressRecordRepository progressRepository;

  @GetMapping
  public List<ProgressRecord> getMyProgress(@RequestParam String studentId) {
    return progressRepository.findByStudentId(studentId);
  }

  @PostMapping
  public ProgressRecord addRecord(@Valid @RequestBody ProgressRecord record) {
    return progressRepository.save(record);
  }

  @PutMapping("/{id}")
  public ResponseEntity<ProgressRecord> updateRecord(@PathVariable String id,
      @Valid @RequestBody ProgressRecord record) {
    return progressRepository.findById(id)
        .map(existing -> {
          existing.setStatus(record.getStatus());
          existing.setGrade(record.getGrade());
          existing.setGpaContribution(record.getGpaContribution());
          return ResponseEntity.ok(progressRepository.save(existing));
        })
        .orElse(ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteRecord(@PathVariable String id) {
    progressRepository.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
