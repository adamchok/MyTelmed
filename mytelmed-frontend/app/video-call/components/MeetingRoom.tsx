"use client";
import { useState, useEffect } from "react";
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useDeviceList,
} from "@stream-io/video-react-sdk";
import { Spin, Dropdown, Menu, Button } from "antd";
import {
  LayoutOutlined,
  UserOutlined,
  UpOutlined,
  DownOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import cn from "classnames";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

interface MeetingRoomProps {
  onCallEnd: () => void;
}

const MeetingRoom = ({ onCallEnd }: MeetingRoomProps) => {
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { useCallCallingState, useCameraState } = useCallStateHooks();
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);

  const callingState = useCallCallingState();
  const { camera, selectedDevice, devices } = useCameraState();
  const { deviceList } = useDeviceList(devices, selectedDevice);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Force grid layout on mobile
  useEffect(() => {
    if (isMobile) {
      setLayout("grid");
    }
  }, [isMobile]);

  if (callingState !== CallingState.JOINED)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );

  const CallLayout = () => {
    // Always use grid on mobile
    if (isMobile) {
      return <PaginatedGridLayout />;
    }

    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  const menu = (
    <Menu
      onClick={({ key }) => setLayout(key as CallLayoutType)}
      items={[
        { label: "Grid", key: "grid" },
        { label: "Speaker-Left", key: "speaker-left" },
        { label: "Speaker-Right", key: "speaker-right" },
      ]}
    />
  );

  // Function to switch camera (cycles through available cameras)
  const switchCamera = async () => {
    if (deviceList.length > 1) {
      const currentIndex = deviceList.findIndex(device => device.deviceId === selectedDevice);
      const nextIndex = (currentIndex + 1) % deviceList.length;
      await camera.select(deviceList[nextIndex].deviceId);
    }
  };

  // Check if camera switching is available (multiple cameras)
  const isCameraSwitchAvailable = deviceList.length > 1;

  return (
    <div className="relative flex flex-col size-full">
      {/* Main call layout */}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex size-full items-center">
          <CallLayout />
        </div>

        {/* Participants panel - responsive positioning */}
        <div
          className={cn(
            "h-[calc(100vh-86px)] hidden",
            {
              "show-block": showParticipants,
              "ml-2": !isMobile && showParticipants,
              "absolute top-0 left-0 w-full h-full z-10 bg-white": isMobile && showParticipants,
            }
          )}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Responsive Action Bar at Bottom */}
      <div className="mt-2 md:mt-4 flex justify-center px-2 md:px-4">
        <div
          className={cn(
            "flex items-center rounded-xl bg-[#cbd5e1] border border-gray-300",
            {
              // Mobile styles
              "px-2 py-1 gap-1": isMobile,
              "flex-wrap justify-center": isMobile && !isControlsCollapsed,
              // Desktop styles
              "px-4 py-2": !isMobile,
              "gap-3": !isMobile && !isControlsCollapsed,
              "gap-1": !isMobile && isControlsCollapsed,
            }
          )}
        >
          {/* Collapse/Expand button - smaller on mobile */}
          <Button
            size={isMobile ? "small" : "small"}
            shape="circle"
            icon={isControlsCollapsed ? <UpOutlined /> : <DownOutlined />}
            onClick={() => setIsControlsCollapsed((prev) => !prev)}
            className={cn({
              "w-7 h-7": isMobile,
            })}
          />

          {!isControlsCollapsed && (
            <>
              {/* Call Controls */}
              <div className={cn({ "order-1": isMobile })}>
                <CallControls onLeave={onCallEnd} />
              </div>

              {/* Camera Switch Button - only show on mobile if multiple cameras available */}
              {isMobile && isCameraSwitchAvailable && (
                <div className={cn({ "order-2": isMobile })}>
                  <Button
                    shape="round"
                    size="small"
                    icon={<SyncOutlined />}
                    onClick={switchCamera}
                    title="Switch Camera"
                    className="w-8 h-8"
                  />
                </div>
              )}

              {/* Layout Dropdown - hidden on mobile */}
              {!isMobile && (
                <Dropdown overlay={menu} placement="top">
                  <Button shape="round" icon={<LayoutOutlined />} />
                </Dropdown>
              )}

              {/* Call Stats Button */}
              <div className={cn({ "order-4": isMobile })}>
                <CallStatsButton />
              </div>

              {/* Participants Button */}
              <div className={cn({ "order-3": isMobile })}>
                <Button
                  shape="round"
                  size={isMobile ? "small" : "middle"}
                  icon={<UserOutlined />}
                  onClick={() => setShowParticipants((prev) => !prev)}
                  className={cn({
                    "w-8 h-8": isMobile,
                  })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
