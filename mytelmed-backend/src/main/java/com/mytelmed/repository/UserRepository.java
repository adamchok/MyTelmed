package com.mytelmed.repository;

import com.mytelmed.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);

    @Query("SELECT u FROM User u JOIN u.permissions p WHERE u.username = :name AND p.access IN ('admin', 'doc', " +
            "'patient', 'pharma')")
    Optional<User> findByUsernameAndPermission(String name);
}
