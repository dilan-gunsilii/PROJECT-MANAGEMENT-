package com.taskmanager.web;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiStatusController {

    @GetMapping("/status")
    public Map<String, String> status() {
        return Map.of("status", "ok");
    }
}
