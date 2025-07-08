"use client";

import React from "react";
import { Alert, Space, Typography } from "antd";
import { WifiOff, RefreshCw } from "lucide-react";
import { usePWA } from "../hooks/usePWA";

const { Text } = Typography;

export default function NetworkStatus() {
  const { isOnline } = usePWA();

  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Alert
        message={
          <Space>
            <WifiOff size={16} />
            <Text strong>You&apos;re offline</Text>
          </Space>
        }
        description={
          <Space>
            <Text>
              Some features may be limited. Your data will sync when connection
              is restored.
            </Text>
            <Text
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={handleRetry}
            >
              <RefreshCw size={14} className="inline mr-1" />
              Retry
            </Text>
          </Space>
        }
        type="warning"
        showIcon={false}
        className="rounded-none border-0 border-b"
      />
    </div>
  );
}
