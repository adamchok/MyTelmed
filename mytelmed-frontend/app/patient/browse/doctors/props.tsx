import { Doctor, UserLocation } from "@/app/props";

export interface LocationOption {
  label: string;
  value: string;
  type: string;
}

export interface SpecialtyOption {
  label: string;
  value: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface FacilityOption {
  label: string;
  value: string;
}

export interface BrowseDoctorsPageComponentProps {
  // Search
  search: string;
  setSearch: (search: string) => void;

  // Location filter
  selectedLocation: string | undefined;
  setSelectedLocation: (selectedLocation: string | undefined) => void;
  locationOptions: LocationOption[];

  // Specialty filter
  selectedSpecialty: string | undefined;
  setSelectedSpecialty: (selectedSpecialty: string | undefined) => void;
  specialtyOptions: SpecialtyOption[];

  // Doctors data
  paginatedDoctors: Doctor[];
  filteredDoctors: Doctor[];

  // Pagination
  currentPage: number;
  setCurrentPage: (currentPage: number) => void;
  doctorsPerPage: number;

  // User location for distance calculation
  userLocation: UserLocation | null;

  // Date range navigation
  onDateRangeChange: (direction: 'prev' | 'next') => void;
  currentDatePage: number;
  getDateRangeDisplay: () => string;

  // Facility filter
  onFacilityChange: (value: string | undefined) => void;
  selectedFacilityFilter: string | undefined;
  facilityOptions: FacilityOption[];
}
