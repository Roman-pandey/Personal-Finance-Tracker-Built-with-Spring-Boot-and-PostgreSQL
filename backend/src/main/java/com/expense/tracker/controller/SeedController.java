package com.expense.tracker.controller;

import com.expense.tracker.service.SeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/seed")
@RequiredArgsConstructor
public class SeedController {

    private final SeedService seedService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> seedData(
            @RequestParam(name = "email", required = false) String email,
            @RequestParam(name = "forceReset", defaultValue = "false") boolean forceReset,
            Authentication authentication
    ) {
        String targetEmail = email;
        if ((targetEmail == null || targetEmail.isBlank()) && authentication != null) {
            targetEmail = authentication.getName();
        }
        Map<String, Object> result = seedService.seedData(targetEmail, forceReset);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> clearSeedData(
            @RequestParam(name = "email", required = false) String email,
            Authentication authentication
    ) {
        String targetEmail = email;
        if ((targetEmail == null || targetEmail.isBlank()) && authentication != null) {
            targetEmail = authentication.getName();
        }
        Map<String, Object> result = seedService.clearSeedData(targetEmail);
        return ResponseEntity.ok(result);
    }
}
