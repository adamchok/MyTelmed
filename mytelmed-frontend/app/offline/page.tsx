import React from "react";
import { Button, Card, Typography, Space } from "antd";
import { WifiOff, RefreshCw, Home, Phone } from "lucide-react";
import Link from "next/link";

const { Title, Paragraph } = Typography;

export default function OfflinePage() {
  const handleRefresh = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center shadow-xl">
        <Space direction="vertical" size="large" className="w-full">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <WifiOff size={40} className="text-gray-400" />
            </div>
          </div>

          <div>
            <Title level={2} className="text-gray-700 mb-2">
              You&apos;re Offline
            </Title>
            <Paragraph className="text-gray-500 mb-0">
              It looks like you&apos;ve lost your internet connection.
              Don&apos;t worry, you can still access some features of MyTelmed.
            </Paragraph>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <Title level={4} className="text-blue-700 mb-2">
              Available Offline:
            </Title>
            <ul className="text-left text-blue-600 space-y-1">
              <li>• View cached appointment history</li>
              <li>• Access saved medical records</li>
              <li>• Review previous prescriptions</li>
              <li>• Browse cached health articles</li>
            </ul>
          </div>

          <Space direction="vertical" className="w-full">
            <Button
              type="primary"
              icon={<RefreshCw size={16} />}
              onClick={handleRefresh}
              size="large"
              className="w-full"
            >
              Try Again
            </Button>

            <Link href="/" className="w-full">
              <Button icon={<Home size={16} />} size="large" className="w-full">
                Go to Home
              </Button>
            </Link>
          </Space>

          <div className="pt-4 border-t border-gray-200">
            <Paragraph className="text-xs text-gray-400 mb-2">
              For emergencies, please call:
            </Paragraph>
            <Button
              type="link"
              icon={<Phone size={14} />}
              className="text-red-500 p-0 h-auto"
              href="tel:999"
            >
              999 (Emergency Services)
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
}
