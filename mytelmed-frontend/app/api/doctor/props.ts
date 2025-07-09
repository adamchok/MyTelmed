import { Facility } from "../facility/props";
import { ExtendedUser, SearchOptions } from "../props";

export interface Doctor extends ExtendedUser {
    facility: Facility;
    specialityList: string[];
    languageList: string[];
    qualifications: string;
}

export interface CreateDoctorRequest {
    name: string;
    nric: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    facilityId: string;
    specialityList: string[];
    languageList: string[];
    qualifications: string;
}

export interface UpdateDoctorProfileRequest {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    languageList: string[];
    qualifications: string;
}

export interface UpdateDoctorSpecialitiesAndFacilityRequest {
    facilityId: string;
    specialityList: string[];
}

export type DoctorSearchOptions = SearchOptions;
