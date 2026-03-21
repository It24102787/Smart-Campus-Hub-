package com.example.academic_support_portal.tutor.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TutorResponse {
    private String id;
    private String name;
    private String email;
    private List<String> subjects;
    private String availability;
    private String mode;
    private String bio;
    private String qualifications;
    private Double averageRating;
    private Integer totalReviews;
}
