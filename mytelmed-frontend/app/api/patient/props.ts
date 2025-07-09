import { BaseUser, SearchOptions } from "../props";

export interface Patient extends BaseUser {
    serialNumber: string;
    dateOfBirth: string;
    gender: string;
}

export interface CreatePatientRequest {
    name: string;
    nric: string;
    email: string;
    serialNumber: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    password: string;
}

export interface UpdatePatientProfileRequest {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
}

export type PatientSearchOptions = SearchOptions;
