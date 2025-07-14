"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Typography,
  Alert,
  Spin,
  Progress,
  Space,
  Statistic,
  Badge,
  Row,
  Col,
  Avatar,
  Tag,
  Divider,
  Steps,
} from "antd";
import {
  VideoCameraOutlined,
  UserOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  WifiOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import {
  useStreamVideoClient,
  StreamCall,
  Call,
  StreamTheme,
} from "@stream-io/video-react-sdk";
import MeetingRoom from "./MeetingRoom";
import MeetingSetup from "./MeetingSetup";
import VideoCallApi from "../../api/video-call";
import { VideoCallDto } from "../../api/video-call/props";
import { AppointmentDto } from "../../api/appointment/props";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface VideoCallManagerProps {
  appointment: AppointmentDto;
  onCallEnd: () => void;
}

export default function VideoCallManager({
  appointment,
  onCallEnd,
}: VideoCallManagerProps) {
  const client = useStreamVideoClient();
  const [meetingInfo, setMeetingInfo] = useState<VideoCallDto | null>(null);
  const [call, setCall] = useState<Call | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "failed"
  >("connecting");

  const initializeCall = useCallback(async () => {
    if (!client) {
      setError("Video client not available");
      setConnectionStatus("failed");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setConnectionStatus("connecting");
      setConnectionProgress(0);

      // Simulate connection progress
      const progressInterval = setInterval(() => {
        setConnectionProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await VideoCallApi.createStreamCallAndGetVideoCall(
        appointment.id
      );
      const meetingData = response.data.data;

      if (!meetingData) {
        throw new Error("Failed to get or create video call");
      }

      setMeetingInfo(meetingData);

      const streamCall = client.call(
        meetingData.streamCallType,
        meetingData.streamCallId
      );

      setCall(streamCall);
      setConnectionProgress(100);
      setConnectionStatus("connected");

      clearInterval(progressInterval);
    } catch (error: any) {
      console.error("Failed to join video call:", error);
      setError("Unable to join video call");
      setConnectionStatus("failed");
      setConnectionProgress(0);
    } finally {
      setIsLoading(false);
    }
  }, [client, appointment.id]);

  const handleCallEnd = async () => {
    try {
      await VideoCallApi.endVideoCall(appointment.id);
      onCallEnd();
    } catch (error) {
      console.error("Failed to end call:", error);
      onCallEnd();
    }
  };

  const canCreateCall = () => {
    return appointment?.status === "READY_FOR_CALL";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "READY_FOR_CALL":
        return "green";
      case "IN_PROGRESS":
        return "blue";
      case "CONFIRMED":
        return "orange";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "READY_FOR_CALL":
        return "Ready for Call";
      case "IN_PROGRESS":
        return "In Progress";
      case "CONFIRMED":
        return "Confirmed";
      default:
        return status;
    }
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (
      client &&
      appointment &&
      (appointment.status === "READY_FOR_CALL" ||
        appointment.status === "IN_PROGRESS") &&
      !call &&
      !meetingInfo &&
      !isLoading
    ) {
      initializeCall();
    }
  }, [client, appointment, isLoading, initializeCall]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border border-gray-200">
          <div className="text-center py-8">
            <div className="mb-6">
              <Spin
                indicator={
                  <LoadingOutlined
                    style={{ fontSize: 48, color: "#1890ff" }}
                    spin
                  />
                }
              />
            </div>

            <Title level={3} className="mb-4">
              Connecting to Video Call
            </Title>

            <Progress
              percent={connectionProgress}
              strokeColor="#1890ff"
              className="mb-4"
            />

            <Text className="text-gray-600">
              Setting up your video call environment...
            </Text>

            <div className="mt-6">
              <Steps
                direction="vertical"
                size="small"
                current={Math.floor(connectionProgress / 25)}
              >
                <Step title="Connecting to server" icon={<WifiOutlined />} />
                <Step
                  title="Initializing video"
                  icon={<VideoCameraOutlined />}
                />
                <Step title="Setting up audio" icon={<SoundOutlined />} />
                <Step title="Ready to join" icon={<CheckCircleOutlined />} />
              </Steps>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border border-gray-200">
          <div className="text-center py-8">
            <div className="mb-6">
              <ExclamationCircleOutlined
                style={{ fontSize: 64, color: "#ff4d4f" }}
              />
            </div>

            <Title level={3} className="text-red-600 mb-4">
              Connection Failed
            </Title>

            <Alert
              type="error"
              message="Video Call Error"
              description={error}
              showIcon
              className="mb-6 text-left"
            />

            <Space direction="vertical" size="large" className="w-full">
              <Paragraph className="text-gray-600">
                We encountered an issue while trying to connect to your video
                call. This could be due to network connectivity or server
                issues.
              </Paragraph>

              <Space>
                <Button
                  type="primary"
                  onClick={() => {
                    setError(null);
                    initializeCall();
                  }}
                  icon={<VideoCameraOutlined />}
                >
                  Try Again
                </Button>
                <Button onClick={onCallEnd}>Back to Appointments</Button>
              </Space>
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  if (meetingInfo && call) {
    return (
      <StreamCall call={call}>
        <StreamTheme className="dark">
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom onCallEnd={handleCallEnd} />
          )}
        </StreamTheme>
      </StreamCall>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full">
        <Row gutter={[24, 24]} align="middle">
          {/* Left Side - Appointment Info */}
          <Col xs={24} lg={12}>
            <Card
              className="shadow-xl border border-gray-200 h-full"
              cover={
                <div className="bg-white border-b border-gray-200 p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar
                      size={64}
                      src={appointment.provider?.profileImageUrl}
                      icon={<UserOutlined />}
                      className="border border-gray-300"
                    />
                    <div>
                      <Title level={3} className="m-0">
                        Dr. {appointment.provider?.name}
                      </Title>
                      <Text className="text-gray-500">Healthcare Provider</Text>
                    </div>
                  </div>
                </div>
              }
            >
              <Space direction="vertical" size="large" className="w-full">
                <div>
                  <Title level={4} className="mb-3">
                    <CalendarOutlined className="mr-2" />
                    Appointment Details
                  </Title>

                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="Date"
                        value={formatDate(appointment.appointmentDateTime)}
                        valueStyle={{ fontSize: "14px" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Time"
                        value={formatTime(appointment.appointmentDateTime)}
                        valueStyle={{ fontSize: "14px", color: "#1890ff" }}
                      />
                    </Col>
                  </Row>
                </div>

                <Divider />

                <div>
                  <Title level={5} className="mb-3">
                    Status
                  </Title>
                  <Tag
                    color={getStatusColor(appointment.status)}
                    className="px-3 py-1 text-sm"
                  >
                    <Badge
                      status={
                        connectionStatus === "connected"
                          ? "success"
                          : "processing"
                      }
                      className="mr-2"
                    />
                    {getStatusText(appointment.status)}
                  </Tag>
                </div>

                {appointment.reasonForVisit && (
                  <>
                    <Divider />
                    <div>
                      <Title level={5} className="mb-2">
                        Reason for Visit
                      </Title>
                      <Text className="text-gray-600">
                        {appointment.reasonForVisit}
                      </Text>
                    </div>
                  </>
                )}

                <Divider />

                <div>
                  <Title level={5} className="mb-3">
                    Contact Information
                  </Title>
                  <Space direction="vertical" size="small">
                    <Text>
                      <MailOutlined className="mr-2 text-blue-500" />
                      {appointment.provider?.email}
                    </Text>
                    <Text>
                      <PhoneOutlined className="mr-2 text-green-500" />
                      {appointment.provider?.phone || "Not available"}
                    </Text>
                  </Space>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Right Side - Video Call Controls */}
          <Col xs={24} lg={12}>
            <Card className="shadow-xl border border-gray-200 h-full">
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                    <VideoCameraOutlined className="text-4xl text-gray-700" />
                  </div>
                  <Title level={2} className="mb-2">
                    Ready for Video Call
                  </Title>
                  <Text className="text-gray-600 text-lg">
                    Start your consultation with Dr.{" "}
                    {appointment.provider?.name}
                  </Text>
                </div>

                <div className="space-y-6">
                  {canCreateCall() ? (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <Space
                          direction="vertical"
                          size="small"
                          className="w-full"
                        >
                          <div className="flex items-center justify-center">
                            <CheckCircleOutlined className="text-green-500 mr-2" />
                            <Text className="text-green-700 font-medium">
                              All systems ready
                            </Text>
                          </div>
                          <Text className="text-green-600 text-sm">
                            Your appointment is confirmed and ready to begin
                          </Text>
                        </Space>
                      </div>

                      <Button
                        type="primary"
                        size="large"
                        icon={<VideoCameraOutlined />}
                        onClick={initializeCall}
                        className="w-full h-14 text-lg font-semibold shadow-md"
                        loading={isLoading}
                      >
                        {isLoading ? "Connecting..." : "Start Video Call"}
                      </Button>

                      <Text className="text-gray-500 text-sm block">
                        Make sure your camera and microphone are working
                        properly
                      </Text>
                    </>
                  ) : (
                    <Alert
                      type="info"
                      message="Video Call Not Available"
                      description={
                        appointment.status === "PENDING"
                          ? "Please wait for your appointment to be confirmed by the healthcare provider."
                          : appointment.status === "COMPLETED"
                          ? "This appointment has been completed. Thank you for using DiaConnect!"
                          : appointment.status === "CANCELLED"
                          ? "This appointment has been cancelled. Please book a new appointment if needed."
                          : "Video call is not available for this appointment at this time. Please contact support if you need assistance."
                      }
                      showIcon
                      className="text-left"
                      action={
                        appointment.status === "COMPLETED" ||
                        appointment.status === "CANCELLED" ? (
                          <Button size="small" onClick={onCallEnd}>
                            Back to Appointments
                          </Button>
                        ) : null
                      }
                    />
                  )}
                </div>

                {canCreateCall() && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <Title level={5} className="mb-3">
                      Before you join:
                    </Title>
                    <Space
                      direction="vertical"
                      size="small"
                      className="text-left"
                    >
                      <div className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        <Text>Ensure stable internet connection</Text>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        <Text>Test your camera and microphone</Text>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        <Text>Find a quiet, well-lit environment</Text>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                        <Text>Have your health documents ready</Text>
                      </div>
                    </Space>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
