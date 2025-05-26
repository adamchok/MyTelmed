package com.mytelmed.core.auth.repository;

import com.mytelmed.core.auth.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {
    Optional<Account> findByUsername(String username);

    @Modifying
    @Query("UPDATE Account a SET a.password = :password WHERE a.id = :id")
    void updatePasswordById(@Param("id") UUID id, @Param("password") String password);
}
