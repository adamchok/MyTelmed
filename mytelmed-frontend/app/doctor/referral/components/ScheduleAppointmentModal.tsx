"use client";

import React, { useState, useEffect } from "react";
import {
    Modal,
    Calendar,
    Card,
    Typography,
    Button,
    message,
    List,
    Tag,
    Avatar,
    Empty,
    Spin,
    Row,
    Col,
    Alert,
} from "antd";
import {
    User,
    Clock,
    Video,
    MapPin,
    Calendar as CalendarIcon,
    CheckCircle,
} from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import TimeSlotApi from "@/app/api/timeslot";
import ReferralApi from "@/app/api/referral";

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);
import { TimeSlotDto } from "@/app/api/timeslot/props";
import { ReferralDto } from "@/app/api/referral/props";
import { ConsultationMode } from "@/app/api/props";

const { Title, Text } = Typography;

interface CalendarHeaderProps {
    value: Dayjs;
    onChange: (date: Dayjs) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ value, onChange }) => (
    <div className="flex justify-between items-center p-2">
        <Button
            size="small"
            onClick={() => onChange(value.subtract(1, 'month'))}
        >
            Previous
        </Button>
        <Title level={5} className="m-0">
            {value.format('MMMM YYYY')}
        </Title>
        <Button
            size="small"
            onClick={() => onChange(value.add(1, 'month'))}
        >
            Next
        </Button>
    </div>
);

interface SlotContentProps {
    slotsLoading: boolean;
    availableSlots: TimeSlotDto[];
    selectedSlot: TimeSlotDto | null;
    onSlotSelect: (slot: TimeSlotDto) => void;
}

