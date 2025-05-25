package com.mytelmed.core.speciality.repository;

import com.mytelmed.core.speciality.entity.Speciality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface SpecialityRepository extends JpaRepository<Speciality, UUID> {
    Optional<Speciality> findByName(String name);
}
