"use client";

import React, { useEffect } from "react";
import { notification } from "antd";
import { Bell } from "lucide-react";

interface NotificationMessage {
    title: string;
    body: string;
    icon: string;
    badge: string;
    data: {
        url?: string;
        appointmentId?: string;
        [key: string]: any;
    };
    timestamp: number;
    requireInteraction: boolean;
    silent: boolean;
    tag: string; // This contains the notification type from backend
    actions: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
}

export const NotificationDisplay: React.FC = () => {
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        // Listen for push notifications when app is in foreground
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.addEventListener("message", (event) => {
                if (event.data.type === "PUSH_NOTIFICATION_RECEIVED") {
                    const notificationData: NotificationMessage = event.data.payload;
                    showInAppNotification(notificationData);
                }
            });
        }

        // Listen for focus events to check for missed notifications
        const handleFocus = () => {
            checkForMissedNotifications();
        };

        window.addEventListener("focus", handleFocus);

        return () => {
            window.removeEventListener("focus", handleFocus);
        };
    }, [api]);

    const showInAppNotification = (notification: NotificationMessage) => {
        api.open({
            message: notification.title,
            description: notification.body,
            type: "info",
            icon: <Bell style={{ color: "#1890ff" }} />,
            duration: 6, // Show for 6 seconds
            placement: "topRight",
            onClick: () => {
                if (notification.data?.url) {
                    window.location.href = notification.data.url;
                }
            },
            style: {
                cursor: notification.data?.url ? "pointer" : "default",
            },
        });
    };

    const checkForMissedNotifications = () => {
        // This could be extended to check for notifications that arrived while the app was not focused
        // For now, we'll just log that we're checking
        console.log("Checking for missed notifications...");
    };

    return <>{contextHolder}</>;
};

export default NotificationDisplay;
