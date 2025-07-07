package com.mytelmed.common.event.video;

import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class VideoListener {
    private final AwsS3Service awsS3Service;

    public VideoListener(AwsS3Service awsS3Service) {
        this.awsS3Service = awsS3Service;
    }

    @Async
    @EventListener
    public void handleVideoDeleted(VideoDeletedEvent event) {
        try {
            awsS3Service.deleteFile(event.videoKey());
            log.info("Deleted video from S3 video with ID: {}", event.entityId());
        } catch (Exception e) {
            log.error("Failed to delete video from S3 video with ID: {}. Manual intervention is required", event.entityId(), e);
        }
    }
}
