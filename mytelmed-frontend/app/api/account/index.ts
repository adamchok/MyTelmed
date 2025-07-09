import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import { UpdateAccountUsernameRequest, UpdateAccountPasswordRequest } from "./props";

const ACCOUNT_BASE = "/api/v1/account";

const AccountApi = {
    updateUsername(data: UpdateAccountUsernameRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${ACCOUNT_BASE}/username`, data);
    },

    updatePassword(data: UpdateAccountPasswordRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.patch<ApiResponse<void>>(`${ACCOUNT_BASE}/password`, data);
    },
};

export default AccountApi;
