package com.example.academic_support_portal.user.repository;

import com.example.academic_support_portal.user.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
  Optional<User> findByEmail(String email);

  boolean existsByEmail(String email);
}
