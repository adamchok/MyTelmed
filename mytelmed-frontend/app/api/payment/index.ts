import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse, PaginatedResponse } from "../props";
import {
    PaymentIntentResponseDto,
    ConfirmPaymentRequestDto,
    BillDto,
    PaymentTransactionDto,
    RefundRequestDto,
    RefundResponseDto,
    RefundStatusDto,
    PaymentSearchOptions,
} from "./props";

const PAYMENT_RESOURCE: string = "/api/payment";
const REFUND_RESOURCE: string = "/api/v1/payments/refunds";
const DEFAULT_PAGE_SIZE: number = 10;

const PaymentApi = {
    // Payment Intent Endpoints
    createAppointmentPaymentIntent(appointmentId: string): Promise<AxiosResponse<ApiResponse<PaymentIntentResponseDto>>> {
        return repository.post<ApiResponse<PaymentIntentResponseDto>>(
            `${PAYMENT_RESOURCE}/appointment/${appointmentId}/create-intent`
        );
    },

    createPrescriptionPaymentIntent(prescriptionId: string): Promise<AxiosResponse<ApiResponse<PaymentIntentResponseDto>>> {
        return repository.post<ApiResponse<PaymentIntentResponseDto>>(
            `${PAYMENT_RESOURCE}/prescription/${prescriptionId}/create-intent`
        );
    },

    confirmPayment(request: ConfirmPaymentRequestDto): Promise<AxiosResponse<ApiResponse<PaymentIntentResponseDto>>> {
        return repository.post<ApiResponse<PaymentIntentResponseDto>>(`${PAYMENT_RESOURCE}/confirm`, request);
    },

    // Bill Endpoints
    getPatientBills(
        options?: PaymentSearchOptions & {
            patientId?: string;
            billType?: string;
            billingStatus?: string;
            searchQuery?: string;
            startDate?: string;
            endDate?: string;
        }
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<BillDto>>>> {
        const page: number = options?.page ?? 0;
        const size: number = options?.size ?? DEFAULT_PAGE_SIZE;
        const sortBy: string = options?.sortBy ?? "createdAt";
        const sortDir: string = options?.sortDir ?? "desc";

        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", size.toString());
        params.append("sortBy", sortBy);
        params.append("sortDir", sortDir);

        if (options?.patientId) params.append("patientId", options.patientId);
        if (options?.billType) params.append("billType", options.billType);
        if (options?.billingStatus) params.append("billingStatus", options.billingStatus);
        if (options?.searchQuery) params.append("searchQuery", options.searchQuery);
        if (options?.startDate) params.append("startDate", options.startDate);
        if (options?.endDate) params.append("endDate", options.endDate);

        return repository.get<ApiResponse<PaginatedResponse<BillDto>>>(`${PAYMENT_RESOURCE}/bills?${params.toString()}`);
    },

    // Transaction Endpoints
    getPatientTransactions(
        options?: PaymentSearchOptions
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<PaymentTransactionDto>>>> {
        const page: number = options?.page ?? 0;
        const size: number = options?.size ?? DEFAULT_PAGE_SIZE;
        const sortBy: string = options?.sortBy ?? "createdAt";
        const sortDir: string = options?.sortDir ?? "desc";

        const query: string = `?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
        return repository.get<ApiResponse<PaginatedResponse<PaymentTransactionDto>>>(
            `${PAYMENT_RESOURCE}/transactions${query}`
        );
    },

    // Refund Endpoints
    getAppointmentRefundStatus(appointmentId: string): Promise<AxiosResponse<ApiResponse<RefundStatusDto>>> {
        return repository.get<ApiResponse<RefundStatusDto>>(`${REFUND_RESOURCE}/appointment/${appointmentId}/status`);
    },

    processManualRefund(
        appointmentId: string,
        request: RefundRequestDto
    ): Promise<AxiosResponse<ApiResponse<RefundResponseDto>>> {
        return repository.post<ApiResponse<RefundResponseDto>>(
            `${REFUND_RESOURCE}/appointment/${appointmentId}/process`,
            request
        );
    },
};

export default PaymentApi;
