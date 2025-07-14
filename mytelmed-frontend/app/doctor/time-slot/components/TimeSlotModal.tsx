"use client";

import React, { useState } from "react";
import { Modal, message, Descriptions, Tag, Space, Button, Divider } from "antd";
import { Calendar, Clock, Monitor, MapPin, Edit, Eye, EyeOff } from "lucide-react";
import { TimeSlotDto, UpdateTimeSlotRequestDto } from "@/app/api/timeslot/props";
import { ConsultationMode } from "@/app/api/props";
import { TimeSlotUtils } from "../utils";
import TimeSlotForm from "./TimeSlotForm";
import TimeSlotApi from "@/app/api/timeslot";

interface TimeSlotModalProps {
    timeSlot: TimeSlotDto | null;
    visible: boolean;
    onClose: () => void;
    onUpdate?: (updatedTimeSlot: TimeSlotDto) => void;
    mode?: "view" | "edit";
}

export default function TimeSlotModal({
    timeSlot,
    visible,
    onClose,
    onUpdate,
    mode = "view",
}: Readonly<TimeSlotModalProps>) {
    const [currentMode, setCurrentMode] = useState<"view" | "edit">(mode);
    const [loading, setLoading] = useState(false);

    if (!timeSlot) return null;

    const canEdit = TimeSlotUtils.canEditTimeSlot(timeSlot);
    const status = TimeSlotUtils.getTimeSlotStatus(timeSlot);
    const statusColor = TimeSlotUtils.getTimeSlotStatusColor(timeSlot);

    const handleEdit = () => {
        setCurrentMode("edit");
    };

    const handleCancelEdit = () => {
        setCurrentMode("view");
    };

    const handleUpdateTimeSlot = async (data: UpdateTimeSlotRequestDto) => {
        try {
            setLoading(true);
            await TimeSlotApi.updateTimeSlot(timeSlot.id, data);

            // Create updated time slot object
            const updatedTimeSlot: TimeSlotDto = {
                ...timeSlot,
                ...data,
            };

            if (onUpdate) {
                onUpdate(updatedTimeSlot);
            }

            message.success("Time slot updated successfully");
            setCurrentMode("view");
        } catch (error) {
            console.error("Failed to update time slot:", error);
            message.error("Failed to update time slot");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAvailability = async () => {
        if (!canEdit) return;

        try {
            setLoading(true);
            if (timeSlot.isAvailable) {
                await TimeSlotApi.disableTimeSlot(timeSlot.id);
                message.success("Time slot disabled successfully");
            } else {
                await TimeSlotApi.enableTimeSlot(timeSlot.id);
                message.success("Time slot enabled successfully");
            }

            // Create updated time slot object
            const updatedTimeSlot: TimeSlotDto = {
                ...timeSlot,
                isAvailable: !timeSlot.isAvailable,
            };

            if (onUpdate) {
                onUpdate(updatedTimeSlot);
            }
        } catch (error) {
            console.error("Failed to toggle time slot availability:", error);
            message.error("Failed to update time slot availability");
        } finally {
            setLoading(false);
        }
    };

    const getConsultationIcon = () => {
        return timeSlot.consultationMode === ConsultationMode.VIRTUAL ? (
            <Monitor className="w-4 h-4" />
        ) : (
            <MapPin className="w-4 h-4" />
        );
    };

    const renderViewMode = () => (
        <div className="space-y-4">
            <Descriptions
                column={1}
                bordered
                size="small"
                labelStyle={{ width: "120px", fontWeight: "600" }}
            >
                <Descriptions.Item
                    label={
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date
                        </span>
                    }
                >
                    {TimeSlotUtils.formatDateForDisplay(timeSlot.startTime)}
                </Descriptions.Item>
                <Descriptions.Item
                    label={
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Time
                        </span>
                    }
                >
                    {TimeSlotUtils.formatTimeForDisplay(timeSlot.startTime)} -
                    {TimeSlotUtils.formatTimeForDisplay(timeSlot.endTime)}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                    {TimeSlotUtils.formatDuration(timeSlot.durationMinutes)}
                </Descriptions.Item>
                <Descriptions.Item
                    label={
                        <span className="flex items-center gap-2">
                            {getConsultationIcon()}
                            Type
                        </span>
                    }
                >
                    {timeSlot.consultationMode === ConsultationMode.VIRTUAL
                        ? "Virtual Consultation"
                        : "Physical Consultation"}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                    <Tag color={statusColor}>{status}</Tag>
                </Descriptions.Item>
            </Descriptions>

            {canEdit && (
                <>
                    <Divider />
                    <Space className="w-full justify-end">
                        <Button
                            type="default"
                            icon={timeSlot.isAvailable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            onClick={handleToggleAvailability}
                            loading={loading}
                            className={
                                timeSlot.isAvailable
                                    ? "border-orange-400 text-orange-600 hover:border-orange-500 hover:text-orange-700"
                                    : "border-green-400 text-green-600 hover:border-green-500 hover:text-green-700"
                            }
                        >
                            {timeSlot.isAvailable ? "Disable" : "Enable"}
                        </Button>
                        <Button
                            type="primary"
                            icon={<Edit className="w-4 h-4" />}
                            onClick={handleEdit}
                            className="bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            Edit Time Slot
                        </Button>
                    </Space>
                </>
            )}
        </div>
    );

    const renderEditMode = () => (
        <TimeSlotForm
            timeSlot={timeSlot}
            isEdit={true}
            onSubmit={handleUpdateTimeSlot}
            onCancel={handleCancelEdit}
            loading={loading}
        />
    );

    const getModalTitle = () => {
        if (currentMode === "edit") {
            return (
                <span className="flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    Edit Time Slot
                </span>
            );
        }
        return (
            <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Time Slot Details
            </span>
        );
    };

    return (
        <Modal
            title={getModalTitle()}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={currentMode === "edit" ? 600 : 500}
            destroyOnHidden={true}
            maskClosable={!loading}
            closable={!loading}
        >
            {currentMode === "view" ? renderViewMode() : renderEditMode()}
        </Modal>
    );
}
