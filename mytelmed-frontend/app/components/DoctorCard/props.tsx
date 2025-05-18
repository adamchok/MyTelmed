import { Doctor, UserLocation } from "@/app/props";


export interface DoctorCardProps {
  doctor: Doctor,
  userLocation: UserLocation | null,
}