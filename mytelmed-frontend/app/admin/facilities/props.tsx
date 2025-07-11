import { Facility, FacilityType } from "../../api/facility/props";
import { Form } from "antd";

export interface FacilityManagementComponentProps {
    // Data props
    facilities: Facility[];
    loading: boolean;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
    };

    // Modal states
    createModalVisible: boolean;
    editModalVisible: boolean;
    viewModalVisible: boolean;
    imageUploadModalVisible: boolean;
    createLoading: boolean;
    editLoading: boolean;
    imageUploadLoading: boolean;
    selectedFacility: Facility | null;

    // Search and filter
    searchTerm: string;
    selectedState: string | undefined;
    selectedType: string | undefined;
    filteredFacilities: Facility[];

    // Forms
    createForm: ReturnType<typeof Form.useForm>[0];
    editForm: ReturnType<typeof Form.useForm>[0];

    // Handlers
    onCreateFacility: () => Promise<void>;
    onUpdateFacility: () => Promise<void>;
    onImageUpload: (file: File) => Promise<void>;
    onPaginationChange: (page: number, pageSize: number) => void;
    onSearchChange: (value: string) => void;
    onStateFilterChange: (value: string | undefined) => void;
    onTypeFilterChange: (value: string | undefined) => void;

    // Modal handlers
    onCreateModalOpen: () => void;
    onCreateModalClose: () => void;
    onViewModalOpen: (facility: Facility) => void;
    onViewModalClose: () => void;
    onEditModalOpen: (facility: Facility) => void;
    onEditModalClose: () => void;
    onImageUploadModalOpen: (facility: Facility) => void;
    onImageUploadModalClose: () => void;
}

// Malaysian states for the facility form
export const MALAYSIAN_STATES = [
    "Johor",
    "Kedah",
    "Kelantan",
    "Kuala Lumpur",
    "Labuan",
    "Malacca",
    "Negeri Sembilan",
    "Pahang",
    "Penang",
    "Perak",
    "Perlis",
    "Putrajaya",
    "Sabah",
    "Sarawak",
    "Selangor",
    "Terengganu",
];

export const FACILITY_TYPES = [
    { label: "Hospital", value: FacilityType.HOSPITAL },
    { label: "Clinic", value: FacilityType.CLINIC },
];
