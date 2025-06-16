package com.mytelmed.common.listener;

import com.mytelmed.common.events.deletion.ImageDeletedEvent;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class ImageListener {
    private final AwsS3Service awsS3Service;

    public ImageListener(AwsS3Service awsS3Service) {
        this.awsS3Service = awsS3Service;
    }

    @Async
    @EventListener
    public void handleImageDeletion(ImageDeletedEvent event) {
        try {
            awsS3Service.deleteFile(event.imageKey(), true);
            log.info("Deleted image from S3 for entity with ID: {}", event.entityId());
        } catch (Exception e) {
            log.error("Failed to delete image from S3 for entity with ID: {}. Manual intervention is required.", event.entityId(), e);
        }
    }
}
