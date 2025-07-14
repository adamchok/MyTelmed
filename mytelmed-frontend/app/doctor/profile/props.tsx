import { Doctor } from "@/app/api/doctor/props";

export interface ProfileComponentProps {
    // Data
    doctor: Doctor | null;

    // State
    isEditing: boolean;
    loading: boolean;
    saving: boolean;
    uploadingImage: boolean;
    error: string | null;

    // Handlers
    onToggleEditMode: () => void;
    onCancelEdit: () => void;
    onUpdateProfile: (values: any) => Promise<void>;
    onImageUpload: (file: File) => Promise<void>;
    onClearError: () => void;
    onRetry: () => Promise<void>;
}

export default ProfileComponentProps;
