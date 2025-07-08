"use client";

import React from "react";
import { notification, Button, Space } from "antd";
import { Download, X } from "lucide-react";
import { usePWA } from "../hooks/usePWA";

export default function UpdateNotification() {
  const { hasUpdate, updateApp } = usePWA();
  const [api, contextHolder] = notification.useNotification();

  React.useEffect(() => {
    if (hasUpdate) {
      const key = "app-update";

      api.info({
        key,
        message: "New Update Available",
        description:
          "A new version of MyTelmed is ready. Update now for the latest features and improvements.",
        placement: "bottomRight",
        duration: 0, // Don't auto-close
        icon: <Download size={20} className="text-blue-500" />,
        btn: (
          <Space>
            <Button
              type="text"
              size="small"
              onClick={() => api.destroy(key)}
              icon={<X size={14} />}
            >
              Later
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                updateApp();
                api.destroy(key);
              }}
              icon={<Download size={14} />}
            >
              Update Now
            </Button>
          </Space>
        ),
        className: "update-notification",
      });
    }
  }, [hasUpdate, api, updateApp]);

  return contextHolder;
}
