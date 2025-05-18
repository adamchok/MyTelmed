import { Facility, UserLocation } from "@/app/props";

export interface LocationOption {
  label: string;
  value: string;
  type: string;
}

export interface FacilityTypeOption {
  label: string;
  value: string;
}

export interface BrowseFacilitiesPageComponentProps {
  search: string;
  setSearch: (search: string) => void;
  selectedLocation: string | undefined;
  setSelectedLocation: (selectedLocation: string | undefined) => void;
  locationOptions: LocationOption[];
  selectedType: string | undefined;
  setSelectedType: (selectedType: string | undefined) => void;
  typeOptions: FacilityTypeOption[];
  paginatedFacilities: Facility[];
  totalFacilitySize: number;
  facilitiesPerPage: number;
  selectedFacility: Facility | undefined;
  setSelectedFacility: (selectedFacility: Facility | undefined) => void;
  currentPage: number;
  setCurrentPage: (currentPage: number) => void;
  userLocation: UserLocation | null;
}
