package com.mytelmed.core.notification.mapper;

import com.mytelmed.core.notification.dto.NotificationDto;
import com.mytelmed.core.notification.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface NotificationMapper {
    @Mapping(target = "id",
            expression = "java(notification.getId() != null ? notification.getId().toString() : null)")
    @Mapping(target = "imageUrl",
            expression = "java(notification.getNotificationImage() != null ? notification.getNotificationImage().getImageUrl() : null)")
    @Mapping(target = "type",
            expression = "java(notification.getNotificationType() != null ? notification.getNotificationType().toString().toLowerCase() : null)")
    @Mapping(target = "isRead", expression = "java(notification.getIsRead())")
    NotificationDto toDto(Notification notification);
}
