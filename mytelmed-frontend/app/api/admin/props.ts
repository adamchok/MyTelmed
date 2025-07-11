import { BaseUser, SearchOptions } from "../props";

// Admin Types (matching backend DTOs)
export type Admin = BaseUser;

export interface CreateAdminRequest {
    name: string;
    nric: string;
    email: string;
    phone: string;
}

export interface UpdateAdminRequest {
    name: string;
    nric: string;
    email: string;
    phone: string;
}

export interface UpdateAdminProfileRequest {
    name: string;
    email: string;
    phone: string;
}

export type AdminSearchOptions = SearchOptions;