const SlotContent: React.FC<SlotContentProps> = ({
    slotsLoading,
    availableSlots,
    selectedSlot,
    onSlotSelect,
}) => {
    if (slotsLoading) {
        return (
            <div className="flex justify-center py-8">
                <Spin />
            </div>
        );
    }

    if (availableSlots.length === 0) {
        return (
            <Empty
                description="No available slots for this date"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    return (
        <List
            itemLayout="horizontal"
            dataSource={availableSlots}
            renderItem={(slot) => (
                <List.Item
                    className={`cursor-pointer rounded-lg p-2 mb-2 border-2 transition-all ${selectedSlot?.id === slot.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                        }`}
                    onClick={() => onSlotSelect(slot)}
                >
                    <List.Item.Meta
                        avatar={
                            <div className="flex flex-col items-center">
                                <Clock className="w-4 h-4 text-green-600" />
                                {selectedSlot?.id === slot.id && (
                                    <CheckCircle className="w-3 h-3 text-green-600 mt-1" />
                                )}
                            </div>
                        }
                        title={
                            <div className="flex items-center justify-between">
                                <Text strong>
                                    {dayjs(slot.startTime).format('h:mm A')} - {dayjs(slot.endTime).format('h:mm A')}
                                </Text>
                                <Tag
                                    color={getConsultationModeColor(slot.consultationMode)}
                                    icon={getConsultationModeIcon(slot.consultationMode)}
                                >
                                    {slot.consultationMode === ConsultationMode.VIRTUAL ? 'Virtual' : 'Physical'}
                                </Tag>
                            </div>
                        }
                        description={
                            <Text type="secondary" className="text-xs">
                                Duration: {slot.durationMinutes} minutes
                            </Text>
                        }
                    />
                </List.Item>
            )}
        />
    );
};

const getConsultationModeIcon = (mode: ConsultationMode) => {
    return mode === ConsultationMode.VIRTUAL ?
        <Video className="w-4 h-4" /> :
        <MapPin className="w-4 h-4" />;
};

const getConsultationModeColor = (mode: ConsultationMode) => {
    return mode === ConsultationMode.VIRTUAL ? "blue" : "green";
};

interface ScheduleAppointmentModalProps {
    visible: boolean;
    referral: ReferralDto | null;
    onCancel: () => void;
    onSuccess: () => void;
}

const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
    visible,
    referral,
    onCancel,
    onSuccess,
}) => {
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs().add(7, 'days'));
    const [availableSlots, setAvailableSlots] = useState<TimeSlotDto[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlotDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [monthlySlots, setMonthlySlots] = useState<Map<string, TimeSlotDto[]>>(new Map());
    const [monthSlotsLoading, setMonthSlotsLoading] = useState(false);

    // Load available slots when date changes
    useEffect(() => {
        if (visible && selectedDate) {
            loadAvailableSlots(selectedDate);
        }
    }, [visible, selectedDate]);

    // Load monthly slots when modal opens or month changes
    useEffect(() => {
        if (visible && selectedDate) {
            loadMonthlySlots(selectedDate);
        }
    }, [visible, selectedDate.format('YYYY-MM')]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!visible) {
            setSelectedDate(dayjs().add(7, 'days'));
            setAvailableSlots([]);
            setSelectedSlot(null);
            setMonthlySlots(new Map());
        }
    }, [visible]);

    const loadAvailableSlots = async (date: Dayjs) => {
        if (!referral?.referredDoctor?.id) return;

        try {
            setSlotsLoading(true);
            const startDate = date.tz('Asia/Kuala_Lumpur').startOf('day').format('YYYY-MM-DDTHH:mm:ss');
            const endDate = date.tz('Asia/Kuala_Lumpur').endOf('day').format('YYYY-MM-DDTHH:mm:ss');

            const response = await TimeSlotApi.getAvailableTimeSlots(
                referral.referredDoctor.id,
                startDate,
                endDate
            );

            if (response.data.isSuccess && response.data.data) {
                // Filter slots that are at least 1 week in advance
                const oneWeekFromNow = dayjs().add(7, 'days');
                const validSlots = response.data.data.filter(slot =>
                    dayjs(slot.startTime).isAfter(oneWeekFromNow)
                );
                setAvailableSlots(validSlots);
            }
        } catch {
            message.error("Failed to load available time slots");
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const loadMonthlySlots = async (date: Dayjs) => {
        if (!referral?.referredDoctor?.id) return;

        try {
            setMonthSlotsLoading(true);
            const startDate = date.tz('Asia/Kuala_Lumpur').startOf('month').format('YYYY-MM-DDTHH:mm:ss');
            const endDate = date.tz('Asia/Kuala_Lumpur').endOf('month').format('YYYY-MM-DDTHH:mm:ss');

            const response = await TimeSlotApi.getAvailableTimeSlots(
                referral.referredDoctor.id,
                startDate,
                endDate
            );

            if (response.data.isSuccess && response.data.data) {
                const oneWeekFromNow = dayjs().add(7, 'days');
                const validSlots = response.data.data.filter(slot =>
                    dayjs(slot.startTime).isAfter(oneWeekFromNow)
                );

                // Group slots by date
                const slotsByDate = new Map<string, TimeSlotDto[]>();
                validSlots.forEach(slot => {
                    const slotDate = dayjs(slot.startTime).format('YYYY-MM-DD');
                    if (!slotsByDate.has(slotDate)) {
                        slotsByDate.set(slotDate, []);
                    }
                    slotsByDate.get(slotDate)!.push(slot);
                });

                setMonthlySlots(slotsByDate);
            }
        } catch {
            console.error("Failed to load monthly time slots");
            setMonthlySlots(new Map());
        } finally {
            setMonthSlotsLoading(false);
        }
    };

    const handleDateSelect = (date: Dayjs) => {
        const oneWeekFromNow = dayjs().add(7, 'days');
        if (date.isBefore(oneWeekFromNow, 'day')) {
            message.warning("Please select a date at least 1 week in advance");
            return;
        }
        setSelectedDate(date);
        setSelectedSlot(null);
    };

    const handleSlotSelect = (slot: TimeSlotDto) => {
        setSelectedSlot(slot);
    };

    const handleSchedule = async () => {
        if (!selectedSlot || !referral) {
            message.error("Please select a time slot");
            return;
        }

        try {
            setLoading(true);
            await ReferralApi.scheduleAppointment(referral.id, selectedSlot.id);
            onSuccess();
        } catch {
            message.error("Failed to schedule appointment");
        } finally {
            setLoading(false);
        }
    };

    const disabledDate = (current: Dayjs) => {
        const oneWeekFromNow = dayjs().add(7, 'days');
        return current && (current.isBefore(oneWeekFromNow, 'day') || current.isAfter(dayjs().add(3, 'months')));
    };

    const dateCellRender = (date: Dayjs) => {
        const dateKey = date.format('YYYY-MM-DD');
        const hasSlots = monthlySlots.has(dateKey) && monthlySlots.get(dateKey)!.length > 0;
        const isDisabled = disabledDate(date);
        const isSelected = date.isSame(selectedDate, 'day');

        const baseStyle: React.CSSProperties = {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            position: 'relative',
        };

        let cellStyle: React.CSSProperties;

        if (monthSlotsLoading) {
            cellStyle = {
                ...baseStyle,
                backgroundColor: '#f5f5f5',
            };
        } else if (isDisabled) {
            cellStyle = {
                ...baseStyle,
                backgroundColor: '#f5f5f5',
                color: '#d9d9d9',
            };
        } else if (hasSlots) {
            cellStyle = {
                ...baseStyle,
                backgroundColor: isSelected ? '#52c41a' : '#f6ffed',
                border: '1px solid #b7eb8f',
                color: isSelected ? 'white' : '#52c41a',
                fontWeight: 'bold',
            };
        } else {
            cellStyle = {
                ...baseStyle,
                backgroundColor: isSelected ? '#ff7875' : '#fff2f0',
                border: '1px solid #ffccc7',
                color: isSelected ? 'white' : '#ff4d4f',
            };
        }

        return (
            <div style={cellStyle}>
                {date.format('D')}
                {hasSlots && !isDisabled && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            width: '6px',
                            height: '6px',
                            backgroundColor: isSelected ? 'white' : '#52c41a',
                            borderRadius: '50%',
                        }}
                    />
                )}
            </div>
        );
    };

    if (!referral) return null;

    return (
        <Modal
            title="Schedule Appointment for Referral"
            open={visible}
            onCancel={onCancel}
            width={900}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button
                    key="schedule"
                    type="primary"
                    onClick={handleSchedule}
                    loading={loading}
                    disabled={!selectedSlot}
                    className="bg-green-700 hover:bg-green-800 border-green-700"
                >
                    Schedule Appointment
                </Button>,
            ]}
            className="top-4"
        >
            <div className="space-y-6">
                {/* Patient & Referral Info */}
                <Card size="small" className="bg-green-50 border-green-200">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <div className="flex items-center space-x-3">
                                <Avatar
                                    src={referral.patient.profileImageUrl}
                                    icon={<User className="w-4 h-4" />}
                                    size={40}
                                />
                                <div>
                                    <Text strong className="block">{referral.patient.name}</Text>
                                    <Text type="secondary" className="text-xs">
                                        Patient
                                    </Text>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div className="text-right">
                                <Text strong className="block">Referral #{referral.referralNumber}</Text>
                                <Text type="secondary" className="text-xs">
                                    From: {referral.referringDoctor.name}
                                </Text>
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
                />

                <Row gutter={[24, 0]}>
                    {/* Calendar */}
                    <Col xs={24} lg={12}>
                        <Card title="Select Date" size="small">
                            <Calendar
                                fullscreen={false}
                                value={selectedDate}
                                onSelect={handleDateSelect}
                                disabledDate={disabledDate}
                                dateCellRender={dateCellRender}
                                headerRender={({ value, onChange }) => (
                                    <CalendarHeader value={value} onChange={onChange} />
                                )}
                            />
                            {/* Legend */}
                            <div className="mt-3 p-2 bg-gray-50 rounded">
                                <Text className="text-xs font-medium mb-2 block">Legend:</Text>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-green-50 border border-green-300 rounded"></div>
                                        <span>Available</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-red-50 border border-red-300 rounded"></div>
                                        <span>No slots</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-gray-200 rounded"></div>
                                        <span>Disabled</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Available Time Slots */}
                    <Col xs={24} lg={12}>
                        <Card
                            title={`Available Slots - ${selectedDate.format('MMM DD, YYYY')}`}
                            size="small"
                            extra={
                                slotsLoading && <Spin size="small" />
                            }
                        >
                            <div className="max-h-80 overflow-y-auto">
                                <SlotContent
                                    slotsLoading={slotsLoading}
                                    availableSlots={availableSlots}
                                    selectedSlot={selectedSlot}
                                    onSlotSelect={handleSlotSelect}
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Selected Slot Summary */}
                {selectedSlot && (
                    <Card
                        title="Selected Appointment Details"
                        size="small"
                        className="bg-blue-50 border-blue-200"
                    >
                        <Row gutter={[16, 8]}>
                            <Col xs={24} sm={8}>
                                <Text strong>Date:</Text>
                                <div>{selectedDate.format('dddd, MMMM DD, YYYY')}</div>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Text strong>Time:</Text>
                                <div>
                                    {dayjs(selectedSlot.startTime).format('h:mm A')} - {dayjs(selectedSlot.endTime).format('h:mm A')}
                                </div>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Text strong>Type:</Text>
                                <div>
                                    <Tag
                                        color={getConsultationModeColor(selectedSlot.consultationMode)}
                                        icon={getConsultationModeIcon(selectedSlot.consultationMode)}
                                    >
                                        {selectedSlot.consultationMode === ConsultationMode.VIRTUAL ? 'Virtual Consultation' : 'Physical Consultation'}
                                    </Tag>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                )}
            </div>
        </Modal>
    );
};

export default ScheduleAppointmentModal; 