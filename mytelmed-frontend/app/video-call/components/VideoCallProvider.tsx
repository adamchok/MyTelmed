"use client";

import VideoCallApi from "@/app/api/video-call";
import {
  StreamVideo,
  StreamVideoClient,
  StreamVideoClientOptions,
  User,
} from "@stream-io/video-react-sdk";
import { Button, message, Spin } from "antd";
import { ReactNode, useEffect, useState } from "react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export function VideoCallProvider({
  appointmentId,
  children,
}: {
  appointmentId: string;
  children: ReactNode;
}) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeVideoCall = async () => {
      try {
        const isLoggedIn = localStorage.getItem("isLogin");
        const userType = localStorage.getItem("userType");

        // Check if user is logged in
        if (!isLoggedIn || isLoggedIn === "false") {
          setError("User not logged in");
          setIsLoading(false);
          return;
        }

        // Check if API key is missing
        if (!apiKey) {
          setError("Stream API key is missing");
          setIsLoading(false);
          return;
        }

        if (userType === "admin") {
          setError("Admin cannot join video call");
          setIsLoading(false);
          return;
        }

        //
        const response =
          await VideoCallApi.createVideoCallAndGetStreamUserAndToken(
            appointmentId
          );
        const videoCallResponse = response.data;
        const videoCall = videoCallResponse.data;

        // Check if get or create video call is successful
        if (!videoCallResponse.isSuccess || !videoCall) {
          setError("Failed to get or create video call");
          message.error("Failed to get or create video call");
          setIsLoading(false);
          return;
        }

        // Set user and token based on user type
        const streamUser: User = {
          id: videoCall.userId,
          name: videoCall.name,
        };

        const streamToken: string = videoCall.token;

        if (!streamToken) {
          setError("Failed to get authentication token");
          message.error("Failed to get authentication token");
          setIsLoading(false);
          return;
        }

        if (!streamUser) {
          setError("Failed to initialize Stream user");
          message.error("Failed to initialize Stream user");
          setIsLoading(false);
          return;
        }

        // Initialize Stream client
        const options: StreamVideoClientOptions = {
          apiKey,
          user: streamUser,
          token: streamToken,
        };

        const client = new StreamVideoClient(options);
        setVideoClient(client);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize Stream client:", error);
        setError("Failed to initialize video call");
        message.error("Failed to initialize video call");
        setIsLoading(false);
      }
    };

    initializeVideoCall();
  }, [appointmentId]); // Only depend on appointmentId

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-12">
        <Spin size="large" tip="Initializing video call...">
          <div className="p-8" />
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-12">
        <div className="text-center text-red-600">
          <p className="mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!videoClient) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-12">
        <p>Video call not available</p>
      </div>
    );
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}
