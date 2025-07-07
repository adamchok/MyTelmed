package com.mytelmed.common.constant;

import com.fasterxml.jackson.annotation.JsonCreator;


public enum Language {
    ENGLISH,
    MANDARIN,
    MALAY,
    TAMIL;

    @JsonCreator
    public static Language fromString(String value) {
        return Language.valueOf(value.toUpperCase());
    }
}
