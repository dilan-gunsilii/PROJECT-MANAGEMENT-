package com.taskmanager.config;

import com.taskmanager.domain.Role;
import com.taskmanager.domain.User;
import com.taskmanager.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class StartupDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StartupDataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@taskmanager.local")) {
            return;
        }

        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@taskmanager.local");
        admin.setPassword(passwordEncoder.encode("Admin123!"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
    }
}
