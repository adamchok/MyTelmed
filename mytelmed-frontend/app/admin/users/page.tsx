"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Form, message, Modal } from "antd";
import { ExclamationCircleOutlined, CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import AdminApi from "../../api/admin";
import { CreateAdminRequest, UpdateAdminRequest } from "../../api/admin/props";
import DoctorApi from "../../api/doctor";
import { CreateDoctorRequest, UpdateDoctorRequest } from "../../api/doctor/props";
import PharmacistApi from "../../api/pharmacist";
import { CreatePharmacistRequest, UpdatePharmacistRequest } from "../../api/pharmacist/props";
import PatientApi from "../../api/patient";
import FacilityApi from "../../api/facility";
import { Facility } from "../../api/facility/props";
import UserManagementComponent from "./component";
import { UserType, TabData } from "./props";

const { confirm } = Modal;

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState<UserType>("admin");
    const [tabData, setTabData] = useState<Record<UserType, TabData>>({
        admin: { users: [], loading: true, pagination: { current: 1, pageSize: 10, total: 0 } },
        doctor: { users: [], loading: true, pagination: { current: 1, pageSize: 10, total: 0 } },
        pharmacist: { users: [], loading: true, pagination: { current: 1, pageSize: 10, total: 0 } },
        patient: { users: [], loading: true, pagination: { current: 1, pageSize: 10, total: 0 } },
    });
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [imageUploadModalVisible, setImageUploadModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [imageUploadLoading, setImageUploadLoading] = useState(false);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    const loadUsers = useCallback(async (userType: UserType, page = 1, pageSize = 10) => {
        setTabData((prev) => ({
            ...prev,
            [userType]: { ...prev[userType], loading: true },
        }));

        try {
            let response;
            switch (userType) {
                case "admin":
                    response = await AdminApi.getAllAdmins(page - 1, pageSize);
                    break;
                case "doctor":
                    response = await DoctorApi.getDoctors(page - 1, pageSize);
                    break;
                case "pharmacist":
                    response = await PharmacistApi.getAllPharmacists({ page: page - 1, pageSize });
                    break;
                case "patient":
                    response = await PatientApi.getAllPatients({ page: page - 1, pageSize });
                    break;
            }

            if (response.data.isSuccess && response.data.data) {
                const { content, totalElements } = response.data.data;
                setTabData((prev) => ({
                    ...prev,
                    [userType]: {
                        users: content,
                        loading: false,
                        pagination: {
                            current: page,
                            pageSize,
                            total: totalElements,
                        },
                    },
                }));
            }
        } catch {
            message.error(`Failed to load ${userType}s`);
            setTabData((prev) => ({
                ...prev,
                [userType]: { ...prev[userType], loading: false },
            }));
        }
    }, []);

    const loadFacilities = useCallback(async () => {
        const response = await FacilityApi.findAllFacilities();
        if (response.data.isSuccess && response.data.data) {
            setFacilities(response.data.data);
        }
    }, []);

    useEffect(() => {
        loadUsers(activeTab);
        loadFacilities();
    }, [activeTab, loadUsers, loadFacilities]);

    const handleCreateUser = async () => {
        try {
            const values = await form.validateFields();
            setCreateLoading(true);

            let response = undefined;
            switch (activeTab) {
                case "admin": {
                    const adminData: CreateAdminRequest = {
                        name: values.name,
                        nric: values.nric,
                        email: values.email,
                        phone: values.phone,
                    };
                    response = await AdminApi.createAdmin(adminData);
                    break;
                }
                case "doctor": {
                    const doctorData: CreateDoctorRequest = {
                        name: values.name,
                        nric: values.nric,
                        email: values.email,
                        phone: values.phone,
                        dateOfBirth: values.dateOfBirth.format("DD/MM/YYYY"),
                        gender: values.gender,
                        facilityId: values.facilityId,
                        specialityList: values.specialityList,
                        languageList: values.languageList,
                        qualifications: values.qualifications,
                    };
                    response = await DoctorApi.createDoctor(doctorData);
                    break;
                }
                case "pharmacist": {
                    const pharmacistData: CreatePharmacistRequest = {
                        name: values.name,
                        nric: values.nric,
                        email: values.email,
                        phone: values.phone,
                        dateOfBirth: values.dateOfBirth.format("DD/MM/YYYY"),
                        gender: values.gender,
                        facilityId: values.facilityId,
                    };
                    response = await PharmacistApi.createPharmacist(pharmacistData);
                    break;
                }
            }

            if (!response) {
                message.error(`Failed to create ${activeTab}`);
                setCreateLoading(false);
                return;
            }

            const responseData = response.data;

            console.log("Response data:", responseData);

            if (responseData.isSuccess) {
                message.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} created successfully`);
                setCreateModalVisible(false);
                form.resetFields();
                setCreateLoading(false);
                loadUsers(activeTab);
            } else {
                message.error(responseData.message);
                setCreateLoading(false);
            }
        } catch {
            message.error(`Failed to create ${activeTab}`);
            setCreateLoading(false);
        }
    };

    const handleEditUser = async () => {
        try {
            const values = await editForm.validateFields();
            setEditLoading(true);

            if (!selectedUser) {
                message.error("No user selected for editing");
                setEditLoading(false);
                return;
            }

            let response = undefined;
            switch (activeTab) {
                case "admin": {
                    const adminData: UpdateAdminRequest = {
                        name: values.name,
                        nric: values.nric,
                        email: values.email,
                        phone: values.phone,
                    };
                    response = await AdminApi.updateAdmin(selectedUser.id, adminData);
                    break;
                }
                case "doctor": {
                    const doctorData: UpdateDoctorRequest = {
                        name: values.name,
                        nric: values.nric,
                        email: values.email,
                        phone: values.phone,
                        dateOfBirth: values.dateOfBirth.format("DD/MM/YYYY"),
                        gender: values.gender,
                        facilityId: values.facilityId,
                        specialityList: values.specialityList,
                        languageList: values.languageList,
                        qualifications: values.qualifications,
                    };
                    response = await DoctorApi.updateDoctor(selectedUser.id, doctorData);
                    break;
                }
                case "pharmacist": {
                    const pharmacistData: UpdatePharmacistRequest = {
                        name: values.name,
                        nric: values.nric,
                        email: values.email,
                        phone: values.phone,
                        dateOfBirth: values.dateOfBirth.format("DD/MM/YYYY"),
                        gender: values.gender,
                        facilityId: values.facilityId,
                    };
                    response = await PharmacistApi.updatePharmacist(selectedUser.id, pharmacistData);
                    break;
                }
            }

            if (!response) {
                message.error(`Failed to update ${activeTab}`);
                setEditLoading(false);
                return;
            }

            const responseData = response.data;

            if (responseData.isSuccess) {
                message.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} updated successfully`);
                setEditModalVisible(false);
                editForm.resetFields();
                setSelectedUser(null);
                setEditLoading(false);
                loadUsers(activeTab);
            } else {
                message.error(`Failed to update ${activeTab}`);
                setEditLoading(false);
            }
        } catch {
            message.error(`Failed to update ${activeTab}`);
            setEditLoading(false);
        }
    };

    const handleResetPassword = async (userId: string) => {
        confirm({
            title: "Reset Password",
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to reset this ${activeTab}'s password? A new password will be generated and sent to their email.`,
            onOk: async () => {
                try {
                    let response = undefined;
                    switch (activeTab) {
                        case "admin":
                            response = await AdminApi.resetAdminPassword(userId);
                            break;
                        case "doctor":
                            response = await DoctorApi.resetDoctorPassword(userId);
                            break;
                        case "pharmacist":
                            response = await PharmacistApi.resetPharmacistPassword(userId);
                            break;
                        case "patient":
                            response = await PatientApi.resetPatientPassword(userId);
                            break;
                    }

                    if (!response) {
                        message.error("Failed to reset password");
                        return;
                    }

                    const responseData = response.data;

                    if (responseData.isSuccess) {
                        message.success("Password reset successfully. New password sent to user's email.");
                    } else {
                        message.error("Failed to reset password");
                    }
                } catch {
                    message.error("Failed to reset password");
                }
            },
        });
    };

    const handleActivateUser = async (userId: string) => {
        confirm({
            title: `Activate ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
            icon: <CheckCircleOutlined />,
            content: `Are you sure you want to activate this ${activeTab}? They will be able to access their account.`,
            onOk: async () => {
                try {
                    let response = undefined;
                    switch (activeTab) {
                        case "admin":
                            response = await AdminApi.activateAdmin(userId);
                            break;
                        case "doctor":
                            response = await DoctorApi.activateDoctor(userId);
                            break;
                        case "pharmacist":
                            response = await PharmacistApi.activatePharmacist(userId);
                            break;
                    }

                    if (!response) {
                        message.error(`Failed to activate ${activeTab}`);
                        return;
                    }

                    const responseData = response.data;

                    if (responseData.isSuccess) {
                        message.success(
                            `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} activated successfully`
                        );
                        loadUsers(activeTab);
                    } else {
                        message.error(`Failed to activate ${activeTab}`);
                    }
                } catch {
                    message.error(`Failed to activate ${activeTab}`);
                }
            },
        });
    };

    const handleDeactivateUser = async (userId: string) => {
        confirm({
            title: `Deactivate ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
            icon: <StopOutlined />,
            content: `Are you sure you want to deactivate this ${activeTab}? They will not be able to access their account.`,
            onOk: async () => {
                try {
                    let response = undefined;
                    switch (activeTab) {
                        case "admin":
                            response = await AdminApi.deactivateAdmin(userId);
                            break;
                        case "doctor":
                            response = await DoctorApi.deactivateDoctor(userId);
                            break;
                        case "pharmacist":
                            response = await PharmacistApi.deactivatePharmacist(userId);
                            break;
                    }

                    if (!response) {
                        message.error(`Failed to deactivate ${activeTab}`);
                        return;
                    }

                    const responseData = response.data;

                    if (responseData.isSuccess) {
                        message.success(
                            `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} deactivated successfully`
                        );
                        loadUsers(activeTab);
                    } else {
                        message.error(`Failed to deactivate ${activeTab}`);
                    }
                } catch {
                    message.error(`Failed to deactivate ${activeTab}`);
                }
            },
        });
    };

    const handleUploadImage = async (userId: string) => {
        setSelectedUserId(userId);
        setImageUploadModalVisible(true);
    };

    const handleImageUpload = async (file: File) => {
        if (!selectedUserId) {
            message.error("No user selected for image upload");
            return;
        }

        try {
            setImageUploadLoading(true);
            let response = undefined;
            switch (activeTab) {
                case "doctor":
                    response = await DoctorApi.uploadDoctorImage(selectedUserId, file);
                    break;
                case "pharmacist":
                    response = await PharmacistApi.uploadPharmacistImage(selectedUserId, file);
                    break;
            }

            if (!response) {
                message.error("Failed to upload image");
                setImageUploadLoading(false);
                return;
            }

            const responseData = response.data;

            if (responseData.isSuccess) {
                message.success("Image uploaded successfully");
                setImageUploadModalVisible(false);
                loadUsers(activeTab);
            } else {
                message.error("Failed to upload image");
            }
        } catch {
            message.error("Failed to upload image");
        } finally {
            setImageUploadLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        confirm({
            title: `Delete ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to delete this ${activeTab}? This action cannot be undone.`,
            okType: "danger",
            onOk: async () => {
                try {
                    let response = undefined;
                    if (activeTab === "admin") {
                        response = await AdminApi.deleteAdmin(userId);
                    }

                    if (!response) {
                        message.error(`Failed to delete ${activeTab}`);
                        return;
                    }

                    const responseData = response.data;

                    if (responseData.isSuccess) {
                        message.success(
                            `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} deleted successfully`
                        );
                        loadUsers(activeTab);
                    } else {
                        message.error(`Failed to delete ${activeTab}`);
                    }
                } catch {
                    message.error(`Failed to delete ${activeTab}`);
                }
            },
        });
    };

    const handlePaginationChange = (userType: UserType, page: number, pageSize: number) => {
        loadUsers(userType, page, pageSize);
    };

    const handleCreateModalOpen = () => {
        setCreateModalVisible(true);
    };

    const handleCreateModalClose = () => {
        setCreateModalVisible(false);
        form.resetFields();
    };

    const handleEditModalOpen = (user: any) => {
        setSelectedUser(user);

        // Map gender from backend to frontend format
        const mapGender = (gender: string) => {
            if (!gender) return undefined;
            const genderMap: Record<string, string> = {
                male: "MALE",
                female: "FEMALE",
                MALE: "MALE",
                FEMALE: "FEMALE",
            };
            return genderMap[gender.toLowerCase()];
        };

        // Map languages from backend to frontend format
        const mapLanguages = (languages: string[]) => {
            if (!languages || !Array.isArray(languages)) return [];
            const languageMap: Record<string, string> = {
                malay: "MALAY",
                english: "ENGLISH",
                mandarin: "MANDARIN",
                tamil: "TAMIL",
                MALAY: "MALAY",
                ENGLISH: "ENGLISH",
                MANDARIN: "MANDARIN",
                TAMIL: "TAMIL",
            };
            return languages.map((lang) => languageMap[lang.toLowerCase()] || lang);
        };

        editForm.setFieldsValue({
            name: user.name,
            nric: user.nric,
            email: user.email,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth, "DD/MM/YYYY") : undefined,
            gender: mapGender(user.gender),
            facilityId: user.facility?.id,
            specialityList: user.specialityList,
            languageList: mapLanguages(user.languageList),
            qualifications: user.qualifications,
        });
        setEditModalVisible(true);
    };

    const handleEditModalClose = () => {
        setEditModalVisible(false);
        editForm.resetFields();
        setSelectedUser(null);
    };

    const handleImageUploadModalClose = () => {
        setImageUploadModalVisible(false);
        setSelectedUserId("");
    };

    return (
        <UserManagementComponent
            activeTab={activeTab}
            tabData={tabData}
            facilities={facilities}
            createModalVisible={createModalVisible}
            createLoading={createLoading}
            editModalVisible={editModalVisible}
            editLoading={editLoading}
            imageUploadModalVisible={imageUploadModalVisible}
            selectedUserId={selectedUserId}
            imageUploadLoading={imageUploadLoading}
            form={form}
            editForm={editForm}
            onTabChange={setActiveTab}
            onCreateUser={handleCreateUser}
            onEditUser={handleEditUser}
            onResetPassword={handleResetPassword}
            onActivateUser={handleActivateUser}
            onDeactivateUser={handleDeactivateUser}
            onUploadImage={handleUploadImage}
            onDeleteUser={handleDeleteUser}
            onImageUpload={handleImageUpload}
            onPaginationChange={handlePaginationChange}
            onCreateModalOpen={handleCreateModalOpen}
            onCreateModalClose={handleCreateModalClose}
            onEditModalOpen={handleEditModalOpen}
            onEditModalClose={handleEditModalClose}
            onImageUploadModalClose={handleImageUploadModalClose}
        />
    );
};

const UserManagementPage = () => {
    return <UserManagement />;
};

export default UserManagementPage;
