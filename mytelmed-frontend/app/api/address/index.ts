import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import { AddressDto, RequestAddressDto } from "./props";

const RESOURCE: string = "/api/v1/address";

const AddressApi = {
    /**
     * Get address by ID (Patient only)
     */
    getAddressById(addressId: string): Promise<AxiosResponse<ApiResponse<AddressDto>>> {
        return repository.get<ApiResponse<AddressDto>>(`${RESOURCE}/${addressId}`);
    },

    /**
     * Get all addresses by patient ID (Patient only)
     */
    getAddressesByPatientId(patientId: string): Promise<AxiosResponse<ApiResponse<AddressDto[]>>> {
        return repository.get<ApiResponse<AddressDto[]>>(`${RESOURCE}/patient?patientId=${patientId}`);
    },

    /**
     * Get all addresses for the current patient (Patient only)
     */
    getAddressesByPatientAccount(): Promise<AxiosResponse<ApiResponse<AddressDto[]>>> {
        return repository.get<ApiResponse<AddressDto[]>>(`${RESOURCE}`);
    },

    /**
     * Create new address for the current patient (Patient only)
     */
    createAddressByAccount(request: RequestAddressDto): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}`, request);
    },

    /**
     * Update address by ID (Patient only)
     */
    updateAddressById(addressId: string, request: RequestAddressDto): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${addressId}`, request);
    },

    /**
     * Delete address by ID (Patient only)
     */
    deleteAddressById(addressId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.delete<ApiResponse<void>>(`${RESOURCE}/${addressId}`);
    },
};

export default AddressApi;
