"use client";

import { Chat } from "stream-chat-react";
import React from "react";
import { Button, Spin } from "antd";
import { useStreamChat } from "@/app/hooks/useStreamChat";

const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { chatClient, isLoading, error } = useStreamChat();

    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center">
                <Spin size="large" />
                <span className="mt-4 text-gray-600 text-center">
                    Initializing chat client...
                </span>
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

    if (!chatClient) {
        return (
            <div className="h-screen w-full flex items-center justify-center p-12">
                <p>Chat client not available</p>
            </div>
        );
    }

    return <Chat client={chatClient}>{children}</Chat>;
};

export default ChatProvider;
