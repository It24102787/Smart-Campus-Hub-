package com.example.academic_support_portal.dashboard.controller;

import com.example.academic_support_portal.dashboard.dto.EnvironmentDashboardResponse;
import com.example.academic_support_portal.iot.service.IotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

  private final IotService iotService;

  @GetMapping("/environment")
  public EnvironmentDashboardResponse getEnvironment() {
    return iotService.getEnvironmentDashboard();
  }
}
