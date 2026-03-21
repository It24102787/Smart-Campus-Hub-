package com.example.academic_support_portal.tutor.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

import java.util.List;

@Data
public class TutorUpdateRequest {

    private String name;
    @Email(message = "Tutor email must be valid")
    private String email;
    private List<String> subjects;
    private String availability;
    private String mode;
    private String bio;
    private String qualifications;
}
