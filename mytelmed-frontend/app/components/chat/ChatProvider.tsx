"use client";

import { Chat } from "stream-chat-react";
import React from "react";
import { StreamChat } from "stream-chat";

interface ChatProviderProps {
    children: React.ReactNode;
    chatClient: StreamChat;
}

const ChatProvider = ({ children, chatClient }: ChatProviderProps) => {
    return <Chat client={chatClient}>{children}</Chat>;
};

export default ChatProvider;
