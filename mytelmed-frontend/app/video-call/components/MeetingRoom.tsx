"use client";
import { useState } from "react";
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Spin, Dropdown, Menu, Button } from "antd";
import {
  LayoutOutlined,
  UserOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import cn from "classnames";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

interface MeetingRoomProps {
  onCallEnd: () => void;
}

const MeetingRoom = ({ onCallEnd }: MeetingRoomProps) => {
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);

  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );

  const CallLayout = () => {
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

  return (
    <>
      <div className="relative flex flex-col size-full">
        {/* Main call layout */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex size-full items-center">
            <CallLayout />
          </div>

          <div
            className={cn("h-[calc(100vh-86px)] hidden ml-2", {
              "show-block": showParticipants,
            })}
          >
            <CallParticipantsList onClose={() => setShowParticipants(false)} />
          </div>
        </div>

        {/* Centered Action Bar at Bottom */}
        <div className="mt-4 flex justify-center">
          <div
            className={cn(
              "flex items-center rounded-xl bg-[#cbd5e1] border border-gray-300 px-4 py-2",
              { "gap-3": !isControlsCollapsed, "gap-1": isControlsCollapsed }
            )}
          >
            <Button
              size="small"
              shape="circle"
              icon={isControlsCollapsed ? <UpOutlined /> : <DownOutlined />}
              onClick={() => setIsControlsCollapsed((prev) => !prev)}
            />

            {!isControlsCollapsed && (
              <>
                <CallControls onLeave={onCallEnd} />

                <Dropdown overlay={menu} placement="top">
                  <Button shape="round" icon={<LayoutOutlined />} />
                </Dropdown>

                <CallStatsButton />

                <Button
                  shape="round"
                  icon={<UserOutlined />}
                  onClick={() => setShowParticipants((prev) => !prev)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MeetingRoom;
