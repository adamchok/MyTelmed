export interface Referral {
  id: string;
  type: string;
  referringDoctor: string;
  referringClinic: string;
  referralDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'used';
  description: string;
  specialty?: string;
  issuedFor?: string;
}

export interface ReferralsFilterOptions {
  status?: ('active' | 'expired' | 'used')[];
  dateRange?: [string, string]; // [startDate, endDate]
  doctorName?: string;
  specialty?: string;
}

export interface ReferralsPageProps {
  referrals: Referral[];
}

export interface ReferralsComponentProps {
  // Data props
  referrals: Referral[];
  filteredReferrals: Referral[];

  // Pagination props
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;

  // Filter props
  filters: ReferralsFilterOptions;
  statusOptions: { label: string; value: 'active' | 'expired' | 'used' }[];
  specialtyOptions: { label: string; value: string }[];

  // Search props
  searchQuery: string;

  // Handler functions
  onSearchChange: (query: string) => void;
  onFilterChange: (newFilters: Partial<ReferralsFilterOptions>) => void;
  onPageChange: (page: number) => void;

  // Loading state
  isLoading: boolean;
}

export interface ReferralCardProps {
  referral: Referral;
  onViewDetails: (referral: Referral) => void;
}

export interface ReferralDetailModalProps {
  referral: Referral | null;
  isVisible: boolean;
  onClose: () => void;
} 