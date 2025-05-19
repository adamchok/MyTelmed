package com.mytelmed.utils;

import java.util.UUID;


public class PasswordGenerator {
    public static String generateSecurePassword(String name) {
        String nameWithoutSpace = name.replaceAll("\\s+", ""); // remove spaces
        String base = nameWithoutSpace.length() >= 5 ? nameWithoutSpace.substring(0, 5) : name;
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 6); // 6-char random part
        return base + "@" + uniqueSuffix;
    }
}
