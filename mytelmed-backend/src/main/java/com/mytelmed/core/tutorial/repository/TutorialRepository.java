package com.mytelmed.core.tutorial.repository;

import com.mytelmed.core.tutorial.entity.Tutorial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;


@Repository
public interface TutorialRepository extends JpaRepository<Tutorial, UUID> {
    Page<Tutorial> findByCategory(String category, Pageable pageable);
}
