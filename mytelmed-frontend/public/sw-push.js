/**
 * MyTelmed Push Notification Service Worker
 * Handles push events, notification clicks, and background sync
 */

// Workbox manifest injection - required for PWA caching
importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js");

// Inject the manifest - this will be replaced by Workbox during build
if (typeof self.__WB_MANIFEST !== "undefined") {
    // This ensures the manifest is included in the service worker
    console.log("Workbox manifest loaded");
}

// Constants
const NOTIFICATION_TAG_PREFIX = "mytelmed-";
const CACHE_NAME = "mytelmed-notifications-v1";
const FALLBACK_ICON = "/assets/logos/mytelmed-logo.png";
const FALLBACK_BADGE = "/assets/logos/mytelmed-logo.png";

// URL mappings for different notification types
const NOTIFICATION_URLS = {
    APPOINTMENT_REMINDER_PATIENT: "/patient/appointment",
    APPOINTMENT_CONFIRMATION_PATIENT: "/patient/appointment",
    APPOINTMENT_CANCEL_PATIENT: "/patient/appointment",
    APPOINTMENT_BOOKED_PATIENT: "/patient/appointment",
    PRESCRIPTION_CREATED: "/patient/prescription",
    PRESCRIPTION_EXPIRING: "/patient/prescription",
};

/**
 * Push event handler - receives notifications from backend
 */
self.addEventListener("push", (event) => {
    console.log("Push notification received:", event);

    if (!event.data) {
        console.log("Push event has no data");
        return;
    }

    try {
        // Parse notification payload
        const payload = event.data.json();
        console.log("Push payload:", payload);

        // Validate payload
        if (!payload.title || !payload.body) {
            console.error("Invalid push payload - missing title or body");
            return;
        }

        // Show notification
        event.waitUntil(showNotification(payload));
    } catch (error) {
        console.error("Error processing push event:", error);

        // Show fallback notification
        event.waitUntil(showFallbackNotification("MyTelmed Notification", "You have a new notification"));
    }
});

/**
 * Notification click handler
 */
self.addEventListener("notificationclick", (event) => {
    console.log("Notification clicked:", event);

    const notification = event.notification;
    const action = event.action;
    const data = notification.data || {};

    // Close the notification
    notification.close();

    // Handle different actions
    event.waitUntil(handleNotificationClick(action, data));
});

/**
 * Notification close handler
 */
self.addEventListener("notificationclose", (event) => {
    console.log("Notification closed:", event);

    const data = event.notification.data || {};

    // Track notification dismissal
    event.waitUntil(trackNotificationEvent("dismissed", data));
});

/**
 * Show notification with proper formatting
 */
async function showNotification(payload) {
    try {
        const {
            title,
            body,
            icon = FALLBACK_ICON,
            badge = FALLBACK_BADGE,
            image,
            tag,
            data = {},
            actions = [],
            requireInteraction = false,
            silent = false,
            vibrate = [200, 100, 200],
        } = payload;

        // Create notification options
        const options = {
            body,
            icon,
            badge,
            image,
            tag: tag || `${NOTIFICATION_TAG_PREFIX}${Date.now()}`,
            data: {
                ...data,
                timestamp: Date.now(),
                url: data.url ?? getNotificationUrl(data.notificationType || payload.tag, data),
            },
            actions: actions.map((action) => ({
                action: action.action,
                title: action.title,
                icon: action.icon,
            })),
            requireInteraction,
            silent,
            vibrate: silent ? [] : vibrate,
            renotify: true,
            persistent: true,
        };

        console.log("Showing notification with options:", options);

        // Show the notification
        await self.registration.showNotification(title, options);

        // Track notification delivery
        await trackNotificationEvent("delivered", data);

        console.log("Notification shown successfully");
    } catch (error) {
        console.error("Error showing notification:", error);
        throw error;
    }
}

/**
 * Show fallback notification when payload is invalid
 */
async function showFallbackNotification(title, body) {
    try {
        const options = {
            body,
            icon: FALLBACK_ICON,
            badge: FALLBACK_BADGE,
            tag: `${NOTIFICATION_TAG_PREFIX}fallback`,
            data: {
                timestamp: Date.now(),
                type: "fallback",
            },
            requireInteraction: false,
        };

        await self.registration.showNotification(title, options);
        console.log("Fallback notification shown");
    } catch (error) {
        console.error("Error showing fallback notification:", error);
    }
}

