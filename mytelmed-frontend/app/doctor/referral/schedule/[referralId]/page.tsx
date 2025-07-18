"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Card,
    Row,
    Col,
    Button,
    Typography,
    DatePicker,
    Tag,
    Avatar,
    Empty,
    Spin,
    message,
    Badge,
    Alert,
} from "antd";
import {
    Calendar,
    Clock,
    Video,
    MapPin,
    ArrowLeft,
    User,
    UserCheck,
    Stethoscope,
    CheckCircle,
    Calendar as CalendarIcon
} from "lucide-react";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

import TimeSlotApi from "@/app/api/timeslot";
import ReferralApi from "@/app/api/referral";
import { TimeSlotDto } from "@/app/api/timeslot/props";
import { ReferralDto } from "@/app/api/referral/props";
import { ConsultationMode } from "@/app/api/props";

const { Title, Text } = Typography;

export default function ScheduleAppointmentPage() {
    const router = useRouter();
    const params = useParams();
    const referralId = params.referralId as string;

    // State management
    const [referral, setReferral] = useState<ReferralDto | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
    const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotDto | null>(null);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs().add(7, 'days'));

    // Loading states
    const [pageLoading, setPageLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [schedulingLoading, setSchedulingLoading] = useState(false);

    // Load referral data and initialize
    useEffect(() => {
        if (referralId) {
            loadReferralData();
        }
    }, [referralId]);

    // Load available dates when referral changes
    useEffect(() => {
        if (referral?.referredDoctor?.id) {
            loadAvailableDates();
        }
    }, [referral]);

    // Load time slots when date changes
    useEffect(() => {
        if (referral?.referredDoctor?.id && selectedDate) {
            loadTimeSlots();
        }
    }, [referral, selectedDate]);

    const loadReferralData = async () => {
        try {
            setPageLoading(true);
            const response = await ReferralApi.getReferralById(referralId);
            if (response.data.isSuccess && response.data.data) {
                setReferral(response.data.data);
            } else {
                message.error("Referral not found");
                router.push("/doctor/referral");
            }
        } catch {
            message.error("Failed to load referral data");
            router.push("/doctor/referral");
        } finally {
            setPageLoading(false);
        }
    };

    const loadAvailableDates = async () => {
        if (!referral?.referredDoctor?.id) return;

        try {
            const startDate = dayjs().add(7, 'days').startOf("day").format("YYYY-MM-DDTHH:mm:ss");
            const endDate = dayjs().add(3, "months").endOf("day").format("YYYY-MM-DDTHH:mm:ss");

            const response = await TimeSlotApi.getAvailableTimeSlots(
                referral.referredDoctor.id,
                startDate,
                endDate
            );

            if (response.data.isSuccess) {
                let slots = response.data.data || [];

                // Only show physical consultation slots
                slots = slots.filter((slot) => slot.consultationMode === ConsultationMode.PHYSICAL);

                // Extract unique dates that have available slots (1 week minimum advance)
                const uniqueDates = new Set<string>();
                const oneWeekFromNow = dayjs().add(7, 'days');

                slots.forEach((slot) => {
                    const slotDateTime = dayjs(slot.startTime);
                    if (slotDateTime.isAfter(oneWeekFromNow, "minute")) {
                        const slotDate = slotDateTime.format("YYYY-MM-DD");
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
        }
    };

    const loadTimeSlots = async () => {
        if (!referral?.referredDoctor?.id) return;

        try {
            setSlotsLoading(true);
            const startDate = selectedDate.tz('Asia/Kuala_Lumpur').startOf("day").format("YYYY-MM-DDTHH:mm:ss");
            const endDate = selectedDate.tz('Asia/Kuala_Lumpur').endOf("day").format("YYYY-MM-DDTHH:mm:ss");

            const response = await TimeSlotApi.getAvailableTimeSlots(
                referral.referredDoctor.id,
                startDate,
                endDate
            );

            if (response.data.isSuccess) {
                let slots = response.data.data || [];

                // Only show physical consultation slots
                slots = slots.filter((slot) => slot.consultationMode === ConsultationMode.PHYSICAL);

                // Filter by selected date and only future slots (1 week minimum advance)
                const oneWeekFromNow = dayjs().add(7, 'days');
                slots = slots.filter(
                    (slot) =>
                        dayjs(slot.startTime).isSame(selectedDate, "day") &&
                        dayjs(slot.startTime).isAfter(oneWeekFromNow, "minute")
                );

                setTimeSlots(slots);
            }
        } catch {
            message.error("Failed to load available time slots");
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleDateChange = (date: dayjs.Dayjs | null) => {
        if (date) {
            const oneWeekFromNow = dayjs().add(7, 'days');
            if (date.isBefore(oneWeekFromNow, 'day')) {
                message.warning("Please select a date at least 1 week in advance");
                return;
            }
            setSelectedDate(date);
            setSelectedTimeSlot(null);
        }
    };

    const handleSelectTimeSlot = (slot: TimeSlotDto) => {
        setSelectedTimeSlot(slot);
    };

    const handleScheduleAppointment = async () => {
        if (!selectedTimeSlot || !referral) {
            message.error("Please select a time slot");
            return;
        }

        try {
            setSchedulingLoading(true);
            await ReferralApi.scheduleAppointment(referral.id, selectedTimeSlot.id);
            message.success("Appointment scheduled successfully");
            router.push("/doctor/referral");
        } catch {
            message.error("Failed to schedule appointment");
        } finally {
            setSchedulingLoading(false);
        }
    };

    const handleBack = () => {
        router.push("/doctor/referral");
    };

    const formatTime = (dateTime: string) => {
        return dayjs(dateTime).format("h:mm A");
    };

    const getConsultationModeIcon = (mode: ConsultationMode) => {
        return mode === ConsultationMode.VIRTUAL ?
            <Video className="w-4 h-4" /> :
            <MapPin className="w-4 h-4" />;
    };

    const getConsultationModeColor = (mode: ConsultationMode) => {
        return mode === ConsultationMode.VIRTUAL ? "green" : "emerald";
    };

    const disabledDate = (current: dayjs.Dayjs) => {
        const oneWeekFromNow = dayjs().add(7, 'days');
        if (current?.isBefore(oneWeekFromNow, "day") || current?.isAfter(dayjs().add(3, 'months'))) {
            return true;
        }
        // Disable dates that don't have available slots
        const dateStr = current.format("YYYY-MM-DD");
        return !availableDates.has(dateStr);
    };

    const cellRender = (current: string | number | dayjs.Dayjs, info: any) => {
        if (info.type === "date" && dayjs.isDayjs(current)) {
            const dateStr = current.format("YYYY-MM-DD");
            const isAvailable = availableDates.has(dateStr);
            const isSelected = current.isSame(selectedDate, "day");

            if (isAvailable && !isSelected) {
                return (
                    <div className="ant-picker-cell-inner">
                        <div className="relative">
                            {current.date()}
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                    </div>
                );
            }
        }
        return info.originNode;
    };

    if (pageLoading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="text-center">
                    <Spin size="large" />
                    <Text className="block mt-4 text-gray-500">Loading referral data...</Text>
                </div>
            </div>
        );
    }

    if (!referral) {
        return (
            <div className="text-center py-12">
                <Empty description="Referral not found" />
                <Button type="primary" onClick={handleBack} className="mt-4">
                    Back to Referrals
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        icon={<ArrowLeft className="w-4 h-4" />}
                        onClick={handleBack}
                        size="large"
                    >
                        Back to Referrals
                    </Button>
                    <div>
                        <Title level={2} className="mb-0">Schedule Appointment</Title>
                        <Text className="text-gray-600">Schedule appointment for referral #{referral.referralNumber}</Text>
                    </div>
                </div>
            </div>

            {/* Patient & Referral Info */}
            <Card
                className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm"
                bodyStyle={{ padding: '24px' }}
            >
                <Row gutter={[24, 16]} align="middle">
                    <Col xs={24} sm={12}>
                        <div className="flex items-center space-x-4">
                            <Avatar
                                src={referral.patient.profileImageUrl}
                                icon={<User className="w-5 h-5" />}
                                size={52}
                                className="border-2 border-green-200"
                            />
                            <div>
                                <Text strong className="block text-xl text-gray-800">{referral.patient.name}</Text>
                                <div className="flex items-center space-x-1 mt-1">
                                    <UserCheck className="w-4 h-4 text-green-600" />
                                    <Text type="secondary" className="text-sm">Patient</Text>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12}>
                        <div className="text-right">
                            <Text strong className="block text-xl text-gray-800">Referral #{referral.referralNumber}</Text>
                            <div className="flex items-center justify-end space-x-1 mt-1">
                                <Stethoscope className="w-4 h-4 text-green-600" />
                                <Text type="secondary" className="text-sm">
                                    From: {referral.referringDoctor.name}
                                </Text>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Scheduling Constraint Alert */}
            <Alert
                message="Scheduling Constraint"
                description="Appointments must be scheduled at least 1 week in advance to ensure proper preparation and patient notification."
                type="info"
                icon={<CalendarIcon className="w-4 h-4" />}
                showIcon
                className="border-green-200 bg-green-25"
            />

            {/* Date Selection */}
            <Card
                title={
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <span>Select Date</span>
                    </div>
                }
                className="shadow-md"
            >
                <Row gutter={[24, 16]}>
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
                                <MapPin className="inline w-4 h-4 mr-1" />
                                Consultation Mode
                            </Text>
                            <Alert
                                message="Physical Consultations Only"
                                description="Doctors can only schedule appointments for physical consultations at the facility."
                                type="info"
                                showIcon
                                className="border-green-200 bg-green-25"
                            />
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Time Slots */}
            <Card
                title={
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-green-600" />
                            <span>Available Time Slots</span>
                        </div>
                        {slotsLoading && <Spin size="small" />}
                    </div>
                }
                extra={
                    <Text className="text-gray-600">
                        {selectedDate.format("MMMM D, YYYY")}
                    </Text>
                }
                className="shadow-md"
            >
                {slotsLoading && (
                    <div className="text-center py-12">
                        <Spin size="large" />
                        <Text className="block mt-3 text-gray-500">Loading available slots...</Text>
                    </div>
                )}
                {!slotsLoading && timeSlots.length === 0 && (
                    <div className="py-8">
                        <Empty
                            description={
                                <div className="text-center">
                                    <Text className="block text-gray-500 mb-2">No available time slots for the selected date</Text>
                                    <Text className="text-sm text-gray-400">
                                        Try selecting a different date or consultation mode
                                    </Text>
                                </div>
                            }
                        />
                    </div>
                )}
                {!slotsLoading && timeSlots.length > 0 && (
                    <Row gutter={[16, 16]}>
                        {timeSlots.map((slot) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={slot.id}>
                                <Card
                                    hoverable
                                    size="small"
                                    className={`cursor-pointer transition-all duration-200 ${selectedTimeSlot?.id === slot.id
                                        ? "border-green-500 bg-green-50 shadow-lg"
                                        : "border-gray-200 hover:border-green-300"
                                        }`}
                                    onClick={() => handleSelectTimeSlot(slot)}
                                >
                                    <div className="text-center space-y-2">
                                        <div className="flex items-center justify-center space-x-1">
                                            <Clock className="w-4 h-4 text-green-600" />
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
                                        {selectedTimeSlot?.id === slot.id && (
                                            <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                                        )}
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>

            {/* Selected Time Slot Info & Action */}
            {selectedTimeSlot && (
                <Card
                    className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md"
                    bodyStyle={{ padding: '24px' }}
                >
                    <Row gutter={[24, 16]} align="middle">
                        <Col xs={24} lg={16}>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <Text strong className="text-lg">Selected Appointment Details</Text>
                                </div>
                                <Row gutter={[16, 8]}>
                                    <Col xs={24} sm={8}>
                                        <Text className="text-sm text-gray-600">Date:</Text>
                                        <div className="font-medium">{selectedDate.format('dddd, MMMM DD, YYYY')}</div>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Text className="text-sm text-gray-600">Time:</Text>
                                        <div className="font-medium">
                                            {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Text className="text-sm text-gray-600">Type:</Text>
                                        <div>
                                            <Tag
                                                color={getConsultationModeColor(selectedTimeSlot.consultationMode)}
                                                icon={getConsultationModeIcon(selectedTimeSlot.consultationMode)}
                                            >
                                                {selectedTimeSlot.consultationMode === ConsultationMode.VIRTUAL ? 'Virtual Consultation' : 'Physical Consultation'}
                                            </Tag>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                        <Col xs={24} lg={8}>
                            <div className="text-right">
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleScheduleAppointment}
                                    loading={schedulingLoading}
                                    className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                                    icon={<CheckCircle className="w-4 h-4" />}
                                >
                                    Schedule Appointment
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card>
            )}
        </div>
    );
}
