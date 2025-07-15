import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PrescriptionDto } from "@/app/api/prescription/props";
import { AddressDto } from "@/app/api/address/props";
import { MedicationDeliveryDto } from "@/app/api/delivery/props";

// Delivery method options
export enum DeliveryMethodOption {
    PICKUP = "PICKUP",
    HOME_DELIVERY = "HOME_DELIVERY",
}

// Delivery flow steps
export enum DeliveryStep {
    METHOD_SELECTION = 0,
    ADDRESS_SELECTION = 1,
    PAYMENT = 2,
    SUCCESS = 3,
}

// Delivery flow state interface
export interface DeliveryFlowState {
    // Current step in the flow
    currentStep: DeliveryStep;

    // Prescription being processed
    prescription: PrescriptionDto | null;

    // Selected delivery method
    selectedMethod: DeliveryMethodOption | null;

    // Address selection (for home delivery)
    selectedAddress: AddressDto | null;
    availableAddresses: AddressDto[];

    // Delivery instructions
    deliveryInstructions: string;

    // Payment state
    paymentRequired: boolean;
    paymentCompleted: boolean;

    // Final delivery object
    delivery: MedicationDeliveryDto | null;

    // Loading states
    loading: boolean;
    creatingDelivery: boolean;
    processingPayment: boolean;

    // Error handling
    error: string | null;

    // Success state
    flowCompleted: boolean;
}

// Initial state
const initialState: DeliveryFlowState = {
    currentStep: DeliveryStep.METHOD_SELECTION,
    prescription: null,
    selectedMethod: null,
    selectedAddress: null,
    availableAddresses: [],
    deliveryInstructions: "",
    paymentRequired: false,
    paymentCompleted: false,
    delivery: null,
    loading: false,
    creatingDelivery: false,
    processingPayment: false,
    error: null,
    flowCompleted: false,
};

// Delivery flow slice
const deliveryFlowSlice = createSlice({
    name: "deliveryFlow",
    initialState,
    reducers: {
        // Initialize the flow with prescription data
        initializeDeliveryFlow: (state, action: PayloadAction<PrescriptionDto>) => {
            state.prescription = action.payload;
            state.currentStep = DeliveryStep.METHOD_SELECTION;
            state.error = null;
            state.flowCompleted = false;
        },

        // Set delivery method
        setDeliveryMethod: (state, action: PayloadAction<DeliveryMethodOption>) => {
            state.selectedMethod = action.payload;
            state.paymentRequired = action.payload === DeliveryMethodOption.HOME_DELIVERY;
            state.error = null;
        },

        // Set available addresses
        setAvailableAddresses: (state, action: PayloadAction<AddressDto[]>) => {
            state.availableAddresses = action.payload;
        },

        // Set selected address
        setSelectedAddress: (state, action: PayloadAction<AddressDto>) => {
            state.selectedAddress = action.payload;
            state.error = null;
        },

        // Set delivery instructions
        setDeliveryInstructions: (state, action: PayloadAction<string>) => {
            state.deliveryInstructions = action.payload;
        },

        // Navigation actions
        nextStep: (state) => {
            if (state.currentStep < DeliveryStep.SUCCESS) {
                state.currentStep += 1;
            }
            state.error = null;
        },

        previousStep: (state) => {
            if (state.currentStep > DeliveryStep.METHOD_SELECTION) {
                state.currentStep -= 1;
            }
            state.error = null;
        },

        goToStep: (state, action: PayloadAction<DeliveryStep>) => {
            state.currentStep = action.payload;
            state.error = null;
        },

        // Loading states
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        setCreatingDelivery: (state, action: PayloadAction<boolean>) => {
            state.creatingDelivery = action.payload;
        },

        setProcessingPayment: (state, action: PayloadAction<boolean>) => {
            state.processingPayment = action.payload;
        },

        // Set created delivery
        setDelivery: (state, action: PayloadAction<MedicationDeliveryDto>) => {
            state.delivery = action.payload;
        },

        // Payment completion
        setPaymentCompleted: (state, action: PayloadAction<boolean>) => {
            state.paymentCompleted = action.payload;
            if (action.payload) {
                state.error = null;
            }
        },

        // Flow completion
        setFlowCompleted: (state, action: PayloadAction<boolean>) => {
            state.flowCompleted = action.payload;
            if (action.payload) {
                state.currentStep = DeliveryStep.SUCCESS;
                state.error = null;
            }
        },

        // Error handling
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },

        clearError: (state) => {
            state.error = null;
        },

        // Reset the entire flow
        resetDeliveryFlow: () => {
            return { ...initialState };
        },
    },
});

// Export actions
export const {
    initializeDeliveryFlow,
    setDeliveryMethod,
    setAvailableAddresses,
    setSelectedAddress,
    setDeliveryInstructions,
    nextStep,
    previousStep,
    goToStep,
    setLoading,
    setCreatingDelivery,
    setProcessingPayment,
    setDelivery,
    setPaymentCompleted,
    setFlowCompleted,
    setError,
    clearError,
    resetDeliveryFlow,
} = deliveryFlowSlice.actions;

// Export reducer
export default deliveryFlowSlice.reducer;
