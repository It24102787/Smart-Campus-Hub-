package com.example.academic_support_portal.resource.repository;

import com.example.academic_support_portal.resource.model.AcademicResource;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

// Repository for resource-library persistence and subject-based filtering.
public interface AcademicResourceRepository extends MongoRepository<AcademicResource, String> {
  // Subject filter used by the support resources page.
  List<AcademicResource> findBySubject(String subject);
}
