import { BillDto, BillType, BillingStatus } from "@/app/api/payment/props";

export interface BillingStats {
    totalBills: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    paidBills: number;
    unpaidBills: number;
}

export interface PatientOption {
    value: string;
    label: string;
}

export interface BillingComponentProps {
    bills: BillDto[];
    stats: BillingStats;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    searchQuery: string;
    selectedPatientId: string;
    selectedBillType: BillType | "ALL";
    selectedStatus: BillingStatus | "ALL";
    dateRange: [string, string] | null;
    sortBy: string;
    sortDir: "desc" | "asc" | undefined;
    patientOptions: PatientOption[];
    isViewingOwnBills: boolean;
    isLoading: boolean;
    error: string | null;
    onSearchChange: (value: string) => void;
    onPatientChange: (patientId: string) => void;
    onBillTypeChange: (billType: BillType | "ALL") => void;
    onStatusChange: (status: BillingStatus | "ALL") => void;
    onDateRangeChange: (range: [string, string] | null) => void;
    onSortChange: (sortBy: string, sortDir: string) => void;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
    onClearFilters: () => void;
}

export interface BillCardProps {
    bill: BillDto;
    showPatientInfo: boolean;
}

export interface BillDetailModalProps {
    bill: BillDto | null;
    visible: boolean;
    onClose: () => void;
} 