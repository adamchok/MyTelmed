"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Input, Select, Button, Avatar, Typography, Badge, Spin, Empty, message } from "antd";
import { Search, MapPin, Stethoscope, Languages, User, ArrowRight, Filter } from "lucide-react";
import { RootState } from "@/lib/store";
import { setSelectedDoctor, setDoctorFilters, nextStep } from "@/lib/reducers/appointment-booking-reducer";
import DoctorApi from "@/app/api/doctor";
import FacilityApi from "@/app/api/facility";
import { Doctor } from "@/app/api/doctor/props";
import { Facility } from "@/app/api/facility/props";

const { Title, Text } = Typography;
const { Option } = Select;

export default function DoctorSelectionStep() {
    const dispatch = useDispatch();
    const { selectedDoctor, doctorFilters } = useSelector((state: RootState) => state.rootReducer.appointmentBooking);

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(false);
    const [facilitiesLoading, setFacilitiesLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);

    // Get distinct specialties from existing doctors
    const getDistinctSpecialties = () => {
        const allSpecialties = allDoctors.flatMap((doctor) => doctor.specialityList);
        return Array.from(new Set(allSpecialties)).sort((a, b) => a.localeCompare(b));
    };

    // Get language name from language code
    const getLanguageName = (langCode: string) => {
        const languageNames: { [key: string]: string } = {
            english: "English",
            malay: "Malay",
            mandarin: "Mandarin",
            tamil: "Tamil",
        };
        return languageNames[langCode.toLowerCase()] || langCode;
    };

    // Load facilities on mount
    useEffect(() => {
        loadFacilities();
    }, []);

    // Load doctors when filters change
    useEffect(() => {
        loadDoctors();
    }, [doctorFilters]);

    const loadFacilities = async () => {
        try {
            setFacilitiesLoading(true);
            const response = await FacilityApi.findAllFacilities();
            if (response.data.isSuccess) {
                setFacilities(response.data.data || []);
            }
        } catch {
            message.error("Failed to load facilities");
        } finally {
            setFacilitiesLoading(false);
        }
    };

    const loadDoctors = async (page = 0) => {
        try {
            setLoading(true);
            const response = await DoctorApi.getDoctors(page, 10);

            if (response.data.isSuccess) {
                const newDoctors = response.data.data?.content || [];

                if (page === 0) {
                    setAllDoctors(newDoctors);
                    const filteredDoctors = newDoctors.filter((doctor) => filterDoctor(doctor, doctorFilters));
                    setDoctors(filteredDoctors);
                } else {
                    const updatedAllDoctors = [...allDoctors, ...newDoctors];
                    setAllDoctors(updatedAllDoctors);
                    const filteredDoctors = newDoctors.filter((doctor) => filterDoctor(doctor, doctorFilters));
                    setDoctors((prev) => [...prev, ...filteredDoctors]);
                }

                setHasMore(!(response.data.data?.last || true));
                setCurrentPage(page);
            }
        } catch {
            message.error("Failed to load doctors");
        } finally {
            setLoading(false);
        }
    };

    const filterDoctor = (doctor: Doctor, filters: any) => {
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            if (!doctor.name.toLowerCase().includes(searchLower)) {
                return false;
            }
        }

        if (filters.facilityId && filters.facilityId !== "") {
            if (doctor.facility.id !== filters.facilityId) {
                return false;
            }
        }

        if (filters.speciality && filters.speciality !== "") {
            if (!doctor.specialityList.includes(filters.speciality)) {
                return false;
            }
        }

        return true;
    };

    const handleFilterChange = (key: string, value: any) => {
        dispatch(setDoctorFilters({ [key]: value }));
        setCurrentPage(0);
    };

    const handleSelectDoctor = (doctor: Doctor) => {
        dispatch(setSelectedDoctor(doctor));
    };

    const handleNext = () => {
        if (!selectedDoctor) {
            message.warning("Please select a doctor to continue");
            return;
        }
        dispatch(nextStep());
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            loadDoctors(currentPage + 1);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card title="Find Your Doctor" className="shadow-lg">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <div className="space-y-2">
                            <Text className="text-sm font-medium text-gray-700">
                                <Search className="inline w-4 h-4 mr-1" />
                                Search by Name
                            </Text>
                            <Input
                                placeholder="Enter doctor's name"
                                value={doctorFilters.searchTerm}
                                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                                className="h-10"
                            />
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div className="space-y-2">
                            <Text className="text-sm font-medium text-gray-700">
                                <MapPin className="inline w-4 h-4 mr-1" />
                                Medical Facility
                            </Text>
                            <Select
                                placeholder="Select facility"
                                value={doctorFilters.facilityId || undefined}
                                onChange={(value) => handleFilterChange("facilityId", value)}
                                className="w-full h-10"
                                loading={facilitiesLoading}
                                allowClear
                            >
                                {facilities.map((facility) => (
                                    <Option key={facility.id} value={facility.id}>
                                        {facility.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div className="space-y-2">
                            <Text className="text-sm font-medium text-gray-700">
                                <Stethoscope className="inline w-4 h-4 mr-1" />
                                Specialty
                            </Text>
                            <Select
                                placeholder="Select specialty"
                                value={doctorFilters.speciality || undefined}
                                onChange={(value) => handleFilterChange("speciality", value)}
                                className="w-full h-10"
                                allowClear
                            >
                                {getDistinctSpecialties().map((specialty: string) => (
                                    <Option key={specialty} value={specialty}>
                                        {specialty}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Doctor List */}
            <Card title="Available Doctors" className="shadow-lg">
                {loading && doctors.length === 0 && (
                    <div className="text-center py-8">
                        <Spin size="large" />
                    </div>
                )}
                {!loading && doctors.length === 0 && <Empty description="No doctors found matching your criteria" />}
                {!loading && doctors.length > 0 && (
                    <div className="space-y-4">
                        <Row gutter={[16, 16]}>
                            {doctors.map((doctor) => (
                                <Col xs={24} md={12} lg={8} key={doctor.id}>
                                    <Card
                                        hoverable
                                        className={`cursor-pointer transition-all duration-200 ${
                                            selectedDoctor?.id === doctor.id
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:border-blue-300"
                                        }`}
                                        onClick={() => handleSelectDoctor(doctor)}
                                    >
                                        <div className="flex flex-col items-center text-center space-y-3">
                                            <Avatar
                                                src={doctor.profileImageUrl}
                                                icon={<User className="w-6 h-6" />}
                                                size={80}
                                                className="border-2 border-blue-100"
                                            />
                                            <div>
                                                <Title level={4} className="mb-1">
                                                    {doctor.name}
                                                </Title>
                                                <Text className="text-gray-600 text-sm">{doctor.facility.name}</Text>
                                            </div>
                                            <div className="w-full space-y-2">
                                                <div className="flex flex-wrap gap-1 justify-center">
                                                    {doctor.specialityList.map((specialty) => (
                                                        <Badge
                                                            key={specialty}
                                                            count={specialty}
                                                            color="blue"
                                                            className="text-xs"
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-center text-xs text-gray-500">
                                                    <Languages className="w-3 h-3 mr-1" />
                                                    {doctor.languageList
                                                        .map((lang) => getLanguageName(lang))
                                                        .join(", ")}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {hasMore && (
                            <div className="text-center pt-4">
                                <Button
                                    type="default"
                                    loading={loading}
                                    onClick={loadMore}
                                    icon={<Filter className="w-4 h-4" />}
                                >
                                    Load More Doctors
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Selected Doctor Info */}
            {selectedDoctor && (
                <Card className="shadow-lg border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Avatar
                                src={selectedDoctor.profileImageUrl}
                                icon={<User className="w-6 h-6" />}
                                size={60}
                            />
                            <div>
                                <Title level={4} className="mb-1">
                                    Selected: Dr. {selectedDoctor.name}
                                </Title>
                                <Text className="text-gray-600">{selectedDoctor.facility.name}</Text>
                            </div>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleNext}
                            icon={<ArrowRight className="w-4 h-4" />}
                        >
                            Next: Choose Time
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
