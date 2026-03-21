package com.example.academic_support_portal.resource.service;

import com.example.academic_support_portal.resource.model.AcademicResource;
import com.example.academic_support_portal.resource.repository.AcademicResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
@Slf4j
// Service layer for resource library business rules: validation, file handling, and persistence.
public class AcademicResourceService {
  private final AcademicResourceRepository repository;
  private static final long MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

  // Returns the full resource catalog used by the support library UI.
  public List<AcademicResource> getAll() {
    return repository.findAll();
  }

  // Returns resources for one subject to support subject filtering.
  public List<AcademicResource> getBySubject(String subject) {
    return repository.findBySubject(subject);
  }

  // Creates metadata-based resources and derives defaults for timestamp/type/download flag.
  public AcademicResource create(AcademicResource resource) {
    if (!StringUtils.hasText(resource.getUploadedAt())) {
      resource.setUploadedAt(Instant.now().toString());
    }
    if (!StringUtils.hasText(resource.getType())) {
      resource.setType("PDF");
    }
    resource.setDownloadable(resource.getFileContent() != null && resource.getFileContent().length > 0);
    return repository.save(resource);
  }

  // Validates multipart upload input, maps file metadata, and stores binary content in MongoDB.
  public AcademicResource createWithFile(
      String title,
      String subject,
      String description,
      String type,
      String uploaderId,
      String uploaderName,
      MultipartFile file) {
    if (file == null || file.isEmpty()) {
      log.warn("Upload rejected: missing/empty file. title='{}' subject='{}'", title, subject);
      throw new ResponseStatusException(BAD_REQUEST, "File is required");
    }
    if (file.getSize() > MAX_UPLOAD_SIZE_BYTES) {
      log.warn("Upload rejected: file too large. size={} title='{}' subject='{}'",
          file.getSize(), title, subject);
      throw new ResponseStatusException(BAD_REQUEST, "File size must be 10MB or less");
    }

    String mimeType = normalizeMimeType(file.getContentType());
    String resourceType = StringUtils.hasText(type) ? type.trim() : inferTypeFromMime(mimeType);
    String safeFileName = sanitizeFileName(file.getOriginalFilename());

    try {
      AcademicResource resource = AcademicResource.builder()
          .title(title != null ? title.trim() : "")
          .subject(subject != null ? subject.trim() : "")
          .description(description)
          .type(resourceType)
          .uploaderId(uploaderId)
          .uploaderName(uploaderName)
          .uploadedAt(Instant.now().toString())
          .mimeType(mimeType)
          .fileSize(file.getSize())
          .fileName(safeFileName)
          .fileContent(file.getBytes())
          .downloadable(true)
          .build();
      return repository.save(resource);
    } catch (IOException ex) {
      log.error("Failed to read uploaded file. title='{}' subject='{}' fileName='{}'",
          title, subject, file.getOriginalFilename(), ex);
      throw new ResponseStatusException(BAD_REQUEST, "Failed to read uploaded file");
    }
  }

  // Fetches a resource by id for detail/download endpoints.
  public AcademicResource getById(String id) {
    return repository.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Resource not found"));
  }

  // Deletes a stored resource record.
  public void delete(String id) {
    repository.deleteById(id);
  }

  // Normalizes content-type for stable type detection and response headers.
  private String normalizeMimeType(String mimeType) {
    if (!StringUtils.hasText(mimeType)) {
      return "application/octet-stream";
    }
    return mimeType.toLowerCase(Locale.ROOT);
  }

  // Converts MIME types into UI-friendly resource categories.
  private String inferTypeFromMime(String mimeType) {
    if ("application/pdf".equals(mimeType)) {
      return "PDF";
    }
    if (mimeType.startsWith("video/")) {
      return "Video";
    }
    if (mimeType.startsWith("text/")) {
      return "Text";
    }
    return "File";
  }

  // Removes path segments and unsafe filename forms before persistence.
  private String sanitizeFileName(String originalName) {
    if (!StringUtils.hasText(originalName)) {
      return "resource.bin";
    }
    String trimmed = originalName.trim().replace("\\", "/");
    int lastSlash = trimmed.lastIndexOf('/');
    String baseName = lastSlash >= 0 ? trimmed.substring(lastSlash + 1) : trimmed;
    return StringUtils.hasText(baseName) ? baseName : "resource.bin";
  }
}
