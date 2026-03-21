package com.example.academic_support_portal.iot.controller;

import com.example.academic_support_portal.iot.dto.CardTapRequest;
import com.example.academic_support_portal.iot.dto.CardTapResponse;
import com.example.academic_support_portal.iot.dto.EnvironmentReadingRequest;
import com.example.academic_support_portal.iot.dto.EnvironmentReadingResponse;
import com.example.academic_support_portal.iot.service.IotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
public class IotController {

  private final IotService iotService;

  @PostMapping("/card-tap")
  public CardTapResponse cardTap(@Valid @RequestBody CardTapRequest request) {
    return iotService.processCardTap(request);
  }

  @PostMapping("/environment-reading")
  public EnvironmentReadingResponse environmentReading(@Valid @RequestBody EnvironmentReadingRequest request) {
    return iotService.saveEnvironmentReading(request);
  }
}
