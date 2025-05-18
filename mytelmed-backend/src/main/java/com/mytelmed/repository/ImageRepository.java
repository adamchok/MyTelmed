package com.mytelmed.repository;

import com.mytelmed.constant.EntityType;
import com.mytelmed.model.entity.object.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;


@Repository
public interface ImageRepository extends JpaRepository<Image, UUID> {
    Image findByEntityTypeAndEntityIdAndIsDeletedFalse(EntityType entityType, UUID entityId);
}
