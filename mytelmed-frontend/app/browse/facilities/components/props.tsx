import { Facility, UserLocation } from "@/app/props";

export interface FacilityCardProps {
  facility: Facility;
  setSelectedFacility: (facility: Facility) => void;
  selectedFacility: Facility | undefined;
  userLocation: UserLocation | null;
}

export interface MapFrameProps {
  selectedFacility: Facility | undefined;
}
