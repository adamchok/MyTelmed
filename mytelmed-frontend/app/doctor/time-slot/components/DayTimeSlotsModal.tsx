"use client";

import React from "react";
import { Modal, Row, Col, Empty } from "antd";
import { Calendar } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { TimeSlotDto } from "@/app/api/timeslot/props";
import { TimeSlotUtils } from "../utils";
import TimeSlotCard from "./TimeSlotCard";
import "./DayTimeSlotsModal.css";

interface DayTimeSlotsModalProps {
    visible: boolean;
    onClose: () => void;
    date: Dayjs | null;
    timeSlots: TimeSlotDto[];
    onEditTimeSlot?: (timeSlot: TimeSlotDto) => void;
    onViewTimeSlot?: (timeSlot: TimeSlotDto) => void;
    onToggleAvailability?: (timeSlot: TimeSlotDto) => void;
}

export default function DayTimeSlotsModal({
    visible,
    onClose,
    date,
    timeSlots,
    onEditTimeSlot,
    onViewTimeSlot,
    onToggleAvailability,
}: Readonly<DayTimeSlotsModalProps>) {
    if (!date) return null;

    const sortedSlots = TimeSlotUtils.sortTimeSlots(timeSlots);
    const isToday = date.isSame(dayjs(), "day");

    const getStatusCounts = () => {
        const available = sortedSlots.filter(s => s.isAvailable && !s.isBooked && !TimeSlotUtils.isTimeSlotInPast(s)).length;
        const booked = sortedSlots.filter(s => s.isBooked).length;
        const disabled = sortedSlots.filter(s => !s.isAvailable && !TimeSlotUtils.isTimeSlotInPast(s)).length;
        const past = sortedSlots.filter(s => TimeSlotUtils.isTimeSlotInPast(s)).length;

        return { available, booked, disabled, past };
    };

    const statusCounts = getStatusCounts();

    return (
        <Modal
            title={
                <div className="flex items-center">
                    <span className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Time Slots for {date.format("dddd, MMMM D, YYYY")}
                        {isToday && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                Today
                            </span>
                        )}
                    </span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={1200}
            centered
            className="day-timeslots-modal"
        >
            <div className="space-y-4">
                {/* Status Summary */}
                {sortedSlots.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-4 p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Available: {statusCounts.available}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>Booked: {statusCounts.booked}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span>Disabled: {statusCounts.disabled}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                            <span>Past: {statusCounts.past}</span>
                        </div>
                    </div>
                )}

                {/* Time Slots */}
                <div className="max-h-[500px] overflow-y-auto">
                    {sortedSlots.length === 0 ? (
                        <Empty
                            description="No time slots for this day"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ) : (
                        <Row gutter={[12, 16]}>
                            {sortedSlots.map((slot) => (
                                <Col key={slot.id} xs={24} sm={12} md={12} lg={6} xl={6}>
                                    <TimeSlotCard
                                        timeSlot={slot}
                                        onEdit={onEditTimeSlot}
                                        onView={onViewTimeSlot}
                                        onToggleAvailability={onToggleAvailability}
                                        compact={false}
                                    />
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            </div>
        </Modal>
    );
}
