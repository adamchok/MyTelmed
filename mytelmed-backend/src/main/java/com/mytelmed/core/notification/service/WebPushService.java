package com.mytelmed.core.notification.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.auth.service.AccountService;
import com.mytelmed.core.notification.entity.PushSubscription;
import com.mytelmed.core.notification.repository.PushSubscriptionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;


@Slf4j
@Service
public class WebPushService {
    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final AccountService accountService;
    private final PushNotificationService pushNotificationService;

    public WebPushService(PushSubscriptionRepository pushSubscriptionRepository, PushNotificationService pushNotificationService, AccountService accountService) {
        this.pushSubscriptionRepository = pushSubscriptionRepository;
        this.pushNotificationService = pushNotificationService;
        this.accountService = accountService;
    }

    private String buildPayload(String title, String body, String url) {
        return String.format("""
                {
                    "notification": {
                        "title": "%s",
                        "body": "%s",
                        "icon": "/logo.png",
                        "data": {
                            "url": "%s"
                        },
                        "actions": [
                            {
                                "action": "view",
                                "title": "View"
                            }
                        ]
                    }
                }
                """, title, body, url);
    }

    private boolean isSubscriptionExpired(Exception e) {
        String message = e.getMessage().toLowerCase();
        return message.contains("expired") || message.contains("invalid") || message.contains("not found");
    }

    @Transactional
    public void subscribe(UUID accountId, String endpoint, String p256dh, String auth) throws AppException {
        try {
            Account account = accountService.getAccountById(accountId);

            PushSubscription subscription = PushSubscription.builder()
                    .account(account)
                    .endpoint(endpoint)
                    .p256dh(p256dh)
                    .auth(auth)
                    .build();

            pushSubscriptionRepository.save(subscription);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to subscribe account: {}", accountId, e);
            throw new AppException("Failed to subscribe account");
        }
    }

    @Transactional
    public void unsubscribe(UUID accountId, String endpoint) throws AppException {
        try {
            pushSubscriptionRepository.deleteByAccountIdAndEndpoint(accountId, endpoint);
        } catch (Exception e) {
            log.error("Failed to unsubscribe account: {}", accountId, e);
            throw new AppException("Failed to unsubscribe account");
        }
    }

    @Transactional
    public void sendNotification(Account account, String title, String body, String url) {
        List<PushSubscription> subscriptions = pushSubscriptionRepository.findByAccountId(account.getId());

        for (PushSubscription subscription : subscriptions) {
            try {
                pushNotificationService.sendPushNotification(
                        subscription.getEndpoint(),
                        subscription.getP256dh(),
                        subscription.getAuth(),
                        buildPayload(title, body, url)
                );
            } catch (Exception e) {
                log.error("Failed to send push notification to account: {}", account.getId(), e);

                if (isSubscriptionExpired(e)) {
                    pushSubscriptionRepository.delete(subscription);
                }
            }
        }
    }
}
