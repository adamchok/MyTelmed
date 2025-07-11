"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Form, message } from "antd";
import FacilityApi from "../../api/facility";
import { Facility, CreateFacilityRequest, UpdateFacilityRequest } from "../../api/facility/props";
import FacilityManagementComponent from "./component";

const FacilityManagement = () => {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Modal states
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [imageUploadModalVisible, setImageUploadModalVisible] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [imageUploadLoading, setImageUploadLoading] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
    const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

    // Forms
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const loadFacilities = useCallback(async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await FacilityApi.findFacilities({ page: page - 1, pageSize });

            if (response.data.isSuccess && response.data.data) {
                const facilitiesData = response.data.data;

                if (Array.isArray(facilitiesData)) {
                    // If response is just an array
                    setFacilities(facilitiesData);
                    setPagination((prev) => ({
                        ...prev,
                        current: page,
                        pageSize,
                        total: facilitiesData.length,
                    }));
                } else if (facilitiesData && "content" in facilitiesData) {
                    // If response is paginated
                    setFacilities(facilitiesData.content || []);
                    setPagination({
                        current: page,
                        pageSize,
                        total: facilitiesData.totalElements || 0,
                    });
                }
            }
        } catch {
            message.error("Failed to load facilities");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFacilities();
    }, [loadFacilities]);

    // Filtered facilities based on search and filters
    const filteredFacilities = useMemo(() => {
        return facilities.filter((facility) => {
            const matchesSearch =
                !searchTerm ||
                facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                facility.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                facility.city.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesState = !selectedState || facility.state === selectedState;
            const matchesType = !selectedType || facility.facilityType === selectedType;

            return matchesSearch && matchesState && matchesType;
        });
    }, [facilities, searchTerm, selectedState, selectedType]);

    const handleCreateFacility = async () => {
        try {
            const values = await createForm.validateFields();
            setCreateLoading(true);

            const facilityData: CreateFacilityRequest = {
                name: values.name,
                telephone: values.telephone,
                address: values.address,
                city: values.city,
                state: values.state,
                facilityType: values.facilityType,
            };

            await FacilityApi.createFacility(facilityData);
            message.success("Facility created successfully");
            setCreateModalVisible(false);
            createForm.resetFields();
            loadFacilities();
        } catch {
            message.error("Failed to create facility");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleUpdateFacility = async () => {
        if (!selectedFacility) return;

        try {
            const values = await editForm.validateFields();
            setEditLoading(true);

            const facilityData: UpdateFacilityRequest = {
                name: values.name,
                telephone: values.telephone,
                address: values.address,
                city: values.city,
                state: values.state,
                facilityType: values.facilityType,
            };

            await FacilityApi.updateFacility(selectedFacility.id, facilityData);
            message.success("Facility updated successfully");
            setEditModalVisible(false);
            editForm.resetFields();
            setSelectedFacility(null);
            loadFacilities();
        } catch {
            message.error("Failed to update facility");
        } finally {
            setEditLoading(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        if (!selectedFacility) return;

        try {
            setImageUploadLoading(true);
            await FacilityApi.uploadImage(selectedFacility.id, file);
            message.success("Image uploaded successfully");
            setImageUploadModalVisible(false);
            setSelectedFacility(null);
            loadFacilities();
        } catch {
            message.error("Failed to upload image");
        } finally {
            setImageUploadLoading(false);
        }
    };

    const handlePaginationChange = (page: number, pageSize: number) => {
        loadFacilities(page, pageSize);
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    };

    const handleStateFilterChange = (value: string | undefined) => {
        setSelectedState(value);
    };

    const handleTypeFilterChange = (value: string | undefined) => {
        setSelectedType(value);
    };

    const handleCreateModalOpen = () => {
        setCreateModalVisible(true);
    };

    const handleCreateModalClose = () => {
        setCreateModalVisible(false);
        createForm.resetFields();
    };

    const handleViewModalOpen = (facility: Facility) => {
        setSelectedFacility(facility);
        setViewModalVisible(true);
    };

    const handleViewModalClose = () => {
        setViewModalVisible(false);
        setSelectedFacility(null);
    };

    const handleEditModalOpen = (facility: Facility) => {
        setSelectedFacility(facility);
        editForm.setFieldsValue({
            name: facility.name,
            telephone: facility.telephone,
            address: facility.address,
            city: facility.city,
            state: facility.state,
            facilityType: facility.facilityType,
        });
        setEditModalVisible(true);
    };

    const handleEditModalClose = () => {
        setEditModalVisible(false);
        editForm.resetFields();
        setSelectedFacility(null);
    };

    const handleImageUploadModalOpen = (facility: Facility) => {
        setSelectedFacility(facility);
        setImageUploadModalVisible(true);
    };

    const handleImageUploadModalClose = () => {
        setImageUploadModalVisible(false);
        setSelectedFacility(null);
    };

    return (
        <FacilityManagementComponent
            facilities={facilities}
            loading={loading}
            pagination={pagination}
            createModalVisible={createModalVisible}
            editModalVisible={editModalVisible}
            viewModalVisible={viewModalVisible}
            imageUploadModalVisible={imageUploadModalVisible}
            createLoading={createLoading}
            editLoading={editLoading}
            imageUploadLoading={imageUploadLoading}
            selectedFacility={selectedFacility}
            searchTerm={searchTerm}
            selectedState={selectedState}
            selectedType={selectedType}
            filteredFacilities={filteredFacilities}
            createForm={createForm}
            editForm={editForm}
            onCreateFacility={handleCreateFacility}
            onUpdateFacility={handleUpdateFacility}
            onImageUpload={handleImageUpload}
            onPaginationChange={handlePaginationChange}
            onSearchChange={handleSearchChange}
            onStateFilterChange={handleStateFilterChange}
            onTypeFilterChange={handleTypeFilterChange}
            onCreateModalOpen={handleCreateModalOpen}
            onCreateModalClose={handleCreateModalClose}
            onViewModalOpen={handleViewModalOpen}
            onViewModalClose={handleViewModalClose}
            onEditModalOpen={handleEditModalOpen}
            onEditModalClose={handleEditModalClose}
            onImageUploadModalOpen={handleImageUploadModalOpen}
            onImageUploadModalClose={handleImageUploadModalClose}
        />
    );
};

const FacilityManagementPage = () => {
    return <FacilityManagement />;
};

export default FacilityManagementPage;
