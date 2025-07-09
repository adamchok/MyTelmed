import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import { StreamTokenAndUserResponseDto } from "./props";

const RESOURCE: string = "/api/v1/chat";

const ChatApi = {
    /**
     * Create and get Stream user and token for chat functionality
     * This endpoint integrates with Stream service to provide real-time chat capabilities
     * Returns authentication token, user ID, and display name for the current authenticated user
     */
    createAndGetStreamUserAndToken(): Promise<AxiosResponse<ApiResponse<StreamTokenAndUserResponseDto>>> {
        return repository.get<ApiResponse<StreamTokenAndUserResponseDto>>(`${RESOURCE}`);
    },
};

export default ChatApi;
