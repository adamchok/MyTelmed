package com.mytelmed.core.notification.service;

import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.apache.http.HttpResponse;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.security.GeneralSecurityException;
import java.security.Security;
import static java.nio.charset.StandardCharsets.UTF_8;


@Slf4j
@Service
public class PushNotificationService {
    private final PushService pushService;

    public PushNotificationService(@Value("${webpush.vapid.public-key}") String publicKey,
                                   @Value("${webpush.vapid.private-key}") String privateKey,
                                   @Value("${webpush.vapid.subject}") String subject) throws GeneralSecurityException {
        Security.addProvider(new BouncyCastleProvider());

        this.pushService = new PushService()
                .setPublicKey(publicKey)
                .setPrivateKey(privateKey)
                .setSubject(subject);
    }

    public void sendPushNotification(String endpoint, String p256dh, String auth, String payload) throws Exception {
        Notification notification = new Notification(endpoint, p256dh, auth, payload.getBytes(UTF_8));
        HttpResponse response = pushService.send(notification);

        int statusCode = response.getStatusLine().getStatusCode();
        if (statusCode != 201) {
            log.error("Push failed with status {}: {}", statusCode, response.getStatusLine());
            throw new RuntimeException("Failed to send push: " + statusCode);
        }
    }
}
