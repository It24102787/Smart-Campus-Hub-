package com.example.academic_support_portal.tutor.repository;

import com.example.academic_support_portal.tutor.model.Tutor;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface TutorRepository extends MongoRepository<Tutor, String> {
    Optional<Tutor> findByEmailIgnoreCase(String email);
}
