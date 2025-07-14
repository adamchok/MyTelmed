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
} from "antd";
import {
    Search,
    MapPin,
    Stethoscope,
    Languages,
    User,
    Building2,
    Filter,
    CheckCircle,
} from "lucide-react";
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
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [facilitiesLoading, setFacilitiesLoading] = useState(false);

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

    // Apply filters when data or filters change
    useEffect(() => {
        applyFilters();
    }, [doctors, searchTerm, selectedFacilityId, selectedSpeciality]);

    // Reset filters when modal closes
    useEffect(() => {
        if (!visible) {
            setSearchTerm("");
            setSelectedFacilityId("");
            setSelectedSpeciality("");
        }
    }, [visible]);

    const loadDoctors = async () => {
        try {
            setLoading(true);
            const response = await DoctorApi.getDoctors(0, 100); // Load more doctors
            if (response.data.isSuccess && response.data.data) {
                setDoctors(response.data.data.content || []);
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

    const applyFilters = () => {
        let filtered = [...doctors];

        // Search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(doctor =>
                doctor.name.toLowerCase().includes(searchLower) ||
                doctor.specialityList.some(spec =>
                    spec.toLowerCase().includes(searchLower)
                )
            );
        }

        // Facility filter
        if (selectedFacilityId) {
            filtered = filtered.filter(doctor =>
                doctor.facility.id === selectedFacilityId
            );
        }

        // Speciality filter
        if (selectedSpeciality) {
            filtered = filtered.filter(doctor =>
                doctor.specialityList.includes(selectedSpeciality)
            );
        }

        setFilteredDoctors(filtered);
    };

    const getDistinctSpecialities = () => {
        const allSpecialities = doctors.flatMap(doctor => doctor.specialityList);
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
    };

    const renderDoctorsContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center py-12">
                    <Spin size="large" />
                </div>
            );
        }

        if (filteredDoctors.length === 0) {
            return (
                <Empty
                    description="No doctors found matching your criteria"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            );
        }

        return (
            <Row gutter={[16, 16]}>
                {filteredDoctors.map((doctor) => (
                    <Col key={doctor.id} xs={24} sm={12} lg={8} xl={6}>
                        <Card
                            hoverable
                            className={`cursor-pointer transition-all border-2 h-full ${selectedDoctorId === doctor.id
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
                                            <Tag
                                                key={speciality}
                                                color="green"
                                                className="text-xs px-2 py-0"
                                            >
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
                                            {doctor.languageList.slice(0, 2)
                                                .map(getLanguageName)
                                                .join(", ")}
                                            {doctor.languageList.length > 2 && " +more"}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
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
                                {facilities.map(facility => (
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
                                {getDistinctSpecialities().map(speciality => (
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
                                <Button
                                    icon={<Filter className="w-4 h-4" />}
                                    onClick={clearFilters}
                                    size="middle"
                                >
                                    Clear Filters
                                </Button>
                                <Badge count={filteredDoctors.length} showZero>
                                    <Text type="secondary" className="text-xs">
                                        Results
                                    </Text>
                                </Badge>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Doctors Grid */}
                <div className="max-h-96 overflow-y-auto">
                    {renderDoctorsContent()}
                </div>

                {/* Summary */}
                {!loading && (
                    <div className="text-center text-sm text-gray-500 pt-4 border-t">
                        Showing {filteredDoctors.length} of {doctors.length} doctors
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default DoctorSelectionModal; 