package com.mytelmed.core.admin.repository;

import com.mytelmed.core.admin.entity.Admin;
import com.mytelmed.core.auth.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface AdminRepository extends JpaRepository<Admin, UUID> {
    boolean existsAdminByAccountUsername(String accountUsername);

    Optional<Admin> findByAccount(Account account);
    
    Optional<Admin> findByAccountId(UUID accountId);
    
    Optional<Admin> findByHashedNric(String hashedNric);
    
    Optional<Admin> findByHashedEmail(String hashedEmail);
}
