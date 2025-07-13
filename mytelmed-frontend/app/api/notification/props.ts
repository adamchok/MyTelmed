/**
 * Push Notification Types and Interfaces
 * Comprehensive type definitions for push notification functionality
 */

// Permission states
export type PushNotificationPermission = "granted" | "denied" | "default" | "unsupported";

export interface NotificationPermissionState {
    permission: NotificationPermission;
    subscription: PushSubscription | null;
    isSupported: boolean;
    isSubscribed: boolean;
}

// Notification types from backend
export enum NotificationType {
    // Appointment notifications
    APPOINTMENT_REMINDER_PATIENT = "APPOINTMENT_REMINDER_PATIENT",
    APPOINTMENT_REMINDER_PROVIDER = "APPOINTMENT_REMINDER_PROVIDER",
    APPOINTMENT_CONFIRMATION_PATIENT = "APPOINTMENT_CONFIRMATION_PATIENT",
    APPOINTMENT_CONFIRMATION_PROVIDER = "APPOINTMENT_CONFIRMATION_PROVIDER",
    APPOINTMENT_CANCEL_PATIENT = "APPOINTMENT_CANCEL_PATIENT",
    APPOINTMENT_CANCEL_PROVIDER = "APPOINTMENT_CANCEL_PROVIDER",
    APPOINTMENT_BOOKED_PATIENT = "APPOINTMENT_BOOKED_PATIENT",
    APPOINTMENT_BOOKED_PROVIDER = "APPOINTMENT_BOOKED_PROVIDER",

    // Prescription notifications
    PRESCRIPTION_CREATED = "PRESCRIPTION_CREATED",
    PRESCRIPTION_EXPIRING = "PRESCRIPTION_EXPIRING",
    PRESCRIPTION_OUT_FOR_DELIVERY = "PRESCRIPTION_OUT_FOR_DELIVERY",

    // Delivery notifications
    DELIVERY_CREATED = "DELIVERY_CREATED",
    DELIVERY_CANCELLED = "DELIVERY_CANCELLED",
    DELIVERY_COMPLETED = "DELIVERY_COMPLETED",
    DELIVERY_OUT = "DELIVERY_OUT",
}

// Notification families
export enum NotificationFamily {
    APPOINTMENT = "APPOINTMENT",
    PRESCRIPTION = "PRESCRIPTION",
    DELIVERY = "DELIVERY",
}

// Push subscription request to backend
export interface PushSubscriptionRequest {
    endpoint: string;
    p256dh: string; // Public key for encryption
    auth: string; // Authentication secret
    userAgent: string;
    deviceInfo?: string;
}

// Push subscription response from backend
export interface PushSubscriptionResponse {
    success: boolean;
    message: string;
    subscription?: PushSubscriptionRequest;
    error?: string;
}

// Local subscription storage
export interface StoredPushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    subscribedAt: number;
    lastUsed?: number;
}

// Device information structure
export interface DeviceInfo {
    platform: string;
    vendor: string;
    isMobile: boolean;
    isDesktop: boolean;
    browser: string;
    os: string;
    userAgent: string;
}

// Push notification payload structure
export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    tag?: string;
    data?: {
        notificationType: NotificationType;
        actionUrl?: string;
        appointmentId?: string;
        prescriptionId?: string;
        userId?: string;
        timestamp: number;
        [key: string]: any;
    };
    actions?: NotificationAction[];
    requireInteraction?: boolean;
    silent?: boolean;
    vibrate?: number[];
    timestamp?: number;
}

// Notification action buttons
export interface NotificationAction {
    action: string;
    title: string;
    icon?: string;
}

// Push notification event data
export interface PushEventData {
    type: NotificationType;
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    data?: Record<string, any>;
    actions?: NotificationAction[];
    clickAction?: string;
    tag?: string;
    requireInteraction?: boolean;
    silent?: boolean;
    vibrate?: number[];
}

// Service worker message types
export interface ServiceWorkerMessage {
    type: "PUSH_RECEIVED" | "NOTIFICATION_CLICKED" | "NOTIFICATION_CLOSED" | "SUBSCRIPTION_UPDATE";
    payload?: any;
    timestamp: number;
}

