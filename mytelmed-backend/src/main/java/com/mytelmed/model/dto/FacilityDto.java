package com.mytelmed.model.dto;


public record FacilityDto(
        String id,
        String name,
        String address,
        String state,
        String city,
        String type,
        String telephone,
        String imageUrl
) {}
