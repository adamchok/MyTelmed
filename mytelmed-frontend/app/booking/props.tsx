import { AppointmentMode, Doctor, PatientSymptom } from '../props';
import { MedicalRecord } from '../medical-records/props';

export interface Referral {
  id: string;
  type: string;
  referringDoctor: string;
  referringClinic: string;
  referralDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'used';
  description: string;
}

export interface BookingFormValues {
  symptoms: PatientSymptom[];
  reason: string;
  selectedRecords: string[];
  selectedReferral?: string;
  newDocuments: File[];
  bookingMode: AppointmentMode;
  date: string;
  time: string;
}

export interface BookingPageProps {
  isLoading: boolean;
  doctor?: Doctor;
  availableTimes: string[];
  bookingDate: string;
  bookingType: 'video' | 'physical' | 'both';
  medicalRecords: MedicalRecord[];
  referrals: Referral[];
  onSubmitBooking: (values: BookingFormValues) => void;
}

export interface SymptomInputProps {
  symptoms: PatientSymptom[];
  onAddSymptom: (symptom: PatientSymptom) => void;
  onRemoveSymptom: (id: string) => void;
}

export interface DocumentSelectorProps {
  medicalRecords: MedicalRecord[];
  selectedRecords: string[];
  onSelectRecord: (recordId: string, selected: boolean) => void;
  onAddNewDocument: (file: File) => void;
  newDocuments: File[];
  onRemoveNewDocument: (index: number) => void;
}

export interface TimeSlotSelectorProps {
  date: string;
  availableTimes: string[];
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

export interface ReferralSelectorProps {
  referrals: Referral[];
  selectedReferral: string | undefined;
  onSelectReferral: (referralId: string) => void;
} 