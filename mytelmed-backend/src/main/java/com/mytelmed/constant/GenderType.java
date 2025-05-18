package com.mytelmed.constant;

public enum GenderType {
    MALE,
    FEMALE;

    public char toChar() {
        return this == MALE ? 'm' : 'f';
    }
}
