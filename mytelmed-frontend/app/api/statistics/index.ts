import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import { DashboardStats } from "./props";

const RESOURCE: string = "/api/v1/statistics";

const StatisticsApi = {
    /**
     * Get dashboard statistics including total counts and growth percentages.
     * Only accessible by admin users.
     */
    getDashboardStats(): Promise<AxiosResponse<ApiResponse<DashboardStats>>> {
        return repository.get<ApiResponse<DashboardStats>>(`${RESOURCE}/dashboard`);
    },
};

export default StatisticsApi;
