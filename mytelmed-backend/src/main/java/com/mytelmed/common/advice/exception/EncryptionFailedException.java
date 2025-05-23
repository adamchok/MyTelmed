package com.mytelmed.common.advice.exception;

public class EncryptionFailedException extends RuntimeException {
    public EncryptionFailedException(String message) {
        super(message);
    }
}
