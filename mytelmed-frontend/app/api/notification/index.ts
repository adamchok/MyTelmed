import repository from "../RepositoryManager";
import {
  PushSubscriptionRequest,
  PushSubscriptionResponse,
  PushNotificationPermission,
} from "./props";

/**
 * Push Notification API Client
 * Handles all push notification subscription management with the backend
 */
class PushNotificationAPI {
  private static readonly VAPID_PUBLIC_KEY =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  private static readonly NOTIFICATION_OPTIONS = {
    userVisibleOnly: true,
    applicationServerKey: PushNotificationAPI.urlBase64ToUint8Array(
      PushNotificationAPI.VAPID_PUBLIC_KEY
    ),
  };

  /**
   * Subscribe user to push notifications
   * @param subscription - PushSubscription object from browser
   * @param deviceInfo - Additional device information
   * @returns Promise<PushSubscriptionResponse>
   */
  static async subscribe(
    subscription: PushSubscription,
    deviceInfo?: string
  ): Promise<PushSubscriptionResponse> {
    try {
      const request: PushSubscriptionRequest = {
        endpoint: subscription.endpoint,
        p256dh: PushNotificationAPI.arrayBufferToBase64(
          subscription.getKey("p256dh")
        ),
        auth: PushNotificationAPI.arrayBufferToBase64(
          subscription.getKey("auth")
        ),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        deviceInfo: deviceInfo || PushNotificationAPI.getDeviceInfo(),
      };

      const response = await repository.post(
        "/push-subscriptions/subscribe",
        request
      );

      // Store subscription locally for offline access
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "pushSubscription",
          JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: request.p256dh,
              auth: request.auth,
            },
            subscribedAt: Date.now(),
          })
        );
      }

      return {
        success: true,
        message:
          response.data?.message ||
          "Successfully subscribed to push notifications",
        subscription: request,
      };
    } catch (error: any) {
      console.error("Failed to subscribe to push notifications:", error);
      throw new Error(
        error.response?.data?.message ||
          "Failed to subscribe to push notifications. Please try again."
      );
    }
  }

  /**
   * Unsubscribe from a specific endpoint
   * @param endpoint - The subscription endpoint to unsubscribe
   * @returns Promise<{ success: boolean; message: string }>
   */
  static async unsubscribe(
    endpoint: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await repository.delete(
        "/push-subscriptions/unsubscribe",
        {
          params: { endpoint },
        }
      );

      // Remove from local storage
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("pushSubscription");
        if (stored) {
          const subscription = JSON.parse(stored);
          if (subscription.endpoint === endpoint) {
            localStorage.removeItem("pushSubscription");
          }
        }
      }

      return {
        success: true,
        message:
          response.data?.message ||
          "Successfully unsubscribed from push notifications",
      };
    } catch (error: any) {
      console.error("Failed to unsubscribe from push notifications:", error);
      throw new Error(
        error.response?.data?.message ||
          "Failed to unsubscribe from push notifications"
      );
    }
  }

  /**
   * Unsubscribe from all push notifications for the current user
   * @returns Promise<{ success: boolean; message: string }>
   */
  static async unsubscribeAll(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await repository.delete(
        "/push-subscriptions/unsubscribe/all"
      );

      // Clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("pushSubscription");
        localStorage.removeItem("notificationPermission");
      }

      return {
        success: true,
        message:
          response.data?.message ||
          "Successfully unsubscribed from all push notifications",
      };
    } catch (error: any) {
      console.error(
        "Failed to unsubscribe from all push notifications:",
        error
      );
      throw new Error(
        error.response?.data?.message ||
          "Failed to unsubscribe from all push notifications"
      );
    }
  }

  /**
   * Request notification permission from the user
   * @returns Promise<PushNotificationPermission>
   */
  static async requestPermission(): Promise<PushNotificationPermission> {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support push notifications");
    }

    if (!("serviceWorker" in navigator)) {
      throw new Error("This browser does not support service workers");
    }

    try {
      const permission = await Notification.requestPermission();

      // Store permission state
      if (typeof window !== "undefined") {
        localStorage.setItem("notificationPermission", permission);
      }

      return permission as PushNotificationPermission;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      throw new Error("Failed to request notification permission");
    }
  }

  /**
   * Get current notification permission status
   * @returns PushNotificationPermission
   */
  static getPermissionStatus(): PushNotificationPermission {
    if (!("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission as PushNotificationPermission;
  }

  /**
   * Subscribe to push notifications with permission handling
   * @param deviceInfo - Optional device information
   * @returns Promise<PushSubscriptionResponse>
   */
  static async subscribeWithPermission(
    deviceInfo?: string
  ): Promise<PushSubscriptionResponse> {
    try {
      // Check if notifications are supported
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        throw new Error("Push notifications are not supported in this browser");
      }

      // Request permission if not granted
      const permission = await PushNotificationAPI.requestPermission();
      if (permission !== "granted") {
        throw new Error("Push notification permission was denied");
      }

      // Register service worker
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe(
        PushNotificationAPI.NOTIFICATION_OPTIONS
      );

      // Subscribe with backend
      return await PushNotificationAPI.subscribe(subscription, deviceInfo);
    } catch (error: any) {
      console.error("Failed to subscribe with permission:", error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications completely
   * @returns Promise<{ success: boolean; message: string }>
   */
  static async unsubscribeComplete(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Get current subscription
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Unsubscribe from backend
        await PushNotificationAPI.unsubscribe(subscription.endpoint);
      }

      return {
        success: true,
        message: "Successfully unsubscribed from push notifications",
      };
    } catch (error: any) {
      console.error("Failed to completely unsubscribe:", error);
      throw error;
    }
  }

  /**
   * Check if user is currently subscribed
   * @returns Promise<boolean>
   */
  static async isSubscribed(): Promise<boolean> {
    try {
      if (!("serviceWorker" in navigator)) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      return subscription !== null;
    } catch (error) {
      console.error("Failed to check subscription status:", error);
      return false;
    }
  }

  /**
   * Get current subscription details
   * @returns Promise<PushSubscription | null>
   */
  static async getCurrentSubscription(): Promise<PushSubscription | null> {
    try {
      if (!("serviceWorker" in navigator)) {
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error("Failed to get current subscription:", error);
      return null;
    }
  }

  /**
   * Test push notification functionality
   * @returns Promise<boolean>
   */
  static async testNotification(): Promise<boolean> {
    try {
      if (PushNotificationAPI.getPermissionStatus() !== "granted") {
        return false;
      }

      // Show a test notification
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification("MyTelmed Test", {
          body: "Push notifications are working correctly!",
          icon: "/assets/logos/mytelmed-logo.png",
          badge: "/assets/logos/mytelmed-logo.png",
          tag: "test-notification",
          requireInteraction: false,
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to test notification:", error);
      return false;
    }
  }

  // Utility methods

  /**
   * Convert URL-safe base64 to Uint8Array
   * @param base64String - VAPID public key
   * @returns Uint8Array
   */
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Convert ArrayBuffer to base64 string
   * @param buffer - ArrayBuffer to convert
   * @returns string
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return "";

    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Get device information for tracking
   * @returns string
   */
  private static getDeviceInfo(): string {
    if (typeof navigator === "undefined") return "";

    const platform = navigator.platform || "";
    const vendor = (navigator as any).vendor || "";
    const userAgent = navigator.userAgent || "";

    // Extract meaningful device info
    const deviceInfo = {
      platform,
      vendor,
      isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
      isDesktop: !/Mobile|Android|iPhone|iPad/.test(userAgent),
      browser: PushNotificationAPI.getBrowserName(userAgent),
      os: PushNotificationAPI.getOperatingSystem(userAgent),
    };

    return JSON.stringify(deviceInfo);
  }

  /**
   * Extract browser name from user agent
   * @param userAgent - Navigator user agent
   * @returns string
   */
  private static getBrowserName(userAgent: string): string {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  }

  /**
   * Extract operating system from user agent
   * @param userAgent - Navigator user agent
   * @returns string
   */
  private static getOperatingSystem(userAgent: string): string {
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
      return "iOS";
    return "Unknown";
  }
}

export default PushNotificationAPI;
