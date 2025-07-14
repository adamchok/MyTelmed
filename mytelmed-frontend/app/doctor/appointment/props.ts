import { AppointmentDto, AppointmentStatus } from "../../api/appointment/props";
import type { Dayjs } from "dayjs";

// Patient selection option for dropdown
export interface PatientOption {
    id: string;
    name: string;
    relationship: string; // "You" for self, or actual relationship for family members
    canViewAppointments: boolean;
    canManageAppointments: boolean;
}

export type ViewMode = "calendar" | "table";

export interface AppointmentStats {
    total: number;
    today: number;
    upcoming: number;
    pending: number;
    confirmed: number;
    readyForCall: number;
    inProgress: number;
    completedToday: number;
    cancelled: number;
}

export interface AppointmentComponentProps {
    // Data
    loading: boolean;
    allAppointments: AppointmentDto[];
    filteredAppointments: AppointmentDto[];
    patientOptions: PatientOption[];
    selectedPatientId: string;
    familyLoading: boolean;

    // View state
    viewMode: ViewMode;
    calendarValue: Dayjs;
    selectedDateAppointments: AppointmentDto[];

    // Modal state
    cancelModalVisible: boolean;
    appointmentToCancel: AppointmentDto | null;
    cancelLoading: boolean;

    // Filter states
    activeTab: string;
    searchTerm: string;
    selectedStatus: AppointmentStatus | "all";
    dateRange: [Dayjs | null, Dayjs | null] | null;

    // Pagination
    currentPage: number;
    pageSize: number;

    // Statistics
    stats: AppointmentStats;

    // Event handlers
    onViewModeChange: (mode: ViewMode) => void;
    onCalendarSelect: (date: Dayjs) => void;
    onCalendarChange: (date: Dayjs) => void;
    onPatientChange: (patientId: string) => void;
    onSearchChange: (value: string) => void;
    onStatusChange: (status: AppointmentStatus | "all") => void;
    onDateRangeChange: (range: [Dayjs | null, Dayjs | null] | null) => void;
    onTabChange: (tab: string) => void;
    onPageChange: (page: number) => void;
    onViewAppointment: (appointment: AppointmentDto) => void;
    onCancelAppointment: (appointment: AppointmentDto) => void;
    onCancelModalClose: () => void;
    onCancelSubmit: (values: { reason?: string }) => void;
    onBookAppointment: () => void;
}
