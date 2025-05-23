package com.mytelmed.common.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;


@Component
public class HashUtil {
    private static String SECRET_SALT;

    @Autowired
    public void setSecretSalt(@Value("${application.security.hashing.secret-key}") String secretSalt) {
        SECRET_SALT = secretSalt;
    }

    public static String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(SECRET_SALT.getBytes(StandardCharsets.UTF_8));
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
