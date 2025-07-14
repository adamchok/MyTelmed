"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Typography,
  Alert,
  Spin,
  Card,
  Row,
  Col,
  Space,
  Statistic,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  LoadingOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { VideoCallProvider } from "../components/VideoCallProvider";
import VideoCallManager from "../components/VideoCallManager";
import AppointmentApi from "../../api/appointment";
import { AppointmentDto } from "../../api/appointment/props";

const { Title, Text } = Typography;

export default function VideoCallPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;

  const [appointment, setAppointment] = useState<AppointmentDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AppointmentApi.getAppointmentById(appointmentId);
      const appointmentResponse = response.data;
      const appointmentData = appointmentResponse.data;

      if (appointmentResponse.isSuccess && appointmentData) {
        setAppointment(appointmentData);
      } else {
        setError(
          "Appointment not found or you don't have permission to access it"
        );
      }
    } catch (error: any) {
      setError("Failed to load appointment information");
      console.error("Failed to load appointment:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallEnd = () => {
    const userType = localStorage.getItem("userType");

    if (userType === "admin") {
      router.push("/admin/dashboard");
      return;
    }

    router.push(`/${userType}/appointment`);
  };

  useEffect(() => {
    if (appointmentId) {
      loadAppointment();
    }
  }, [appointmentId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border border-gray-200">
          <div className="text-center py-12">
            <Spin
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 48, color: "#1890ff" }}
                  spin
                />
              }
              size="large"
            />
          </div>
        </Card>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border border-gray-200">
          <div className="text-center py-12">
            <ExclamationCircleOutlined
              style={{ fontSize: 64, color: "#ff4d4f" }}
              className="mb-6"
            />
            <Title level={3} className="text-gray-800 mb-4">
              Unable to Load Appointment
            </Title>
            <Alert
              type="error"
              message="Error Loading Appointment"
              description={error}
              showIcon
              className="mb-6 text-left"
            />
            <Space>
              <Button
                type="primary"
                onClick={loadAppointment}
                icon={<ArrowLeftOutlined />}
              >
                Try Again
              </Button>
              <Button onClick={() => router.back()}>Go Back</Button>
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Info Bar */}
        <Card className="mb-6 shadow-sm border border-gray-200 bg-white">
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <div className="flex items-center space-x-3">
                <Avatar
                  size={48}
                  src={appointment.doctor?.profileImageUrl}
                  icon={<UserOutlined />}
                  className="border-2 border-gray-200"
                />
                <div>
                  <Text className="text-gray-800 font-medium block">
                    Dr. {appointment.doctor?.name}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Healthcare Provider
                  </Text>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={8} md={6}>
              <Statistic
                title={<span className="text-gray-500">Date</span>}
                value={new Date(
                  appointment.appointmentDateTime
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                valueStyle={{ color: "#1f2937", fontSize: "16px" }} // text-gray-800
                prefix={<CalendarOutlined />}
              />
            </Col>

            <Col xs={24} sm={8} md={6}>
              <Statistic
                title={<span className="text-gray-500">Time</span>}
                value={new Date(
                  appointment.appointmentDateTime
                ).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
                valueStyle={{ color: "#1f2937", fontSize: "16px" }} // text-gray-800
                prefix={<ClockCircleOutlined />}
              />
            </Col>

            <Col xs={24} sm={24} md={6}>
              <div className="text-right">
                <Text className="text-gray-500 block text-sm">
                  Appointment ID
                </Text>
                <Text className="text-gray-800 font-mono">
                  #{appointmentId.slice(-8).toUpperCase()}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Video Call Component */}
        <VideoCallProvider appointmentId={appointmentId}>
          <VideoCallManager
            appointment={appointment}
            onCallEnd={handleCallEnd}
          />
        </VideoCallProvider>
      </div>
    </div>
  );
}
