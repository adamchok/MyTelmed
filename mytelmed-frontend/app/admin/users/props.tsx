import { Admin } from "../../api/admin/props";
import { Doctor } from "../../api/doctor/props";
import { Pharmacist } from "../../api/pharmacist/props";
import { Patient } from "../../api/patient/props";
import { Facility } from "../../api/facility/props";
import { Form } from "antd";

export type UserType = "admin" | "doctor" | "pharmacist" | "patient";

export interface TabData {
    users: (Admin | Doctor | Pharmacist | Patient)[];
    loading: boolean;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
    };
}

export interface UserManagementComponentProps {
    // Data props
    activeTab: UserType;
    tabData: Record<UserType, TabData>;
    facilities: Facility[];

    // Modal states
    createModalVisible: boolean;
    createLoading: boolean;
    editModalVisible: boolean;
    editLoading: boolean;
    imageUploadModalVisible: boolean;
    selectedUserId: string;
    imageUploadLoading: boolean;

    // Form
    form: ReturnType<typeof Form.useForm>[0];
    editForm: ReturnType<typeof Form.useForm>[0];

    // Handlers
    onTabChange: (userType: UserType) => void;
    onCreateUser: () => Promise<void>;
    onEditUser: () => Promise<void>;
    onResetPassword: (userId: string) => Promise<void>;
    onActivateUser: (userId: string) => Promise<void>;
    onDeactivateUser: (userId: string) => Promise<void>;
    onUploadImage: (userId: string) => Promise<void>;
    onDeleteUser: (userId: string) => Promise<void>;
    onImageUpload: (file: File) => Promise<void>;
    onPaginationChange: (userType: UserType, page: number, pageSize: number) => void;

    // Modal handlers
    onCreateModalOpen: () => void;
    onCreateModalClose: () => void;
    onEditModalOpen: (user: any) => void;
    onEditModalClose: () => void;
    onImageUploadModalClose: () => void;
}
