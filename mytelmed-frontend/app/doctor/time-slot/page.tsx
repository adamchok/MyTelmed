"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    Tabs,
    Button,
    Typography,
    Row,
    Col,
    Statistic,
    Spin,
    message,
    Modal,
    Select,
} from "antd";
import {
    Clock,
    Calendar,
    CheckCircle,
    XCircle,
    Plus,
    Grid3X3,
    List,
    Monitor,
    MapPin,
    History,
    Filter,
    ArrowUpDown,
} from "lucide-react";
import TimeSlotApi from "@/app/api/timeslot";
import { TimeSlotDto, CreateTimeSlotRequestDto } from "@/app/api/timeslot/props";
import { ConsultationMode } from "@/app/api/props";
import TimeSlotGrid from "./components/TimeSlotGrid";
import TimeSlotForm from "./components/TimeSlotForm";
import TimeSlotModal from "./components/TimeSlotModal";
import TimeSlotCard from "./components/TimeSlotCard";
import { TimeSlotUtils } from "./utils";

const { Title } = Typography;
const { Option } = Select;

type ViewMode = "grid" | "list";
type StatusFilter = "all" | "available" | "booked" | "disabled" | "past";
type ConsultationFilter = "all" | ConsultationMode.VIRTUAL | ConsultationMode.PHYSICAL;
type SortOption = "date-asc" | "date-desc" | "status" | "type";

