import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppointmentDto } from "@/app/api/appointment/props";
import { Doctor } from "@/app/api/doctor/props";
import { ReferralType, ReferralPriority } from "@/app/api/referral/props";

export interface ReferralFormData {
    priority?: ReferralPriority;
    clinicalSummary?: string;
    reasonForReferral?: string;
    investigationsDone?: string;
    currentMedications?: string;
    allergies?: string;
    vitalSigns?: string;
    expiryDate?: string;
    notes?: string;
    // External referral fields
    externalDoctorName?: string;
    externalDoctorSpeciality?: string;
    externalFacilityName?: string;
    externalFacilityAddress?: string;
    externalContactNumber?: string;
    externalEmail?: string;
}

interface ReferralCreationState {
    currentStep: number;
    selectedAppointment: AppointmentDto | null;
    referralType: ReferralType;
    selectedDoctor: Doctor | null;
    formData: ReferralFormData;
    isSubmitting: boolean;
}

const initialState: ReferralCreationState = {
    currentStep: 0,
    selectedAppointment: null,
    referralType: ReferralType.INTERNAL,
    selectedDoctor: null,
    formData: {},
    isSubmitting: false,
};

const referralCreationSlice = createSlice({
    name: "referralCreation",
    initialState,
    reducers: {
        setCurrentStep: (state, action: PayloadAction<number>) => {
            state.currentStep = action.payload;
        },
        nextStep: (state) => {
            state.currentStep += 1;
        },
        previousStep: (state) => {
            state.currentStep = Math.max(0, state.currentStep - 1);
        },
        setSelectedAppointment: (state, action: PayloadAction<AppointmentDto | null>) => {
            state.selectedAppointment = action.payload;
        },
        setReferralType: (state, action: PayloadAction<ReferralType>) => {
            state.referralType = action.payload;
            // Clear selected doctor when changing referral type
            if (action.payload === ReferralType.EXTERNAL) {
                state.selectedDoctor = null;
            }
        },
        setSelectedDoctor: (state, action: PayloadAction<Doctor | null>) => {
            state.selectedDoctor = action.payload;
        },
        updateFormData: (state, action: PayloadAction<Partial<ReferralFormData>>) => {
            state.formData = { ...state.formData, ...action.payload };
        },
        setFormData: (state, action: PayloadAction<ReferralFormData>) => {
            state.formData = action.payload;
        },
        setIsSubmitting: (state, action: PayloadAction<boolean>) => {
            state.isSubmitting = action.payload;
        },
        resetReferralCreation: () => {
            return initialState;
        },
    },
});

export const {
    setCurrentStep,
    nextStep,
    previousStep,
    setSelectedAppointment,
    setReferralType,
    setSelectedDoctor,
    updateFormData,
    setFormData,
    setIsSubmitting,
    resetReferralCreation,
} = referralCreationSlice.actions;

export default referralCreationSlice.reducer;
