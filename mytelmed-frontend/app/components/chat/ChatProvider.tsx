"use client";

import { Chat } from "stream-chat-react";
import React from "react";
import { useStreamChat } from "@/app/hooks/useStreamChat";

const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { chatClient, isLoading, error } = useStreamChat();

    // Let ChatPage handle loading and error states
    if (isLoading || error || !chatClient) {
        return null;
    }

    return <Chat client={chatClient}>{children}</Chat>;
};

export default ChatProvider;
