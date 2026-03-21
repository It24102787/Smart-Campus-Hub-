package com.example.academic_support_portal.tutor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class TutorCreateRequest {

    @NotBlank(message = "Tutor name is required")
    private String name;

    @NotBlank(message = "Tutor email is required")
    @Email(message = "Tutor email must be valid")
    private String email;

    @NotEmpty(message = "At least one subject is required")
    private List<String> subjects;

    @NotBlank(message = "Availability is required")
    private String availability;

    @NotBlank(message = "Mode is required")
    private String mode;

    private String bio;
    private String qualifications;
}
