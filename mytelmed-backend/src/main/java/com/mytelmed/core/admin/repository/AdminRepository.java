package com.mytelmed.core.admin.repository;

import com.mytelmed.core.admin.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;


@Repository
public interface AdminRepository extends JpaRepository<Admin, UUID> {
    boolean existsAdminByAccountUsername(String accountUsername);
}
