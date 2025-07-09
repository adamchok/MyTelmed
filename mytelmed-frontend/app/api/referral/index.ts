import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse, PaginatedResponse } from "../props";
import {
    ReferralDto,
    CreateReferralRequestDto,
    UpdateReferralStatusRequestDto,
    ReferralStatisticsDto,
    ReferralSearchOptions,
} from "./props";

const RESOURCE: string = "/api/v1/referral";
const DEFAULT_PAGE_SIZE: number = 20;

const ReferralApi = {
    /**
     * Create new referral (Doctor only)
     */
    createReferral(request: CreateReferralRequestDto): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}`, request);
    },

    /**
     * Get referral by ID (All authenticated users)
     */
    getReferralById(referralId: string): Promise<AxiosResponse<ApiResponse<ReferralDto>>> {
        return repository.get<ApiResponse<ReferralDto>>(`${RESOURCE}/${referralId}`);
    },

    /**
     * Get referral by referral number (All authenticated users)
     */
    getReferralByNumber(referralNumber: string): Promise<AxiosResponse<ApiResponse<ReferralDto>>> {
        return repository.get<ApiResponse<ReferralDto>>(`${RESOURCE}/number/${referralNumber}`);
    },

    /**
     * Get referrals by patient ID (Patient and related doctors)
     */
    getReferralsByPatient(
        patientId: string,
        options?: ReferralSearchOptions
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<ReferralDto>>>> {
        const page: number = options?.page ?? 0;
        const size: number = options?.size ?? DEFAULT_PAGE_SIZE;
        const query: string = `?page=${page}&size=${size}`;
        return repository.get<ApiResponse<PaginatedResponse<ReferralDto>>>(`${RESOURCE}/patient/${patientId}${query}`);
    },

    /**
     * Get referrals by referring doctor (Doctor only - for referrals they made)
     */
    getReferralsByReferringDoctor(
        options?: ReferralSearchOptions
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<ReferralDto>>>> {
        const page: number = options?.page ?? 0;
        const size: number = options?.size ?? DEFAULT_PAGE_SIZE;
        const query: string = `?page=${page}&size=${size}`;
        return repository.get<ApiResponse<PaginatedResponse<ReferralDto>>>(`${RESOURCE}/referring${query}`);
    },

    /**
     * Get referrals by referred doctor (Doctor only - for referrals made to them)
     */
    getReferralsByReferredDoctor(
        options?: ReferralSearchOptions
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<ReferralDto>>>> {
        const page: number = options?.page ?? 0;
        const size: number = options?.size ?? DEFAULT_PAGE_SIZE;
        const query: string = `?page=${page}&size=${size}`;
        return repository.get<ApiResponse<PaginatedResponse<ReferralDto>>>(`${RESOURCE}/referred${query}`);
    },

    /**
     * Get pending referrals for current doctor (Doctor only)
     */
    getPendingReferrals(): Promise<AxiosResponse<ApiResponse<ReferralDto[]>>> {
        return repository.get<ApiResponse<ReferralDto[]>>(`${RESOURCE}/pending`);
    },

    /**
     * Update referral status (Doctor only - for referred doctor to accept/reject)
     */
    updateReferralStatus(
        referralId: string,
        request: UpdateReferralStatusRequestDto
    ): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${referralId}/status`, request);
    },

    /**
     * Schedule appointment for referral (Doctor only)
     */
    scheduleAppointment(referralId: string, timeSlotId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        const params = `?timeSlotId=${timeSlotId}`;
        return repository.post<ApiResponse<void>>(`${RESOURCE}/${referralId}/schedule-appointment${params}`);
    },

    /**
     * Get referral statistics for current doctor (Doctor only)
     */
    getReferralStatistics(): Promise<AxiosResponse<ApiResponse<ReferralStatisticsDto>>> {
        return repository.get<ApiResponse<ReferralStatisticsDto>>(`${RESOURCE}/statistics`);
    },
};

export default ReferralApi;
