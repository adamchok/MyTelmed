package com.mytelmed.common.dto;

public record ApiResponse<T>(
        boolean isSuccess,
        String message,
        T data
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "OK", data);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data);
    }

    public static ApiResponse<Void> success(String message) {
        return new ApiResponse<>(true, message, null);
    }

    public static ApiResponse<Void> failure(String message) {
        return new ApiResponse<>(false, message, null);
    }

    public static <T> ApiResponse<T> failure(T data, String message) {
        return new ApiResponse<>(false, message, data);
    }
}

