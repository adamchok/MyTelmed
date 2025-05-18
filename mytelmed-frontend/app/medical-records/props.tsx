import { FamilyMember } from '@/app/props';

export interface MedicalRecord {
  id: string;
  name: string;
  type: 'medical_report' | 'prescription';
  category: 'system' | 'self-uploaded';
  fileType: string;
  uploadDate: string;
  fileSize: string;
  fileUrl: string;
  description?: string;
  permissions: {
    read: boolean;
    edit: boolean;
    download: boolean;
    share: boolean;
  };
  sharedWith: string[]; // IDs of family members
}

export type MedicalRecordPermission = 'read' | 'edit' | 'download' | 'share';
export type MedicalRecordType = 'medical_report' | 'prescription';
export type MedicalRecordCategory = 'system' | 'self-uploaded';

export interface MedicalRecordsPageProps {
  medicalRecords: MedicalRecord[];
}

export interface MedicalRecordsComponentProps {
  // Data props
  medicalRecords: MedicalRecord[];
  filteredRecords: MedicalRecord[];

  // Pagination props
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;

  // Filter props
  selectedType: MedicalRecordType | 'all';
  selectedCategory: MedicalRecordCategory | 'all';

  // Search props
  searchQuery: string;

  // Handler functions
  onUploadRecord: (record: File, type: MedicalRecordType, description?: string) => void;
  onDeleteRecord: (recordId: string) => void;
  onUpdateRecord: (recordId: string, updates: Partial<MedicalRecord>) => void;
  onUpdatePermissions: (recordId: string, permissions: Partial<MedicalRecord['permissions']>) => void;
  onShareRecord: (recordId: string, familyMemberIds: string[]) => void;

  // Filter handlers
  onTypeChange: (type: MedicalRecordType | 'all') => void;
  onCategoryChange: (category: MedicalRecordCategory | 'all') => void;
  onSearchChange: (query: string) => void;

  // Pagination handler
  onPageChange: (page: number) => void;

  // Loading state
  isLoading: boolean;

  // Family members data
  familyMembers: any[];
}

export interface RecordCardProps {
  record: MedicalRecord;
  onDelete: (recordId: string) => void;
  onUpdate: (recordId: string, updates: Partial<MedicalRecord>) => void;
  onUpdatePermissions: (recordId: string) => void;
  onShare: (recordId: string) => void;
  editable: boolean;
}

export interface RecordUploadProps {
  onUpload: (record: File, type: MedicalRecordType, description?: string) => void;
  recordType: MedicalRecordType;
  isVisible: boolean;
  onVisibleChange: (visible: boolean) => void;
}

export interface PermissionsModalProps {
  record: MedicalRecord;
  isVisible: boolean;
  onClose: () => void;
  onUpdatePermissions: (recordId: string, permissions: Partial<MedicalRecord['permissions']>) => void;
}

export interface ShareRecordModalProps {
  record: MedicalRecord;
  familyMembers: FamilyMember[];
  isVisible: boolean;
  onClose: () => void;
  onShare: (recordId: string, familyMemberIds: string[]) => void;
}
