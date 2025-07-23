"use client";

import React from "react";
import {
    Typography,
    Tag,
    Form,
    Input,
    Select,
    Modal,
    Tabs,
    Upload,
    Button,
    Tooltip,
    DatePicker,
    Row,
    Col,
    Image,
    Alert,
    message,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    LockOutlined,
    CheckCircleOutlined,
    StopOutlined,
    CameraOutlined,
    InfoCircleOutlined,
    IdcardOutlined,
    MailOutlined,
    UserOutlined,
    CalendarOutlined,
    MedicineBoxOutlined,
    GlobalOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import DataTable, { DataTableColumn, DataTableAction } from "../../components/DataTable/DataTable";
import FormModal from "../../components/FormModal/FormModal";
import { UserManagementComponentProps, UserType } from "./props";

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const UserManagementComponent: React.FC<UserManagementComponentProps> = ({
    activeTab,
    tabData,
    facilities,
    createModalVisible,
    createLoading,
    editModalVisible,
    editLoading,
    imageUploadModalVisible,
    imageUploadLoading,
    form,
    editForm,
    onTabChange,
    onCreateUser,
    onEditUser,
    onResetPassword,
    onActivateUser,
    onDeactivateUser,
    onUploadImage,
    onDeleteUser,
    onImageUpload,
    onPaginationChange,
    onCreateModalOpen,
    onCreateModalClose,
    onEditModalOpen,
    onEditModalClose,
    onImageUploadModalClose,
}) => {
    const getUserColumns = (): DataTableColumn<any>[] => {
        const baseColumns: DataTableColumn<any>[] = [
            {
                title: "Profile",
                dataIndex: "profileImageUrl",
                key: "profileImageUrl",
                width: 80,
                render: (value, record) => (
                    <div className="flex items-center justify-center">
                        {value ? (
                            <Image
                                src={value}
                                alt={`${record.name || "User"} profile`}
                                width={80}
                                height={80}
                                className="w-[80px] h-[80px] rounded-full object-cover border-2 border-gray-200"
                            />
                        ) : null}
                        <div
                            className={`w-[80px] h-[80px] rounded-full bg-gray-200 flex items-center justify-center ${value ? "hidden" : ""
                                }`}
                        >
                            <UserOutlined className="text-gray-400 text-xl" />
                        </div>
                    </div>
                ),
            },
            {
                title: "Name",
                dataIndex: "name",
                key: "name",
                render: (value, record) => (
                    <div>
                        <div className="font-medium">{value || "N/A"}</div>
                        <div className="text-sm text-gray-500">{record.nric}</div>
                    </div>
                ),
            },
            {
                title: "Email",
                dataIndex: "email",
                key: "email",
                render: (value) => value || "N/A",
            },
            {
                title: "Phone",
                dataIndex: "phone",
                key: "phone",
                render: (value) => value || "N/A",
            },
            {
                title: "Status",
                dataIndex: "enabled",
                key: "enabled",
                render: (value) => <Tag color={value ? "green" : "red"}>{value ? "Active" : "Inactive"}</Tag>,
            },
        ];

        // Helper functions to map backend values to display values
        const mapGenderDisplay = (gender: string) => {
            if (!gender) return "N/A";
            const genderMap: Record<string, string> = {
                male: "Male",
                female: "Female",
                MALE: "Male",
                FEMALE: "Female",
            };
            return genderMap[gender.toLowerCase()] || gender;
        };

        const mapLanguageDisplay = (languages: string[]) => {
            if (!languages || !Array.isArray(languages)) return [];
            const languageMap: Record<string, string> = {
                malay: "Bahasa Malaysia",
                english: "English",
                mandarin: "Mandarin",
                tamil: "Tamil",
                MALAY: "Bahasa Malaysia",
                ENGLISH: "English",
                MANDARIN: "Mandarin",
                TAMIL: "Tamil",
            };
            return languages.map((lang) => languageMap[lang.toLowerCase()] || lang);
        };

        // Add specific columns based on user type
        if (activeTab === "doctor") {
            baseColumns.splice(2, 0, {
                title: "Gender",
                dataIndex: "gender",
                key: "gender",
                render: (gender: string) => mapGenderDisplay(gender),
            });
            baseColumns.splice(3, 0, {
                title: "Languages",
                dataIndex: "languageList",
                key: "languageList",
                render: (languages: string[]) => {
                    const mappedLanguages = mapLanguageDisplay(languages);
                    if (mappedLanguages.length === 0) return "N/A";
                    return (
                        <div>
                            {mappedLanguages.map((lang) => (
                                <Tag key={lang} color="green">
                                    {lang}
                                </Tag>
                            ))}
                        </div>
                    );
                },
            });
            baseColumns.splice(4, 0, {
                title: "Specialities",
                dataIndex: "specialityList",
                key: "specialityList",
                render: (specialities: string[]) => (
                    <div>
                        {specialities?.map((spec) => (
                            <Tag key={spec} color="blue">
                                {spec}
                            </Tag>
                        )) || "N/A"}
                    </div>
                ),
            });
            baseColumns.splice(5, 0, {
                title: "Facility",
                dataIndex: "facility",
                key: "facility",
                render: (facility: any) => facility?.name || "N/A",
            });
        }

        if (activeTab === "pharmacist") {
            baseColumns.splice(2, 0, {
                title: "Gender",
                dataIndex: "gender",
                key: "gender",
                render: (gender: string) => mapGenderDisplay(gender),
            });
            baseColumns.splice(3, 0, {
                title: "Facility",
                dataIndex: "facility",
                key: "facility",
                render: (facility: any) => facility?.name || "N/A",
            });
        }

        baseColumns.push({
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (value) => new Date(value * 1000).toLocaleDateString(),
        });

        return baseColumns;
    };

    const getUserActions = (): DataTableAction<any>[] => {
        const actions: DataTableAction<any>[] = [
            {
                label: "Activate",
                onClick: (record) => {
                    void onActivateUser(record.id);
                },
                icon: <CheckCircleOutlined className="text-lg" />,
                type: "default",
                showLabel: false,
                tooltip: "Activate User",
                disabled: (record) => record.enabled,
            },
            {
                label: "Deactivate",
                onClick: (record) => {
                    void onDeactivateUser(record.id);
                },
                icon: <StopOutlined className="text-lg" />,
                type: "default",
                showLabel: false,
                tooltip: "Deactivate User",
                disabled: (record) => !record.enabled,
            },
            {
                label: "Reset Password",
                onClick: (record) => {
                    void onResetPassword(record.id);
                },
                icon: <LockOutlined className="text-lg" />,
                type: "default",
                showLabel: false,
                tooltip: "Reset Password",
                disabled: (record) => !record.enabled,
            },
        ];

        if (activeTab !== "patient") {
            actions.push({
                label: "Edit",
                onClick: (record) => {
                    onEditModalOpen(record);
                },
                icon: <EditOutlined className="text-lg" />,
                type: "default",
                showLabel: false,
                tooltip: "Edit User",
            });
        }

        // Add image upload for doctors and pharmacists
        if (activeTab === "doctor" || activeTab === "pharmacist") {
            actions.push({
                label: "Upload Image",
                onClick: (record) => {
                    void onUploadImage(record.id);
                },
                icon: <CameraOutlined className="text-lg" />,
                type: "default",
                showLabel: false,
                tooltip: "Upload Profile Image",
            });
        }

        if (activeTab === "admin") {
            actions.push({
                label: "Delete",
                onClick: (record) => {
                    void onDeleteUser(record.id);
                },
                icon: <DeleteOutlined className="text-lg" />,
                type: "default",
                danger: true,
                showLabel: false,
                tooltip: "Delete User",
            });
        }

        return actions;
    };

    const getCreateFormFields = (isEditMode = false) => {
        const baseFields = [
            <Form.Item
                key="name"
                label={
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                        Full Name
                        <Tooltip title="Enter the complete name as it appears on official documents">
                            <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                        </Tooltip>
                    </span>
                }
                name="name"
                rules={[
                    { required: true, message: "Please enter full name" },
                    { min: 2, message: "Name must be at least 2 characters long" },
                    { max: 100, message: "Name cannot exceed 100 characters" },
                    {
                        pattern: /^[a-zA-Z\s]+$/,
                        message: "Name can only contain letters and spaces",
                    },
                ]}
            >
                <Input
                    placeholder="Enter full name"
                    prefix={<UserOutlined className="text-gray-400" />}
                    className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                    autoComplete="name"
                />
            </Form.Item>,
            <Form.Item
                key="nric"
                label={
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                        NRIC (12 digits)
                        <Tooltip title="Malaysian National Registration Identity Card number (12 digits without hyphens)">
                            <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                        </Tooltip>
                    </span>
                }
                name="nric"
                rules={[
                    { required: true, message: "Please enter NRIC" },
                    { pattern: /^\d{12}$/, message: "NRIC must be exactly 12 digits" },
                ]}
            >
                <Input
                    placeholder="Enter NRIC (12 digits)"
                    prefix={<IdcardOutlined className="text-gray-400" />}
                    className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                    maxLength={12}
                    autoComplete="off"
                />
            </Form.Item>,
            <Form.Item
                key="email"
                label={
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                        Email Address
                        <Tooltip title={isEditMode ? "Email address cannot be changed for security reasons" : "This email will be used for account notifications and password recovery"}>
                            <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                        </Tooltip>
                    </span>
                }
                name="email"
                rules={[
                    { required: true, message: "Please enter email address" },
                    { type: "email", message: "Please enter a valid email address" },
                    { max: 255, message: "Email address cannot exceed 255 characters" },
                    {
                        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Please enter a valid email format (e.g., user@example.com)",
                    },
                ]}
            >
                <Input
                    placeholder="Enter email address"
                    prefix={<MailOutlined className="text-gray-400" />}
                    className={`rounded-xl border-gray-200 transition-colors ${isEditMode
                        ? "bg-gray-50 cursor-not-allowed border-gray-300"
                        : "hover:border-blue-400 focus:border-blue-500"
                        }`}
                    autoComplete="email"
                    disabled={isEditMode}
                />
            </Form.Item>,
            <Form.Item
                key="phone"
                label={
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                        Phone Number
                        <Tooltip title="Malaysian phone number (e.g., 0112223333)">
                            <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                        </Tooltip>
                    </span>
                }
                name="phone"
                rules={[
                    { required: true, message: "Please enter phone number" },
                    {
                        pattern: /^\d{10}$/,
                        message: "Phone number must be exactly 10 digits",
                    },
                    {
                        pattern: /^(01)[0-46-9]\d{7,8}$/,
                        message: "Phone number must be a valid Malaysian phone number",
                    },
                ]}
                normalize={(value) => {
                    // Remove any non-digit characters
                    return value ? value.replace(/\D/g, "") : value;
                }}
            >
                <Input
                    placeholder="Enter phone number (e.g., 0171234567)"
                    addonBefore="+6"
                    className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                    autoComplete="tel"
                    maxLength={10}
                />
            </Form.Item>,
        ];

        if (activeTab === "doctor" || activeTab === "pharmacist") {
            baseFields.push(
                <Form.Item
                    key="dateOfBirth"
                    label={
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                            Date of Birth
                            <Tooltip title="Must be at least 21 years old to register as a medical professional">
                                <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                            </Tooltip>
                        </span>
                    }
                    name="dateOfBirth"
                    rules={[
                        { required: true, message: "Please select date of birth" },
                        {
                            validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                const age = dayjs().diff(dayjs(value), "year");
                                if (age < 21) {
                                    return Promise.reject(new Error("Must be at least 21 years old"));
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <DatePicker
                        placeholder="Select date of birth"
                        className="w-full rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                        format="DD/MM/YYYY"
                        disabledDate={(current) => current && current > dayjs().subtract(21, "year")}
                        suffixIcon={<CalendarOutlined className="text-gray-400" />}
                    />
                </Form.Item>,
                <Form.Item
                    key="gender"
                    label={
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                            Gender
                            <Tooltip title="Select biological gender">
                                <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                            </Tooltip>
                        </span>
                    }
                    name="gender"
                    rules={[{ required: true, message: "Please select gender" }]}
                >
                    <Select placeholder="Select gender" className="rounded-xl">
                        <Option value="MALE">Male</Option>
                        <Option value="FEMALE">Female</Option>
                    </Select>
                </Form.Item>,
                <Form.Item
                    key="facilityId"
                    label={
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                            Medical Facility
                            <Tooltip title="Primary healthcare facility where this professional will practice">
                                <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                            </Tooltip>
                        </span>
                    }
                    name="facilityId"
                    rules={[{ required: true, message: "Please select facility" }]}
                >
                    <Select
                        placeholder="Select facility"
                        className="rounded-xl"
                        showSearch
                        filterOption={(input, option) =>
                            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {facilities.map((facility) => (
                            <Option key={facility.id} value={facility.id}>
                                {facility.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            );
        }

        if (activeTab === "doctor") {
            baseFields.push(
                <Form.Item
                    key="specialityList"
                    label={
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                            Medical Specialities
                            <Tooltip title="Add medical specializations (e.g., Cardiology, Neurology). Type and press Enter to add custom specialities.">
                                <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                            </Tooltip>
                        </span>
                    }
                    name="specialityList"
                    rules={[
                        { required: true, message: "Please select at least one speciality" },
                        {
                            validator: (_, value) => {
                                if (!value || value.length === 0) {
                                    return Promise.reject(new Error("At least one speciality is required"));
                                }
                                if (value.length > 10) {
                                    return Promise.reject(new Error("Maximum 10 specialities allowed"));
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <Select
                        mode="tags"
                        style={{ width: "100%" }}
                        placeholder="Enter or select specialities"
                        tokenSeparators={[","]}
                        className="rounded-xl"
                        suffixIcon={<MedicineBoxOutlined className="text-gray-400" />}
                        options={[
                            { value: "General Medicine", label: "General Medicine" },
                            { value: "Cardiology", label: "Cardiology" },
                            { value: "Neurology", label: "Neurology" },
                            { value: "Orthopedics", label: "Orthopedics" },
                            { value: "Pediatrics", label: "Pediatrics" },
                            { value: "Dermatology", label: "Dermatology" },
                            { value: "Psychiatry", label: "Psychiatry" },
                            { value: "Radiology", label: "Radiology" },
                            { value: "Anesthesiology", label: "Anesthesiology" },
                            { value: "Emergency Medicine", label: "Emergency Medicine" },
                        ]}
                    />
                </Form.Item>,
                <Form.Item
                    key="languageList"
                    label={
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                            Languages Spoken
                            <Tooltip title="Select all languages the doctor can communicate in with patients">
                                <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                            </Tooltip>
                        </span>
                    }
                    name="languageList"
                    rules={[
                        { required: true, message: "Please select at least one language" },
                        {
                            validator: (_, value) => {
                                if (!value || value.length === 0) {
                                    return Promise.reject(new Error("At least one language is required"));
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Select languages"
                        className="rounded-xl"
                        suffixIcon={<GlobalOutlined className="text-gray-400" />}
                    >
                        <Option value="ENGLISH">English</Option>
                        <Option value="MANDARIN">Mandarin</Option>
                        <Option value="MALAY">Bahasa Malaysia</Option>
                        <Option value="TAMIL">Tamil</Option>
                    </Select>
                </Form.Item>,
                <Form.Item
                    key="qualifications"
                    label={
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                            Professional Qualifications
                            <Tooltip title="List medical degrees, certifications, and professional qualifications (e.g., MBBS, MD, MRCP)">
                                <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                            </Tooltip>
                        </span>
                    }
                    name="qualifications"
                    rules={[
                        { required: true, message: "Please enter qualifications" },
                        { min: 10, message: "Please provide more detailed qualifications (minimum 10 characters)" },
                        { max: 1000, message: "Qualifications cannot exceed 1000 characters" },
                    ]}
                >
                    <Input.TextArea
                        placeholder="Enter professional qualifications and certifications (e.g., MBBS from University of Malaya, MRCP certification...)"
                        rows={4}
                        className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                        showCount
                        maxLength={1000}
                    />
                </Form.Item>
            );
        }

        return baseFields;
    };

    const currentTabData = tabData[activeTab];

    return (
        <div>
            <div className="mb-6">
                <Title level={2} className="mb-2 mt-0">
                    User Management
                </Title>
            </div>

            <Tabs activeKey={activeTab} onChange={(key) => onTabChange(key as UserType)} className="mb-4">
                <TabPane tab="Admins" key="admin" />
                <TabPane tab="Doctors" key="doctor" />
                <TabPane tab="Pharmacists" key="pharmacist" />
                <TabPane tab="Patients" key="patient" />
            </Tabs>

            <DataTable<any>
                title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s`}
                data={currentTabData.users}
                columns={getUserColumns()}
                loading={currentTabData.loading}
                onAdd={activeTab !== "patient" ? onCreateModalOpen : undefined}
                addButtonText={`Create ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                actions={getUserActions()}
                rowKey="id"
                pagination={{
                    current: currentTabData.pagination.current,
                    pageSize: currentTabData.pagination.pageSize,
                    total: currentTabData.pagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ${activeTab}s`,
                    onChange: (page, pageSize) => {
                        onPaginationChange(activeTab, page, pageSize);
                    },
                }}
            />

            {activeTab !== "patient" && (
                <FormModal
                    title={`Create New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                    visible={createModalVisible}
                    onCancel={onCreateModalClose}
                    onOk={onCreateUser}
                    loading={createLoading}
                    form={form}
                    width={activeTab === "doctor" ? 900 : 600}
                >
                    <div className="space-y-4">
                        <Alert
                            message="Account Setup Information"
                            description="A temporary password will be generated and sent to the provided email address. The user will be required to change their password on first login."
                            type="info"
                            showIcon
                            className="mb-6"
                        />

                        {activeTab === "doctor" ? (
                            <Row gutter={[16, 0]}>
                                <Col xs={24} md={12}>
                                    {getCreateFormFields().slice(0, Math.ceil(getCreateFormFields().length / 2))}
                                </Col>
                                <Col xs={24} md={12}>
                                    {getCreateFormFields().slice(Math.ceil(getCreateFormFields().length / 2))}
                                </Col>
                            </Row>
                        ) : (
                            getCreateFormFields()
                        )}
                    </div>
                </FormModal>
            )}

            {/* Edit User Modal */}
            {activeTab !== "patient" && (
                <FormModal
                    title={`Edit ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                    visible={editModalVisible}
                    onCancel={onEditModalClose}
                    onOk={onEditUser}
                    loading={editLoading}
                    form={editForm}
                    width={activeTab === "doctor" ? 900 : 600}
                >
                    <div className="space-y-4">
                        {activeTab === "doctor" ? (
                            <Row gutter={[16, 0]}>
                                <Col xs={24} md={12}>
                                    {getCreateFormFields(true).slice(0, Math.ceil(getCreateFormFields(true).length / 2))}
                                </Col>
                                <Col xs={24} md={12}>
                                    {getCreateFormFields(true).slice(Math.ceil(getCreateFormFields(true).length / 2))}
                                </Col>
                            </Row>
                        ) : (
                            getCreateFormFields(true)
                        )}
                    </div>
                </FormModal>
            )}

            {/* Image Upload Modal */}
            {(activeTab === "doctor" || activeTab === "pharmacist") && (
                <Modal
                    title={`Upload ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Image`}
                    open={imageUploadModalVisible}
                    onCancel={onImageUploadModalClose}
                    footer={null}
                    destroyOnHidden={true}
                    centered
                >
                    <div className="py-4 flex justify-center items-center">
                        <Upload
                            accept="image/*"
                            beforeUpload={(file) => {
                                const isLt10MB = file.size / 1024 / 1024 < 10;
                                if (!isLt10MB) {
                                    message.error('Image must be smaller than 10MB!');
                                    return Upload.LIST_IGNORE;
                                }

                                onImageUpload(file);
                                return false; // prevent default upload
                            }}
                            showUploadList={true}
                            maxCount={1}
                        >
                            <Button
                                size="large"
                                block
                                loading={imageUploadLoading}
                                className="h-32 border-2 border-dashed border-gray-300 hover:border-orange-500 hover:text-orange-600"
                            >
                                <div className="flex flex-col items-center justify-center">
                                    <CameraOutlined className="text-3xl text-gray-400 mb-2" />
                                    <span>Click to upload profile image</span>
                                    <span className="text-sm text-gray-500">JPG, PNG up to 10MB</span>
                                </div>
                            </Button>
                        </Upload>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default UserManagementComponent;
