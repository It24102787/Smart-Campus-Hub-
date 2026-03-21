package com.example.academic_support_portal.tutor.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tutors")
public class Tutor {

    @Id
    private String id;

    @NotBlank(message = "Tutor name is required")
    private String name;

    @NotBlank(message = "Tutor email is required")
    @Email(message = "Tutor email must be valid")
    private String email;

    @NotEmpty(message = "At least one subject is required")
    @Builder.Default
    private List<String> subjects = new ArrayList<>();

    @NotBlank(message = "Availability is required")
    private String availability;

    @NotBlank(message = "Mode is required")
    private String mode;

    private String bio;
    private String qualifications;

    @Builder.Default
    private Double averageRating = 0.0;

    @Builder.Default
    private Integer totalReviews = 0;
}