export default function DoctorTimeSlotPage() {
    const [activeTab, setActiveTab] = useState("my-time-slots");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [loading, setLoading] = useState(true);
    const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotDto | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // List view filters and sorting
    const [listStatusFilter, setListStatusFilter] = useState<StatusFilter>("all");
    const [listConsultationFilter, setListConsultationFilter] = useState<ConsultationFilter>("all");
    const [listSortOption, setListSortOption] = useState<SortOption>("date-asc");

    // Statistics
    const [totalTimeSlots, setTotalTimeSlots] = useState(0);
    const [availableTimeSlots, setAvailableTimeSlots] = useState(0);
    const [bookedTimeSlots, setBookedTimeSlots] = useState(0);
    const [disabledTimeSlots, setDisabledTimeSlots] = useState(0);
    const [pastTimeSlots, setPastTimeSlots] = useState(0);
    const [virtualSlots, setVirtualSlots] = useState(0);
    const [physicalSlots, setPhysicalSlots] = useState(0);

    // Load time slots and calculate statistics
    const loadTimeSlots = async () => {
        try {
            const response = await TimeSlotApi.getDoctorTimeSlots();
            if (response.data.isSuccess && response.data.data) {
                const timeSlotsData = response.data.data;
                setTimeSlots(timeSlotsData);

                // Calculate statistics
                setTotalTimeSlots(timeSlotsData.length);

                const available = timeSlotsData.filter(slot => slot.isAvailable && !slot.isBooked && !TimeSlotUtils.isTimeSlotInPast(slot)).length;
                setAvailableTimeSlots(available);

                const booked = timeSlotsData.filter(slot => slot.isBooked).length;
                setBookedTimeSlots(booked);

                const disabled = timeSlotsData.filter(slot => !slot.isAvailable && !TimeSlotUtils.isTimeSlotInPast(slot)).length;
                setDisabledTimeSlots(disabled);

                const past = timeSlotsData.filter(slot => TimeSlotUtils.isTimeSlotInPast(slot)).length;
                setPastTimeSlots(past);

                const virtual = timeSlotsData.filter(slot => slot.consultationMode === ConsultationMode.VIRTUAL).length;
                setVirtualSlots(virtual);

                const physical = timeSlotsData.filter(slot => slot.consultationMode === ConsultationMode.PHYSICAL).length;
                setPhysicalSlots(physical);
            }
        } catch (error) {
            console.error("Failed to load time slots:", error);
            message.error("Failed to load time slots");
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            await loadTimeSlots();
        } catch {
            message.error("Failed to load time slot data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [refreshTrigger]);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleCreateTimeSlot = async (data: CreateTimeSlotRequestDto) => {
        try {
            await TimeSlotApi.createTimeSlot(data);
            setShowCreateModal(false);
            handleRefresh();
            message.success("Time slot created successfully");
        } catch (error) {
            console.error("Failed to create time slot:", error);
            message.error("Failed to create time slot");
        }
    };

    const handleEditTimeSlot = (timeSlot: TimeSlotDto) => {
        if (!TimeSlotUtils.canEditTimeSlot(timeSlot)) {
            if (TimeSlotUtils.isTimeSlotInPast(timeSlot)) {
                message.error("Cannot edit past time slots");
            } else if (timeSlot.isBooked) {
                message.error("Cannot edit booked time slots");
            }
            return;
        }
        setSelectedTimeSlot(timeSlot);
        setShowTimeSlotModal(true);
    };

    const handleViewTimeSlot = (timeSlot: TimeSlotDto) => {
        setSelectedTimeSlot(timeSlot);
        setShowTimeSlotModal(true);
    };

    const handleToggleAvailability = async (timeSlot: TimeSlotDto) => {
        if (!TimeSlotUtils.canEditTimeSlot(timeSlot)) {
            if (TimeSlotUtils.isTimeSlotInPast(timeSlot)) {
                message.error("Cannot modify past time slots");
            } else if (timeSlot.isBooked) {
                message.error("Cannot modify booked time slots");
            }
            return;
        }

        try {
            if (timeSlot.isAvailable) {
                await TimeSlotApi.disableTimeSlot(timeSlot.id);
                message.success("Time slot disabled successfully");
            } else {
                await TimeSlotApi.enableTimeSlot(timeSlot.id);
                message.success("Time slot enabled successfully");
            }
            handleRefresh();
        } catch (error) {
            console.error("Failed to toggle time slot availability:", error);
            message.error("Failed to update time slot availability");
        }
    };

    const handleTimeSlotUpdate = () => {
        handleRefresh();
        setShowTimeSlotModal(false);
        setSelectedTimeSlot(null);
    };

    const handleCloseTimeSlotModal = () => {
        setShowTimeSlotModal(false);
        setSelectedTimeSlot(null);
    };

    // Memoized filtered and sorted time slots for list view
    const filteredAndSortedTimeSlots = useMemo(() => {
        // First apply filters
        const filtered = timeSlots.filter((slot) => {
            // Status filter
            if (listStatusFilter !== "all") {
                if (listStatusFilter === "available" && (!slot.isAvailable || slot.isBooked || TimeSlotUtils.isTimeSlotInPast(slot))) return false;
                if (listStatusFilter === "booked" && !slot.isBooked) return false;
                if (listStatusFilter === "disabled" && (slot.isAvailable || TimeSlotUtils.isTimeSlotInPast(slot))) return false;
                if (listStatusFilter === "past" && !TimeSlotUtils.isTimeSlotInPast(slot)) return false;
            }

            // Consultation mode filter
            if (listConsultationFilter !== "all" && slot.consultationMode !== listConsultationFilter) {
                return false;
            }

            return true;
        });

        // Then apply sorting
        return filtered.sort((a, b) => {
            switch (listSortOption) {
                case "date-asc":
                    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
                case "date-desc":
                    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
                case "status": {
                    const statusPriority = { "Available": 1, "Booked": 2, "Disabled": 3, "Past": 4 };
                    const aStatus = TimeSlotUtils.getTimeSlotStatus(a);
                    const bStatus = TimeSlotUtils.getTimeSlotStatus(b);
                    return (statusPriority[aStatus as keyof typeof statusPriority] || 5) - (statusPriority[bStatus as keyof typeof statusPriority] || 5);
                }
                case "type":
                    return a.consultationMode.localeCompare(b.consultationMode);
                default:
                    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
            }
        });
    }, [timeSlots, listStatusFilter, listConsultationFilter, listSortOption]);

    // Render list view
    const renderListView = () => {

        if (timeSlots.length === 0) {
            return (
                <Card className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <Title level={4} className="text-gray-500 mb-2">
                        No Time Slots Yet
                    </Title>
                    <p className="text-gray-400 mb-6">
                        Create your first time slot to start accepting appointments
                    </p>
                    <Button
                        type="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowCreateModal(true)}
                        className="bg-green-600 hover:bg-green-700 border-green-600"
                    >
                        Create Time Slot
                    </Button>
                </Card>
            );
        }

        return (
            <div className="space-y-4">
                {/* Filter and Sort Controls */}
                <Card size="small" className="shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Filter & Sort:</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                value={listStatusFilter}
                                onChange={setListStatusFilter}
                                size="middle"
                                suffixIcon={<Filter className="w-4 h-4" />}
                            >
                                <Option value="all">All Status</Option>
                                <Option value="available">Available</Option>
                                <Option value="booked">Booked</Option>
                                <Option value="disabled">Disabled</Option>
                                <Option value="past">Past</Option>
                            </Select>

                            <Select
                                value={listConsultationFilter}
                                onChange={setListConsultationFilter}
                                size="middle"
                            >
                                <Option value="all">All Types</Option>
                                <Option value={ConsultationMode.VIRTUAL}>Virtual</Option>
                                <Option value={ConsultationMode.PHYSICAL}>Physical</Option>
                            </Select>

                            <Select
                                value={listSortOption}
                                onChange={setListSortOption}
                                size="middle"
                                suffixIcon={<ArrowUpDown className="w-4 h-4" />}
                            >
                                <Option value="date-asc">Date (Oldest First)</Option>
                                <Option value="date-desc">Date (Newest First)</Option>
                                <Option value="status">By Status</Option>
                                <Option value="type">By Type</Option>
                            </Select>

                            {(listStatusFilter !== "all" || listConsultationFilter !== "all" || listSortOption !== "date-asc") && (
                                <Button
                                    size="middle"
                                    onClick={() => {
                                        setListStatusFilter("all");
                                        setListConsultationFilter("all");
                                        setListSortOption("date-asc");
                                    }}
                                    className="text-gray-600"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Results Summary */}
                {filteredAndSortedTimeSlots.length !== timeSlots.length && (
                    <div className="text-sm text-gray-600 px-1">
                        Showing {filteredAndSortedTimeSlots.length} of {timeSlots.length} time slots
                    </div>
                )}

                {/* Time Slots Grid */}
                {filteredAndSortedTimeSlots.length === 0 ? (
                    <Card className="text-center py-8">
                        <div className="text-gray-400 mb-2">No time slots match your filters</div>
                        <Button
                            size="small"
                            onClick={() => {
                                setListStatusFilter("all");
                                setListConsultationFilter("all");
                                setListSortOption("date-asc");
                            }}
                        >
                            Clear Filters
                        </Button>
                    </Card>
                ) : (
                    <Row gutter={[16, 16]}>
                        {filteredAndSortedTimeSlots.map((timeSlot) => (
                            <Col key={timeSlot.id} xs={24} sm={12} lg={8} xl={6}>
                                <TimeSlotCard
                                    timeSlot={timeSlot}
                                    onEdit={handleEditTimeSlot}
                                    onView={handleViewTimeSlot}
                                    onToggleAvailability={handleToggleAvailability}
                                />
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Title level={2} className="text-gray-800 mb-2 mt-0 text-lg sm:text-xl md:text-3xl">
                        Time Slot Management
                    </Title>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                        Manage your availability and appointment time slots
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowCreateModal(true)}
                    size="middle"
                    className="bg-green-600 hover:bg-green-700 border-green-600 w-full sm:w-auto"
                >
                    New Time Slot
                </Button>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6} xl={5}>
                    <Card className="h-full">
                        <Statistic
                            title={
                                <span className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    Total Time Slots
                                </span>
                            }
                            value={totalTimeSlots}
                            valueStyle={{ color: '#1890ff', fontSize: '1.5rem' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={5}>
                    <Card className="h-full">
                        <Statistic
                            title={
                                <span className="flex items-center gap-2 text-xs sm:text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    Available
                                </span>
                            }
                            value={availableTimeSlots}
                            valueStyle={{ color: '#52c41a', fontSize: '1.5rem' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={5}>
                    <Card className="h-full">
                        <Statistic
                            title={
                                <span className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Calendar className="w-4 h-4 text-red-600" />
                                    Booked
                                </span>
                            }
                            value={bookedTimeSlots}
                            valueStyle={{ color: '#ff4d4f', fontSize: '1.5rem' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={5}>
                    <Card className="h-full">
                        <Statistic
                            title={
                                <span className="flex items-center gap-2 text-xs sm:text-sm">
                                    <XCircle className="w-4 h-4 text-orange-600" />
                                    Disabled
                                </span>
                            }
                            value={disabledTimeSlots}
                            valueStyle={{ color: '#faad14', fontSize: '1.5rem' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                    <Card className="h-full">
                        <Statistic
                            title={
                                <span className="flex items-center gap-2 text-xs sm:text-sm">
                                    <History className="w-4 h-4 text-gray-600" />
                                    Past
                                </span>
                            }
                            value={pastTimeSlots}
                            valueStyle={{ color: '#8c8c8c', fontSize: '1.5rem' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Consultation Type Statistics */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                    <Card className="h-full">
                        <Statistic
                            title={
                                <span className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Monitor className="w-4 h-4 text-purple-600" />
                                    Virtual Consultations
                                </span>
                            }
                            value={virtualSlots}
                            valueStyle={{ color: '#722ed1', fontSize: '1.5rem' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card className="h-full">
                        <Statistic
                            title={
                                <span className="flex items-center gap-2 text-xs sm:text-sm">
                                    <MapPin className="w-4 h-4 text-indigo-600" />
                                    Physical Consultations
                                </span>
                            }
                            value={physicalSlots}
                            valueStyle={{ color: '#1d39c4', fontSize: '1.5rem' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Content Tabs */}
            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    tabBarExtraContent={
                        timeSlots.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    type={viewMode === "grid" ? "primary" : "default"}
                                    icon={<Grid3X3 className="w-4 h-4" />}
                                    size="small"
                                    onClick={() => setViewMode("grid")}
                                    className={viewMode === "grid" ? "bg-green-600 border-green-600" : ""}
                                />
                                <Button
                                    type={viewMode === "list" ? "primary" : "default"}
                                    icon={<List className="w-4 h-4" />}
                                    size="small"
                                    onClick={() => setViewMode("list")}
                                    className={viewMode === "list" ? "bg-green-600 border-green-600" : ""}
                                />
                            </div>
                        )
                    }
                    items={[
                        {
                            key: "my-time-slots",
                            label: (
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span className="hidden sm:inline">My Time Slots</span>
                                    <span className="sm:hidden">Time Slots</span>
                                </span>
                            ),
                            children: (
                                <div className="min-h-[400px]">
                                    {viewMode === "grid" ? (
                                        <TimeSlotGrid
                                            timeSlots={timeSlots}
                                            onEditTimeSlot={handleEditTimeSlot}
                                            onViewTimeSlot={handleViewTimeSlot}
                                            onToggleAvailability={handleToggleAvailability}
                                            onRefresh={handleRefresh}
                                        />
                                    ) : (
                                        renderListView()
                                    )}
                                </div>
                            ),
                        },
                    ]}
                />
            </Card>

            {/* Create Time Slot Modal */}
            <Modal
                title={
                    <span className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create New Time Slot
                    </span>
                }
                open={showCreateModal}
                onCancel={() => setShowCreateModal(false)}
                footer={null}
                width={600}
                destroyOnHidden={true}
                centered
            >
                <TimeSlotForm
                    onSubmit={handleCreateTimeSlot}
                    onCancel={() => setShowCreateModal(false)}
                    existingTimeSlots={timeSlots}
                />
            </Modal>

            {/* Time Slot Detail/Edit Modal */}
            <TimeSlotModal
                timeSlot={selectedTimeSlot}
                visible={showTimeSlotModal}
                onClose={handleCloseTimeSlotModal}
                onUpdate={handleTimeSlotUpdate}
                existingTimeSlots={timeSlots}
            />
        </div>
    );
}
