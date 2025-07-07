package com.mytelmed.core.video.repository;

import com.mytelmed.common.constant.file.VideoType;
import com.mytelmed.core.video.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface VideoRepository extends JpaRepository<Video, UUID> {
    Optional<Video> findByVideoTypeAndEntityId(VideoType videoType, UUID entityId);
}
