import { ReferralDto, ReferralStatus, ReferralType, ReferralPriority } from "@/app/api/referral/props";

// Legacy interface for backward compatibility (keeping the old mock data structure)
export interface Referral {
    id: string;
    type: string;
    referringDoctor: string;
    referringClinic: string;
    referralDate: string;
    expiryDate: string;
    status: "active" | "expired" | "used";
    description: string;
    specialty?: string;
    issuedFor?: string;
}

// Patient selection option for dropdown
export interface PatientOption {
    id: string;
    name: string;
    relationship: string; // "You" for self, or actual relationship for family members
    canViewReferrals: boolean;
}

// New interfaces for the actual API integration
export interface ReferralsFilterOptions {
    status?: ReferralStatus[];
    dateRange?: [string, string]; // [startDate, endDate]
    doctorName?: string;
    specialty?: string[];
    priority?: ReferralPriority[];
    referralType?: ReferralType[];
}

export interface ReferralsPageProps {
    referrals: ReferralDto[];
}

export interface ReferralsComponentProps {
    // Data props
    referrals: ReferralDto[];
    filteredReferrals: ReferralDto[];

    // Pagination props
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;

    // Filter props
    filters: ReferralsFilterOptions;
    statusOptions: { label: string; value: ReferralStatus }[];
    specialtyOptions: { label: string; value: string }[];
    priorityOptions: { label: string; value: ReferralPriority }[];
    referralTypeOptions: { label: string; value: ReferralType }[];

    // Search props
    searchQuery: string;

    // Patient selection props
    patientOptions: PatientOption[];
    selectedPatientId: string;

    // Handler functions
    onSearchChange: (query: string) => void;
    onFilterChange: (newFilters: Partial<ReferralsFilterOptions>) => void;
    onPageChange: (page: number) => void;
    onPatientChange: (patientId: string) => void;
    onRefresh: () => Promise<void>;

    // Loading state
    isLoading: boolean;
    error: string | null;
}

export interface ReferralCardProps {
    referral: ReferralDto;
    onViewDetails: (referral: ReferralDto) => void;
}

export interface ReferralDetailModalProps {
    referral: ReferralDto | null;
    isVisible: boolean;
    onClose: () => void;
}
