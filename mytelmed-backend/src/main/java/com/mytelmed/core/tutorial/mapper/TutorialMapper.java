package com.mytelmed.core.tutorial.mapper;

import com.mytelmed.core.tutorial.dto.TutorialDto;
import com.mytelmed.core.tutorial.entity.Tutorial;
import com.mytelmed.core.video.entity.Video;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.util.UUID;


@Mapper(componentModel = "spring")
public interface TutorialMapper {
    @Mapping(target = "id", source = "tutorial.id", qualifiedByName = "mapUUID")
    @Mapping(target = "duration", source = "tutorial.video", qualifiedByName = "mapDuration")
    @Mapping(target = "thumbnailUrl", expression = "java(mapThumbnailUrl(tutorial, awsS3Service))")
    @Mapping(target = "videoUrl", expression = "java(mapVideoUrl(tutorial, awsS3Service))")
    TutorialDto toDto(Tutorial tutorial, @Context AwsS3Service awsS3Service);

    @Named("mapUUID")
    default String mapUUID(UUID id) {
        return id != null ? id.toString() : null;
    }

    @Named("mapDuration")
    default Integer mapDuration(Video video) {
        if (video == null || video.getDurationSeconds() == null) {
            return null;
        }
        return Math.toIntExact(video.getDurationSeconds() / 60);
    }

    default String mapThumbnailUrl(Tutorial tutorial, @Context AwsS3Service awsS3Service) {
        if (tutorial.getThumbnail() != null && tutorial.getThumbnail().getImageKey() != null) {
            return awsS3Service.generatePresignedViewUrl(tutorial.getThumbnail().getImageKey());
        }
        return null;
    }

    default String mapVideoUrl(Tutorial tutorial, @Context AwsS3Service awsS3Service) {
        if (tutorial.getVideo() != null && tutorial.getVideo().getVideoKey() != null) {
            return awsS3Service.generateVideoUrl(tutorial.getVideo().getVideoKey());
        }
        return null;
    }
}
