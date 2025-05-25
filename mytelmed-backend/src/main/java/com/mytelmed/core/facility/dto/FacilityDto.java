package com.mytelmed.core.facility.dto;

public record FacilityDto(
        String id,
        String name,
        String telephone,
        String address,
        String city,
        String state,
        String facilityType,
        String thumbnailUrl
) {
}
