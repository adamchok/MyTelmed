"use client";

import React from "react";
import { Channel, ChannelHeader, ChannelList, MessageInput, MessageList, Window } from "stream-chat-react";
import ChatProvider from "./ChatProvider";
import { ChannelFilters, ChannelOptions, ChannelSort } from "stream-chat";
import { useStreamChat } from "@/app/hooks/useStreamChat";
import "./ChatPage.css";

const ChatPage = () => {
    const { streamUser, isLoading } = useStreamChat();

    // Return loading state when streamUser is not available yet
    if (isLoading || !streamUser) {
        return;
    }

    // Sort configuration: pinned channels first, then by last message time
    const sort: ChannelSort = [
        { pinned_at: -1 }, // Pinned channels first
        { last_message_at: -1 }, // Then by last message time
    ];

    // Filter for regular messaging channels
    const filters: ChannelFilters = {
        type: "messaging",
        members: { $in: [streamUser.id] },
    };

    const options: ChannelOptions = {
        limit: 10,
        state: true,
        presence: true,
    };

    return (
        <main className="chat-container">
            <ChatProvider>
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
                    setActiveChannelOnMount={true}
                />
                <Channel>
                    <Window>
                        <ChannelHeader />
                        <MessageList />
                        <MessageInput focus />
                    </Window>
                </Channel>
            </ChatProvider>
        </main>
    );
};

export default ChatPage;
