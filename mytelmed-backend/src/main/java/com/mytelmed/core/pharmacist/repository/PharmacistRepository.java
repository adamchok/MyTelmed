package com.mytelmed.core.pharmacist.repository;

import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.pharmacist.entity.Pharmacist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PharmacistRepository extends JpaRepository<Pharmacist, UUID> {
    Optional<Pharmacist> findByAccount(Account account);

    Optional<Pharmacist> findByAccountId(UUID accountId);
    
    Optional<Pharmacist> findByHashedNric(String hashedNric);
    
    Optional<Pharmacist> findByHashedEmail(String hashedEmail);

    boolean existsPharmacistByHashedEmail(String hashedEmail);

    boolean existsPharmacistByHashedNric(String hashedNric);

    boolean existsPharmacistByHashedPhone(String hashedPhone);
}
