"use client";

import React, { useState, useEffect } from "react";
import { Channel, ChannelHeader, ChannelList, MessageInput, MessageList, Window } from "stream-chat-react";
import { Typography, Card, Spin, Alert, Button } from "antd";
import { MessageCircle, ArrowLeft } from "lucide-react";
import ChatProvider from "./ChatProvider";
import { ChannelFilters, ChannelOptions, ChannelSort } from "stream-chat";
import { useStreamChat } from "@/app/hooks/useStreamChat";
import "./index.css";

const { Title, Text } = Typography;

const ChatPage = () => {
    const { chatClient, streamUser, isLoading, error } = useStreamChat();
    const [isMobileView, setIsMobileView] = useState(false);
    const [showChannelList, setShowChannelList] = useState(true);

    // Check if we're on mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobileView(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Reset mobile view when switching to desktop
    useEffect(() => {
        if (!isMobileView) {
            setShowChannelList(true);
        }
    }, [isMobileView]);

    // Sort configuration: pinned channels first, then by last message time
    const sort: ChannelSort = [
        { pinned_at: -1 }, // Pinned channels first
        { last_message_at: -1 }, // Then by last message time
    ];

    // Filter for regular messaging channels
    const filters: ChannelFilters = {
        type: "messaging",
        members: { $in: [streamUser?.id || ""] },
    };

    const options: ChannelOptions = {
        limit: 10,
        state: true,
        presence: true,
    };

    // Handle back to channel list
    const handleBackToChannelList = () => {
        if (isMobileView) {
            setShowChannelList(true);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Title level={2} className="text-gray-800 mb-2 mt-0 text-xl md:text-3xl">
                            Chat
                        </Title>
                        <Text className="text-gray-600 text-sm md:text-base">
                            Connect with your healthcare providers
                        </Text>
                    </div>
                </div>

                {/* Loading Card */}
                <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "48px" } }}>
                    <div className="flex flex-col items-center justify-center">
                        <Spin size="large" />
                        <Text className="mt-4 text-gray-600">Connecting to chat...</Text>
                    </div>
                </Card>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Title level={2} className="text-gray-800 mb-2 mt-0 text-xl md:text-3xl">
                            Chat
                        </Title>
                        <Text className="text-gray-600 text-sm md:text-base">
                            Connect with your healthcare providers
                        </Text>
                    </div>
                </div>

                {/* Error Card */}
                <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "48px" } }}>
                    <Alert
                        message="Chat Connection Error"
                        description={error}
                        type="error"
                        showIcon
                        action={
                            <Button onClick={() => window.location.reload()} type="primary" danger>
                                Retry
                            </Button>
                        }
                    />
                </Card>
            </div>
        );
    }

    // No user or client state
    if (!streamUser || !chatClient) {
        return (
            <div className="container mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Title level={2} className="text-gray-800 mb-2 mt-0 text-xl md:text-3xl">
                            Chat
                        </Title>
                        <Text className="text-gray-600 text-sm md:text-base">
                            Connect with your healthcare providers
                        </Text>
                    </div>
                </div>

                {/* No User Card */}
                <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "48px" } }}>
                    <div className="text-center">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <Text className="text-gray-500 block mb-4">Chat is not available at the moment</Text>
                        <Button type="primary" onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Title level={2} className="text-gray-800 mb-2 mt-0 text-xl md:text-3xl">
                        Chat
                    </Title>
                    <Text className="text-gray-600 text-sm md:text-base">Connect with your healthcare providers</Text>
                </div>
            </div>

            {/* Chat Interface */}
            <Card className="shadow-lg border-0 bg-white chat-main-card" styles={{ body: { padding: 0 } }}>
                <div className="chat-container">
                    <ChatProvider chatClient={chatClient}>
                        <div className="str-chat-container">
                            {/* Channel List - Show on desktop always, or on mobile when showChannelList is true */}
                            {(!isMobileView || showChannelList) && (
                                <div className="chat-channel-list">
                                    <div className="chat-channel-header">
                                        <div className="flex items-center p-4 border-b border-gray-100">
                                            <MessageCircle className="w-5 h-5 text-blue-500 mr-3" />
                                            <Title level={5} className="m-0 text-gray-800">
                                                Conversations
                                            </Title>
                                        </div>
                                    </div>
                                    <ChannelList
                                        filters={filters}
                                        sort={sort}
                                        options={options}
                                        showChannelSearch
                                        additionalChannelSearchProps={{
                                            searchForChannels: true,
                                            searchQueryParams: {
                                                channelFilters: {
                                                    filters,
                                                },
                                            },
                                        }}
                                        Preview={(props) => (
                                            <div
                                                onClick={() => {
                                                    if (isMobileView) {
                                                        setShowChannelList(false);
                                                    }
                                                }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {props.Preview && <props.Preview {...props} />}
                                            </div>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Chat Window - Show on desktop always, or on mobile when channel is selected */}
                            {(!isMobileView || !showChannelList) && (
                                <div className="chat-window">
                                    {/* Mobile back button */}
                                    {isMobileView && (
                                        <div className="mobile-chat-header">
                                            <div className="flex items-center p-4 bg-white border-b border-gray-200">
                                                <Button
                                                    type="text"
                                                    icon={<ArrowLeft className="w-5 h-5" />}
                                                    onClick={handleBackToChannelList}
                                                    className="mr-3"
                                                />
                                                <Title level={5} className="m-0 text-gray-800">
                                                    Chat
                                                </Title>
                                            </div>
                                        </div>
                                    )}

                                    <Channel>
                                        <Window>
                                            <div className="chat-header-wrapper">
                                                <ChannelHeader />
                                            </div>
                                            <div className="chat-messages-wrapper">
                                                <MessageList />
                                            </div>
                                            <div className="chat-input-wrapper">
                                                <MessageInput focus />
                                            </div>
                                        </Window>
                                    </Channel>
                                </div>
                            )}
                        </div>
                    </ChatProvider>
                </div>
            </Card>
        </div>
    );
};

export default ChatPage;
