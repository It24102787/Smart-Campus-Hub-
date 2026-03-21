package com.example.academic_support_portal.resource.controller;

import com.example.academic_support_portal.resource.model.AcademicResource;
import com.example.academic_support_portal.resource.service.AcademicResourceService;
import com.example.academic_support_portal.progress.model.ProgressRecord;
import com.example.academic_support_portal.progress.repository.ProgressRecordRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

// Resource library controller: browse, upload, download, and progress-related endpoints used in student support.
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@Slf4j
public class AcademicResourceController {
  private final AcademicResourceService service;
  private final ProgressRecordRepository progressRepository;

  // Returns all resources or only resources for a selected subject.
  @GetMapping
  public List<AcademicResource> getAll(@RequestParam(required = false) String subject) {
    if (subject != null && !subject.isEmpty()) {
      return service.getBySubject(subject);
    }
    return service.getAll();
  }

  // Creates metadata-only resource records (non-multipart path).
  @PostMapping
  public AcademicResource create(@Valid @RequestBody AcademicResource resource) {
    return service.create(resource);
  }

  // Handles multipart upload and delegates file validation/storage to service layer.
  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public AcademicResource upload(
      @RequestParam String title,
      @RequestParam String subject,
      @RequestParam(required = false) String description,
      @RequestParam(required = false) String type,
      @RequestParam(required = false) String uploaderId,
      @RequestParam(required = false) String uploaderName,
      @RequestPart("file") MultipartFile file) {
    if (!StringUtils.hasText(title) || !StringUtils.hasText(subject)) {
      log.warn("Rejecting resource upload due to missing title/subject. title='{}' subject='{}'", title, subject);
      throw new ResponseStatusException(BAD_REQUEST, "title and subject are required");
    }
    if (file == null) {
      log.warn("Rejecting resource upload due to missing file. title='{}' subject='{}'", title, subject);
    } else {
      log.info("Resource upload received. title='{}' subject='{}' fileName='{}' size={}",
          title, subject, file.getOriginalFilename(), file.getSize());
    }
    return service.createWithFile(title, subject, description, type, uploaderId, uploaderName, file);
  }

  // Streams binary file content back to the client with inferred content-type and filename.
  @GetMapping("/{id}/download")
  public ResponseEntity<byte[]> download(@PathVariable String id) {
    AcademicResource resource = service.getById(id);
    if (resource.getFileContent() == null || resource.getFileContent().length == 0) {
      throw new ResponseStatusException(BAD_REQUEST, "Resource file is not available");
    }

    MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
    if (StringUtils.hasText(resource.getMimeType())) {
      try {
        mediaType = MediaType.parseMediaType(resource.getMimeType());
      } catch (Exception ignored) {
        mediaType = MediaType.APPLICATION_OCTET_STREAM;
      }
    }
    String fileName = StringUtils.hasText(resource.getFileName()) ? resource.getFileName() : "resource.bin";

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
        .contentType(mediaType)
        .body(resource.getFileContent());
  }

  // Deletes a resource entry by id.
  @DeleteMapping("/{id}")
  public void delete(@PathVariable String id) {
    service.delete(id);
  }

  // Student support progress endpoint (used by support pages that show user learning progress).
  @GetMapping("/progress/{userId}")
  public List<ProgressRecord> getUserProgress(@PathVariable String userId) {
    return progressRepository.findByStudentId(userId);
  }

  // Saves progress records tied to the student support workflow.
  @PostMapping("/progress")
  public ProgressRecord updateProgress(@Valid @RequestBody ProgressRecord record) {
    return progressRepository.save(record);
  }
}
