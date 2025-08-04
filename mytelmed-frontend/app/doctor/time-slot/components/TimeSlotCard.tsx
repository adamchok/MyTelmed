"use client";

import React from "react";
import { Card, Tag, Button, Tooltip, Dropdown } from "antd";
import {
    Monitor,
    MapPin,
    Edit,
    Eye,
    EyeOff,
    MoreVertical,
    Calendar,
} from "lucide-react";
import { TimeSlotDto } from "@/app/api/timeslot/props";
import { ConsultationMode } from "@/app/api/props";
import { TimeSlotUtils } from "../utils";

interface TimeSlotCardProps {
    timeSlot: TimeSlotDto;
    onEdit?: (timeSlot: TimeSlotDto) => void;
    onToggleAvailability?: (timeSlot: TimeSlotDto) => void;
    onView?: (timeSlot: TimeSlotDto) => void;
    loading?: boolean;
    compact?: boolean;
}

export default function TimeSlotCard({
    timeSlot,
    onEdit,
    onToggleAvailability,
    onView,
    loading = false,
    compact = false,
}: Readonly<TimeSlotCardProps>) {
    const canEdit = TimeSlotUtils.canEditTimeSlot(timeSlot);
    const status = TimeSlotUtils.getTimeSlotStatus(timeSlot);
    const statusColor = TimeSlotUtils.getTimeSlotStatusColor(timeSlot);
    const isVirtual = timeSlot.consultationMode === ConsultationMode.VIRTUAL;

    const getConsultationIcon = () => isVirtual ?
        <Monitor className="w-3 h-3 sm:w-4 sm:h-4" /> :
        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />;

    const getConsultationText = () => isVirtual ? "Virtual" : "Physical";

    const handleToggleAvailability = () => {
        if (onToggleAvailability && canEdit) {
            onToggleAvailability(timeSlot);
        }
    };

    const handleEdit = () => {
        if (onEdit && canEdit) {
            onEdit(timeSlot);
        }
    };

    const handleView = () => {
        if (onView) {
            onView(timeSlot);
        }
    };

    // Menu items for dropdown
    const viewMenuItem = {
        key: "view",
        label: "View Details",
        icon: <Calendar className="w-4 h-4" />,
        onClick: handleView,
    };

    const editMenuItem = {
        key: "edit",
        label: "Edit Time Slot",
        icon: <Edit className="w-4 h-4" />,
        onClick: handleEdit,
        disabled: !canEdit,
    };

    const toggleMenuItem = {
        key: "toggle",
        label: timeSlot.isAvailable ? "Disable" : "Enable",
        icon: timeSlot.isAvailable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />,
        onClick: handleToggleAvailability,
        disabled: !canEdit,
    };

    const menuItems = [
        viewMenuItem,
        ...(canEdit ? [editMenuItem, toggleMenuItem] : []),
    ];

    const getBorderClass = () => {
        if (timeSlot.isBooked) return "border-red-200";
        return timeSlot.isAvailable ? "border-green-200" : "border-orange-200";
    };

    const getBackgroundClass = () => {
        if (timeSlot.isBooked) return "border-red-200 bg-red-50";
        return timeSlot.isAvailable ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50";
    };

    const renderCompactCard = () => (
        <Card
            size="small"
            className={`hover:shadow-md transition-shadow ${getBorderClass()}`}
            styles={{
                body: { padding: "8px sm:12px" },
            }}
            loading={loading}
        >
            {/* Mobile-first responsive layout - 2 rows */}
            <div className="flex flex-col gap-2 pb-3">
                {/* Row 1: Time and actions */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-800 truncate min-w-0 flex-1">
                        <span className="truncate">
                            {TimeSlotUtils.formatTimeForDisplay(timeSlot.startTime)} -
                            {TimeSlotUtils.formatTimeForDisplay(timeSlot.endTime)}
                        </span>
                    </div>
                    {menuItems.length > 0 && (
                        <Dropdown
                            menu={{ items: menuItems }}
                            trigger={["click"]}
                            placement="bottomRight"
                        >
                            <Button
                                icon={<MoreVertical className="w-4 h-4" />}
                                className="opacity-70 hover:opacity-100 flex-shrink-0"
                            />
                        </Dropdown>
                    )}
                </div>

                {/* Row 2: Consultation mode and status */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        {getConsultationIcon()}
                        <span className="truncate">{getConsultationText()}</span>
                    </div>
                    <Tag color={statusColor} className="text-xs">
                        {status}
                    </Tag>
                </div>
            </div>
        </Card>
    );

    const renderFullCard = () => (
        <Card
            className={`hover:shadow-lg transition-all duration-200 ${getBackgroundClass()}`}
            styles={{
                body: { padding: "12px sm:16px" },
            }}
            loading={loading}
        >
            <div className="space-y-3 sm:space-y-4">
                {/* Row 1: Time and date */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mb-1">
                        <span className="font-semibold text-base sm:text-lg lg:text-xl text-gray-800 truncate">
                            {TimeSlotUtils.formatTimeForDisplay(timeSlot.startTime)} -
                            {TimeSlotUtils.formatTimeForDisplay(timeSlot.endTime)}
                        </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 ml-0 xs:ml-6">
                        {TimeSlotUtils.formatDateForDisplay(timeSlot.startTime)}
                    </div>
                </div>

                {/* Row 2: Consultation mode, duration, and status */}
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
                        <div className="flex items-center gap-2">
                            {getConsultationIcon()}
                            <span className="text-sm sm:text-base font-medium text-gray-700">
                                {getConsultationText()}
                            </span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                            {TimeSlotUtils.formatDuration(timeSlot.durationMinutes)}
                        </div>
                    </div>
                    <Tag color={statusColor} className="text-xs sm:text-sm font-medium flex-shrink-0 p-2">
                        {status}
                    </Tag>
                </div>

                {/* Actions */}
                {renderCardActions()}
            </div>
        </Card>
    );

    const renderCardActions = () => {
        if (menuItems.length === 0) return null;

        return (
            <div className="flex items-center justify-end pt-2 sm:pt-3 border-t border-gray-100">
                {/* Mobile: Stack buttons vertically on very small screens, horizontal on larger */}
                <div className="flex flex-col xs:flex-row gap-1 xs:gap-2 w-full xs:w-auto">
                    <Button
                        icon={<Calendar className="w-4 h-4" />}
                        onClick={handleView}
                        className="text-gray-600 hover:text-blue-600 text-xs sm:text-sm justify-start xs:justify-center"
                    >
                        <span className="xs:hidden sm:inline">View Details</span>
                        <span className="hidden xs:inline sm:hidden">View</span>
                    </Button>
                    {canEdit && (
                        <>
                            <Tooltip title="Edit this time slot">
                                <Button
                                    icon={<Edit className="w-4 h-4" />}
                                    onClick={handleEdit}
                                    className="text-gray-600 hover:text-green-600 text-xs sm:text-sm justify-start xs:justify-center"
                                >
                                    <span className="xs:hidden sm:inline">Edit Time Slot</span>
                                    <span className="hidden xs:inline sm:hidden">Edit</span>
                                </Button>
                            </Tooltip>
                            <Tooltip
                                title={
                                    timeSlot.isAvailable
                                        ? "Disable this time slot"
                                        : "Enable this time slot"
                                }
                            >
                                <Button
                                    icon={
                                        timeSlot.isAvailable ?
                                            <EyeOff className="w-4 h-4" /> :
                                            <Eye className="w-4 h-4" />
                                    }
                                    onClick={handleToggleAvailability}
                                    className={
                                        `text-xs sm:text-sm justify-start xs:justify-center ${timeSlot.isAvailable
                                            ? "text-gray-600 hover:text-orange-600"
                                            : "text-gray-600 hover:text-green-600"
                                        }`
                                    }
                                >
                                    <span className="xs:hidden">
                                        {timeSlot.isAvailable ? "Disable Time Slot" : "Enable Time Slot"}
                                    </span>
                                    <span className="hidden xs:inline">
                                        {timeSlot.isAvailable ? "Disable" : "Enable"}
                                    </span>
                                </Button>
                            </Tooltip>
                        </>
                    )}
                    {!canEdit && (TimeSlotUtils.isTimeSlotInPast(timeSlot) || timeSlot.isBooked) && (
                        <div className="text-xs text-gray-500 italic">
                            {TimeSlotUtils.isTimeSlotInPast(timeSlot) ? "Past time slot - view only" : "Booked time slot - view only"}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return compact ? renderCompactCard() : renderFullCard();
}
