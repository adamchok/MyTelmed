import { Facility } from "@/app/api/facility/props";
import { UserLocation } from "../props";

export interface FacilityCardProps {
  facility: Facility;
  setSelectedFacility: (facility: Facility) => void;
  selectedFacility: Facility | undefined;
  userLocation: UserLocation | null;
}

export interface MapFrameProps {
  selectedFacility: Facility | undefined;
}
