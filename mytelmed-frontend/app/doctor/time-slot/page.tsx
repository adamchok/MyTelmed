"use client";

import React, { useState, useEffect } from "react";
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

type ViewMode = "grid" | "list";

export default function DoctorTimeSlotPage() {
    const [activeTab, setActiveTab] = useState("my-time-slots");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [loading, setLoading] = useState(true);
    const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotDto | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Statistics
    const [totalTimeSlots, setTotalTimeSlots] = useState(0);
    const [availableTimeSlots, setAvailableTimeSlots] = useState(0);
    const [bookedTimeSlots, setBookedTimeSlots] = useState(0);
    const [disabledTimeSlots, setDisabledTimeSlots] = useState(0);
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

                const available = timeSlotsData.filter(slot => slot.isAvailable && !slot.isBooked).length;
                setAvailableTimeSlots(available);

                const booked = timeSlotsData.filter(slot => slot.isBooked).length;
                setBookedTimeSlots(booked);

                const disabled = timeSlotsData.filter(slot => !slot.isAvailable).length;
                setDisabledTimeSlots(disabled);

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
        setSelectedTimeSlot(timeSlot);
        setShowTimeSlotModal(true);
    };

    const handleViewTimeSlot = (timeSlot: TimeSlotDto) => {
        setSelectedTimeSlot(timeSlot);
        setShowTimeSlotModal(true);
    };

    const handleToggleAvailability = async (timeSlot: TimeSlotDto) => {
        if (!TimeSlotUtils.canEditTimeSlot(timeSlot)) {
            message.error("Cannot modify booked time slots");
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

    // Render list view
    const renderListView = () => {
        const sortedTimeSlots = TimeSlotUtils.sortTimeSlots(timeSlots);

        if (sortedTimeSlots.length === 0) {
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
                <Row gutter={[16, 16]}>
                    {sortedTimeSlots.map((timeSlot) => (
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
        <div className="container mx-auto p-4 space-y-6">
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
                <Col xs={24} sm={12} md={8} lg={6}>
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
                <Col xs={24} sm={12} md={8} lg={6}>
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
                <Col xs={24} sm={12} md={8} lg={6}>
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
                <Col xs={24} sm={12} md={8} lg={6}>
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
            >
                <TimeSlotForm
                    onSubmit={handleCreateTimeSlot}
                    onCancel={() => setShowCreateModal(false)}
                />
            </Modal>

            {/* Time Slot Detail/Edit Modal */}
            <TimeSlotModal
                timeSlot={selectedTimeSlot}
                visible={showTimeSlotModal}
                onClose={handleCloseTimeSlotModal}
                onUpdate={handleTimeSlotUpdate}
            />
        </div>
    );
}
