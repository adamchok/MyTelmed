package com.mytelmed.controller;

import com.mytelmed.service.AppointmentService;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/appointment")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }
}