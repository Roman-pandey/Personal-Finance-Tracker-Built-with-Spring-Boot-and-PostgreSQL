package com.expense.tracker.service;

import java.util.Map;

public interface SeedService {
    Map<String, Object> seedData(String email, boolean forceReset);
    Map<String, Object> clearSeedData(String email);
}
