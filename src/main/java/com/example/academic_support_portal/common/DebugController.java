package com.example.academic_support_portal.common;

import com.example.academic_support_portal.user.model.Role;
import com.example.academic_support_portal.user.model.User;
import com.example.academic_support_portal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MongoTemplate mongoTemplate;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/check-user")
    public ResponseEntity<?> checkUser() {
        Map<String, Object> response = new HashMap<>();
        response.put("total_users", userRepository.count());

        userRepository.findByEmail("test@gmail.com").ifPresentOrElse(
            user -> response.put("test@gmail.com", Map.of(
                "exists", true,
                "name", user.getName(),
                "role", user.getRoles(),
                "active", user.isActive()
            )),
            () -> response.put("test@gmail.com", Map.of("exists", false))
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/seed-users")
    public ResponseEntity<?> seedUsers() {
        Map<String, String> results = new HashMap<>();

        try {
            // Clear existing users
            userRepository.deleteAll();
            results.put("status", "Database cleared");

            // Create users
            User testUser = User.builder()
                .email("test@gmail.com")
                .password(passwordEncoder.encode("password123"))
                .name("Test User")
                .phone("1234567890")
                .roles(Set.of(Role.STUDENT))
                .active(true)
                .build();

            User adminUser = User.builder()
                .email("admin@campus.com")
                .password(passwordEncoder.encode("admin123"))
                .name("Main Admin")
                .roles(Set.of(Role.ADMIN))
                .active(true)
                .build();

            User studentUser = User.builder()
                .email("student@campus.com")
                .password(passwordEncoder.encode("student123"))
                .name("John Doe")
                .roles(Set.of(Role.STUDENT))
                .active(true)
                .build();

            userRepository.save(testUser);
            userRepository.save(adminUser);
            userRepository.save(studentUser);

            results.put("message", "Users seeded successfully!");
            results.put("test_email", "test@gmail.com");
            results.put("test_password", "password123");
            results.put("admin_email", "admin@campus.com");
            results.put("admin_password", "admin123");
            results.put("student_email", "student@campus.com");
            results.put("student_password", "student123");
            results.put("total_users_created", "3");

            return ResponseEntity.ok(results);
        } catch (Exception e) {
            results.put("error", e.getMessage());
            return ResponseEntity.status(500).body(results);
        }
    }

    @PostMapping("/clean-database")
    public ResponseEntity<?> cleanDatabase() {
        mongoTemplate.getDb().drop();
        return ResponseEntity.ok(Map.of(
            "status", "ok",
            "message", "Database cleaned successfully",
            "database", mongoTemplate.getDb().getName()
        ));
    }
}

