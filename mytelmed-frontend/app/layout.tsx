import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import StoreProvider from "@/lib/StoreProvider";
import React from "react";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";
import "./globals.css";
import MainLayout from "./layout/MainLayout";
import PushNotificationProvider from "./components/Notification/PushNotificationProvider";
import { NotificationDisplay } from "./components/Notification/NotificationDisplay";

const inter = Inter({ subsets: ["latin"] });
const APP_NAME = "MyTelmed - Telemedicine Application";
const APP_DEFAULT_TITLE = "MyTelmed";
const APP_TITLE_TEMPLATE = "%s - MyTelmed";
const APP_DESCRIPTION =
    "Comprehensive telemedicine application for Malaysians. Connect with doctors, manage appointments, and access healthcare services from anywhere.";

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    applicationName: APP_NAME,
    title: {
        default: APP_DEFAULT_TITLE,
        template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    manifest: "/manifest.json",
    keywords: [
        "telemedicine",
        "healthcare",
        "doctor",
        "appointment",
        "medical consultation",
        "Malaysia",
        "health",
        "medical app",
        "telehealth",
    ],
    authors: [{ name: "MyTelmed Team" }],
    creator: "MyTelmed Team",
    publisher: "MyTelmed",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: APP_DEFAULT_TITLE,
        startupImage: [
            {
                url: "/assets/logos/mytelmed-logo.png",
                media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
            },
        ],
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        type: "website",
        siteName: APP_NAME,
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
        url: "https://mytelmed.com",
        images: [
            {
                url: "/assets/logos/mytelmed-logo.png",
                width: 512,
                height: 512,
                alt: "MyTelmed Logo",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
        images: ["/assets/logos/mytelmed-logo.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: [
            {
                url: "/assets/logos/mytelmed-logo.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                url: "/assets/logos/mytelmed-logo.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
        apple: [
            {
                url: "/assets/logos/mytelmed-logo.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    },
    other: {
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "default",
        "apple-mobile-web-app-title": APP_DEFAULT_TITLE,
        "application-name": APP_NAME,
        "msapplication-TileColor": "#1890ff",
        "msapplication-config": "/browserconfig.xml",
        "theme-color": "#1890ff",
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#1890ff" },
        { media: "(prefers-color-scheme: dark)", color: "#1890ff" },
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content={APP_DEFAULT_TITLE} />
                <meta name="msapplication-tap-highlight" content="no" />
                <link rel="icon" href="/assets/logos/mytelmed-logo.png" />
                <link rel="apple-touch-icon" href="/assets/logos/mytelmed-logo.png" />
                <link rel="mask-icon" href="/assets/logos/mytelmed-logo.png" color="#1890ff" />
            </head>
            <body className={inter.className}>
                <AntdRegistry>
                    <StoreProvider>
                        <React.Suspense fallback="Loading...">
                            <MainLayout>{children}</MainLayout>
                            <PushNotificationProvider />
                            <NotificationDisplay />
                        </React.Suspense>
                    </StoreProvider>
                </AntdRegistry>
            </body>
        </html>
    );
}
