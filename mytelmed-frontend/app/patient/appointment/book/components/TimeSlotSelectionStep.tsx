"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Button, Typography, DatePicker, Select, Tag, Avatar, Empty, Spin, message, Badge } from "antd";
import { Calendar, Clock, Video, MapPin, ArrowRight, ArrowLeft, User } from "lucide-react";
import dayjs from "dayjs";
import { RootState } from "@/lib/store";
import {
    setSelectedTimeSlot,
    setTimeSlotFilters,
    nextStep,
    previousStep,
} from "@/lib/reducers/appointment-booking-reducer";
import TimeSlotApi from "@/app/api/timeslot";
import { TimeSlotDto } from "@/app/api/timeslot/props";
import { ConsultationMode } from "@/app/api/props";

const { Title, Text } = Typography;
const { Option } = Select;

export default function TimeSlotSelectionStep() {
    const dispatch = useDispatch();
    const { selectedDoctor, selectedTimeSlot, timeSlotFilters } = useSelector(
        (state: RootState) => state.rootReducer.appointmentBooking
    );

    const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
    const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [loadingDates, setLoadingDates] = useState(false);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());

    // Load available dates when component mounts or doctor changes
    useEffect(() => {
        if (selectedDoctor) {
            loadAvailableDates();
        }
    }, [selectedDoctor, timeSlotFilters.consultationMode]);

    // Load time slots when date or filters change
    useEffect(() => {
        if (selectedDoctor) {
            loadTimeSlots();
        }
    }, [selectedDoctor, selectedDate, timeSlotFilters]);

    const loadAvailableDates = async () => {
        if (!selectedDoctor) return;

        try {
            setLoadingDates(true);
            const startDate = dayjs().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
            // Load next 60 days to show available dates
            const endDate = dayjs().add(60, "day").endOf("day").format("YYYY-MM-DDTHH:mm:ss");

            const response = await TimeSlotApi.getAvailableTimeSlots(selectedDoctor.id, startDate, endDate);

            if (response.data.isSuccess) {
                let slots = response.data.data || [];

                // Apply consultation mode filter
                if (timeSlotFilters.consultationMode !== "all") {
                    slots = slots.filter((slot) => slot.consultationMode === timeSlotFilters.consultationMode);
                }

                // Extract unique dates that have available slots
                const uniqueDates = new Set<string>();
                slots.forEach((slot) => {
                    const slotDate = dayjs(slot.startTime).format("YYYY-MM-DD");
                    // Only include future dates
                    if (dayjs(slot.startTime).isAfter(dayjs(), "minute")) {
                        uniqueDates.add(slotDate);
                    }
                });

                setAvailableDates(uniqueDates);

                // If currently selected date is not available, reset to first available date
                const selectedDateStr = selectedDate.format("YYYY-MM-DD");
                if (!uniqueDates.has(selectedDateStr) && uniqueDates.size > 0) {
                    const firstAvailableDate = Array.from(uniqueDates).sort()[0];
                    setSelectedDate(dayjs(firstAvailableDate));
                }
            }
        } catch {
            message.error("Failed to load available dates");
        } finally {
            setLoadingDates(false);
        }
    };

    const loadTimeSlots = async () => {
        if (!selectedDoctor) return;

        try {
            setLoading(true);
            const startDate = selectedDate.startOf("day").format("YYYY-MM-DDTHH:mm:ss");
            const endDate = selectedDate.endOf("day").format("YYYY-MM-DDTHH:mm:ss");

            const response = await TimeSlotApi.getAvailableTimeSlots(selectedDoctor.id, startDate, endDate);

            if (response.data.isSuccess) {
                let slots = response.data.data || [];

                // Apply consultation mode filter
                if (timeSlotFilters.consultationMode !== "all") {
                    slots = slots.filter((slot) => slot.consultationMode === timeSlotFilters.consultationMode);
                }

                // Filter by selected date and only future slots
                slots = slots.filter(
                    (slot) =>
                        dayjs(slot.startTime).isSame(selectedDate, "day") &&
                        dayjs(slot.startTime).isAfter(dayjs(), "minute")
                );

                setTimeSlots(slots);
            }
        } catch {
            message.error("Failed to load available time slots");
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (date: dayjs.Dayjs | null) => {
        if (date) {
            setSelectedDate(date);
            // Clear selected time slot when date changes
            dispatch(setSelectedTimeSlot(null));
        }
    };

    const handleConsultationModeFilter = (mode: ConsultationMode | "all") => {
        dispatch(setTimeSlotFilters({ consultationMode: mode }));
        // Clear selected time slot when filter changes
        dispatch(setSelectedTimeSlot(null));
    };

    const handleSelectTimeSlot = (slot: TimeSlotDto) => {
        dispatch(setSelectedTimeSlot(slot));
    };

    const handleNext = () => {
        if (!selectedTimeSlot) {
            message.warning("Please select a time slot to continue");
            return;
        }
        dispatch(nextStep());
    };

    const handlePrevious = () => {
        dispatch(previousStep());
    };

    const formatTime = (dateTime: string) => {
        return dayjs(dateTime).format("h:mm A");
    };

    const getConsultationModeIcon = (mode: ConsultationMode) => {
        switch (mode) {
            case ConsultationMode.VIRTUAL:
                return <Video className="w-4 h-4" />;
            case ConsultationMode.PHYSICAL:
                return <MapPin className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getConsultationModeColor = (mode: ConsultationMode) => {
        switch (mode) {
            case ConsultationMode.VIRTUAL:
                return "blue";
            case ConsultationMode.PHYSICAL:
                return "green";
            default:
                return "default";
        }
    };

    const isTimeSlotPast = (startTime: string) => {
        return dayjs(startTime).isBefore(dayjs());
    };

    const disabledDate = (current: dayjs.Dayjs) => {
        if (current?.isBefore(dayjs(), "day")) {
            return true;
        }
        // Disable dates that don't have available slots
        const dateStr = current.format("YYYY-MM-DD");
        return !availableDates.has(dateStr);
    };

    // Custom cell render for DatePicker to show available dates
    const cellRender = (current: string | number | dayjs.Dayjs, info: any) => {
        if (info.type === "date" && dayjs.isDayjs(current)) {
            const dateStr = current.format("YYYY-MM-DD");
            const isAvailable = availableDates.has(dateStr);
            const isSelected = current.isSame(selectedDate, "day");

            if (isAvailable && !isSelected) {
                return <div className="ant-picker-cell-inner bg-green-500">{current.date()}</div>;
            }
        }
        return info.originNode;
    };

    return (
        <div className="space-y-6">
            {/* Doctor Summary */}
            <Card className="shadow-lg border-l-4 border-l-blue-500">
                <div className="flex items-center space-x-4">
                    <Avatar src={selectedDoctor?.profileImageUrl} icon={<User className="w-6 h-6" />} size={50} />
                    <div>
                        <Title level={4} className="mb-1">
                            Dr. {selectedDoctor?.name}
                        </Title>
                        <Text className="text-gray-600">{selectedDoctor?.facility.name}</Text>
                    </div>
                </div>
            </Card>

            {/* Date and Filter Selection */}
            <Card title="Select Date & Filter" className="shadow-lg">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <div className="space-y-2">
                            <Text className="text-sm font-medium text-gray-700">
                                <Calendar className="inline w-4 h-4 mr-1" />
                                Select Date
                            </Text>
                            <div className="space-y-1">
                                <DatePicker
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="w-full h-10"
                                    disabledDate={disabledDate}
                                    format="MMMM D, YYYY"
                                    cellRender={cellRender}
                                />
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Badge color="green" size="small" />
                                        <span>Available dates</span>
                                    </div>
                                    <span>{availableDates.size} days available</span>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className="space-y-2">
                            <Text className="text-sm font-medium text-gray-700">
                                <Video className="inline w-4 h-4 mr-1" />
                                Consultation Mode
                            </Text>
                            <Select
                                value={timeSlotFilters.consultationMode}
                                onChange={handleConsultationModeFilter}
                                className="w-full h-10"
                                loading={loadingDates}
                            >
                                <Option value="all">All Modes</Option>
                                <Option value={ConsultationMode.VIRTUAL}>Virtual</Option>
                                <Option value={ConsultationMode.PHYSICAL}>Physical</Option>
                            </Select>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Time Slots */}
            <Card title={`Available Time Slots - ${selectedDate.format("MMMM D, YYYY")}`} className="shadow-lg">
                {loading && (
                    <div className="text-center py-8">
                        <Spin size="large" />
                    </div>
                )}
                {!loading && timeSlots.length === 0 && (
                    <Empty
                        description={
                            <div className="text-center">
                                <Text>No available time slots for the selected date</Text>
                                <br />
                                <Text className="text-gray-500">
                                    Try selecting a different date or consultation mode
                                </Text>
                            </div>
                        }
                    />
                )}
                {!loading && timeSlots.length > 0 && (
                    <Row gutter={[16, 16]}>
                        {timeSlots.map((slot) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={slot.id}>
                                <Card
                                    hoverable
                                    size="small"
                                    className={`cursor-pointer transition-all duration-200 ${
                                        selectedTimeSlot?.id === slot.id
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-blue-300"
                                    } ${isTimeSlotPast(slot.startTime) ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={() => !isTimeSlotPast(slot.startTime) && handleSelectTimeSlot(slot)}
                                >
                                    <div className="text-center space-y-2">
                                        <div className="flex items-center justify-center space-x-1">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                            <Text className="font-medium">{formatTime(slot.startTime)}</Text>
                                        </div>
                                        <div className="flex items-center justify-center space-x-1">
                                            <Text className="text-gray-600 text-sm">{slot.durationMinutes} min</Text>
                                        </div>
                                        <Tag
                                            icon={getConsultationModeIcon(slot.consultationMode)}
                                            color={getConsultationModeColor(slot.consultationMode)}
                                            className="text-xs"
                                        >
                                            {slot.consultationMode}
                                        </Tag>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>

            {/* Selected Time Slot Info */}
            {selectedTimeSlot && (
                <Card className="shadow-lg border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-green-600" />
                                <div>
                                    <Text className="font-medium">
                                        Selected Time: {formatTime(selectedTimeSlot.startTime)}
                                    </Text>
                                    <br />
                                    <Text className="text-gray-600 text-sm">
                                        {selectedTimeSlot.durationMinutes} minutes • {selectedTimeSlot.consultationMode}
                                    </Text>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={handlePrevious} icon={<ArrowLeft className="w-4 h-4" />}>
                                Previous
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleNext}
                                icon={<ArrowRight className="w-4 h-4" />}
                            >
                                Next: Add Details
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