/**
 * Handle notification click events
 */
async function handleNotificationClick(action, data) {
    try {
        console.log("Handling notification click:", { action, data });

        // Track click event
        await trackNotificationEvent("clicked", { ...data, action });

        // Handle specific actions
        await openNotificationUrl(data);
    } catch (error) {
        console.error("Error handling notification click:", error);
    }
}

/**
 * Open notification URL in client
 */
async function openNotificationUrl(data) {
    try {
        const url = data.url || getNotificationUrl(data.notificationType, data);
        console.log("Opening notification URL:", url);

        // Focus existing window or open new one
        const clients = await self.clients.matchAll({ type: "window" });

        for (const client of clients) {
            if (client.url.includes(url) && "focus" in client) {
                return client.focus();
            }
        }

        // Open new window
        if (self.clients.openWindow) {
            return self.clients.openWindow(url);
        }
    } catch (error) {
        console.error("Error opening notification URL:", error);
    }
}

/**
 * Get notification URL based on type and data
 */
function getNotificationUrl(notificationType, data = {}) {
    console.log("Getting notification URL for:", { notificationType, data });

    if (data.url) {
        return data.url;
    }

    const baseUrl = NOTIFICATION_URLS[notificationType] || "/";

    // Add specific IDs if available
    if (data.appointmentId && baseUrl.includes("appointments")) {
        return `${baseUrl}/${data.appointmentId}`;
    }

    if (data.prescriptionId && baseUrl.includes("prescriptions")) {
        return `${baseUrl}/${data.prescriptionId}`;
    }

    return baseUrl;
}

/**
 * Track notification events for analytics
 */
async function trackNotificationEvent(event, data) {
    try {
        console.log("Tracking notification event:", { event, data });

        // Store event locally
        const eventData = {
            event,
            notificationType: data.notificationType,
            timestamp: Date.now(),
            userId: data.userId,
            appointmentId: data.appointmentId,
            prescriptionId: data.prescriptionId,
            action: data.action,
        };

        // Store in IndexedDB or localStorage
        await storeNotificationEvent(eventData);
    } catch (error) {
        console.error("Error tracking notification event:", error);
    }
}

/**
 * Store notification event locally
 */
async function storeNotificationEvent(eventData) {
    try {
        // For simplicity, using cache API to store events
        // In production, you might want to use IndexedDB
        const cache = await caches.open(CACHE_NAME);
        const eventKey = `event-${eventData.timestamp}`;

        const response = new Response(JSON.stringify(eventData), {
            headers: { "Content-Type": "application/json" },
        });

        await cache.put(eventKey, response);
        console.log("Notification event stored locally");
    } catch (error) {
        console.error("Error storing notification event:", error);
    }
}

/**
 * Background sync for offline events (optional)
 */
self.addEventListener("sync", (event) => {
    if (event.tag === "notification-events-sync") {
        console.log("Background sync triggered for notification events");
        event.waitUntil(syncNotificationEvents());
    }
});

/**
 * Sync stored notification events when online
 */
async function syncNotificationEvents() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();

        for (const request of keys) {
            if (request.url.includes("event-")) {
                try {
                    const response = await cache.match(request);
                    const eventData = await response.json();
                    await cache.delete(request);

                    console.log("Synced notification event:", eventData.event);
                } catch (error) {
                    console.error("Error syncing event:", error);
                }
            }
        }
    } catch (error) {
        console.error("Error during notification events sync:", error);
    }
}

/**
 * Clean up old notification events
 */
self.addEventListener("activate", (event) => {
    event.waitUntil(cleanupOldEvents());
});

async function cleanupOldEvents() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        for (const request of keys) {
            if (request.url.includes("event-")) {
                const timestamp = parseInt(request.url.split("event-")[1]);
                if (timestamp < oneWeekAgo) {
                    await cache.delete(request);
                }
            }
        }

        console.log("Cleaned up old notification events");
    } catch (error) {
        console.error("Error cleaning up old events:", error);
    }
}

console.log("MyTelmed Push Notification Service Worker loaded");

// Export functions for testing
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        showNotification,
        handleNotificationClick,
        getNotificationUrl,
        trackNotificationEvent,
    };
}
