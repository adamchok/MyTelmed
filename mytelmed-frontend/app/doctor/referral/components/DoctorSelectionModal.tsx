"use client";

import React, { useState, useEffect } from "react";
import {
    Modal,
    Row,
    Col,
    Input,
    Select,
    Card,
    Avatar,
    Typography,
    Button,
    Space,
    Tag,
    Empty,
    Spin,
    message,
    Badge,
    Pagination,
} from "antd";
import { Search, MapPin, Stethoscope, Languages, User, Building2, Filter, CheckCircle } from "lucide-react";
import DoctorApi from "@/app/api/doctor";
import FacilityApi from "@/app/api/facility";
import { Doctor } from "@/app/api/doctor/props";
import { Facility } from "@/app/api/facility/props";

const { Title, Text } = Typography;
const { Option } = Select;

interface DoctorSelectionModalProps {
    visible: boolean;
    onCancel: () => void;
    onSelect: (doctor: Doctor) => void;
    selectedDoctorId?: string;
}

const DoctorSelectionModal: React.FC<DoctorSelectionModalProps> = ({
    visible,
    onCancel,
    onSelect,
    selectedDoctorId,
}) => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(false);
    const [facilitiesLoading, setFacilitiesLoading] = useState(false);
    const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(12);
    const [totalDoctors, setTotalDoctors] = useState(0);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
    const [selectedSpeciality, setSelectedSpeciality] = useState<string>("");

    // Load data when modal opens
    useEffect(() => {
        if (visible) {
            loadDoctors();
            loadFacilities();
        }
    }, [visible]);

    // Load doctors when page or filters change
    useEffect(() => {
        if (visible) {
            loadDoctors();
        }
    }, [currentPage, searchTerm, selectedFacilityId, selectedSpeciality, visible]);

    // Reset page when filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [searchTerm, selectedFacilityId, selectedSpeciality]);

    // Reset filters when modal closes
    useEffect(() => {
        if (!visible) {
            setSearchTerm("");
            setSelectedFacilityId("");
            setSelectedSpeciality("");
            setCurrentPage(1);
        }
    }, [visible]);

    const loadDoctors = async () => {
        try {
            setLoading(true);

            const responseProfile = await DoctorApi.getDoctorProfile();
            if (responseProfile.data.isSuccess && responseProfile.data.data) {
                setCurrentDoctor(responseProfile.data.data);
            }

            const response = await DoctorApi.getDoctors(currentPage - 1, pageSize);
            if (response.data.isSuccess && response.data.data) {
                const doctorsData = response.data.data.content || [];
                const totalElements = response.data.data.totalElements || 0;

                // Apply client-side filters to the paginated results
                let filtered = [...doctorsData];

                // Filter current doctor
                filtered = filtered.filter((doctor) => doctor.id !== currentDoctor?.id);

                // Search filter
                if (searchTerm.trim()) {
                    const searchLower = searchTerm.toLowerCase().trim();
                    filtered = filtered.filter(
                        (doctor) =>
                            doctor.name.toLowerCase().includes(searchLower) ||
                            doctor.specialityList.some((spec) => spec.toLowerCase().includes(searchLower))
                    );
                }

                // Facility filter
                if (selectedFacilityId) {
                    filtered = filtered.filter((doctor) => doctor.facility.id === selectedFacilityId);
                }

                // Speciality filter
                if (selectedSpeciality) {
                    filtered = filtered.filter((doctor) => doctor.specialityList.includes(selectedSpeciality));
                }

                setDoctors(filtered);
                setTotalDoctors(totalElements);
            }
        } catch {
            message.error("Failed to load doctors");
        } finally {
            setLoading(false);
        }
    };

    const loadFacilities = async () => {
        try {
            setFacilitiesLoading(true);
            const response = await FacilityApi.findAllFacilities();
            if (response.data.isSuccess && response.data.data) {
                setFacilities(response.data.data || []);
            }
        } catch {
            message.error("Failed to load facilities");
        } finally {
            setFacilitiesLoading(false);
        }
    };

    // Load all doctors to get distinct specialities for filter
    const [allDoctorsForFilters, setAllDoctorsForFilters] = useState<Doctor[]>([]);

    useEffect(() => {
        if (visible && allDoctorsForFilters.length === 0) {
            loadAllDoctorsForFilters();
        }
    }, [visible, allDoctorsForFilters.length]);

    const loadAllDoctorsForFilters = async () => {
        try {
            const response = await DoctorApi.getDoctors(0, 1000); // Load a large number for filters
            if (response.data.isSuccess && response.data.data) {
                setAllDoctorsForFilters(response.data.data.content || []);
            }
        } catch {
            // Silently fail - filters will just be empty
        }
    };

    const getDistinctSpecialities = () => {
        const allSpecialities = allDoctorsForFilters.flatMap((doctor) => doctor.specialityList);
        return Array.from(new Set(allSpecialities)).sort((a, b) => a.localeCompare(b));
    };

    const getLanguageName = (langCode: string) => {
        const languageNames: { [key: string]: string } = {
            english: "English",
            malay: "Malay",
            mandarin: "Mandarin",
            tamil: "Tamil",
        };
        return languageNames[langCode.toLowerCase()] || langCode;
    };

    const handleDoctorSelect = (doctor: Doctor) => {
        onSelect(doctor);
        onCancel();
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedFacilityId("");
        setSelectedSpeciality("");
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const renderDoctorsContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center py-12">
                    <Spin size="large" />
                </div>
            );
        }

        if (doctors.length === 0) {
            return <Empty description="No doctors found matching your criteria" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
        }

        return (
            <div className="space-y-4">
                <Row gutter={[16, 16]}>
                    {doctors.map((doctor) => (
                        <Col key={doctor.id} xs={24} sm={12} lg={8} xl={6}>
                            <Card
                                hoverable
                                className={`cursor-pointer transition-all border-2 h-full ${
                                    selectedDoctorId === doctor.id
                                        ? "border-green-500 bg-green-50 shadow-md"
                                        : "border-gray-200 hover:border-green-300 hover:shadow-md"
                                }`}
                                onClick={() => handleDoctorSelect(doctor)}
                                size="small"
                            >
                                <div className="text-center space-y-3">
                                    {/* Doctor Avatar */}
                                    <div className="relative">
                                        <Avatar
                                            src={doctor.profileImageUrl}
                                            icon={<User className="w-6 h-6" />}
                                            size={64}
                                            className="border-2 border-green-100 mx-auto"
                                        />
                                        {selectedDoctorId === doctor.id && (
                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Doctor Info */}
                                    <div className="space-y-2">
                                        <Title level={5} className="mb-1 text-sm">
                                            {doctor.name}
                                        </Title>

                                        {/* Specialities */}
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {doctor.specialityList.slice(0, 2).map((speciality) => (
                                                <Tag key={speciality} color="green" className="text-xs px-2 py-0">
                                                    {speciality}
                                                </Tag>
                                            ))}
                                            {doctor.specialityList.length > 2 && (
                                                <Tag color="default" className="text-xs px-2 py-0">
                                                    +{doctor.specialityList.length - 2}
                                                </Tag>
                                            )}
                                        </div>

                                        {/* Facility */}
                                        <div className="flex items-center justify-center space-x-1 text-xs text-gray-600">
                                            <MapPin className="w-3 h-3" />
                                            <Text className="text-xs" ellipsis={{ tooltip: doctor.facility.name }}>
                                                {doctor.facility.name}
                                            </Text>
                                        </div>

                                        {/* Languages */}
                                        <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                                            <Languages className="w-3 h-3" />
                                            <Text className="text-xs">
                                                {doctor.languageList.slice(0, 2).map(getLanguageName).join(", ")}
                                                {doctor.languageList.length > 2 && " +more"}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Pagination */}
                {totalDoctors > pageSize && (
                    <div className="flex justify-center pt-4">
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={totalDoctors}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                            showQuickJumper={false}
                            showTotal={(total, range) => `Showing ${range[0]}-${range[1]} of ${total} doctors`}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <Modal
            title="Select Doctor for Referral"
            open={visible}
            onCancel={onCancel}
            width={1000}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
            ]}
            className="top-4"
            style={{ zIndex: 1001 }} // Higher z-index to overlay create referral modal
        >
            <div className="space-y-6">
                {/* Filters */}
                <Card size="small" className="bg-gray-50">
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={8} md={6}>
                            <Input
                                placeholder="Search doctors..."
                                prefix={<Search className="w-4 h-4 text-gray-400" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                allowClear
                                size="middle"
                            />
                        </Col>

                        <Col xs={24} sm={8} md={6}>
                            <Select
                                placeholder="Filter by facility"
                                value={selectedFacilityId || undefined}
                                onChange={setSelectedFacilityId}
                                allowClear
                                loading={facilitiesLoading}
                                className="w-full"
                                size="middle"
                            >
                                {facilities.map((facility) => (
                                    <Option key={facility.id} value={facility.id}>
                                        <Space>
                                            <Building2 className="w-4 h-4" />
                                            {facility.name}
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Col>

                        <Col xs={24} sm={8} md={6}>
                            <Select
                                placeholder="Filter by speciality"
                                value={selectedSpeciality || undefined}
                                onChange={setSelectedSpeciality}
                                allowClear
                                className="w-full"
                                size="middle"
                            >
                                {getDistinctSpecialities().map((speciality) => (
                                    <Option key={speciality} value={speciality}>
                                        <Space>
                                            <Stethoscope className="w-4 h-4" />
                                            {speciality}
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Col>

                        <Col xs={24} sm={24} md={6}>
                            <Space>
                                <Button icon={<Filter className="w-4 h-4" />} onClick={clearFilters} size="middle">
                                    Clear Filters
                                </Button>
                                <Text type="secondary" className="text-xs">
                                    Results
                                </Text>
                                <Badge count={doctors.length} showZero></Badge>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Doctors Grid */}
                <div className="max-h-96 overflow-y-auto overflow-x-hidden">{renderDoctorsContent()}</div>

                {/* Summary */}
                {!loading && (
                    <div className="text-center text-sm text-gray-500 pt-4 border-t">
                        Total: {totalDoctors} doctors available
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default DoctorSelectionModal;
