package com.mytelmed.core.image.repository;

import com.mytelmed.common.constants.file.ImageType;
import com.mytelmed.core.image.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface ImageRepository extends JpaRepository<Image, UUID> {
    Optional<Image> findByImageTypeAndEntityId(ImageType imageType, UUID entityId);
}
