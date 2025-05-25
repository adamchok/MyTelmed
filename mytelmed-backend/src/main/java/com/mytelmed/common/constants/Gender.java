package com.mytelmed.common.constants;

import com.fasterxml.jackson.annotation.JsonCreator;


public enum Gender {
    MALE,
    FEMALE;

    @JsonCreator
    public static Gender fromString(String value) {
        return Gender.valueOf(value.toUpperCase());
    }
}
