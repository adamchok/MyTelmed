package com.mytelmed.utils;

import com.mytelmed.config.EncryptionProperties;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;


@Component
@Slf4j
public class AesEncryptionUtil {
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int IV_SIZE = 12;
    private static final int TAG_LENGTH_BIT = 128;
    private final EncryptionProperties encryptionProperties;
    private SecretKeySpec keySpec;

    public AesEncryptionUtil(EncryptionProperties encryptionProperties) {
        this.encryptionProperties = encryptionProperties;
    }

    @PostConstruct
    private void init() {
        String base64Key = encryptionProperties.getSecretKey().trim();
        byte[] keyBytes = Base64.getDecoder().decode(base64Key);

        if (keyBytes.length != 32) {
            log.debug("Invalid key bytes length: {}", keyBytes.length);
            throw new IllegalArgumentException("AES key must be exactly 32 bytes for AES-256");
        }
        this.keySpec = new SecretKeySpec(keyBytes, ALGORITHM);
    }

    public String encrypt(String plaintext) throws Exception {
        byte[] iv = new byte[IV_SIZE];
        new SecureRandom().nextBytes(iv);
        GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmSpec);

        byte[] encrypted = cipher.doFinal(plaintext.getBytes());

        byte[] ivAndEncrypted = new byte[IV_SIZE + encrypted.length];
        System.arraycopy(iv, 0, ivAndEncrypted, 0, IV_SIZE);
        System.arraycopy(encrypted, 0, ivAndEncrypted, IV_SIZE, encrypted.length);

        return Base64.getEncoder().encodeToString(ivAndEncrypted);
    }

    public String decrypt(String base64IvAndCiphertext) throws Exception {
        byte[] ivAndEncrypted = Base64.getDecoder().decode(base64IvAndCiphertext);

        byte[] iv = new byte[IV_SIZE];
        byte[] encrypted = new byte[ivAndEncrypted.length - IV_SIZE];

        System.arraycopy(ivAndEncrypted, 0, iv, 0, IV_SIZE);
        System.arraycopy(ivAndEncrypted, IV_SIZE, encrypted, 0, encrypted.length);

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE, keySpec, new GCMParameterSpec(TAG_LENGTH_BIT, iv));

        byte[] decrypted = cipher.doFinal(encrypted);
        return new String(decrypted);
    }
}
