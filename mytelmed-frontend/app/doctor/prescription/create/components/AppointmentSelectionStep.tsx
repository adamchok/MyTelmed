"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Input, Button, Avatar, Typography, Badge, Spin, Empty, message, DatePicker } from "antd";
import { Search, Calendar, User, ArrowRight, Filter, Clock, FileText } from "lucide-react";
import { RootState } from "@/lib/store";
import { setSelectedAppointment, setPastAppointments, setAppointmentFilters, nextStep } from "@/lib/reducers/prescription-creation-reducer";
import AppointmentApi from "@/app/api/appointment";
import { AppointmentDto } from "@/app/api/appointment/props";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function AppointmentSelectionStep() {
    const dispatch = useDispatch();
    const { selectedAppointment, pastAppointments, appointmentFilters } = useSelector(
        (state: RootState) => state.rootReducer.prescriptionCreation
    );

    const [loading, setLoading] = useState(false);
    const [filteredAppointments, setFilteredAppointments] = useState<AppointmentDto[]>([]);

    useEffect(() => {
        loadPastAppointments();
    }, []);

    useEffect(() => {
        filterAppointments();
    }, [pastAppointments, appointmentFilters]);

    const loadPastAppointments = async () => {
        try {
            setLoading(true);
            const response = await AppointmentApi.getAllAppointmentsByAccount();
            if (response.data.isSuccess && response.data.data) {
                // Filter for completed appointments only
                const completedAppointments = response.data.data.filter(
                    apt => apt.status === "COMPLETED" // && new Date(apt.appointmentDateTime) < new Date()
                );
                // Sort by date descending (most recent first)
                completedAppointments.sort((a, b) =>
                    new Date(b.appointmentDateTime).getTime() - new Date(a.appointmentDateTime).getTime()
                );
                dispatch(setPastAppointments(completedAppointments));
            }
        } catch (error) {
            console.error("Failed to load past appointments:", error);
            message.error("Failed to load past appointments");
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        let filtered = [...pastAppointments];

        // Filter by patient name
        if (appointmentFilters.patientName) {
            filtered = filtered.filter(apt =>
                apt.patient.name.toLowerCase().includes(appointmentFilters.patientName.toLowerCase())
            );
        }

        // Filter by date range
        if (appointmentFilters.dateRange && appointmentFilters.dateRange.length === 2) {
            const [startDate, endDate] = appointmentFilters.dateRange;
            filtered = filtered.filter(apt => {
                const aptDate = new Date(apt.appointmentDateTime);
                return aptDate >= new Date(startDate) && aptDate <= new Date(endDate);
            });
        }

        setFilteredAppointments(filtered);
    };

    const handleAppointmentSelect = (appointment: AppointmentDto) => {
        dispatch(setSelectedAppointment(appointment));
    };

    const handleNext = () => {
        if (!selectedAppointment) {
            message.warning("Please select an appointment to continue");
            return;
        }
        dispatch(nextStep());
    };

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format("MMM DD, YYYY");
    };

    const formatTime = (dateString: string) => {
        return dayjs(dateString).format("h:mm A");
    };

    const getPatientName = (appointment: AppointmentDto) => {
        return `${appointment.patient.name}`;
    };

    const getPatientInitials = (appointment: AppointmentDto) => {
        return `${appointment.patient.name.charAt(0)}`;
    };

    const handleFilterChange = (field: string, value: any) => {
        dispatch(setAppointmentFilters({ [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6" style={{ backgroundColor: "white" }}>
            {/* Header */}
            <Card className="shadow-sm" style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}>
                <div className="text-center mb-6">
                    <Title level={3} className="text-green-800 mb-2">
                        Select Past Appointment
                    </Title>
                    <Text className="text-gray-600">
                        Choose a completed appointment to create a prescription for the patient
                    </Text>
                </div>

                {/* Filters */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} md={8}>
                        <div className="space-y-2">
                            <Text className="text-sm font-medium text-gray-700">Patient Name</Text>
                            <Input
                                placeholder="Search by patient name..."
                                prefix={<Search className="w-4 h-4 text-gray-400" />}
                                value={appointmentFilters.patientName}
                                onChange={(e) => handleFilterChange("patientName", e.target.value)}
                                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <div className="space-y-2">
                            <Text className="text-sm font-medium text-gray-700">Date Range</Text>
                            <RangePicker
                                value={appointmentFilters.dateRange ? [dayjs(appointmentFilters.dateRange[0]), dayjs(appointmentFilters.dateRange[1])] : null}
                                onChange={(dates) => {
                                    if (dates && dates[0] && dates[1]) {
                                        handleFilterChange("dateRange", [dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")]);
                                    } else {
                                        handleFilterChange("dateRange", null);
                                    }
                                }}
                                className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={24} md={8}>
                        <div className="space-y-2">
                            <Text className="text-sm font-medium text-gray-700">Actions</Text>
                            <Button
                                icon={<Filter className="w-4 h-4" />}
                                onClick={() => {
                                    dispatch(setAppointmentFilters({
                                        patientName: "",
                                        dateRange: null,
                                        status: "all"
                                    }));
                                }}
                                className="w-full border-gray-300 hover:border-green-500 hover:text-green-600"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Appointments List */}
            <Card
                title={
                    <span className="flex items-center gap-2 text-green-800">
                        <Calendar className="w-5 h-5" />
                        Past Appointments ({filteredAppointments.length})
                    </span>
                }
                className="shadow-sm"
                style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
            >
                {filteredAppointments.length === 0 ? (
                    <Empty
                        description="No completed appointments found"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        className="py-8"
                    />
                ) : (
                    <div className="space-y-4">
                        {filteredAppointments.map((appointment) => (
                            <Card
                                key={appointment.id}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedAppointment?.id === appointment.id
                                    ? "border-green-500 bg-green-50 shadow-md"
                                    : "border-gray-200 hover:border-green-300"
                                    }`}
                                onClick={() => handleAppointmentSelect(appointment)}
                                style={{ backgroundColor: selectedAppointment?.id === appointment.id ? "#f0fdf4" : "white" }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Avatar
                                            size={48}
                                            className="bg-green-500 text-white font-semibold"
                                        >
                                            {getPatientInitials(appointment)}
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <Text className="font-semibold text-gray-900 text-base">
                                                    {getPatientName(appointment)}
                                                </Text>
                                                <Badge
                                                    color="green"
                                                    text={appointment.status}
                                                    className="text-xs"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-4 mt-1">
                                                <span className="flex items-center text-gray-600 text-sm">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {formatDate(appointment.appointmentDateTime)}
                                                </span>
                                                <span className="flex items-center text-gray-600 text-sm">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {formatTime(appointment.appointmentDateTime)}
                                                </span>
                                                <span className="flex items-center text-gray-600 text-sm">
                                                    <User className="w-4 h-4 mr-1" />
                                                    {appointment.consultationMode}
                                                </span>
                                            </div>
                                            {appointment.reasonForVisit && (
                                                <div className="flex items-center mt-2 text-gray-600 text-sm">
                                                    <FileText className="w-4 h-4 mr-1" />
                                                    <span className="italic">{appointment.reasonForVisit}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {selectedAppointment?.id === appointment.id && (
                                        <div className="flex items-center text-green-600">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Card>

            {/* Continue Button */}
            <div className="flex justify-end pt-4">
                <Button
                    type="primary"
                    size="large"
                    onClick={handleNext}
                    disabled={!selectedAppointment}
                    className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 disabled:bg-gray-400 disabled:border-gray-400"
                    style={{ backgroundColor: selectedAppointment ? "#059669" : undefined }}
                >
                    Continue to Prescription Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
