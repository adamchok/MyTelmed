import { SearchOptions } from "../props";

export interface Facility {
    id: string;
    name: string;
    telephone: string;
    address: string;
    city: string;
    state: string;
    facilityType: string;
    thumbnailUrl: string;
}

export interface CreateFacilityRequest {
    name: string;
    telephone: string;
    address: string;
    city: string;
    state: string;
    facilityType: FacilityType;
}

export interface UpdateFacilityRequest {
    name: string;
    telephone: string;
    address: string;
    city: string;
    state: string;
    facilityType: FacilityType;
}

export enum FacilityType {
    HOSPITAL = "HOSPITAL",
    CLINIC = "CLINIC",
}

export type FacilitySearchOptions = SearchOptions;
