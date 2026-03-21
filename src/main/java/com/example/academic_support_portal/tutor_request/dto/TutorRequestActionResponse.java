package com.example.academic_support_portal.tutor_request.dto;

import com.example.academic_support_portal.tutor_request.model.TutorRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TutorRequestActionResponse {
  private TutorRequest request;
  private String message;
  private String warning;
}
