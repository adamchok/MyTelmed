"use client";

import { useEffect, useState } from "react";
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
  useConnectedUser,
  DefaultVideoPlaceholder,
  StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import {
  Button,
  Typography,
  Space,
  Card,
  Tag,
  Switch,
  Tooltip,
  Alert,
} from "antd";
import {
  VideoCameraOutlined,
  AudioOutlined,
  SettingOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import "./index.css";

const { Text } = Typography;

interface MeetingSetupProps {
  setIsSetupComplete: (value: boolean) => void;
}

const MeetingSetup = ({ setIsSetupComplete }: MeetingSetupProps) => {
  const call = useCall();
  const { useParticipants, useCallCreatedBy } = useCallStateHooks();
  const participants = useParticipants();
  const callCreatedBy = useCallCreatedBy();

  if (!call) {
    throw new Error(
      "useStreamCall must be used within a StreamCall component."
    );
  }

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [devicePermissions, setDevicePermissions] = useState({
    camera: false,
    microphone: false,
  });

  // Check device permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setDevicePermissions({ camera: true, microphone: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.error("Device permission error:", error);
      }
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    if (isCameraOn) {
      call.camera.enable();
    } else {
      call.camera.disable();
    }
  }, [isCameraOn, call.camera]);

  useEffect(() => {
    if (isMicOn) {
      call.microphone.enable();
    } else {
      call.microphone.disable();
    }
  }, [isMicOn, call.microphone]);

  const handleJoinMeeting = async () => {
    setIsJoining(true);
    try {
      await call.join();
      setIsSetupComplete(true);
    } catch (error) {
      console.error("Failed to join meeting:", error);
      setIsJoining(false);
    }
  };

  const DisabledVideoPreview = () => {
    const connectedUser = useConnectedUser();
    if (!connectedUser) return null;
    return (
      <DefaultVideoPlaceholder
        participant={
          {
            name: connectedUser.name,
          } as StreamVideoParticipant
        }
      />
    );
  };

  const NoCameraPreview = () => (
    <div>
      <VideoCameraOutlined />
    </div>
  );

  const StartingCameraPreview = () => (
    <div>
      <LoadingOutlined />
    </div>
  );

  const participantCount = participants.length;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
      {/* Left Side - Video Preview */}
      <div className="w-full lg:w-8/12">
        <div className="shadow-2xl border border-gray-200 bg-white rounded-lg overflow-hidden">
          <div className="relative aspect-video bg-gray-100">
            <VideoPreview
              DisabledVideoPreview={DisabledVideoPreview}
              NoCameraPreview={NoCameraPreview}
              StartingCameraPreview={StartingCameraPreview}
              className="w-full h-full"
            />

            {/* Video Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
              <Tooltip
                title={isCameraOn ? "Turn off camera" : "Turn on camera"}
              >
                <Button
                  type={isCameraOn ? "primary" : "default"}
                  shape="circle"
                  size="large"
                  icon={<VideoCameraOutlined />}
                  onClick={() => setIsCameraOn(!isCameraOn)}
                  className={`shadow-lg ${
                    !isCameraOn
                      ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                      : ""
                  }`}
                />
              </Tooltip>

              <Tooltip
                title={isMicOn ? "Mute microphone" : "Unmute microphone"}
              >
                <Button
                  type={isMicOn ? "primary" : "default"}
                  shape="circle"
                  size="large"
                  icon={<AudioOutlined />}
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`shadow-lg ${
                    !isMicOn
                      ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                      : ""
                  }`}
                />
              </Tooltip>

              <DeviceSettings />
            </div>

            {/* Device Status Indicators */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <Tag
                color={devicePermissions.camera ? "green" : "red"}
                className="border-0"
              >
                <VideoCameraOutlined className="mr-1" />
                {devicePermissions.camera ? "Camera Ready" : "No Camera"}
              </Tag>
              <Tag
                color={devicePermissions.microphone ? "green" : "red"}
                className="border-0"
              >
                <AudioOutlined className="mr-1" />
                {devicePermissions.microphone ? "Mic Ready" : "No Microphone"}
              </Tag>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Meeting Info & Controls */}
      <div className="w-full lg:w-4/12 space-y-6">
        {/* Meeting Info */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Text className="text-gray-700">Participants in call:</Text>
              <Tag color="blue" className="border-0">
                <UserOutlined className="mr-1" />
                {participantCount}{" "}
                {participantCount === 1 ? "person" : "people"}
              </Tag>
            </div>

            {callCreatedBy && (
              <div className="flex items-center justify-between">
                <Text className="text-gray-700">Call host:</Text>
                <Text className="text-gray-800 font-medium">
                  {callCreatedBy.name}
                </Text>
              </div>
            )}
          </div>
        </Card>

        {/* Device Settings */}
        <Card
          title={
            <span className="text-gray-800 flex items-center">
              <SettingOutlined className="mr-2" />
              Device Settings
            </span>
          }
          headStyle={{
            backgroundColor: "transparent",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Space direction="vertical" size="large" className="w-full">
            {/* Quick Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 flex items-center">
                  <VideoCameraOutlined className="mr-2" />
                  Camera
                </span>
                <Switch
                  checked={isCameraOn}
                  onChange={setIsCameraOn}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 flex items-center">
                  <AudioOutlined className="mr-2" />
                  Microphone
                </span>
                <Switch
                  checked={isMicOn}
                  onChange={setIsMicOn}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
              </div>
            </div>
          </Space>
        </Card>

        {/* Pre-join Checklist */}
        <Card
          title={
            <span className="text-gray-800 flex items-center">
              <CheckCircleOutlined className="mr-2" />
              Pre-call Checklist
            </span>
          }
          headStyle={{
            backgroundColor: "transparent",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Space direction="vertical" size="small" className="w-full">
            <div className="flex items-center text-green-600">
              <CheckCircleOutlined className="mr-2" />
              <Text className="text-gray-700">
                Camera and microphone permissions granted
              </Text>
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircleOutlined className="mr-2" />
              <Text className="text-gray-700">
                Audio and video devices detected
              </Text>
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircleOutlined className="mr-2" />
              <Text className="text-gray-700">Stable internet connection</Text>
            </div>
          </Space>
        </Card>

        {/* Permissions Warning */}
        {(!devicePermissions.camera || !devicePermissions.microphone) && (
          <Alert
            type="warning"
            icon={<ExclamationCircleOutlined />}
            message="Device Permissions Required"
            description="Please allow camera and microphone access for the best video call experience."
            className="bg-yellow-100 border-yellow-400 text-yellow-800"
          />
        )}

        {/* Join Button */}
        <Button
          type="primary"
          size="large"
          block
          loading={isJoining}
          onClick={handleJoinMeeting}
          className="h-14 text-lg font-semibold bg-blue-600 border-0 hover:bg-blue-700 shadow-lg text-white"
          icon={<VideoCameraOutlined />}
        >
          {isJoining ? "Joining..." : "Join Video Call"}
        </Button>
      </div>
    </div>
  );
};

export default MeetingSetup;
