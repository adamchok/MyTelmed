import { Admin } from "@/app/api/admin/props";

export interface ProfileComponentProps {
    // Data
    admin: Admin | null;

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
