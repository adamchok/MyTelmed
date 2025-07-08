import { Appointment, AppointmentDocument, AppointmentStatus, PatientSymptom } from '../props';

export interface AppointmentFilterOptions {
  status?: AppointmentStatus[];
  patientId?: string;
  dateRange?: [string, string]; // [startDate, endDate]
  doctorName?: string;
  facility?: string;
}

export interface AppointmentManagementPageProps {
  appointments: Appointment[];
}

export interface AppointmentComponentProps {
  // Data props
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];

  // Pagination props
  upcomingCurrentPage: number;
  upcomingTotalPages: number;
  pastCurrentPage: number;
  pastTotalPages: number;

  // Filter props
  filters: AppointmentFilterOptions;
  statusOptions: { label: string; value: AppointmentStatus }[];
  patientOptions: { label: string; value: string }[];

  // Search props
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // Handler functions
  onCancelAppointment: (appointmentId: string) => void;
  onRescheduleAppointment: (appointment: Appointment, newDate: string, newTime: string) => void;
  onUpdateAppointmentDetails: (
    appointmentId: string,
    updateData: {
      symptoms?: PatientSymptom[];
      reason?: string;
      notes?: string;
    }
  ) => void;
  onAddDocument: (appointmentId: string, document: AppointmentDocument) => void;
  onRemoveDocument: (appointmentId: string, documentId: string) => void;
  onShareAppointment?: (appointment: Appointment) => void;

  // Pagination handlers
  onUpcomingPageChange: (page: number) => void;
  onPastPageChange: (page: number) => void;

  // Filter handlers
  onFilterChange: (newFilters: Partial<AppointmentFilterOptions>) => void;

  // Loading state
  isLoading: boolean;
}

export interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: (appointmentId: string) => void;
  onReschedule: (appointment: Appointment) => void;
  onUpdateDetails: (appointment: Appointment) => void;
  onShare: (appointment: Appointment) => void;
  showActions: boolean;
}

export interface RescheduleModalProps {
  appointment: Appointment | null;
  isVisible: boolean;
  onClose: () => void;
  onReschedule: (appointment: Appointment, newDate: string, newTime: string) => void;
  availableTimes: string[];
}

export interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  isVisible: boolean;
  onClose: () => void;
  onUpdateDetails: (
    appointmentId: string,
    updateData: {
      symptoms?: PatientSymptom[];
      reason?: string;
      notes?: string;
    }
  ) => void;
  onAddDocument: (appointmentId: string, document: AppointmentDocument) => void;
  onRemoveDocument: (appointmentId: string, documentId: string) => void;
}

export interface ShareAppointmentModalProps {
  appointment: Appointment | null;
  isVisible: boolean;
  onClose: () => void;
}

export interface SymptomItemProps {
  symptom: PatientSymptom;
  onEdit?: (symptom: PatientSymptom) => void;
  onDelete?: (symptomId: string) => void;
  readOnly?: boolean;
}

export interface DocumentItemProps {
  document: AppointmentDocument;
  onRemove?: (documentId: string) => void;
  readOnly?: boolean;
} 