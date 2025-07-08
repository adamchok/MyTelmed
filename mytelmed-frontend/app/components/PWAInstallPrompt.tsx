"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Typography, Space, Modal, Badge } from "antd";
import {
  Download,
  X,
  Smartphone,
  Share,
  Plus,
  CheckCircle,
} from "lucide-react";

const { Title, Paragraph, Text } = Typography;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const iOS =
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
      setTimeout(() => setIsVisible(true), 100);
    };

    // Listen for the app being installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Show iOS prompt after a delay
    if (iOS && !isInstalled && typeof window !== "undefined") {
      setTimeout(() => {
        setShowInstallPrompt(true);
        setIsVisible(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt || typeof window === "undefined") return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      setIsVisible(false);
    }
  };

  const handleIOSInstall = () => {
    setShowIOSInstructions(true);
  };

  const dismissPrompt = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowInstallPrompt(false);
    }, 300);
    // Remember user's choice for 30 days
    if (typeof window !== "undefined") {
      localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    }
  };

  // Don't show if already installed or user dismissed recently
  if (isInstalled) return null;

  // Check for dismissed status only on client side
  if (typeof window !== "undefined") {
    const dismissedTime = localStorage.getItem("pwa-install-dismissed");
    if (
      dismissedTime &&
      Date.now() - parseInt(dismissedTime) < 30 * 24 * 60 * 60 * 1000
    ) {
      return null;
    }
  }

  if (!showInstallPrompt && !isIOS) return null;

  return (
    <>
      {/* Install prompt banner */}
      {(showInstallPrompt || isIOS) && (
        <div
          className={`fixed bottom-6 left-4 right-4 z-50 md:left-auto md:right-6 md:w-96 transition-all duration-300 ease-out transform ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }`}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-30 animate-pulse"></div>

            {/* Main card */}
            <Card className="relative backdrop-blur-sm bg-white/95 shadow-2xl border-0 rounded-2xl overflow-hidden">
              {/* Header gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

              <div className="p-6">
                <div className="flex items-start justify-between">
                  <Space direction="vertical" size="small" className="flex-1">
                    {/* Icon and badge */}
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Smartphone size={24} className="text-white" />
                        </div>
                        <Badge
                          count="New"
                          className="absolute -top-2 -right-2"
                          style={{
                            backgroundColor: "#ff4757",
                            color: "white",
                            fontSize: "10px",
                            padding: "0 4px",
                            minWidth: "20px",
                            height: "16px",
                            lineHeight: "16px",
                          }}
                        />
                      </div>
                      <div>
                        <Title level={5} className="mb-1 text-gray-800">
                          Install MyTelmed App
                        </Title>
                        <Text className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                          ⚡ Lightning Fast • 📱 Native Feel
                        </Text>
                      </div>
                    </div>

                    {/* Description */}
                    <Paragraph className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Get <strong>instant access</strong> to your healthcare
                      with our lightning-fast app. Works offline and updates
                      automatically!
                    </Paragraph>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <CheckCircle size={12} className="text-green-500" />
                        <span>Works offline</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <CheckCircle size={12} className="text-green-500" />
                        <span>Push notifications</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <CheckCircle size={12} className="text-green-500" />
                        <span>Native experience</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <CheckCircle size={12} className="text-green-500" />
                        <span>Auto updates</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <Space size="small" className="w-full">
                      {deferredPrompt ? (
                        <Button
                          type="primary"
                          size="middle"
                          icon={<Download size={16} />}
                          onClick={handleInstallClick}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 flex-1"
                          style={{ borderRadius: "10px" }}
                        >
                          Install Now
                        </Button>
                      ) : isIOS ? (
                        <Button
                          type="primary"
                          size="middle"
                          icon={<Share size={16} />}
                          onClick={handleIOSInstall}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 flex-1"
                          style={{ borderRadius: "10px" }}
                        >
                          Install Guide
                        </Button>
                      ) : null}
                      <Button
                        size="middle"
                        onClick={dismissPrompt}
                        className="border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all duration-200"
                        style={{ borderRadius: "10px" }}
                      >
                        Maybe Later
                      </Button>
                    </Space>
                  </Space>

                  {/* Close button */}
                  <Button
                    type="text"
                    size="small"
                    icon={<X size={16} />}
                    onClick={dismissPrompt}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 ml-3 transition-all duration-200"
                    style={{ borderRadius: "8px" }}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Enhanced iOS Install Instructions Modal */}
      <Modal
        title={
          <div className="flex items-center justify-center space-x-3 pb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Smartphone size={20} className="text-white" />
            </div>
            <div>
              <Title level={4} className="mb-0 text-gray-800">
                Install MyTelmed App
              </Title>
              <Text className="text-sm text-gray-500">
                Get the full native experience
              </Text>
            </div>
          </div>
        }
        open={showIOSInstructions}
        onCancel={() => setShowIOSInstructions(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setShowIOSInstructions(false)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
            style={{ borderRadius: "8px" }}
          >
            Got it!
          </Button>,
        ]}
        className="install-modal"
        width={400}
        centered
      >
        <div className="py-4">
          <Paragraph className="text-center text-gray-600 mb-6">
            Follow these simple steps to install MyTelmed on your device:
          </Paragraph>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Share size={16} className="text-blue-500" />
                  <Text strong className="text-gray-800">
                    Tap the Share button
                  </Text>
                </div>
                <Paragraph className="text-sm text-gray-600 mb-0 ml-6">
                  Look for the <strong>share icon</strong> in Safari&apos;s
                  bottom toolbar
                </Paragraph>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Plus size={16} className="text-purple-500" />
                  <Text strong className="text-gray-800">
                    Select &quot;Add to Home Screen&quot;
                  </Text>
                </div>
                <Paragraph className="text-sm text-gray-600 mb-0 ml-6">
                  Scroll down in the share menu to find this option
                </Paragraph>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <Text strong className="text-gray-800">
                    Tap &quot;Add&quot;
                  </Text>
                </div>
                <Paragraph className="text-sm text-gray-600 mb-0 ml-6">
                  Confirm to add MyTelmed to your home screen
                </Paragraph>
              </div>
            </div>
          </div>

          {/* Success message */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="flex items-start space-x-3">
              <CheckCircle size={20} className="text-blue-500 mt-0.5" />
              <div>
                <Text strong className="text-blue-800 block">
                  🎉 You&apos;re all set!
                </Text>
                <Text className="text-sm text-blue-700">
                  Once installed, MyTelmed will work just like any other app on
                  your device, with offline access and push notifications!
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
