import { Pharmacist } from "../pharmacist/props";
import { Patient } from "../patient/props";
import { Doctor } from "../doctor/props";
import { SearchOptions } from "../props";

// Delivery Enums
export enum DeliveryMethod {
    PICKUP = "PICKUP",
    HOME_DELIVERY = "HOME_DELIVERY",
}

export enum DeliveryStatus {
    PENDING_PAYMENT = "PENDING_PAYMENT",
    PAID = "PAID",
    PREPARING = "PREPARING",
    PENDING_PICKUP = "PENDING_PICKUP",
    READY_FOR_PICKUP = "READY_FOR_PICKUP",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
}

// Related DTOs (simplified versions for delivery context)
export interface PrescriptionDto {
    id: string;
    prescriptionNumber: string;
    appointment: AppointmentDto;
    pharmacist?: Pharmacist;
    diagnosis: string;
    notes?: string;
    instructions: string;
    status: string;
    expiryDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface AppointmentDto {
    id: string;
    patient: Patient;
    doctor: Doctor;
    appointmentDateTime: string;
    durationMinutes: number;
    status: string;
    consultationMode: string;
    patientNotes?: string;
    doctorNotes?: string;
    reasonForVisit?: string;
    cancellationReason?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Main Delivery DTO
export interface MedicationDeliveryDto {
    id: string;
    prescription: PrescriptionDto;
    deliveryMethod: DeliveryMethod;
    status: DeliveryStatus;
    deliveryInstructions?: string;
    deliveryFee: number;
    estimatedDeliveryDate?: string;
    actualDeliveryDate?: string;
    pickupDate?: string;
    trackingReference?: string;
    courierName?: string;
    deliveryContactPhone?: string;
    deliveryNotes?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;
}

// Simple Delivery DTO (without prescription details to avoid circular dependency)
export interface MedicationDeliverySimpleDto {
    id: string;
    deliveryMethod: DeliveryMethod;
    status: DeliveryStatus;
    deliveryInstructions?: string;
    deliveryFee: number;
    estimatedDeliveryDate?: string;
    actualDeliveryDate?: string;
    pickupDate?: string;
    trackingReference?: string;
    courierName?: string;
    deliveryContactPhone?: string;
    deliveryNotes?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;
}

// Request DTOs
export interface ChoosePickupRequestDto {
    prescriptionId: string;
}

export interface ChooseHomeDeliveryRequestDto {
    prescriptionId: string;
    addressId: string;
    deliveryInstructions?: string;
}

export interface MarkOutForDeliveryRequestDto {
    deliveryId: string;
    courierName: string;
    trackingReference: string;
    contactPhone?: string;
}

export interface CancelDeliveryRequestDto {
    deliveryId: string;
    reason: string;
}

// Delivery search/filter options
export type DeliverySearchOptions = SearchOptions;
