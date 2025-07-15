import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppointmentDto } from "@/app/api/appointment/props";
import { CreatePrescriptionItemRequestDto } from "@/app/api/prescription/props";

export interface PrescriptionCreationState {
    // Step 1: Appointment Selection
    selectedAppointment: AppointmentDto | null;
    pastAppointments: AppointmentDto[];
    appointmentFilters: {
        patientName: string;
        dateRange: [string, string] | null;
        status: string;
    };

    // Step 2: Prescription Details
    prescriptionDetails: {
        diagnosis: string;
        notes: string;
        instructions: string;
    };

    // Step 3: Medication Management
    medications: CreatePrescriptionItemRequestDto[];
    currentMedication: CreatePrescriptionItemRequestDto | null;

    // UI State
    currentStep: number;
    loading: boolean;
    error: string | null;

    // Creation state
    isCreating: boolean;
    creationSuccess: boolean;
    createdPrescriptionId: string | null;
}

const initialState: PrescriptionCreationState = {
    selectedAppointment: null,
    pastAppointments: [],
    appointmentFilters: {
        patientName: "",
        dateRange: null,
        status: "all",
    },
    prescriptionDetails: {
        diagnosis: "",
        notes: "",
        instructions: "",
    },
    medications: [],
    currentMedication: null,
    currentStep: 0,
    loading: false,
    error: null,
    isCreating: false,
    creationSuccess: false,
    createdPrescriptionId: null,
};

const initialMedication: CreatePrescriptionItemRequestDto = {
    medicationName: "",
    genericName: "",
    dosageForm: "",
    strength: "",
    quantity: 1,
    instructions: "",
    frequency: "",
    duration: "",
    notes: "",
};

const prescriptionCreationSlice = createSlice({
    name: "prescriptionCreation",
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

        // Appointment Selection
        setSelectedAppointment(state, action: PayloadAction<AppointmentDto | null>) {
            state.selectedAppointment = action.payload;
        },
        setPastAppointments(state, action: PayloadAction<AppointmentDto[]>) {
            state.pastAppointments = action.payload;
        },
        setAppointmentFilters(state, action: PayloadAction<Partial<PrescriptionCreationState["appointmentFilters"]>>) {
            state.appointmentFilters = { ...state.appointmentFilters, ...action.payload };
        },
        clearAppointmentFilters(state) {
            state.appointmentFilters = initialState.appointmentFilters;
        },

        // Prescription Details
        setPrescriptionDetails(state, action: PayloadAction<Partial<PrescriptionCreationState["prescriptionDetails"]>>) {
            state.prescriptionDetails = { ...state.prescriptionDetails, ...action.payload };
        },

        // Medication Management
        setCurrentMedication(state, action: PayloadAction<CreatePrescriptionItemRequestDto | null>) {
            state.currentMedication = action.payload;
        },
        addMedication(state, action: PayloadAction<CreatePrescriptionItemRequestDto>) {
            state.medications.push(action.payload);
        },
        updateMedication(state, action: PayloadAction<{ index: number; medication: CreatePrescriptionItemRequestDto }>) {
            const { index, medication } = action.payload;
            if (index >= 0 && index < state.medications.length) {
                state.medications[index] = medication;
            }
        },
        removeMedication(state, action: PayloadAction<number>) {
            state.medications.splice(action.payload, 1);
        },
        clearMedications(state) {
            state.medications = [];
        },
        initializeNewMedication(state) {
            state.currentMedication = { ...initialMedication };
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

        // Creation State
        setIsCreating(state, action: PayloadAction<boolean>) {
            state.isCreating = action.payload;
        },
        setCreationSuccess(state, action: PayloadAction<boolean>) {
            state.creationSuccess = action.payload;
        },
        setCreatedPrescriptionId(state, action: PayloadAction<string | null>) {
            state.createdPrescriptionId = action.payload;
        },

        // Reset
        resetCreationState(state) {
            Object.assign(state, initialState);
        },
        resetFromStep(state, action: PayloadAction<number>) {
            const step = action.payload;
            if (step <= 0) {
                state.selectedAppointment = null;
                state.appointmentFilters = initialState.appointmentFilters;
            }
            if (step <= 1) {
                state.prescriptionDetails = initialState.prescriptionDetails;
            }
            if (step <= 2) {
                state.medications = [];
                state.currentMedication = null;
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
    setSelectedAppointment,
    setPastAppointments,
    setAppointmentFilters,
    clearAppointmentFilters,
    setPrescriptionDetails,
    setCurrentMedication,
    addMedication,
    updateMedication,
    removeMedication,
    clearMedications,
    initializeNewMedication,
    setLoading,
    setError,
    clearError,
    setIsCreating,
    setCreationSuccess,
    setCreatedPrescriptionId,
    resetCreationState,
    resetFromStep,
} = prescriptionCreationSlice.actions;

export default prescriptionCreationSlice.reducer;
