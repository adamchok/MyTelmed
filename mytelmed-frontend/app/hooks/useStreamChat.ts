import { useState, useEffect, useRef } from "react";
import { StreamChat, UserResponse } from "stream-chat";
import ChatApi from "@/app/api/chat";
import { message } from "antd";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const CHAT_INIT_TIMEOUT = 30000; // 30 seconds timeout

export const useStreamChat = () => {
    const [chatClient, setChatClient] = useState<StreamChat | null>(null);
    const [streamUser, setStreamUser] = useState<UserResponse | null>(null);
    const [streamToken, setStreamToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const initializingRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const initializeChat = async () => {
            // Prevent multiple initialization attempts
            if (initializingRef.current) {
                return;
            }
            initializingRef.current = true;

            // Set up timeout to prevent infinite loading
            timeoutRef.current = setTimeout(() => {
                console.error("[useStreamChat] Initialization timeout after 30 seconds");
                setError("Chat initialization timed out. Please check your connection and try again.");
                setIsLoading(false);
                initializingRef.current = false;
            }, CHAT_INIT_TIMEOUT);

            try {
                const isLoggedIn = localStorage.getItem("isLogin");

                // Check if user is logged in
                if (!isLoggedIn || isLoggedIn === "false") {
                    setError("User not logged in. Please log in to access chat.");
                    setIsLoading(false);
                    return;
                }

                // Check if API key is missing
                if (!apiKey) {
                    console.error("[useStreamChat] Stream API key is missing");
                    setError("Chat service is not configured. Please contact support.");
                    setIsLoading(false);
                    return;
                }

                const response = (await Promise.race([
                    ChatApi.createAndGetStreamUserAndToken(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("API call timeout")), 25000)),
                ])) as any;

                const chatResponse = response.data;
                const chat = chatResponse.data;

                // Check if get or create chat is successful
                if (!chatResponse.isSuccess || !chat) {
                    console.error("[useStreamChat] Failed to get or create chat:", chatResponse);
                    const errorMessage = chatResponse.message || "Failed to get or create chat";
                    setError(`Chat setup failed: ${errorMessage}`);
                    message.error("Failed to get or create chat");
                    setIsLoading(false);
                    return;
                }

                // Validate chat data structure
                if (!chat.userId || !chat.name || !chat.token) {
                    console.error("[useStreamChat] Invalid chat data structure:", chat);
                    setError("Invalid chat configuration received from server");
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
                    setError("Authentication failed. Please try logging in again.");
                    message.error("Failed to get authentication token");
                    setIsLoading(false);
                    return;
                }

                // Create a new StreamChat client and connect WebSocket
                const client = new StreamChat(apiKey);

                await Promise.race([
                    client.connectUser(user, token),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("StreamChat connection timeout")), 20000)),
                ]);

                // Clear timeout since we succeeded
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }

                setChatClient(client);
                setStreamUser(user);
                setStreamToken(token);
                setIsLoading(false);
            } catch (error) {
                console.error("[useStreamChat] Failed to initialize Stream chat client:", error);

                let errorMessage = "Failed to initialize chat";
                if (error instanceof Error) {
                    if (error.message.includes("timeout")) {
                        errorMessage = "Connection timed out. Please check your internet connection and try again.";
                    } else if (error.message.includes("Network Error")) {
                        errorMessage = "Network error. Please check your connection and try again.";
                    } else if (error.message.includes("401") || error.message.includes("Unauthorized")) {
                        errorMessage = "Authentication failed. Please log in again.";
                    } else {
                        errorMessage = `Chat initialization failed: ${error.message}`;
                    }
                }

                setError(errorMessage);
                message.error("Failed to initialize chat");
                setIsLoading(false);
            } finally {
                // Clear timeout in finally block
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                initializingRef.current = false;
            }
        };

        initializeChat();

        // Cleanup function to disconnect on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (chatClient) {
                chatClient.disconnectUser();
                setChatClient(null);
            }
        };
    }, []); // Keep empty dependency array as we only want to initialize once

    return { chatClient, streamUser, streamToken, isLoading, error };
};
