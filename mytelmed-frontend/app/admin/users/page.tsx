"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Tag, Form, Input, Select, Modal, message, Tabs, Upload, Button } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    LockOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    StopOutlined,
    CameraOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import AdminLayout from '../layout';
import DataTable, { DataTableColumn, DataTableAction } from '../../components/DataTable/DataTable';
import FormModal from '../../components/FormModal/FormModal';
import AdminApi from '../../api/admin';
import { Admin, CreateAdminRequest } from '../../api/admin/props';
import DoctorApi from '../../api/doctor';
import { Doctor, CreateDoctorRequest } from '../../api/doctor/props';
import PharmacistApi from '../../api/pharmacist';
import { Pharmacist, CreatePharmacistRequest } from '../../api/pharmacist/props';
import PatientApi from '../../api/patient';
import FacilityApi from '../../api/facility';
import { Patient } from '../../api/patient/props';
import { Facility } from '../../api/facility/props';

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { TabPane } = Tabs;

type UserType = 'admin' | 'doctor' | 'pharmacist' | 'patient';

interface TabData {
    users: (Admin | Doctor | Pharmacist | Patient)[];
    loading: boolean;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
    };
}

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState<UserType>('admin');
    const [tabData, setTabData] = useState<Record<UserType, TabData>>({
        admin: { users: [], loading: true, pagination: { current: 1, pageSize: 10, total: 0 } },
        doctor: { users: [], loading: true, pagination: { current: 1, pageSize: 10, total: 0 } },
        pharmacist: { users: [], loading: true, pagination: { current: 1, pageSize: 10, total: 0 } },
        patient: { users: [], loading: true, pagination: { current: 1, pageSize: 10, total: 0 } },
    });
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [imageUploadModalVisible, setImageUploadModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [imageUploadLoading, setImageUploadLoading] = useState(false);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [form] = Form.useForm();

    const loadUsers = useCallback(async (userType: UserType, page = 1, pageSize = 10) => {
        setTabData(prev => ({
            ...prev,
            [userType]: { ...prev[userType], loading: true }
        }));

        try {
            let response;
            switch (userType) {
                case 'admin':
                    response = await AdminApi.getAllAdmins(page - 1, pageSize);
                    break;
                case 'doctor':
                    response = await DoctorApi.getDoctors(page - 1, pageSize);
                    break;
                case 'pharmacist':
                    response = await PharmacistApi.getAllPharmacists({ page: page - 1, pageSize });
                    break;
                case 'patient':
                    response = await PatientApi.getAllPatients({ page: page - 1, pageSize });
                    break;
            }

            if (response.data.isSuccess && response.data.data) {
                const { content, totalElements } = response.data.data;
                setTabData(prev => ({
                    ...prev,
                    [userType]: {
                        users: content,
                        loading: false,
                        pagination: {
                            current: page,
                            pageSize,
                            total: totalElements
                        }
                    }
                }));
            }
        } catch {
            message.error(`Failed to load ${userType}s`);
            setTabData(prev => ({
                ...prev,
                [userType]: { ...prev[userType], loading: false }
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

            switch (activeTab) {
                case 'admin': {
                    const adminData: CreateAdminRequest = {
                        name: values.name,
                        nric: values.nric,
                        email: values.email,
                        phone: values.phone,
                    };
                    await AdminApi.createAdmin(adminData);
                    break;
                }
                case 'doctor': {
                    const doctorData: CreateDoctorRequest = {
                        name: values.name,
                        nric: values.nric,
                        email: values.email,
                        phone: values.phone,
                        dateOfBirth: values.dateOfBirth,
                        gender: values.gender,
                        facilityId: values.facilityId,
                        specialityList: values.specialityList,
                        languageList: values.languageList,
                        qualifications: values.qualifications,
                    };
                    await DoctorApi.createDoctor(doctorData);
                    break;
                }
                case 'pharmacist': {
                    const pharmacistData: CreatePharmacistRequest = {
                        name: values.name,
                        nric: values.nric,
                        email: values.email,
                        phone: values.phone,
                        dateOfBirth: values.dateOfBirth,
                        gender: values.gender,
                        facilityId: values.facilityId,
                    };
                    await PharmacistApi.createPharmacist(pharmacistData);
                    break;
                }
            }

            message.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} created successfully`);
            setCreateModalVisible(false);
            form.resetFields();
            setCreateLoading(false);
            loadUsers(activeTab);
        } catch {
            message.error(`Failed to create ${activeTab}`);
            setCreateLoading(false);
        }
    };

    const handleResetPassword = async (userId: string) => {
        confirm({
            title: 'Reset Password',
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to reset this ${activeTab}'s password? A new password will be generated and sent to their email.`,
            onOk: async () => {
                try {
                    switch (activeTab) {
                        case 'admin':
                            await AdminApi.resetAdminPassword(userId);
                            break;
                        case 'doctor':
                            await DoctorApi.resetDoctorPassword(userId);
                            break;
                        case 'pharmacist':
                            await PharmacistApi.resetPharmacistPassword(userId);
                            break;
                    }
                    message.success('Password reset successfully. New password sent to user\'s email.');
                } catch {
                    message.error('Failed to reset password');
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
                    switch (activeTab) {
                        case 'admin':
                            await AdminApi.activateAdmin(userId);
                            break;
                        case 'doctor':
                            await DoctorApi.activateDoctor(userId);
                            break;
                        case 'pharmacist':
                            await PharmacistApi.activatePharmacist(userId);
                            break;
                    }
                    message.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} activated successfully`);
                    loadUsers(activeTab);
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
                    switch (activeTab) {
                        case 'admin':
                            await AdminApi.deactivateAdmin(userId);
                            break;
                        case 'doctor':
                            await DoctorApi.deactivateDoctor(userId);
                            break;
                        case 'pharmacist':
                            await PharmacistApi.deactivatePharmacist(userId);
                            break;
                    }
                    message.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} deactivated successfully`);
                    loadUsers(activeTab);
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
        if (!selectedUserId) return;

        try {
            setImageUploadLoading(true);
            switch (activeTab) {
                case 'doctor':
                    await DoctorApi.uploadDoctorImage(selectedUserId, file);
                    break;
                case 'pharmacist':
                    await PharmacistApi.uploadPharmacistImage(selectedUserId, file);
                    break;
            }
            message.success('Image uploaded successfully');
            setImageUploadModalVisible(false);
            loadUsers(activeTab);
        } catch {
            message.error('Failed to upload image');
        } finally {
            setImageUploadLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        confirm({
            title: `Delete ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to delete this ${activeTab}? This action cannot be undone.`,
            okType: 'danger',
            onOk: async () => {
                try {
                    switch (activeTab) {
                        case 'admin':
                            await AdminApi.deleteAdmin(userId);
                            break;
                        case 'doctor':
                            await DoctorApi.deleteDoctor(userId);
                            break;
                        case 'pharmacist':
                            await PharmacistApi.deletePharmacist(userId);
                            break;
                        case 'patient':
                            await PatientApi.deletePatient(userId);
                            break;
                    }
                    message.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} deleted successfully`);
                    loadUsers(activeTab);
                } catch {
                    message.error(`Failed to delete ${activeTab}`);
                }
            },
        });
    };

    const getUserColumns = (): DataTableColumn<any>[] => {
        const baseColumns: DataTableColumn<any>[] = [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                render: (value, record) => (
                    <div>
                        <div className="font-medium">{value || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{record.nric || record.serialNumber}</div>
                    </div>
                ),
            },
            {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
                render: (value) => value || 'N/A',
            },
            {
                title: 'Phone',
                dataIndex: 'phone',
                key: 'phone',
                render: (value) => value || 'N/A',
            },
            {
                title: 'Status',
                dataIndex: 'accountStatus',
                key: 'accountStatus',
                render: (status) => (
                    <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                        {status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </Tag>
                ),
            },
        ];

        // Add specific columns based on user type
        if (activeTab === 'doctor') {
            baseColumns.splice(2, 0, {
                title: 'Specialities',
                dataIndex: 'specialityList',
                key: 'specialityList',
                render: (specialities: string[]) => (
                    <div>
                        {specialities?.map((spec) => (
                            <Tag key={spec} color="blue">{spec}</Tag>
                        )) || 'N/A'}
                    </div>
                ),
            });
            baseColumns.splice(3, 0, {
                title: 'Facility',
                dataIndex: 'facility',
                key: 'facility',
                render: (facility: any) => facility?.name || 'N/A',
            });
        }

        if (activeTab === 'pharmacist') {
            baseColumns.splice(2, 0, {
                title: 'Facility',
                dataIndex: 'facility',
                key: 'facility',
                render: (facility: any) => facility?.name || 'N/A',
            });
        }

        baseColumns.push({
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (value) => new Date(value).toLocaleDateString(),
        });

        return baseColumns;
    };

    const getUserActions = (): DataTableAction<any>[] => {
        const actions: DataTableAction<any>[] = [
            {
                label: 'Edit',
                onClick: (record) => {
                    console.log('Edit user:', record.id);
                },
                icon: <EditOutlined />,
                type: 'default',
            },
        ];

        // Add account actions for non-patient users
        if (activeTab !== 'patient') {
            actions.push({
                label: 'Reset Password',
                onClick: (record) => {
                    void handleResetPassword(record.id);
                },
                icon: <LockOutlined />,
                type: 'default',
            });

            // Add both activate and deactivate actions (will be conditionally shown by the table)
            actions.push(
                {
                    label: 'Activate',
                    onClick: (record) => {
                        void handleActivateUser(record.id);
                    },
                    icon: <CheckCircleOutlined />,
                    type: 'default',
                },
                {
                    label: 'Deactivate',
                    onClick: (record) => {
                        void handleDeactivateUser(record.id);
                    },
                    icon: <StopOutlined />,
                    type: 'default',
                }
            );
        }

        // Add image upload for doctors and pharmacists
        if (activeTab === 'doctor' || activeTab === 'pharmacist') {
            actions.push({
                label: 'Upload Image',
                onClick: (record) => {
                    void handleUploadImage(record.id);
                },
                icon: <CameraOutlined />,
                type: 'default',
            });
        }

        actions.push({
            label: 'Delete',
            onClick: (record) => {
                void handleDeleteUser(record.id);
            },
            icon: <DeleteOutlined />,
            type: 'default',
            danger: true,
        });

        return actions;
    };

    const getCreateFormFields = () => {
        const baseFields = [
            <Form.Item
                key="name"
                label="Full Name"
                name="name"
                rules={[{ required: true, message: 'Please enter full name' }]}
            >
                <Input placeholder="Enter full name" />
            </Form.Item>,
            <Form.Item
                key="nric"
                label="NRIC"
                name="nric"
                rules={[
                    { required: true, message: 'Please enter NRIC' },
                    { pattern: /^\d{12}$/, message: 'NRIC must be exactly 12 digits' }
                ]}
            >
                <Input placeholder="Enter NRIC (12 digits)" />
            </Form.Item>,
            <Form.Item
                key="email"
                label="Email"
                name="email"
                rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter valid email' }
                ]}
            >
                <Input placeholder="Enter email address" />
            </Form.Item>,
            <Form.Item
                key="phone"
                label="Phone"
                name="phone"
                rules={[
                    { required: true, message: 'Please enter phone number' },
                    { pattern: /^\d{9,10}$/, message: 'Phone must be 9-10 digits' }
                ]}
            >
                <Input placeholder="Enter phone number" />
            </Form.Item>,
        ];

        if (activeTab === 'doctor' || activeTab === 'pharmacist') {
            baseFields.push(
                <Form.Item
                    key="dateOfBirth"
                    label="Date of Birth"
                    name="dateOfBirth"
                    rules={[{ required: true, message: 'Please select date of birth' }]}
                >
                    <Input type="date" />
                </Form.Item>,
                <Form.Item
                    key="gender"
                    label="Gender"
                    name="gender"
                    rules={[{ required: true, message: 'Please select gender' }]}
                >
                    <Select placeholder="Select gender">
                        <Option value="MALE">Male</Option>
                        <Option value="FEMALE">Female</Option>
                    </Select>
                </Form.Item>,
                <Form.Item
                    key="facilityId"
                    label="Facility"
                    name="facilityId"
                    rules={[{ required: true, message: 'Please select facility' }]}
                >
                    <Select placeholder="Select facility">
                        {facilities.map((facility) => (
                            <Option key={facility.id} value={facility.id}>{facility.name}</Option>
                        ))}
                    </Select>
                </Form.Item>
            );
        }

        if (activeTab === 'doctor') {
            baseFields.push(
                <Form.Item
                    key="specialityList"
                    label="Specialities"
                    name="specialityList"
                    rules={[{ required: true, message: 'Please select at least one speciality' }]}
                >
                    <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="Enter or select specialities"
                        tokenSeparators={[',']}
                    />
                </Form.Item>,
                <Form.Item
                    key="languageList"
                    label="Languages"
                    name="languageList"
                    rules={[{ required: true, message: 'Please select at least one language' }]}
                >
                    <Select mode="multiple" placeholder="Select languages">
                        <Option value="ENGLISH">English</Option>
                        <Option value="MALAY">Malay</Option>
                        <Option value="CHINESE">Chinese</Option>
                    </Select>
                </Form.Item>,
                <Form.Item
                    key="qualifications"
                    label="Qualifications"
                    name="qualifications"
                    rules={[{ required: true, message: 'Please enter qualifications' }]}
                >
                    <Input.TextArea placeholder="Enter qualifications" />
                </Form.Item>
            );
        }

        return baseFields;
    };

    const currentTabData = tabData[activeTab];

    return (
        <div>
            <div className="mb-6">
                <Title level={2} className="mb-2">User Management</Title>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as UserType)}
                className="mb-4"
            >
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
                onAdd={activeTab !== 'patient' ? () => setCreateModalVisible(true) : undefined}
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
                        loadUsers(activeTab, page, pageSize);
                    },
                }}
            />

            {activeTab !== 'patient' && (
                <FormModal
                    title={`Create New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                    visible={createModalVisible}
                    onCancel={() => {
                        setCreateModalVisible(false);
                        form.resetFields();
                    }}
                    onOk={handleCreateUser}
                    loading={createLoading}
                    form={form}
                >
                    {getCreateFormFields()}
                </FormModal>
            )}

            {/* Image Upload Modal */}
            {(activeTab === 'doctor' || activeTab === 'pharmacist') && (
                <Modal
                    title={`Upload ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Image`}
                    open={imageUploadModalVisible}
                    onCancel={() => {
                        setImageUploadModalVisible(false);
                        setSelectedUserId('');
                    }}
                    footer={null}
                    destroyOnHidden={true}
                >
                    <div className="py-4">
                        <Upload
                            accept="image/*"
                            beforeUpload={(file) => {
                                handleImageUpload(file);
                                return false;
                            }}
                            showUploadList={false}
                        >
                            <Button
                                icon={<UploadOutlined />}
                                size="large"
                                block
                                loading={imageUploadLoading}
                                className="h-32 border-2 border-dashed border-gray-300 hover:border-blue-500"
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

const UserManagementPage = () => {
    return (
        <AdminLayout>
            <UserManagement />
        </AdminLayout>
    );
};

export default UserManagementPage;
