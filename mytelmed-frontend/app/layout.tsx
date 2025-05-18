import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import StoreProvider from "@/lib/StoreProvider";
import MainLayout from "./layout/MainLayout";
import React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const APP_NAME = "MyTelmed Application";
const APP_DEFAULT_TITLE = "MyTelmed";
const APP_TITLE_TEMPLATE = "%s";
const APP_DESCRIPTION = "Telemedicine application for Malaysians.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
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
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdRegistry>
          <StoreProvider>
            <React.Suspense fallback="Loading...">
              <MainLayout>
                {children}
              </MainLayout>
            </React.Suspense>
          </StoreProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