// Push notification settings
export interface PushNotificationSettings {
    enabled: boolean;
    appointments: {
        enabled: boolean;
        reminders: boolean;
        confirmations: boolean;
        cancellations: boolean;
    };
    prescriptions: {
        enabled: boolean;
        created: boolean;
        expiring: boolean;
        delivery: boolean;
    };
    deliveries: {
        enabled: boolean;
        created: boolean;
        outForDelivery: boolean;
        completed: boolean;
        cancelled: boolean;
    };
    quiet_hours: {
        enabled: boolean;
        start: string; // HH:mm format
        end: string; // HH:mm format
    };
    sound: boolean;
    vibration: boolean;
}

// Push manager subscription options
export interface PushSubscriptionOptions {
    userVisibleOnly: boolean;
    applicationServerKey: Uint8Array;
}

// Notification statistics
export interface NotificationStats {
    totalSent: number;
    totalDelivered: number;
    totalClicked: number;
    totalDismissed: number;
    deliveryRate: number;
    clickRate: number;
    lastNotification?: {
        type: NotificationType;
        timestamp: number;
        delivered: boolean;
        clicked: boolean;
    };
}

// Push subscription status
export interface SubscriptionStatus {
    isSupported: boolean;
    hasPermission: boolean;
    isSubscribed: boolean;
    subscription?: PushSubscription;
    error?: string;
    lastCheck: number;
}

// Error types for push notifications
export enum PushNotificationError {
    NOT_SUPPORTED = "NOT_SUPPORTED",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    SUBSCRIPTION_FAILED = "SUBSCRIPTION_FAILED",
    NETWORK_ERROR = "NETWORK_ERROR",
    INVALID_KEYS = "INVALID_KEYS",
    SERVICE_WORKER_ERROR = "SERVICE_WORKER_ERROR",
    BACKEND_ERROR = "BACKEND_ERROR",
}

// Error details
export interface PushNotificationErrorDetails {
    type: PushNotificationError;
    message: string;
    timestamp: number;
    details?: any;
    userAgent?: string;
    endpoint?: string;
}

// Hook return types
export interface UsePushNotificationReturn {
    // Status
    isSupported: boolean;
    hasPermission: boolean;
    isSubscribed: boolean;
    isLoading: boolean;

    // Actions
    requestPermission: () => Promise<boolean>;
    subscribe: (deviceInfo?: string) => Promise<boolean>;
    unsubscribe: () => Promise<boolean>;
    testNotification: () => Promise<boolean>;

    // Data
    subscription: PushSubscription | null;
    permission: PushNotificationPermission;
    error: string | null;
    settings: PushNotificationSettings;
    stats: NotificationStats | null;

    // Settings management
    updateSettings: (settings: Partial<PushNotificationSettings>) => Promise<void>;

    // Utility
    getSubscriptionInfo: () => StoredPushSubscription | null;
    clearError: () => void;
}

// Component props
export interface PushNotificationPromptProps {
    onSubscribed?: (subscription: PushSubscription) => void;
    onError?: (error: string) => void;
    onDismiss?: () => void;
    autoShow?: boolean;
    delay?: number;
    position?: "top" | "bottom" | "center";
    theme?: "light" | "dark" | "auto";
}

export interface NotificationSettingsProps {
    settings: PushNotificationSettings;
    onSettingsChange: (settings: PushNotificationSettings) => void;
    isLoading?: boolean;
    disabled?: boolean;
}

// Context types
export interface PushNotificationContextType {
    isSupported: boolean;
    hasPermission: boolean;
    isSubscribed: boolean;
    subscription: PushSubscription | null;
    permission: PushNotificationPermission;
    settings: PushNotificationSettings;
    stats: NotificationStats | null;
    subscribe: (deviceInfo?: string) => Promise<boolean>;
    unsubscribe: () => Promise<boolean>;
    updateSettings: (settings: Partial<PushNotificationSettings>) => Promise<void>;
    testNotification: () => Promise<boolean>;
}

