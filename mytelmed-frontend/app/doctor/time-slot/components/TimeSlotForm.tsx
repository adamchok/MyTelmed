"use client";

import React, { useState, useEffect } from "react";
import {
    Form,
    DatePicker,
    Select,
    Switch,
    Button,
    Space,
    Alert,
    Row,
    Col,
} from "antd";
import { Monitor, MapPin, Save, X } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { TimeSlotDto, CreateTimeSlotRequestDto, UpdateTimeSlotRequestDto } from "@/app/api/timeslot/props";
import { ConsultationMode } from "@/app/api/props";
import { TimeSlotUtils } from "../utils";

// Configure dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone to Malaysia
const MALAYSIA_TIMEZONE = "Asia/Kuala_Lumpur";
dayjs.tz.setDefault(MALAYSIA_TIMEZONE);

const { Option } = Select;

interface TimeSlotFormProps {
    timeSlot?: TimeSlotDto | null;
    onSubmit: (data: CreateTimeSlotRequestDto | UpdateTimeSlotRequestDto) => Promise<void>;
    onCancel?: () => void;
    loading?: boolean;
    isEdit?: boolean;
    existingTimeSlots?: TimeSlotDto[];
}

export default function TimeSlotForm({
    timeSlot,
    onSubmit,
    onCancel,
    loading = false,
    isEdit = false,
    existingTimeSlots = [],
}: Readonly<TimeSlotFormProps>) {
    const [form] = Form.useForm();
    const [errors, setErrors] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [duration, setDuration] = useState<number>(30);

    const timeOptions = TimeSlotUtils.generateTimeOptions();
    const durationOptions = TimeSlotUtils.generateDurationOptions();

    // Initialize form values
    useEffect(() => {
        if (timeSlot) {
            // Parse existing time slot in Malaysia timezone
            const startDateTime = dayjs(timeSlot.startTime).tz(MALAYSIA_TIMEZONE);
            const endDateTime = dayjs(timeSlot.endTime).tz(MALAYSIA_TIMEZONE);

            setSelectedDate(startDateTime);
            setStartTime(startDateTime.format("HH:mm"));
            setEndTime(endDateTime.format("HH:mm"));
            setDuration(timeSlot.durationMinutes);

            form.setFieldsValue({
                date: startDateTime,
                startTime: startDateTime.format("HH:mm"),
                endTime: endDateTime.format("HH:mm"),
                duration: timeSlot.durationMinutes,
                consultationMode: timeSlot.consultationMode,
                isAvailable: timeSlot.isAvailable,
            });
        } else {
            // Set default values for new time slot in Malaysia timezone
            const defaultSlot = TimeSlotUtils.createDefaultTimeSlot();
            const defaultStart = dayjs(defaultSlot.startTime).tz(MALAYSIA_TIMEZONE);
            const defaultEnd = dayjs(defaultSlot.endTime).tz(MALAYSIA_TIMEZONE);

            setSelectedDate(defaultStart);
            setStartTime(defaultStart.format("HH:mm"));
            setEndTime(defaultEnd.format("HH:mm"));
            setDuration(defaultSlot.durationMinutes!);

            form.setFieldsValue({
                date: defaultStart,
                startTime: defaultStart.format("HH:mm"),
                endTime: defaultEnd.format("HH:mm"),
                duration: defaultSlot.durationMinutes,
                consultationMode: defaultSlot.consultationMode,
                isAvailable: defaultSlot.isAvailable,
            });
        }
    }, [timeSlot, form]);

    // Update end time when start time or duration changes
    useEffect(() => {
        if (startTime && duration && selectedDate) {
            // Create datetime in Malaysia timezone
            const startDateTime = dayjs.tz(`${selectedDate.format("YYYY-MM-DD")} ${startTime}`, MALAYSIA_TIMEZONE);
            const endDateTime = startDateTime.add(duration, "minute");
            const newEndTime = endDateTime.format("HH:mm");

            setEndTime(newEndTime);
            form.setFieldValue("endTime", newEndTime);
        }
    }, [startTime, duration, selectedDate, form]);

    const handleDateChange = (date: Dayjs | null) => {
        setSelectedDate(date);
        if (date && startTime) {
            // Recalculate end time when date changes in Malaysia timezone
            const startDateTime = dayjs.tz(`${date.format("YYYY-MM-DD")} ${startTime}`, MALAYSIA_TIMEZONE);
            const endDateTime = startDateTime.add(duration, "minute");
            const newEndTime = endDateTime.format("HH:mm");
            setEndTime(newEndTime);
            form.setFieldValue("endTime", newEndTime);
        }
    };

    const handleStartTimeChange = (value: string) => {
        setStartTime(value);
    };

    const handleDurationChange = (value: number | null) => {
        if (value) {
            setDuration(value);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            setErrors([]);

            if (!selectedDate || !startTime || !endTime) {
                setErrors(["Please fill in all required fields"]);
                return;
            }

            // Construct the full datetime strings in Malaysia timezone
            const startDateTime = dayjs.tz(`${selectedDate.format("YYYY-MM-DD")} ${startTime}`, MALAYSIA_TIMEZONE);
            const endDateTime = dayjs.tz(`${selectedDate.format("YYYY-MM-DD")} ${endTime}`, MALAYSIA_TIMEZONE);

            const formData: CreateTimeSlotRequestDto | UpdateTimeSlotRequestDto = {
                // Send times in ISO format for LocalDateTime
                startTime: startDateTime.format("YYYY-MM-DDTHH:mm:ss"),
                endTime: endDateTime.format("YYYY-MM-DDTHH:mm:ss"),
                durationMinutes: values.duration,
                consultationMode: values.consultationMode,
            };

            // Validate the data including overlap check
            const validationErrors = TimeSlotUtils.validateTimeSlotWithOverlapCheck(
                formData,
                existingTimeSlots,
                isEdit ? timeSlot?.id : undefined
            );
            if (validationErrors.length > 0) {
                setErrors(validationErrors);
                return;
            }

            await onSubmit(formData);
        } catch (error) {
            console.error("Form submission error:", error);
            setErrors(["Failed to save time slot. Please try again."]);
        }
    };

    const disabledDate = (current: Dayjs) => {
        if (!current) return false;

        const minDate = TimeSlotUtils.getMinimumDate();
        const maxDate = TimeSlotUtils.getMaximumDate();
        const currentMY = dayjs(current).tz(MALAYSIA_TIMEZONE);
        const minDateMY = dayjs(minDate).tz(MALAYSIA_TIMEZONE);
        const maxDateMY = dayjs(maxDate).tz(MALAYSIA_TIMEZONE);

        return currentMY.isBefore(minDateMY, "day") || currentMY.isAfter(maxDateMY, "day");
    };

    const canEdit = !timeSlot || TimeSlotUtils.canEditTimeSlot(timeSlot);

    return (
        <div className="space-y-4">
            {errors.length > 0 && (
                <Alert
                    message="Validation Errors"
                    description={errors.join(", ")}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setErrors([])}
                />
            )}

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                disabled={loading || !canEdit}
            >
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="date"
                            label="Date"
                            rules={[{ required: true, message: "Please select a date" }]}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                disabledDate={disabledDate}
                                onChange={handleDateChange}
                                placeholder="Select date"
                                format="dddd, MMM D, YYYY"
                                disabled={isEdit && timeSlot?.isBooked}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="consultationMode"
                            label="Consultation Type"
                            rules={[{ required: true, message: "Please select consultation type" }]}
                        >
                            <Select placeholder="Select consultation type">
                                <Option value={ConsultationMode.VIRTUAL}>
                                    <div className="flex items-center gap-2">
                                        <Monitor className="w-4 h-4" />
                                        Virtual Consultation
                                    </div>
                                </Option>
                                <Option value={ConsultationMode.PHYSICAL}>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Physical Consultation
                                    </div>
                                </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="startTime"
                            label="Start Time"
                            rules={[{ required: true, message: "Please select start time" }]}
                        >
                            <Select
                                placeholder="Select start time"
                                onChange={handleStartTimeChange}
                                showSearch
                                optionFilterProp="children"
                                disabled={isEdit && timeSlot?.isBooked}
                            >
                                {timeOptions.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="duration"
                            label="Duration"
                            rules={[{ required: true, message: "Please select duration" }]}
                        >
                            <Select
                                placeholder="Select duration"
                                onChange={handleDurationChange}
                                disabled={isEdit && timeSlot?.isBooked}
                            >
                                {durationOptions.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item name="endTime" label="End Time">
                            <Select value={endTime} disabled>
                                <Option value={endTime}>
                                    {endTime &&
                                        dayjs(`2000-01-01T${endTime}`).format("h:mm A")}
                                </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {isEdit && (
                    <Row>
                        <Col xs={24}>
                            <Form.Item
                                name="isAvailable"
                                label="Availability"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="Available"
                                    unCheckedChildren="Disabled"
                                    disabled={timeSlot?.isBooked}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                )}

                <Form.Item className="mb-0">
                    <Space className="w-full justify-end">
                        {onCancel && (
                            <Button
                                type="default"
                                icon={<X className="w-4 h-4" />}
                                onClick={onCancel}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<Save className="w-4 h-4" />}
                            loading={loading}
                            disabled={!canEdit}
                            className="bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            {isEdit ? "Update Time Slot" : "Create Time Slot"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

            {!canEdit && timeSlot?.isBooked && (
                <Alert
                    message="Cannot Edit Booked Time Slot"
                    description="This time slot has been booked by a patient and cannot be modified."
                    type="warning"
                    showIcon
                />
            )}
        </div>
    );
}
