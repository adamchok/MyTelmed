"use client";

import React, { useState, useMemo } from "react";
import { Card, Empty, Spin, Typography, Row, Col, Button, Space, DatePicker, Select } from "antd";
import { ChevronLeft, ChevronRight, Calendar, Filter } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { TimeSlotDto } from "@/app/api/timeslot/props";
import { ConsultationMode } from "@/app/api/props";
import { TimeSlotUtils } from "../utils";
import TimeSlotCard from "./TimeSlotCard";
import DayTimeSlotsModal from "./DayTimeSlotsModal";

const { Title } = Typography;
const { Option } = Select;

interface TimeSlotGridProps {
    timeSlots: TimeSlotDto[];
    loading?: boolean;
    onEditTimeSlot?: (timeSlot: TimeSlotDto) => void;
    onViewTimeSlot?: (timeSlot: TimeSlotDto) => void;
    onToggleAvailability?: (timeSlot: TimeSlotDto) => void;
    onRefresh?: () => void;
}

type ViewMode = "week" | "month";
type StatusFilter = "all" | "available" | "booked" | "disabled" | "past";
type ConsultationFilter = "all" | ConsultationMode.VIRTUAL | ConsultationMode.PHYSICAL;

export default function TimeSlotGrid({
    timeSlots,
    loading = false,
    onEditTimeSlot,
    onViewTimeSlot,
    onToggleAvailability,
}: Readonly<TimeSlotGridProps>) {
    const [viewMode, setViewMode] = useState<ViewMode>("week");
    const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [consultationFilter, setConsultationFilter] = useState<ConsultationFilter>("all");

    // Modal state for viewing all day slots
    const [dayModalVisible, setDayModalVisible] = useState(false);
    const [selectedDayDate, setSelectedDayDate] = useState<Dayjs | null>(null);
    const [selectedDaySlots, setSelectedDaySlots] = useState<TimeSlotDto[]>([]);

    // Filter time slots based on current filters
    const filteredTimeSlots = useMemo(() => {
        return timeSlots.filter((slot) => {
            // Status filter
            if (statusFilter !== "all") {
                if (statusFilter === "available" && (!slot.isAvailable || slot.isBooked || TimeSlotUtils.isTimeSlotInPast(slot))) return false;
                if (statusFilter === "booked" && !slot.isBooked) return false;
                if (statusFilter === "disabled" && (slot.isAvailable || TimeSlotUtils.isTimeSlotInPast(slot))) return false;
                if (statusFilter === "past" && !TimeSlotUtils.isTimeSlotInPast(slot)) return false;
            }

            // Consultation mode filter
            if (consultationFilter !== "all" && slot.consultationMode !== consultationFilter) {
                return false;
            }

            return true;
        });
    }, [timeSlots, statusFilter, consultationFilter]);

    // Get date range based on view mode
    const getDateRange = () => {
        if (viewMode === "week") {
            const startOfWeek = currentDate.startOf("week");
            const endOfWeek = currentDate.endOf("week");
            return { start: startOfWeek, end: endOfWeek };
        } else {
            const startOfMonth = currentDate.startOf("month");
            const endOfMonth = currentDate.endOf("month");
            return { start: startOfMonth, end: endOfMonth };
        }
    };

    const dateRange = getDateRange();

    // Filter time slots for current date range
    const currentPeriodSlots = useMemo(() => {
        return filteredTimeSlots.filter((slot) => {
            const slotDate = dayjs(slot.startTime);
            return slotDate.isAfter(dateRange.start.subtract(1, "day")) &&
                slotDate.isBefore(dateRange.end.add(1, "day"));
        });
    }, [filteredTimeSlots, dateRange.start, dateRange.end]);

    // Group time slots by date
    const groupedSlots = useMemo(() => {
        return TimeSlotUtils.groupTimeSlotsByDate(currentPeriodSlots);
    }, [currentPeriodSlots]);

    // Generate dates for the current period
    const generateDates = () => {
        const dates = [];
        let current = dateRange.start;

        while (current.isBefore(dateRange.end.add(1, "day"))) {
            dates.push(current);
            current = current.add(1, "day");
        }

        return dates;
    };

    const dates = generateDates();

    const navigatePrevious = () => {
        setCurrentDate(currentDate.subtract(1, viewMode));
    };

    const navigateNext = () => {
        setCurrentDate(currentDate.add(1, viewMode));
    };

    const navigateToday = () => {
        setCurrentDate(dayjs());
    };

    const handleDateChange = (date: Dayjs | null) => {
        if (date) {
            setCurrentDate(date);
        }
    };

    const getPeriodTitle = () => {
        if (viewMode === "week") {
            return `${dateRange.start.format("MMM D")} - ${dateRange.end.format("MMM D, YYYY")}`;
        } else {
            return currentDate.format("MMMM YYYY");
        }
    };

    const isToday = (date: Dayjs) => {
        return date.isSame(dayjs(), "day");
    };

    const getDaySlots = (date: Dayjs) => {
        const dateKey = date.format("YYYY-MM-DD");
        const daySlots = groupedSlots[dateKey] || [];
        return TimeSlotUtils.sortTimeSlots(daySlots);
    };

    const handleViewAllSlots = (date: Dayjs, slots: TimeSlotDto[]) => {
        setSelectedDayDate(date);
        setSelectedDaySlots(slots);
        setDayModalVisible(true);
    };

    const handleCloseDayModal = () => {
        setDayModalVisible(false);
        setSelectedDayDate(null);
        setSelectedDaySlots([]);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <Card className="shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Navigation and Period Title */}
                    <div className="flex items-center gap-4">
                        <Space>
                            <Button
                                type="text"
                                icon={<ChevronLeft className="w-4 h-4" />}
                                onClick={navigatePrevious}
                                size="middle"
                            />
                            <Button
                                type="default"
                                onClick={navigateToday}
                                size="middle"
                                className="min-w-[70px]"
                            >
                                Today
                            </Button>
                            <Button
                                type="text"
                                icon={<ChevronRight className="w-4 h-4" />}
                                onClick={navigateNext}
                                size="middle"
                            />
                        </Space>
                        <Title level={4} className="mb-0 mt-0">
                            {getPeriodTitle()}
                        </Title>
                    </div>

                    {/* Filters and Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                        <DatePicker
                            value={currentDate}
                            onChange={handleDateChange}
                            picker={viewMode === "week" ? "week" : "month"}
                            size="middle"
                            allowClear={false}
                            suffixIcon={<Calendar className="w-4 h-4" />}
                        />

                        <Select
                            value={viewMode}
                            onChange={setViewMode}
                            size="middle"
                        >
                            <Option value="week">Week</Option>
                            <Option value="month">Month</Option>
                        </Select>

                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
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
                            value={consultationFilter}
                            onChange={setConsultationFilter}
                            size="middle"
                        >
                            <Option value="all">All Types</Option>
                            <Option value={ConsultationMode.VIRTUAL}>Virtual</Option>
                            <Option value={ConsultationMode.PHYSICAL}>Physical</Option>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* Time Slots Grid */}
            <div className="space-y-4">
                {dates.length === 0 ? (
                    <Empty description="No dates to display" />
                ) : (
                    <Row gutter={[16, 16]}>
                        {dates.map((date) => {
                            const daySlots = getDaySlots(date);
                            const isCurrentDay = isToday(date);

                            return (
                                <Col
                                    key={date.format("YYYY-MM-DD")}
                                    xs={24}
                                    sm={viewMode === "week" ? 24 : 12}
                                    md={viewMode === "week" ? 12 : 8}
                                    lg={viewMode === "week" ? 8 : 6}
                                    xl={viewMode === "week" ? 6 : 4}
                                >
                                    <Card
                                        size="small"
                                        className={`h-full ${isCurrentDay
                                            ? "border-green-300 bg-green-50"
                                            : "border-gray-200"
                                            }`}
                                        title={
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm font-semibold ${isCurrentDay ? "text-green-700" : "text-gray-700"
                                                    }`}>
                                                    {date.format("ddd, MMM D")}
                                                </span>
                                                {daySlots.length > 0 && (
                                                    <span className="text-xs text-gray-500">
                                                        {daySlots.length > 2 ? (
                                                            <>2 of {daySlots.length} slots</>
                                                        ) : (
                                                            <>{daySlots.length} slot{daySlots.length !== 1 ? "s" : ""}</>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        }
                                        styles={{
                                            header: { padding: "8px 12px", minHeight: "40px" },
                                            body: { padding: "8px" },
                                        }}
                                    >
                                        <div className="space-y-2 min-h-[100px]">
                                            {daySlots.length === 0 ? (
                                                <div className="text-center text-gray-400 text-xs py-4">
                                                    No time slots
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Show first 2 time slots */}
                                                    {daySlots.slice(0, 2).map((slot) => (
                                                        <TimeSlotCard
                                                            key={slot.id}
                                                            timeSlot={slot}
                                                            onEdit={onEditTimeSlot}
                                                            onView={onViewTimeSlot}
                                                            onToggleAvailability={onToggleAvailability}
                                                            compact={true}
                                                        />
                                                    ))}

                                                    {/* Show "View All" button if more than 2 slots */}
                                                    {daySlots.length > 2 && (
                                                        <div className="pt-1 border-t border-gray-100">
                                                            <Button
                                                                type="link"
                                                                size="small"
                                                                className="w-full text-center text-blue-600 hover:text-blue-800 text-xs h-6 p-0 font-medium"
                                                                onClick={() => handleViewAllSlots(date, daySlots)}
                                                            >
                                                                +{daySlots.length - 2} more slots
                                                            </Button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </div>

            {/* Summary */}
            {currentPeriodSlots.length > 0 && (
                <Card size="small" className="bg-gray-50">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Available: {currentPeriodSlots.filter(s => s.isAvailable && !s.isBooked && !TimeSlotUtils.isTimeSlotInPast(s)).length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>Booked: {currentPeriodSlots.filter(s => s.isBooked).length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span>Disabled: {currentPeriodSlots.filter(s => !s.isAvailable && !TimeSlotUtils.isTimeSlotInPast(s)).length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                            <span>Past: {currentPeriodSlots.filter(s => TimeSlotUtils.isTimeSlotInPast(s)).length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Total: {currentPeriodSlots.length}</span>
                        </div>
                    </div>
                </Card>
            )}

            {/* Day Time Slots Modal */}
            <DayTimeSlotsModal
                visible={dayModalVisible}
                onClose={handleCloseDayModal}
                date={selectedDayDate}
                timeSlots={selectedDaySlots}
                onEditTimeSlot={onEditTimeSlot}
                onViewTimeSlot={onViewTimeSlot}
                onToggleAvailability={onToggleAvailability}
            />
        </div>
    );
}
