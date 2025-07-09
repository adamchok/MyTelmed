"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PushNotificationAPI from "../api/notification";
import {
    UsePushNotificationReturn,
    PushNotificationPermission,
    PushNotificationSettings,
    NotificationStats,
    StoredPushSubscription,
    DEFAULT_PUSH_SETTINGS,
} from "../api/notification/props";

/**
 * Custom hook for managing push notifications
 * Provides comprehensive push notification functionality with error handling
 */
export function usePushNotifications(): UsePushNotificationReturn {
    // State management
    const [isSupported, setIsSupported] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [permission, setPermission] = useState<PushNotificationPermission>("default");
    const [error, setError] = useState<string | null>(null);
    const [settings, setSettings] = useState<PushNotificationSettings>(DEFAULT_PUSH_SETTINGS);
    const [stats, setStats] = useState<NotificationStats | null>(null);

    // Refs for cleanup
    const abortControllerRef = useRef<AbortController | null>(null);
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize notification support check
    useEffect(() => {
        checkNotificationSupport();
        loadStoredSettings();
        startPeriodicChecks();

        return () => {
            cleanup();
        };
    }, []);

    // Sync permission state
    useEffect(() => {
        if (isSupported) {
            syncPermissionState();
            checkSubscriptionStatus();
        }
    }, [isSupported]);

    /**
     * Check if push notifications are supported
     */
    const checkNotificationSupport = useCallback(() => {
        try {
            const supported =
                typeof window !== "undefined" &&
                "Notification" in window &&
                "serviceWorker" in navigator &&
                "PushManager" in window;

            setIsSupported(supported);

            if (supported) {
                setPermission(Notification.permission as PushNotificationPermission);
                setHasPermission(Notification.permission === "granted");
            } else {
                setError("Push notifications are not supported in this browser");
            }
        } catch (err) {
            console.error("Error checking notification support:", err);
            setError("Failed to check notification support");
            setIsSupported(false);
        }
    }, []);

    /**
     * Sync permission state with browser
     */
    const syncPermissionState = useCallback(() => {
        if (!isSupported) return;

        try {
            const currentPermission = Notification.permission as PushNotificationPermission;
            setPermission(currentPermission);
            setHasPermission(currentPermission === "granted");

            // Store permission state
            if (typeof window !== "undefined") {
                localStorage.setItem("notificationPermission", currentPermission);
            }
        } catch (err) {
            console.error("Error syncing permission state:", err);
        }
    }, [isSupported]);

    /**
     * Check current subscription status
     */
    const checkSubscriptionStatus = useCallback(async () => {
        if (!isSupported || !hasPermission) {
            setIsSubscribed(false);
            setSubscription(null);
            return;
        }

        try {
            const currentSubscription = await PushNotificationAPI.getCurrentSubscription();
            setSubscription(currentSubscription);
            setIsSubscribed(currentSubscription !== null);
        } catch (err) {
            console.error("Error checking subscription status:", err);
            setIsSubscribed(false);
            setSubscription(null);
        }
    }, [isSupported, hasPermission]);

    /**
     * Request notification permission
     */
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            setError("Push notifications are not supported in this browser");
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const permissionResult = await PushNotificationAPI.requestPermission();

            setPermission(permissionResult);
            const granted = permissionResult === "granted";
            setHasPermission(granted);

            if (!granted) {
                setError("Push notification permission was denied");
            }

            return granted;
        } catch (err: any) {
            const errorMessage = err.message || "Failed to request notification permission";
            setError(errorMessage);
            console.error("Error requesting permission:", err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    /**
     * Subscribe to push notifications
     */
    const subscribe = useCallback(
        async (deviceInfo?: string): Promise<boolean> => {
            if (!isSupported) {
                setError("Push notifications are not supported");
                return false;
            }

            // Cancel any existing request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            setIsLoading(true);
            setError(null);

            try {
                // Request permission if not granted
                if (permission !== "granted") {
                    const permissionGranted = await requestPermission();
                    if (!permissionGranted) {
                        return false;
                    }
                }

                // Subscribe with backend
                const response = await PushNotificationAPI.subscribeWithPermission(deviceInfo);

                if (response.success) {
                    // Check subscription status after successful backend registration
                    await checkSubscriptionStatus();

                    // Update stats
                    await updateNotificationStats();

                    console.log("Successfully subscribed to push notifications");
                    return true;
                } else {
                    throw new Error(response.message || "Subscription failed");
                }
            } catch (err: any) {
                const errorMessage = err.message || "Failed to subscribe to push notifications";
                setError(errorMessage);
                console.error("Error subscribing to push notifications:", err);
                return false;
            } finally {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        },
        [isSupported, permission, requestPermission, checkSubscriptionStatus]
    );

    /**
     * Unsubscribe from push notifications
     */
    const unsubscribe = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await PushNotificationAPI.unsubscribeComplete();

            if (result.success) {
                setIsSubscribed(false);
                setSubscription(null);

                // Clear stored data
                if (typeof window !== "undefined") {
                    localStorage.removeItem("pushSubscription");
                }

                console.log("Successfully unsubscribed from push notifications");
                return true;
            } else {
                throw new Error(result.message || "Unsubscription failed");
            }
        } catch (err: any) {
            const errorMessage = err.message || "Failed to unsubscribe from push notifications";
            setError(errorMessage);
            console.error("Error unsubscribing from push notifications:", err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Test push notification functionality
     */
    const testNotification = useCallback(async (): Promise<boolean> => {
        if (!isSupported || !hasPermission || !isSubscribed) {
            setError("Cannot test notifications - not properly set up");
            return false;
        }

        setError(null);

        try {
            const result = await PushNotificationAPI.testNotification();

            if (result) {
                console.log("Test notification sent successfully");
                return true;
            } else {
                setError("Failed to send test notification");
                return false;
            }
        } catch (err: any) {
            const errorMessage = err.message || "Failed to test notification";
            setError(errorMessage);
            console.error("Error testing notification:", err);
            return false;
        }
    }, [isSupported, hasPermission, isSubscribed]);

    /**
     * Update notification settings
     */
    const updateSettings = useCallback(
        async (newSettings: Partial<PushNotificationSettings>): Promise<void> => {
            try {
                const updatedSettings = { ...settings, ...newSettings };
                setSettings(updatedSettings);

                // Store settings locally
                if (typeof window !== "undefined") {
                    localStorage.setItem("pushNotificationSettings", JSON.stringify(updatedSettings));
                }

                // TODO: Send settings to backend if needed
                console.log("Push notification settings updated:", updatedSettings);
            } catch (err: any) {
                const errorMessage = err.message || "Failed to update settings";
                setError(errorMessage);
                console.error("Error updating settings:", err);
            }
        },
        [settings]
    );

    /**
     * Get stored subscription info
     */
    const getSubscriptionInfo = useCallback((): StoredPushSubscription | null => {
        if (typeof window === "undefined") return null;

        try {
            const stored = localStorage.getItem("pushSubscription");
            return stored ? JSON.parse(stored) : null;
        } catch (err) {
            console.error("Error getting subscription info:", err);
            return null;
        }
    }, []);

    /**
     * Clear current error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Load stored settings
     */
    const loadStoredSettings = useCallback(() => {
        if (typeof window === "undefined") return;

        try {
            const storedSettings = localStorage.getItem("pushNotificationSettings");
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                setSettings({ ...DEFAULT_PUSH_SETTINGS, ...parsedSettings });
            }
        } catch (err) {
            console.error("Error loading stored settings:", err);
        }
    }, []);

    /**
     * Update notification statistics
     */
    const updateNotificationStats = useCallback(async () => {
        try {
            // TODO: Fetch stats from backend or local storage
            const mockStats: NotificationStats = {
                totalSent: 0,
                totalDelivered: 0,
                totalClicked: 0,
                totalDismissed: 0,
                deliveryRate: 0,
                clickRate: 0,
            };

            setStats(mockStats);
        } catch (err) {
            console.error("Error updating notification stats:", err);
        }
    }, []);

    /**
     * Start periodic checks for subscription status
     */
    const startPeriodicChecks = useCallback(() => {
        // Check subscription status every 5 minutes
        checkIntervalRef.current = setInterval(() => {
            if (isSupported && hasPermission) {
                checkSubscriptionStatus();
            }
        }, 5 * 60 * 1000);
    }, [isSupported, hasPermission, checkSubscriptionStatus]);

    /**
     * Cleanup function
     */
    const cleanup = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
        }
    }, []);

    // Handle page visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && isSupported && hasPermission) {
                checkSubscriptionStatus();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isSupported, hasPermission, checkSubscriptionStatus]);

    // Handle online/offline events
    useEffect(() => {
        const handleOnline = () => {
            if (isSupported && hasPermission) {
                checkSubscriptionStatus();
            }
        };

        window.addEventListener("online", handleOnline);
        return () => window.removeEventListener("online", handleOnline);
    }, [isSupported, hasPermission, checkSubscriptionStatus]);

    return {
        // Status
        isSupported,
        hasPermission,
        isSubscribed,
        isLoading,

        // Actions
        requestPermission,
        subscribe,
        unsubscribe,
        testNotification,

        // Data
        subscription,
        permission,
        error,
        settings,
        stats,

        // Settings management
        updateSettings,

        // Utility
        getSubscriptionInfo,
        clearError,
    };
}

export default usePushNotifications;
