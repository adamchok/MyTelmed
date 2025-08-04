"use client";

export interface ServiceWorkerRegistrationResult {
    registration: ServiceWorkerRegistration | null;
    error: Error | null;
    isSupported: boolean;
}

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistrationResult> => {
    // Check if service workers are supported
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return {
            registration: null,
            error: new Error("Service workers are not supported"),
            isSupported: false,
        };
    }

    try {
        console.log("Registering service worker...");

        // Register the service worker
        const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none", // Always check for updates
        });

        console.log("Service worker registered successfully:", registration.scope);

        // Handle service worker updates
        registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
                console.log("New service worker installing...");

                newWorker.addEventListener("statechange", () => {
                    console.log("Service worker state changed:", newWorker.state);

                    if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                        // New service worker is available
                        console.log("New service worker available. Please refresh the page.");

                        // Optionally, show a notification to the user
                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification("App Update Available", {
                                body: "A new version of MyTelmed is available. Please refresh the page.",
                                icon: "/assets/logos/mytelmed-logo.png",
                                tag: "app-update",
                            });
                        }
                    }
                });
            }
        });

        // Check if there's a waiting service worker
        if (registration.waiting) {
            console.log("Service worker is waiting to activate");
        }

        // Check if service worker is controlling the page
        if (navigator.serviceWorker.controller) {
            console.log("Service worker is controlling the page");
        }

        return {
            registration,
            error: null,
            isSupported: true,
        };
    } catch (error) {
        console.error("Service worker registration failed:", error);
        return {
            registration: null,
            error: error as Error,
            isSupported: true,
        };
    }
};

export const unregisterServiceWorker = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const unregistered = await registration.unregister();
        console.log("Service worker unregistered:", unregistered);
        return unregistered;
    } catch (error) {
        console.error("Service worker unregistration failed:", error);
        return false;
    }
};

export const updateServiceWorker = async (): Promise<void> => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        console.log("Service worker update check completed");
    } catch (error) {
        console.error("Service worker update failed:", error);
    }
};

export const skipWaitingServiceWorker = async (): Promise<void> => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
    } catch (error) {
        console.error("Failed to skip waiting service worker:", error);
    }
};
