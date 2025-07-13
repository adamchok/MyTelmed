"use client";

import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { useDispatch } from "react-redux";
import PatientApi from "@/app/api/patient";
import { Patient, UpdatePatientProfileRequest } from "@/app/api/patient/props";
import { updateProfileInfo } from "@/lib/reducers/profile-reducer";
import AddressApi from "@/app/api/address";
import { AddressDto, RequestAddressDto } from "@/app/api/address/props";
import ProfilePageComponent from "./component";
import { ProfileComponentProps } from "./props";

interface ProfileData {
    patient: Patient | null;
    isEditing: boolean;
    loading: boolean;
    saving: boolean;
    uploadingImage: boolean;
    error: string | null;
    success: string | null;
}

interface AddressData {
    addresses: AddressDto[];
    loading: boolean;
    error: string | null;
    modalVisible: boolean;
    editingAddress: AddressDto | null;
    submitting: boolean;
    deletingAddressId: string | null;
}

const Profile = () => {
    const dispatch = useDispatch();
    const [profileData, setProfileData] = useState<ProfileData>({
        patient: null,
        isEditing: false,
        loading: true,
        saving: false,
        uploadingImage: false,
        error: null,
        success: null,
    });

    const [addressData, setAddressData] = useState<AddressData>({
        addresses: [],
        loading: false,
        error: null,
        modalVisible: false,
        editingAddress: null,
        submitting: false,
        deletingAddressId: null,
    });

    // Fetch patient profile
    const fetchProfile = useCallback(async () => {
        try {
            setProfileData((prev) => ({ ...prev, loading: true, error: null }));
            const response = await PatientApi.getPatientProfile();

            if (response.data?.isSuccess && response.data.data) {
                const patient = response.data.data;
                setProfileData((prev) => ({ ...prev, patient }));

                // Dispatch profile info to Redux store
                dispatch(
                    updateProfileInfo({
                        name: patient.name,
                        email: patient.email,
                        profileImageUrl: patient.profileImageUrl,
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

                const updateData: UpdatePatientProfileRequest = {
                    name: values.name,
                    email: values.email,
                    phone: values.phone,
                    dateOfBirth: values.dateOfBirth?.format("YYYY-MM-DD") || "",
                    gender: values.gender,
                };

                const response = await PatientApi.updatePatientProfile(updateData);

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

            const response = await PatientApi.uploadPatientProfileImage(file);

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

    // Fetch addresses
    const fetchAddresses = useCallback(async () => {
        try {
            setAddressData((prev) => ({ ...prev, loading: true, error: null }));
            const response = await AddressApi.getAddressesByPatientAccount();

            if (response.data?.isSuccess && response.data.data) {
                setAddressData((prev) => ({ ...prev, addresses: response.data.data || [] }));
            } else {
                setAddressData((prev) => ({
                    ...prev,
                    error: "Failed to load addresses",
                }));
            }
        } catch (err: any) {
            console.error("Failed to fetch addresses:", err);
            setAddressData((prev) => ({
                ...prev,
                error: err.response?.data?.message || "Failed to load addresses",
            }));
        } finally {
            setAddressData((prev) => ({ ...prev, loading: false }));
        }
    }, []);

    // Load addresses on component mount
    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    // Handle add address
    const handleAddAddress = useCallback(() => {
        setAddressData((prev) => ({
            ...prev,
            modalVisible: true,
            editingAddress: null,
            error: null,
        }));
    }, []);

    // Handle edit address
    const handleEditAddress = useCallback((address: AddressDto) => {
        setAddressData((prev) => ({
            ...prev,
            modalVisible: true,
            editingAddress: address,
            error: null,
        }));
    }, []);

    // Handle delete address
    const handleDeleteAddress = useCallback(
        async (addressId: string) => {
            try {
                setAddressData((prev) => ({ ...prev, deletingAddressId: addressId }));
                const response = await AddressApi.deleteAddressById(addressId);

                if (response.data?.isSuccess) {
                    message.success("Address deleted successfully");
                    await fetchAddresses();
                } else {
                    setAddressData((prev) => ({
                        ...prev,
                        error: "Failed to delete address",
                    }));
                }
            } catch (err: any) {
                console.error("Failed to delete address:", err);
                setAddressData((prev) => ({
                    ...prev,
                    error: err.response?.data?.message || "Failed to delete address",
                }));
            } finally {
                setAddressData((prev) => ({ ...prev, deletingAddressId: null }));
            }
        },
        [fetchAddresses]
    );

    // Handle submit address
    const handleSubmitAddress = useCallback(
        async (values: RequestAddressDto) => {
            try {
                setAddressData((prev) => ({ ...prev, submitting: true, error: null }));

                // Final validation and cleaning of postcode before sending to backend
                const cleanedValues = {
                    ...values,
                    postcode: values.postcode ? values.postcode.replace(/\D/g, "").slice(0, 5) : values.postcode,
                };

                // Additional validation to ensure postcode is exactly 5 digits
                if (
                    !cleanedValues.postcode ||
                    cleanedValues.postcode.length !== 5 ||
                    !/^\d{5}$/.test(cleanedValues.postcode)
                ) {
                    throw new Error("Postcode must be exactly 5 digits");
                }

                console.log("Sending address data to backend:", cleanedValues);

                if (addressData.editingAddress) {
                    // Update existing address
                    const response = await AddressApi.updateAddressById(addressData.editingAddress.id, cleanedValues);
                    if (response.data?.isSuccess) {
                        message.success("Address updated successfully");
                    } else {
                        throw new Error("Failed to update address");
                    }
                } else {
                    // Create new address
                    const response = await AddressApi.createAddressByAccount(cleanedValues);
                    if (response.data?.isSuccess) {
                        message.success("Address added successfully");
                    } else {
                        throw new Error("Failed to add address");
                    }
                }

                setAddressData((prev) => ({
                    ...prev,
                    modalVisible: false,
                    editingAddress: null,
                }));
                await fetchAddresses();
            } catch (err: any) {
                console.error("Failed to submit address:", err);
                setAddressData((prev) => ({
                    ...prev,
                    error: err.response?.data?.message || err.message || "Failed to submit address",
                }));
            } finally {
                setAddressData((prev) => ({ ...prev, submitting: false }));
            }
        },
        [addressData.editingAddress, fetchAddresses]
    );

    // Handle cancel modal
    const handleCancelModal = useCallback(() => {
        setAddressData((prev) => ({
            ...prev,
            modalVisible: false,
            editingAddress: null,
            error: null,
        }));
    }, []);

    // Handle clear address error
    const handleClearAddressError = useCallback(() => {
        setAddressData((prev) => ({ ...prev, error: null }));
    }, []);

    // Prepare props for component
    const componentProps: ProfileComponentProps = {
        patient: profileData.patient,
        isEditing: profileData.isEditing,
        loading: profileData.loading,
        saving: profileData.saving,
        uploadingImage: profileData.uploadingImage,
        error: profileData.error,
        addresses: addressData.addresses,
        addressLoading: addressData.loading,
        addressError: addressData.error,
        modalVisible: addressData.modalVisible,
        editingAddress: addressData.editingAddress,
        submitting: addressData.submitting,
        deletingAddressId: addressData.deletingAddressId,
        onToggleEditMode: handleToggleEditMode,
        onCancelEdit: handleCancelEdit,
        onUpdateProfile: handleUpdateProfile,
        onImageUpload: handleImageUpload,
        onClearError: handleClearError,
        onRetry: fetchProfile,
        onAddAddress: handleAddAddress,
        onEditAddress: handleEditAddress,
        onDeleteAddress: handleDeleteAddress,
        onSubmitAddress: handleSubmitAddress,
        onCancelModal: handleCancelModal,
        onClearAddressError: handleClearAddressError,
    };

    return <ProfilePageComponent {...componentProps} />;
};

export default Profile;
