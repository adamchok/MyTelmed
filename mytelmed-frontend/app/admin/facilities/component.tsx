"use client";

import React from "react";
import { Typography, Tag, Form, Input, Select, Modal, Upload, Button, Tooltip, Row, Col, Image } from "antd";
import {
    EditOutlined,
    EyeOutlined,
    CameraOutlined,
    InfoCircleOutlined,
    BuildOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";
import DataTable, { DataTableColumn, DataTableAction } from "../../components/DataTable/DataTable";
import FormModal from "../../components/FormModal/FormModal";
import { FacilityManagementComponentProps, MALAYSIAN_STATES, FACILITY_TYPES } from "./props";
import { Facility } from "../../api/facility/props";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const FacilityManagementComponent: React.FC<FacilityManagementComponentProps> = ({
    loading,
    pagination,
    createModalVisible,
    editModalVisible,
    viewModalVisible,
    imageUploadModalVisible,
    createLoading,
    editLoading,
    imageUploadLoading,
    selectedFacility,
    searchTerm,
    selectedState,
    selectedType,
    filteredFacilities,
    createForm,
    editForm,
    onCreateFacility,
    onUpdateFacility,
    onImageUpload,
    onPaginationChange,
    onSearchChange,
    onStateFilterChange,
    onTypeFilterChange,
    onCreateModalOpen,
    onCreateModalClose,
    onViewModalOpen,
    onViewModalClose,
    onEditModalOpen,
    onEditModalClose,
    onImageUploadModalOpen,
    onImageUploadModalClose,
}) => {
    const getFacilityColumns = (): DataTableColumn<Facility>[] => [
        {
            title: "Image",
            dataIndex: "thumbnailUrl",
            key: "thumbnailUrl",
            width: 120,
            render: (value) => (
                <div className="flex justify-center">
                    {value ? (
                        <Image
                            src={value}
                            alt="Facility"
                            width={80}
                            height={80}
                            className="object-cover rounded border"
                        />
                    ) : (
                        <div className="w-[80px] h-[80px] bg-gray-100 rounded border flex items-center justify-center">
                            <span className="text-xs text-gray-400">No Image</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Facility",
            dataIndex: "name",
            key: "name",
            width: 300,
            render: (value, record) => (
                <div>
                    <div className="font-medium text-gray-900 mb-1">{value || "N/A"}</div>
                    <div className="text-sm text-gray-500">
                        <Tag color={record.facilityType === "HOSPITAL" ? "blue" : "green"}>
                            {record.facilityType === "HOSPITAL" ? "Hospital" : "Clinic"}
                        </Tag>
                    </div>
                </div>
            ),
        },
        {
            title: "Contact",
            dataIndex: "telephone",
            key: "telephone",
            width: 150,
            render: (value) => value || "N/A",
        },
        {
            title: "Location",
            dataIndex: "address",
            key: "address",
            width: 400,
            render: (value, record) => (
                <div>
                    <div className="text-sm text-gray-900 mb-1">{value || "N/A"}</div>
                    <div className="text-xs text-gray-500">
                        {record.city}, {record.state}
                    </div>
                </div>
            ),
        },
    ];

    const getFacilityActions = (): DataTableAction<Facility>[] => [
        {
            label: "View",
            onClick: (record) => {
                onViewModalOpen(record);
            },
            icon: <EyeOutlined />,
            type: "default",
            showLabel: false,
            tooltip: "View Facility Details",
        },
        {
            label: "Edit",
            onClick: (record) => {
                onEditModalOpen(record);
            },
            icon: <EditOutlined />,
            type: "default",
            showLabel: false,
            tooltip: "Edit Facility",
        },
        {
            label: "Upload Image",
            onClick: (record) => {
                onImageUploadModalOpen(record);
            },
            icon: <CameraOutlined />,
            type: "default",
            showLabel: false,
            tooltip: "Upload Facility Image",
        },
    ];

    const getFormFields = () => [
        <Form.Item
            key="name"
            label={
                <span className="text-sm font-medium text-gray-700 flex items-center">
                    Facility Name
                    <Tooltip title="Enter the official name of the healthcare facility">
                        <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                    </Tooltip>
                </span>
            }
            name="name"
            rules={[
                { required: true, message: "Please enter facility name" },
                { min: 2, message: "Name must be at least 2 characters long" },
                { max: 200, message: "Name cannot exceed 200 characters" },
            ]}
        >
            <Input
                placeholder="Enter facility name"
                prefix={<BuildOutlined className="text-gray-400" />}
                className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                autoComplete="organization"
            />
        </Form.Item>,
        <Form.Item
            key="facilityType"
            label={
                <span className="text-sm font-medium text-gray-700 flex items-center">
                    Facility Type
                    <Tooltip title="Select whether this is a hospital or clinic">
                        <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                    </Tooltip>
                </span>
            }
            name="facilityType"
            rules={[{ required: true, message: "Please select facility type" }]}
        >
            <Select placeholder="Select facility type" className="rounded-xl">
                {FACILITY_TYPES.map((type) => (
                    <Option key={type.value} value={type.value}>
                        {type.label}
                    </Option>
                ))}
            </Select>
        </Form.Item>,
        <Form.Item
            key="telephone"
            label={
                <span className="text-sm font-medium text-gray-700 flex items-center">
                    Phone Number
                    <Tooltip title="Main contact number for the facility">
                        <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                    </Tooltip>
                </span>
            }
            name="telephone"
            rules={[
                { required: true, message: "Please enter phone number" },
                {
                    pattern: /^(03)\d{7,8}$/,
                    message: "Please enter a valid Malaysian landline number",
                },
            ]}
        >
            <Input
                placeholder="Enter phone number (e.g., 0312345678)"
                prefix={<PhoneOutlined className="text-gray-400" />}
                className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                autoComplete="tel"
                addonBefore="+6"
                maxLength={10}
            />
        </Form.Item>,
        <Form.Item
            key="address"
            label={
                <span className="text-sm font-medium text-gray-700 flex items-center">
                    Street Address
                    <Tooltip title="Complete street address of the facility">
                        <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                    </Tooltip>
                </span>
            }
            name="address"
            rules={[
                { required: true, message: "Please enter address" },
                { min: 10, message: "Address must be at least 10 characters long" },
                { max: 500, message: "Address cannot exceed 500 characters" },
            ]}
        >
            <TextArea
                placeholder="Enter complete street address"
                rows={3}
                className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                showCount
                maxLength={500}
            />
        </Form.Item>,
        <Form.Item
            key="city"
            label={
                <span className="text-sm font-medium text-gray-700 flex items-center">
                    City
                    <Tooltip title="City where the facility is located">
                        <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                    </Tooltip>
                </span>
            }
            name="city"
            rules={[
                { required: true, message: "Please enter city" },
                { min: 2, message: "City must be at least 2 characters long" },
                { max: 100, message: "City cannot exceed 100 characters" },
            ]}
        >
            <Input
                placeholder="Enter city"
                prefix={<EnvironmentOutlined className="text-gray-400" />}
                className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                autoComplete="address-level2"
            />
        </Form.Item>,
        <Form.Item
            key="state"
            label={
                <span className="text-sm font-medium text-gray-700 flex items-center">
                    State
                    <Tooltip title="Malaysian state where the facility is located">
                        <InfoCircleOutlined className="text-blue-500 ml-2 cursor-pointer hover:text-blue-600 transition-colors" />
                    </Tooltip>
                </span>
            }
            name="state"
            rules={[{ required: true, message: "Please select state" }]}
        >
            <Select
                placeholder="Select state"
                className="rounded-xl"
                showSearch
                filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
            >
                {MALAYSIAN_STATES.map((state) => (
                    <Option key={state} value={state}>
                        {state}
                    </Option>
                ))}
            </Select>
        </Form.Item>,
    ];

    return (
        <div>
            <div className="mb-6">
                <Title level={2} className="mb-2">
                    Facility Management
                </Title>
                <p className="text-gray-600">Manage healthcare facilities and their information</p>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Input.Search
                            placeholder="Search facilities..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            allowClear
                            className="w-full"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            placeholder="Filter by state"
                            value={selectedState}
                            onChange={onStateFilterChange}
                            allowClear
                            className="w-full"
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {MALAYSIAN_STATES.map((state) => (
                                <Option key={state} value={state}>
                                    {state}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            placeholder="Filter by type"
                            value={selectedType}
                            onChange={onTypeFilterChange}
                            allowClear
                            className="w-full"
                        >
                            {FACILITY_TYPES.map((type) => (
                                <Option key={type.value} value={type.value}>
                                    {type.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </div>

            <DataTable<Facility>
                title="Healthcare Facilities"
                data={filteredFacilities}
                columns={getFacilityColumns()}
                loading={loading}
                onAdd={onCreateModalOpen}
                addButtonText="Create Facility"
                actions={getFacilityActions()}
                rowKey="id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} facilities`,
                    onChange: onPaginationChange,
                }}
            />

            {/* Create Facility Modal */}
            <FormModal
                title="Create New Facility"
                visible={createModalVisible}
                onCancel={onCreateModalClose}
                onOk={onCreateFacility}
                loading={createLoading}
                form={createForm}
                width={800}
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <InfoCircleOutlined className="text-blue-500 mt-1" />
                            <div>
                                <p className="text-sm font-medium text-blue-800 mb-1">Facility Information</p>
                                <p className="text-sm text-blue-600">
                                    Please provide accurate information about the healthcare facility. This information
                                    will be visible to patients when they search for facilities.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            {getFormFields().slice(0, 3)}
                        </Col>
                        <Col xs={24} md={12}>
                            {getFormFields().slice(3)}
                        </Col>
                    </Row>
                </div>
            </FormModal>

            {/* Edit Facility Modal */}
            <FormModal
                title="Edit Facility"
                visible={editModalVisible}
                onCancel={onEditModalClose}
                onOk={onUpdateFacility}
                loading={editLoading}
                form={editForm}
                width={800}
            >
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <InfoCircleOutlined className="text-green-500 mt-1" />
                            <div>
                                <p className="text-sm font-medium text-green-800 mb-1">Update Facility Information</p>
                                <p className="text-sm text-green-600">
                                    Modify the facility details as needed. Changes will be immediately visible to
                                    patients.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            {getFormFields().slice(0, 3)}
                        </Col>
                        <Col xs={24} md={12}>
                            {getFormFields().slice(3)}
                        </Col>
                    </Row>
                </div>
            </FormModal>

            {/* View Facility Modal */}
            <Modal
                title="Facility Details"
                open={viewModalVisible}
                onCancel={onViewModalClose}
                footer={[
                    <Button key="close" onClick={onViewModalClose}>
                        Close
                    </Button>,
                    <Button
                        key="edit"
                        type="primary"
                        onClick={() => {
                            onViewModalClose();
                            if (selectedFacility) {
                                onEditModalOpen(selectedFacility);
                            }
                        }}
                    >
                        Edit Facility
                    </Button>,
                ]}
                width={700}
                centered
            >
                {selectedFacility && (
                    <div className="space-y-6">
                        {/* Facility Image */}
                        <div className="flex justify-center">
                            {selectedFacility.thumbnailUrl ? (
                                <Image
                                    src={selectedFacility.thumbnailUrl}
                                    alt={selectedFacility.name}
                                    className="w-64 h-48 object-cover rounded-lg border shadow-sm"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            ) : (
                                <div className="w-64 h-48 bg-gray-100 rounded-lg border flex items-center justify-center">
                                    <div className="text-center">
                                        <CameraOutlined className="text-4xl text-gray-400 mb-2" />
                                        <p className="text-gray-500">No Image Available</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Facility Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Facility Name</span>
                                        <p className="text-gray-900">{selectedFacility.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Type</span>
                                        <div>
                                            <Tag
                                                color={selectedFacility.facilityType === "HOSPITAL" ? "blue" : "green"}
                                            >
                                                {selectedFacility.facilityType === "HOSPITAL" ? "Hospital" : "Clinic"}
                                            </Tag>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Phone Number</span>
                                        <p className="text-gray-900">+60 {selectedFacility.telephone}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Address</span>
                                        <p className="text-gray-900">{selectedFacility.address}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">City</span>
                                        <p className="text-gray-900">{selectedFacility.city}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">State</span>
                                        <p className="text-gray-900">{selectedFacility.state}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center space-x-4 pt-4 border-t">
                            <Button
                                icon={<CameraOutlined />}
                                onClick={() => {
                                    onViewModalClose();
                                    onImageUploadModalOpen(selectedFacility);
                                }}
                            >
                                Upload Image
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Image Upload Modal */}
            <Modal
                title="Upload Facility Image"
                open={imageUploadModalVisible}
                onCancel={onImageUploadModalClose}
                footer={null}
                destroyOnHidden={true}
                centered
            >
                <div className="py-4 flex justify-center items-center flex-col">
                    <div className="text-center mb-4">
                        <p className="text-gray-600 mb-2">
                            Upload a high-quality image of the facility to help patients identify it.
                        </p>
                        <p className="text-sm text-gray-500">Recommended: 800x600 pixels, JPG or PNG format, max 5MB</p>
                    </div>
                    <Upload
                        accept="image/*"
                        beforeUpload={(file) => {
                            onImageUpload(file);
                            return false;
                        }}
                        showUploadList={false}
                    >
                        <Button
                            size="large"
                            block
                            loading={imageUploadLoading}
                            className="h-32 border-2 border-dashed border-gray-300 hover:border-blue-500"
                        >
                            <div className="flex flex-col items-center justify-center">
                                <CameraOutlined className="text-3xl text-gray-400 mb-2" />
                                <span>Click to upload facility image</span>
                                <span className="text-sm text-gray-500">JPG, PNG up to 5MB</span>
                            </div>
                        </Button>
                    </Upload>
                </div>
            </Modal>
        </div>
    );
};

export default FacilityManagementComponent;
