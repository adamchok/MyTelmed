import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Doctor } from "@/app/api/doctor/props";
import { TimeSlotDto } from "@/app/api/timeslot/props";
import { Document } from "@/app/api/document/props";
import { FamilyMember } from "@/app/api/family/props";
import { ConsultationMode } from "@/app/api/props";

export interface AppointmentBookingState {
    // Step 1: Doctor Selection
    selectedDoctor: Doctor | null;
    doctorFilters: {
        facilityId: string;
        speciality: string;
        searchTerm: string;
        consultationMode: ConsultationMode | "all";
    };

    // Step 2: Time Slot Selection
    selectedTimeSlot: TimeSlotDto | null;
    timeSlotFilters: {
        consultationMode: ConsultationMode | "all";
        dateRange: [string, string] | null;
    };

    // Step 3: Appointment Details
    appointmentDetails: {
        patientId: string; // Self or family member ID
        patientName: string;
        isForSelf: boolean;
        patientNotes: string;
        reasonForVisit: string;
        attachedDocuments: Document[];
        documentIds: string[];
    };

    // Family members (for booking for others)
    familyMembers: FamilyMember[];

    // UI State
    currentStep: number;
    loading: boolean;
    error: string | null;

    // Booking state
    isBooking: boolean;
    bookingSuccess: boolean;
    appointmentId: string | null;
}

const initialState: AppointmentBookingState = {
    selectedDoctor: null,
    doctorFilters: {
        facilityId: "",
        speciality: "",
        searchTerm: "",
        consultationMode: "all",
    },
    selectedTimeSlot: null,
    timeSlotFilters: {
        consultationMode: "all",
        dateRange: null,
    },
    appointmentDetails: {
        patientId: "",
        patientName: "",
        isForSelf: true,
        patientNotes: "",
        reasonForVisit: "",
        attachedDocuments: [],
        documentIds: [],
    },
    familyMembers: [],
    currentStep: 0,
    loading: false,
    error: null,
    isBooking: false,
    bookingSuccess: false,
    appointmentId: null,
};

const appointmentBookingSlice = createSlice({
    name: "appointmentBooking",
    initialState,
    reducers: {
        // Navigation
        setCurrentStep(state, action: PayloadAction<number>) {
            state.currentStep = action.payload;
        },
        nextStep(state) {
            state.currentStep = Math.min(state.currentStep + 1, 4);
        },
        previousStep(state) {
            state.currentStep = Math.max(state.currentStep - 1, 0);
        },

        // Doctor Selection
        setSelectedDoctor(state, action: PayloadAction<Doctor | null>) {
            state.selectedDoctor = action.payload;
        },
        setDoctorFilters(state, action: PayloadAction<Partial<AppointmentBookingState["doctorFilters"]>>) {
            state.doctorFilters = { ...state.doctorFilters, ...action.payload };
        },
        clearDoctorFilters(state) {
            state.doctorFilters = initialState.doctorFilters;
        },

        // Time Slot Selection
        setSelectedTimeSlot(state, action: PayloadAction<TimeSlotDto | null>) {
            state.selectedTimeSlot = action.payload;
        },
        setTimeSlotFilters(state, action: PayloadAction<Partial<AppointmentBookingState["timeSlotFilters"]>>) {
            state.timeSlotFilters = { ...state.timeSlotFilters, ...action.payload };
        },
        clearTimeSlotFilters(state) {
            state.timeSlotFilters = initialState.timeSlotFilters;
        },

        // Appointment Details
        setAppointmentDetails(state, action: PayloadAction<Partial<AppointmentBookingState["appointmentDetails"]>>) {
            state.appointmentDetails = { ...state.appointmentDetails, ...action.payload };
        },
        addDocumentToAppointment(state, action: PayloadAction<Document>) {
            state.appointmentDetails.attachedDocuments.push(action.payload);
            state.appointmentDetails.documentIds.push(action.payload.id);
        },
        removeDocumentFromAppointment(state, action: PayloadAction<string>) {
            state.appointmentDetails.attachedDocuments = state.appointmentDetails.attachedDocuments.filter(
                (doc) => doc.id !== action.payload
            );
            state.appointmentDetails.documentIds = state.appointmentDetails.documentIds.filter(
                (id) => id !== action.payload
            );
        },

        // Family Members
        setFamilyMembers(state, action: PayloadAction<FamilyMember[]>) {
            state.familyMembers = action.payload;
        },

        // UI State
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        clearError(state) {
            state.error = null;
        },

        // Booking State
        setIsBooking(state, action: PayloadAction<boolean>) {
            state.isBooking = action.payload;
        },
        setBookingSuccess(state, action: PayloadAction<boolean>) {
            state.bookingSuccess = action.payload;
        },
        setAppointmentId(state, action: PayloadAction<string | null>) {
            state.appointmentId = action.payload;
        },

        // Reset
        resetBookingState(state) {
            Object.assign(state, initialState);
        },
        resetFromStep(state, action: PayloadAction<number>) {
            const step = action.payload;
            if (step <= 0) {
                state.selectedDoctor = null;
                state.doctorFilters = initialState.doctorFilters;
            }
            if (step <= 1) {
                state.selectedTimeSlot = null;
                state.timeSlotFilters = initialState.timeSlotFilters;
            }
            if (step <= 2) {
                state.appointmentDetails = initialState.appointmentDetails;
            }
            state.currentStep = step;
            state.error = null;
        },
    },
});

export const {
    setCurrentStep,
    nextStep,
    previousStep,
    setSelectedDoctor,
    setDoctorFilters,
    clearDoctorFilters,
    setSelectedTimeSlot,
    setTimeSlotFilters,
    clearTimeSlotFilters,
    setAppointmentDetails,
    addDocumentToAppointment,
    removeDocumentFromAppointment,
    setFamilyMembers,
    setLoading,
    setError,
    clearError,
    setIsBooking,
    setBookingSuccess,
    setAppointmentId,
    resetBookingState,
    resetFromStep,
} = appointmentBookingSlice.actions;

export default appointmentBookingSlice.reducer;
