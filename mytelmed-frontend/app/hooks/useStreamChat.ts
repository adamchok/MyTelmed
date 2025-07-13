import { useState, useEffect, useRef } from "react";
import { StreamChat, UserResponse } from "stream-chat";
import ChatApi from "@/app/api/chat";
import { message } from "antd";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export const useStreamChat = () => {
    const [chatClient, setChatClient] = useState<StreamChat | null>(null);
    const [streamUser, setStreamUser] = useState<UserResponse | null>(null);
    const [streamToken, setStreamToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const initializingRef = useRef(false);

    useEffect(() => {
        const initializeChat = async () => {
            // Prevent multiple initialization attempts
            if (initializingRef.current) {
                return;
            }
            initializingRef.current = true;

            try {
                const isLoggedIn = localStorage.getItem("isLogin");

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

                const response = await ChatApi.createAndGetStreamUserAndToken();
                const chatResponse = response.data;
                const chat = chatResponse.data;

                // Check if get or create chat is successful
                if (!chatResponse.isSuccess || !chat) {
                    setError("Failed to get or create chat");
                    message.error("Failed to get or create chat");
                    setIsLoading(false);
                    return;
                }

                // Set user and token based on user type
                const user: UserResponse = {
                    id: chat.userId,
                    name: chat.name,
                };

                const token: string = chat.token;

                if (!token) {
                    setError("Failed to get authentication token");
                    message.error("Failed to get authentication token");
                    setIsLoading(false);
                    return;
                }

                // Create a new StreamChat client and connect WebSocket
                const client = new StreamChat(apiKey);
                await client.connectUser(user, token);
                setChatClient(client);
                setStreamUser(user);
                setStreamToken(token);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to initialize Stream chat client:", error);
                setError("Failed to initialize chat");
                message.error("Failed to initialize chat");
                setIsLoading(false);
            } finally {
                initializingRef.current = false;
            }
        };

        initializeChat();

        // Cleanup function to disconnect on unmount
        return () => {
            if (chatClient) {
                chatClient.disconnectUser();
                setChatClient(null);
            }
        };
    }, []); // Keep empty dependency array as we only want to initialize once

    return { chatClient, streamUser, streamToken, isLoading, error };
};
