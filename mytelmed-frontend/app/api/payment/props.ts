import { SearchOptions } from "../props";

// Payment Enums
export enum BillType {
    CONSULTATION = "CONSULTATION",
    MEDICATION = "MEDICATION",
}

export enum BillingStatus {
    UNPAID = "UNPAID",
    PAID = "PAID",
    CANCELLED = "CANCELLED",
}

export enum PaymentMode {
    CARD = "CARD",
    CASH = "CASH",
    BANK_TRANSFER = "BANK_TRANSFER",
}

export enum TransactionStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED",
    PARTIAL_REFUND = "PARTIAL_REFUND",
}

export enum RefundStatus {
    NOT_REFUNDED = "NOT_REFUNDED",
    REFUND_PENDING = "REFUND_PENDING",
    REFUND_PROCESSING = "REFUND_PROCESSING",
    REFUNDED = "REFUNDED",
    REFUND_FAILED = "REFUND_FAILED",
    PARTIAL_REFUND = "PARTIAL_REFUND",
}

// Payment DTOs
export interface PaymentIntentResponseDto {
    paymentIntentId: string;
    clientSecret: string;
    amount: number;
    currency: string;
    status: string;
    billId: string;
    description: string;
}

export interface ConfirmPaymentRequestDto {
    paymentIntentId: string;
    paymentMethodId: string;
}

export interface BillDto {
    id: string;
    billNumber: string;
    amount: number;
    patientId: string;
    patientName: string;
    billType: BillType;
    billingStatus: BillingStatus;
    paymentMode?: PaymentMode;
    appointmentId?: string;
    prescriptionId?: string;
    description: string;
    receiptUrl?: string;
    billedAt: string;
    paidAt?: string;
    cancelledAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentTransactionDto {
    id: string;
    transactionNumber: string;
    billId: string;
    patientId: string;
    patientName: string;
    amount: number;
    paymentMode: PaymentMode;
    status: TransactionStatus;
    currency: string;
    failureReason?: string;
    processedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Refund DTOs
export interface RefundRequestDto {
    reason: string;
}

export interface RefundResponseDto {
    successful: boolean;
    message: string;
    stripeRefundId?: string;
    refundAmount?: number;
}

export interface RefundStatusDto {
    hasPayment: boolean;
    refundEligible: boolean;
    refundStatus?: RefundStatus;
    refundAmount?: number;
    refundableAmount?: number;
    stripeRefundId?: string;
    refundedAt?: string;
    message: string;
}

// Request DTOs
export interface CreatePaymentIntentRequestDto {
    amount: number;
    currency?: string;
    description?: string;
    appointmentId?: string;
    prescriptionId?: string;
}

// Payment search/filter options
export type PaymentSearchOptions = SearchOptions & {
    sortBy?: string;
    sortDir?: "asc" | "desc";
};
