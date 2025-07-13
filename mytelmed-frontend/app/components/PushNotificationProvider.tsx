"use client";

import { useEffect, useRef } from "react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { registerServiceWorker } from "@/lib/serviceWorkerRegistration";

export default function ServiceWorkerRegistration() {
    const { subscribe } = usePushNotifications();
    const hasAttemptedSubscription = useRef(false);

    useEffect(() => {
        // Register service worker in production by default, or in development unless explicitly disabled
        const shouldRegister =
            process.env.NODE_ENV === "production" ||
            (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_SW_DISABLED !== "true");

        if (shouldRegister && typeof window !== "undefined") {
            registerServiceWorker()
                .then(async (result) => {
                    if (result.registration) {
                        // Automatically request push notification permission and subscribe (only once)
                        // and only if the user is logged in
                        const isUserLoggedIn = localStorage.getItem("isLogin") === "true";

                        if (!hasAttemptedSubscription.current && isUserLoggedIn) {
                            hasAttemptedSubscription.current = true;

                            try {
                                await subscribe();
                                console.log("Push notifications subscribed automatically");
                            } catch (error) {
                                // Silently handle permission denial or subscription errors
                                console.log("Push notification subscription skipped:", error);
                            }
                        }
                    } else if (result.error) {
                        console.error("Service Worker registration failed:", result.error);
                    }
                })
                .catch((error) => {
                    console.error("Service Worker registration error:", error);
                });
        }
    }, [subscribe]);

    // This component doesn't render anything
    return null;
}
