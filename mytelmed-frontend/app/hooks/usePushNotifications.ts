"use client";

import { useState, useEffect, useCallback } from "react";
import pushNotificationApi from "../api/notification";
import { NotificationPermissionState, PushSubscriptionRequest } from "../api/notification/props";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export const usePushNotifications = () => {
    const [permissionState, setPermissionState] = useState<NotificationPermissionState>({
        permission: "default",
        subscription: null,
        isSupported: false,
        isSubscribed: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if push notifications are supported
    const checkSupport = useCallback(() => {
        const isSupported =
            typeof window !== "undefined" &&
            "serviceWorker" in navigator &&
            "PushManager" in window &&
            "Notification" in window;

        setPermissionState((prev) => ({
            ...prev,
            isSupported,
            permission: isSupported ? Notification.permission : "denied",
        }));

        return isSupported;
    }, []);

    // Request notification permission
    const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
        if (!checkSupport()) {
            throw new Error("Push notifications are not supported");
        }

        setIsLoading(true);
        setError(null);

        try {
            const permission = await Notification.requestPermission();

            setPermissionState((prev) => ({
                ...prev,
                permission,
            }));

            if (permission === "denied") {
                throw new Error("Notification permission denied");
            }

            return permission;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to request permission";
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [checkSupport]);

    // Subscribe to push notifications
    const subscribe = useCallback(async (): Promise<void> => {
        // Check if user is logged in before attempting subscription
        if (typeof window !== "undefined" && localStorage.getItem("isLogin") !== "true") {
            console.log("User not logged in, skipping push notification subscription");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (!checkSupport()) {
                throw new Error("Push notifications are not supported");
            }

            // Request permission if not granted
            if (Notification.permission !== "granted") {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    throw new Error("Notification permission denied");
                }
            }

            // Check VAPID key configuration with detailed logging
            console.log("VAPID_PUBLIC_KEY:", VAPID_PUBLIC_KEY ? "SET" : "NOT SET");
            console.log("VAPID_PUBLIC_KEY length:", VAPID_PUBLIC_KEY?.length || 0);

            if (!VAPID_PUBLIC_KEY) {
                throw new Error(
                    "Push notifications are not configured. Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY in your environment variables."
                );
            }

            // Get existing service worker registration (should already be registered)
            console.log("Getting service worker registration...");
            const registration = await navigator.serviceWorker.ready;
            if (!registration) {
                throw new Error("Service worker not found. Please ensure service worker is registered first.");
            }
            console.log("Service worker registration found:", registration);

            // Create push subscription with detailed logging
            console.log("Creating push subscription...");
            console.log("VAPID key (first 20 chars):", VAPID_PUBLIC_KEY.substring(0, 20) + "...");

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            console.log("Push subscription created successfully:", subscription);

            // Send to server
            const subscriptionData: PushSubscriptionRequest = {
                endpoint: subscription.endpoint,
                p256dh: arrayBufferToBase64(subscription.getKey("p256dh")!),
                auth: arrayBufferToBase64(subscription.getKey("auth")!),
                userAgent: navigator.userAgent,
                deviceInfo: getDeviceInfo(),
            };

            console.log("Sending subscription to server...");
            await pushNotificationApi.subscribe(subscription);

            setPermissionState((prev) => ({
                ...prev,
                subscription,
                isSubscribed: true,
                permission: "granted",
            }));

            // Store subscription locally for offline sync
            await storeSubscriptionLocally(subscriptionData);

            console.log("Successfully subscribed to push notifications");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to subscribe";
            console.error("Detailed subscription error:", error);
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [checkSupport]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            if (permissionState.subscription) {
                // Unsubscribe from browser
                await permissionState.subscription.unsubscribe();

                // Unsubscribe from server
                await pushNotificationApi.unsubscribe(permissionState.subscription.endpoint);

                // Update state
                setPermissionState((prev) => ({
                    ...prev,
                    subscription: null,
                    isSubscribed: false,
                }));

                // Remove from local storage
                await removeSubscriptionLocally();

                console.log("Successfully unsubscribed from push notifications");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to unsubscribe";
            setError(errorMessage);
            console.error("Unsubscription failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [permissionState.subscription]);

    // Check current subscription status
    const checkSubscription = useCallback(async (): Promise<void> => {
        if (!checkSupport()) return;

        try {
            // Use existing service worker registration if available
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            setPermissionState((prev) => ({
                ...prev,
                subscription,
                isSubscribed: !!subscription,
            }));
        } catch {
            // If no service worker is registered yet, that's okay - just skip checking
            console.log("Service worker not ready yet, skipping subscription check");
        }
    }, [checkSupport]);

    // Initialize on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            checkSupport();
            checkSubscription();
        }
    }, [checkSupport, checkSubscription]);

    return {
        permissionState,
        isLoading,
        error,
        subscribe,
        unsubscribe,
        requestPermission,
        checkSubscription,
        clearError: () => setError(null),
    };
};

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function getDeviceInfo(): string {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    return `${platform} - ${ua.substring(0, 100)}`;
}

async function storeSubscriptionLocally(subscription: PushSubscriptionRequest): Promise<void> {
    try {
        localStorage.setItem("diaconnect-push-subscription", JSON.stringify(subscription));
    } catch (error) {
        console.warn("Failed to store subscription locally:", error);
    }
}

async function removeSubscriptionLocally(): Promise<void> {
    try {
        localStorage.removeItem("diaconnect-push-subscription");
    } catch (error) {
        console.warn("Failed to remove subscription locally:", error);
    }
}