// Default settings
export const DEFAULT_PUSH_SETTINGS: PushNotificationSettings = {
    enabled: true,
    appointments: {
        enabled: true,
        reminders: true,
        confirmations: true,
        cancellations: true,
    },
    prescriptions: {
        enabled: true,
        created: true,
        expiring: true,
        delivery: true,
    },
    deliveries: {
        enabled: true,
        created: true,
        outForDelivery: true,
        completed: true,
        cancelled: true,
    },
    quiet_hours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
    },
    sound: true,
    vibration: true,
};

// Notification templates
export const NOTIFICATION_TEMPLATES: Record<NotificationType, Partial<PushNotificationPayload>> = {
    [NotificationType.APPOINTMENT_REMINDER_PATIENT]: {
        title: "Appointment Reminder",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "appointment-reminder",
        requireInteraction: true,
        actions: [
            { action: "view", title: "View Details" },
            { action: "dismiss", title: "Dismiss" },
        ],
    },
    [NotificationType.APPOINTMENT_CONFIRMATION_PATIENT]: {
        title: "Appointment Confirmed",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "appointment-confirmation",
        actions: [
            { action: "view", title: "View Details" },
            { action: "calendar", title: "Add to Calendar" },
        ],
    },
    [NotificationType.PRESCRIPTION_CREATED]: {
        title: "New Prescription",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "prescription-created",
        requireInteraction: true,
        actions: [
            { action: "view", title: "View Prescription" },
            { action: "order", title: "Order Now" },
        ],
    },
    [NotificationType.PRESCRIPTION_EXPIRING]: {
        title: "Prescription Expiring Soon",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "prescription-expiring",
        requireInteraction: true,
        actions: [
            { action: "renew", title: "Renew Now" },
            { action: "remind", title: "Remind Later" },
        ],
    },
    [NotificationType.PRESCRIPTION_OUT_FOR_DELIVERY]: {
        title: "Prescription Out for Delivery",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "prescription-delivery",
        actions: [
            { action: "track", title: "Track Delivery" },
            { action: "contact", title: "Contact Support" },
        ],
    },
    // Delivery notifications
    [NotificationType.DELIVERY_CREATED]: {
        title: "Delivery Confirmed",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "delivery-created",
        actions: [
            { action: "view", title: "View Details" },
            { action: "track", title: "Track Delivery" },
        ],
    },
    [NotificationType.DELIVERY_OUT]: {
        title: "Medication Out for Delivery",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "delivery-out",
        requireInteraction: true,
        actions: [
            { action: "track", title: "Track Package" },
            { action: "contact", title: "Contact Support" },
        ],
    },
    [NotificationType.DELIVERY_COMPLETED]: {
        title: "Delivery Completed",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "delivery-completed",
        actions: [
            { action: "view", title: "View Details" },
            { action: "feedback", title: "Give Feedback" },
        ],
    },
    [NotificationType.DELIVERY_CANCELLED]: {
        title: "Delivery Cancelled",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "delivery-cancelled",
        requireInteraction: true,
        actions: [
            { action: "view", title: "View Details" },
            { action: "reschedule", title: "Reschedule" },
        ],
    },
    // Add other notification types...
    [NotificationType.APPOINTMENT_REMINDER_PROVIDER]: {
        title: "Patient Appointment Reminder",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "appointment-reminder-provider",
    },
    [NotificationType.APPOINTMENT_CONFIRMATION_PROVIDER]: {
        title: "Appointment Confirmed",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "appointment-confirmation-provider",
    },
    [NotificationType.APPOINTMENT_CANCEL_PATIENT]: {
        title: "Appointment Cancelled",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "appointment-cancel-patient",
    },
    [NotificationType.APPOINTMENT_CANCEL_PROVIDER]: {
        title: "Appointment Cancelled",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "appointment-cancel-provider",
    },
    [NotificationType.APPOINTMENT_BOOKED_PATIENT]: {
        title: "Appointment Booked",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "appointment-booked-patient",
    },
    [NotificationType.APPOINTMENT_BOOKED_PROVIDER]: {
        title: "New Appointment Booked",
        icon: "/assets/logos/mytelmed-logo.png",
        badge: "/assets/logos/mytelmed-logo.png",
        tag: "appointment-booked-provider",
    },
};
