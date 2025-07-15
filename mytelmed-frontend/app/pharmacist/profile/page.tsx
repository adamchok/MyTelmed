"use client";

import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { useDispatch } from "react-redux";
import PharmacistApi from "@/app/api/pharmacist";
import { Pharmacist, UpdatePharmacistProfileRequest } from "@/app/api/pharmacist/props";
import { updateProfileInfo } from "@/lib/reducers/profile-reducer";
import ProfilePageComponent from "./component";
import { ProfileComponentProps } from "./props";

interface ProfileData {
    pharmacist: Pharmacist | null;
    isEditing: boolean;
    loading: boolean;
    saving: boolean;
    uploadingImage: boolean;
    error: string | null;
    success: string | null;
}

const Profile = () => {
    const dispatch = useDispatch();
    const [profileData, setProfileData] = useState<ProfileData>({
        pharmacist: null,
        isEditing: false,
        loading: true,
        saving: false,
        uploadingImage: false,
        error: null,
        success: null,
    });

    // Fetch doctor profile
    const fetchProfile = useCallback(async () => {
        try {
            setProfileData((prev) => ({ ...prev, loading: true, error: null }));
            const response = await PharmacistApi.getPharmacistProfile();

            if (response.data?.isSuccess && response.data.data) {
                const pharmacist = response.data.data;
                setProfileData((prev) => ({ ...prev, pharmacist }));

                // Dispatch profile info to Redux store
                dispatch(
                    updateProfileInfo({
                        name: pharmacist.name,
                        email: pharmacist.email,
                        profileImageUrl: pharmacist.profileImageUrl,
                    })
                );
            } else {
                setProfileData((prev) => ({
                    ...prev,
                    error: "Failed to load profile data",
                }));
            }
        } catch (err: any) {
            console.error("Failed to fetch profile:", err);
            setProfileData((prev) => ({
                ...prev,
                error: err.response?.data?.message || "Failed to load profile data",
            }));
        } finally {
            setProfileData((prev) => ({ ...prev, loading: false }));
        }
    }, [dispatch]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Handle profile update
    const handleUpdateProfile = useCallback(
        async (values: any) => {
            try {
                setProfileData((prev) => ({ ...prev, saving: true, error: null, success: null }));

                const updateData: UpdatePharmacistProfileRequest = {
                    name: values.name,
                    email: values.email,
                    phone: values.phone,
                    dateOfBirth: values.dateOfBirth?.format("YYYY-MM-DD") || "",
                    gender: values.gender || "",
                };

                const response = await PharmacistApi.updatePharmacistProfile(updateData);

                if (response.data?.isSuccess) {
                    setProfileData((prev) => ({
                        ...prev,
                        isEditing: false,
                        success: "Profile updated successfully",
                    }));

                    // Refresh profile data
                    await fetchProfile();

                    message.success("Profile updated successfully");
                } else {
                    setProfileData((prev) => ({
                        ...prev,
                        error: "Failed to update profile",
                    }));
                }
            } catch (err: any) {
                console.error("Failed to update profile:", err);
                setProfileData((prev) => ({
                    ...prev,
                    error: err.response?.data?.message || "Failed to update profile",
                }));
            } finally {
                setProfileData((prev) => ({ ...prev, saving: false }));
            }
        },
        [fetchProfile]
    );

    // Handle image upload
    const handleImageUpload = async (file: File) => {
        try {
            setProfileData((prev) => ({ ...prev, uploadingImage: true, error: null }));

            const response = await PharmacistApi.updatePharmacistProfileImage(file);

            if (response.data?.isSuccess) {
                setProfileData((prev) => ({
                    ...prev,
                    success: "Profile image updated successfully",
                }));

                // Refresh profile data to get the new image URL
                await fetchProfile();

                message.success("Profile image updated successfully");
            } else {
                setProfileData((prev) => ({
                    ...prev,
                    error: "Failed to upload image",
                }));
            }
        } catch (err: any) {
            console.error("Failed to upload image:", err);
            setProfileData((prev) => ({
                ...prev,
                error: err.response?.data?.message || "Failed to upload image",
            }));
        } finally {
            setProfileData((prev) => ({ ...prev, uploadingImage: false }));
        }
    };

    // Handle edit mode toggle
    const handleToggleEditMode = useCallback(() => {
        setProfileData((prev) => ({
            ...prev,
            isEditing: !prev.isEditing,
            error: null,
            success: null,
        }));
    }, []);

    // Handle cancel edit
    const handleCancelEdit = useCallback(() => {
        setProfileData((prev) => ({
            ...prev,
            isEditing: false,
            error: null,
            success: null,
        }));
    }, []);

    // Handle clear error
    const handleClearError = useCallback(() => {
        setProfileData((prev) => ({ ...prev, error: null }));
    }, []);

    // Prepare props for component
    const componentProps: ProfileComponentProps = {
        pharmacist: profileData.pharmacist,
        isEditing: profileData.isEditing,
        loading: profileData.loading,
        saving: profileData.saving,
        uploadingImage: profileData.uploadingImage,
        error: profileData.error,
        onToggleEditMode: handleToggleEditMode,
        onCancelEdit: handleCancelEdit,
        onUpdateProfile: handleUpdateProfile,
        onImageUpload: handleImageUpload,
        onClearError: handleClearError,
        onRetry: fetchProfile,
    };

    return <ProfilePageComponent {...componentProps} />;
};

export default Profile;
