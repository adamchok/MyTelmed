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

export interface FacilitySearchOptions {
  page?: number;
}
