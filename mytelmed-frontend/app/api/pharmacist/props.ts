import { Facility } from "../facility/props";
import { ExtendedUser, SearchOptions } from "../props";

export interface Pharmacist extends ExtendedUser {
    facility: Facility;
}

export interface CreatePharmacistRequest {
    name: string;
    nric: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    facilityId: string;
}

export interface UpdatePharmacistRequest {
    name: string;
    nric: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    facilityId: string;
}

export interface UpdatePharmacistProfileRequest {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
}

export interface UpdatePharmacistFacilityRequest {
    facilityId: string;
}

export interface UpdatePharmacistRequest {
    name: string;
    nric: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    facilityId: string;
}

export type PharmacistSearchOptions = SearchOptions;
