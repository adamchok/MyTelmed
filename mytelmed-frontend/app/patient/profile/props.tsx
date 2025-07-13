import { Patient } from "@/app/api/patient/props";
import { AddressDto } from "@/app/api/address/props";

export interface ProfileComponentProps {
    // Data
    patient: Patient | null;

    // State
    isEditing: boolean;
    loading: boolean;
    saving: boolean;
    uploadingImage: boolean;
    error: string | null;

    // Address Management
    addresses: AddressDto[];
    addressLoading: boolean;
    addressError: string | null;
    modalVisible: boolean;
    editingAddress: AddressDto | null;
    submitting: boolean;
    deletingAddressId: string | null;

    // Handlers
    onToggleEditMode: () => void;
    onCancelEdit: () => void;
    onUpdateProfile: (values: any) => Promise<void>;
    onImageUpload: (file: File) => Promise<void>;
    onClearError: () => void;
    onRetry: () => Promise<void>;

    // Address Handlers
    onAddAddress: () => void;
    onEditAddress: (address: AddressDto) => void;
    onDeleteAddress: (addressId: string) => Promise<void>;
    onSubmitAddress: (values: any) => Promise<void>;
    onCancelModal: () => void;
    onClearAddressError: () => void;
}

export default ProfileComponentProps;
