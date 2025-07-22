"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Typography, Avatar, Empty, Spin, message, Button, Pagination, Input, Select, DatePicker, Row, Col } from "antd";
import { User, ArrowRight, Search, Calendar, Filter } from "lucide-react";
import dayjs from "dayjs";
import { RootState } from "@/lib/store";
import { setSelectedAppointment, nextStep } from "@/lib/reducers/referral-creation-reducer";
import AppointmentApi from "@/app/api/appointment";
import { AppointmentDto } from "@/app/api/appointment/props";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function PatientSelectionStep() {
    const dispatch = useDispatch();
    const { selectedAppointment } = useSelector((state: RootState) => state.rootReducer.referralCreation);

    const [allAppointments, setAllAppointments] = useState<AppointmentDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("COMPLETED");
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

    // Client-side pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(8);

    useEffect(() => {
        loadAllAppointments();
    }, []);

    const loadAllAppointments = async () => {
        try {
            setLoading(true);
            const response = await AppointmentApi.getAllAppointmentsByAccount();
            if (response.data.isSuccess && response.data.data) {
                setAllAppointments(response.data.data);
            }
        } catch {
            message.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    // Filter and search logic
    const filteredAppointments = useMemo(() => {
        let filtered = allAppointments;

        // Filter by status
        if (selectedStatus) {
            filtered = filtered.filter((apt) => apt.status === selectedStatus);
        }

        // Filter by search term (patient name or reason for visit)
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter((apt) =>
                apt.patient.name.toLowerCase().includes(searchLower) ||
                apt.reasonForVisit?.toLowerCase().includes(searchLower) ||
                apt.patient.email?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by date range
        if (dateRange && dateRange[0] && dateRange[1]) {
            const [startDate, endDate] = dateRange;
            filtered = filtered.filter((apt) => {
                if (!apt.completedAt) return false;
                const completedDate = dayjs(Number(apt.completedAt) * 1000);
                return completedDate.isAfter(startDate!.startOf('day')) &&
                    completedDate.isBefore(endDate!.endOf('day'));
            });
        }

        // Sort by completion date (most recent first)
        return filtered.sort((a, b) => {
            const dateA = a.completedAt ? Number(a.completedAt) : 0;
            const dateB = b.completedAt ? Number(b.completedAt) : 0;
            return dateB - dateA;
        });
    }, [allAppointments, searchTerm, selectedStatus, dateRange]);

    // Client-side pagination
    const paginatedAppointments = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredAppointments.slice(startIndex, endIndex);
    }, [filteredAppointments, currentPage, pageSize]);

    const handleSelectAppointment = (appointment: AppointmentDto) => {
        dispatch(setSelectedAppointment(appointment));
    };

    const handleNext = () => {
        if (!selectedAppointment) {
            message.warning("Please select a patient to continue");
            return;
        }
        dispatch(nextStep());
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Clear selection when changing pages if the selected appointment is not on the current page
        if (selectedAppointment && !paginatedAppointments.some(apt => apt.id === selectedAppointment.id)) {
            dispatch(setSelectedAppointment(null));
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
        setDateRange(dates);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("COMPLETED");
        setDateRange(null);
        setCurrentPage(1);
        dispatch(setSelectedAppointment(null));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <Title level={4} className="my-0">Select Patient from Your Appointments</Title>
                <Text type="secondary">Search and filter through your appointments to find the patient you want to refer.</Text>
            </div>

            {/* Search and Filter Controls */}
            <Card className="bg-gray-50">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Search by patient name, email, or reason..."
                            prefix={<Search className="w-4 h-4 text-gray-400" />}
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Status"
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            className="w-full"
                            suffixIcon={<Filter className="w-4 h-4" />}
                        >
                            <Option value="">All Statuses</Option>
                            <Option value="COMPLETED">Completed</Option>
                            <Option value="CANCELLED">Cancelled</Option>
                            <Option value="SCHEDULED">Scheduled</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <RangePicker
                            placeholder={["Start Date", "End Date"]}
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            className="w-full"
                            suffixIcon={<Calendar className="w-4 h-4" />}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Button onClick={clearFilters} className="w-full">
                            Clear Filters
                        </Button>
                    </Col>
                </Row>
                <div className="mt-3 text-sm text-gray-600">
                    Showing {filteredAppointments.length} appointment(s) {searchTerm || selectedStatus !== "COMPLETED" || dateRange ? "(filtered)" : ""}
                </div>
            </Card>

            {filteredAppointments.length === 0 ? (
                <div className="text-center py-8">
                    <Empty
                        description={
                            searchTerm || selectedStatus || dateRange
                                ? "No appointments found matching your filters"
                                : "No appointments found"
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        {(searchTerm || selectedStatus !== "COMPLETED" || dateRange) && (
                            <Button onClick={clearFilters}>Clear Filters</Button>
                        )}
                    </Empty>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Appointments List */}
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {paginatedAppointments.map((appointment) => (
                            <Card
                                key={appointment.id}
                                hoverable
                                className={`cursor-pointer border-2 transition-all ${selectedAppointment?.id === appointment.id
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 hover:border-green-300"
                                    }`}
                                onClick={() => handleSelectAppointment(appointment)}
                                size="small"
                            >
                                <div className="flex items-center space-x-3">
                                    <Avatar
                                        src={appointment.patient.profileImageUrl}
                                        icon={<User className="w-4 h-4" />}
                                        size={40}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <Text strong>{appointment.patient.name}</Text>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${appointment.status === "COMPLETED"
                                                ? "bg-green-100 text-green-800"
                                                : appointment.status === "CANCELLED"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-blue-100 text-blue-800"
                                                }`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {appointment.status === "COMPLETED" && appointment.completedAt ? (
                                                `Completed: ${dayjs(Number(appointment.completedAt) * 1000).format("MMM DD, YYYY HH:mm")}`
                                            ) : (
                                                `Scheduled: ${dayjs(appointment.appointmentDateTime).format("MMM DD, YYYY HH:mm")}`
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">{appointment.reasonForVisit || "No reason specified"}</div>
                                        <div className="text-xs text-gray-400">{appointment.patient.email}</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {filteredAppointments.length > pageSize && (
                        <div className="flex justify-center pt-4">
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={filteredAppointments.length}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                                showQuickJumper={false}
                                showTotal={(total, range) =>
                                    `${range[0]}-${range[1]} of ${total} appointments`
                                }
                                size="small"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-end pt-4 border-t">
                <Button
                    type="primary"
                    onClick={handleNext}
                    disabled={!selectedAppointment}
                    icon={<ArrowRight className="w-4 h-4" />}
                    className="bg-green-700 hover:bg-green-800 border-green-700 text-white"
                >
                    Next: Referral Type
                </Button>
            </div>
        </div>
    );
}
