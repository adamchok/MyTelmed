import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse, PaginatedResponse } from "../props";
import {
    MedicationDeliveryDto,
    ChoosePickupRequestDto,
    ChooseHomeDeliveryRequestDto,
    MarkOutForDeliveryRequestDto,
    CancelDeliveryRequestDto,
    DeliverySearchOptions,
} from "./props";

const RESOURCE: string = "/api/v1/delivery";
const DEFAULT_PAGE_SIZE: number = 10;

const DeliveryApi = {
    /**
     * Get delivery by ID (Patient only)
     */
    getDeliveryById(deliveryId: string): Promise<AxiosResponse<ApiResponse<MedicationDeliveryDto>>> {
        return repository.get<ApiResponse<MedicationDeliveryDto>>(`${RESOURCE}/${deliveryId}`);
    },

    /**
     * Get delivery by prescription ID (Patient and Pharmacist)
     */
    getDeliveryByPrescriptionId(prescriptionId: string): Promise<AxiosResponse<ApiResponse<MedicationDeliveryDto>>> {
        return repository.get<ApiResponse<MedicationDeliveryDto>>(`${RESOURCE}/prescription/${prescriptionId}`);
    },

    /**
     * Get deliveries for specific patient by patient ID (Patient only)
     */
    getDeliveriesByPatient(
        patientId: string,
        options?: DeliverySearchOptions
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<MedicationDeliveryDto>>>> {
        const page: number = options?.page ?? 0;
        const size: number = options?.size ?? DEFAULT_PAGE_SIZE;
        const query: string = `?page=${page}&size=${size}`;
        return repository.get<ApiResponse<PaginatedResponse<MedicationDeliveryDto>>>(
            `${RESOURCE}/patient/${patientId}${query}`
        );
    },

    /**
     * Get deliveries for current patient account (Any authenticated user)
     */
    getDeliveriesByPatientAccount(
        options?: DeliverySearchOptions
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<MedicationDeliveryDto>>>> {
        const page: number = options?.page ?? 0;
        const size: number = options?.size ?? DEFAULT_PAGE_SIZE;
        const query: string = `?page=${page}&size=${size}`;
        return repository.get<ApiResponse<PaginatedResponse<MedicationDeliveryDto>>>(`${RESOURCE}/patient${query}`);
    },

    /**
     * Get deliveries for specific facility (Pharmacist only)
     */
    getDeliveriesByFacility(
        facilityId: string,
        options?: DeliverySearchOptions
    ): Promise<AxiosResponse<ApiResponse<PaginatedResponse<MedicationDeliveryDto>>>> {
        const page: number = options?.page ?? 0;
        const size: number = options?.size ?? DEFAULT_PAGE_SIZE;
        const query: string = `?page=${page}&size=${size}`;
        return repository.get<ApiResponse<PaginatedResponse<MedicationDeliveryDto>>>(
            `${RESOURCE}/facility/${facilityId}${query}`
        );
    },

    /**
     * Patient chooses pickup delivery method (Patient only)
     */
    choosePickup(request: ChoosePickupRequestDto): Promise<AxiosResponse<ApiResponse<MedicationDeliveryDto>>> {
        return repository.post<ApiResponse<MedicationDeliveryDto>>(`${RESOURCE}/choose-pickup`, request);
    },

    /**
     * Patient chooses home delivery method (Patient only)
     */
    chooseHomeDelivery(
        request: ChooseHomeDeliveryRequestDto
    ): Promise<AxiosResponse<ApiResponse<MedicationDeliveryDto>>> {
        return repository.post<ApiResponse<MedicationDeliveryDto>>(`${RESOURCE}/choose-home-delivery`, request);
    },

    /**
     * Process payment for delivery (Patient only)
     */
    processPayment(deliveryId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${deliveryId}/process-payment`);
    },

    /**
     * Pharmacist processes delivery (Pharmacist only)
     */
    processDelivery(deliveryId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${deliveryId}/process`);
    },

    /**
     * Pharmacist marks delivery as out for delivery (Pharmacist only)
     */
    markOutForDelivery(request: MarkOutForDeliveryRequestDto): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/mark-out-for-delivery`, request);
    },

    /**
     * Patient marks delivery as completed (Patient only)
     */
    markAsCompleted(deliveryId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${deliveryId}/complete`);
    },

    /**
     * Patient cancels delivery (Patient only)
     */
    cancelDeliveryByPatient(request: CancelDeliveryRequestDto): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/patient/cancel`, request);
    },

    /**
     * Pharmacist cancels delivery (Pharmacist only)
     */
    cancelDeliveryByPharmacist(request: CancelDeliveryRequestDto): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/pharmacist/cancel`, request);
    },

    /**
     * Check if delivery is cancellable by patient (Patient only)
     */
    isDeliveryCancellableByPatient(deliveryId: string): Promise<AxiosResponse<ApiResponse<boolean>>> {
        return repository.get<ApiResponse<boolean>>(`${RESOURCE}/${deliveryId}/patient/cancellable`);
    },

    /**
     * Check if delivery is cancellable by pharmacist (Pharmacist only)
     */
    isDeliveryCancellableByPharmacist(deliveryId: string): Promise<AxiosResponse<ApiResponse<boolean>>> {
        return repository.get<ApiResponse<boolean>>(`${RESOURCE}/${deliveryId}/pharmacist/cancellable`);
    },
};

export default DeliveryApi;
