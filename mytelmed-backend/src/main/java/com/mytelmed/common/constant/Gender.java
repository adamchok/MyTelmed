package com.mytelmed.common.constant;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.mytelmed.common.advice.exception.InvalidInputException;


public enum Gender {
    MALE,
    FEMALE;

    @JsonCreator
    public static Gender fromString(String value) {
        try {
            return Gender.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new InvalidInputException("Invalid request inputs");
        }
    }
}
