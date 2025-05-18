import { Facility } from "@/app/props";

export interface FacilitySearchOptions {
  page?: number;
}

export interface FacilityResponse {
  content: Facility[];
  totalElements: number;
  totalPages: number;
}
