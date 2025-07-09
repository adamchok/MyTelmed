package com.mytelmed.common.utils;

import com.mytelmed.core.admin.dto.CreateAdminRequestDto;
import com.mytelmed.core.admin.service.AdminService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;


@Slf4j
@Component
public class DataInitializer implements CommandLineRunner {
    private final String ADMIN_USERNAME = "admin@mytelmed.live";
    private final AdminService adminService;

    public DataInitializer(AdminService adminService) {
        this.adminService = adminService;
    }

    @Transactional
    @Override
    public void run(String... args) {
        boolean isDefaultAdminExist = adminService.isAdminExistsByUsername(ADMIN_USERNAME);

        if (!isDefaultAdminExist) {
            log.info("No default admin found. Creating default admin...");
            createDefaultAdmin();
            log.info("Default admin created successfully");
        } else {
            log.info("Default admin already exist. Skipping default admin creation.");
        }
    }

    protected void createDefaultAdmin() {
        try {
            // Create default admin request
            CreateAdminRequestDto request = CreateAdminRequestDto.builder()
                    .nric("000000000000")
                    .email(ADMIN_USERNAME)
                    .name("Default Admin")
                    .phone("0372721998")
                    .build();

            // Create and save default admin
            adminService.create(request);

            log.info("Default admin created successfully: {}", ADMIN_USERNAME);
        } catch (Exception e) {
            log.error("Unexpected error while creating default admin: {}}", ADMIN_USERNAME, e);
        }
    }
}
