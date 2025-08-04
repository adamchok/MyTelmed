"use client";

import React, { useState } from "react";
import {
    List,
    Card,
    Typography,
    Button,
    Empty,
    Tag,
} from "antd";
import {
    Calendar,
    Clock,
    User,
    Eye,
    FileText,
    Activity,
    CheckCircle,
    AlertTriangle,
    Package,
} from "lucide-react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { PrescriptionDto, PrescriptionStatus } from "@/app/api/prescription/props";
import PrescriptionDetailModal from "./PrescriptionDetailModal";

const { Text } = Typography;

type SortField = "createdAt" | "expiryDate" | "patientName" | "status";
type SortDirection = "asc" | "desc";

interface FilterState {
    searchTerm: string;
    selectedStatus: PrescriptionStatus | "all";
    dateRange: [Dayjs | null, Dayjs | null] | null;
    sortField: SortField;
    sortDirection: SortDirection;
    showFilters: boolean;
}



interface MyPrescriptionsTabProps {
    prescriptions: PrescriptionDto[]; // Already filtered and sorted
    onRefresh: () => void;
    filterState?: FilterState;
}

const MyPrescriptionsTab: React.FC<MyPrescriptionsTabProps> = ({
    prescriptions,
    onRefresh,
    filterState,
}) => {
    const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDto | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const handleViewDetails = (prescription: PrescriptionDto) => {
        setSelectedPrescription(prescription);
        setDetailModalVisible(true);
    };

    // Get status color and icon
    const getStatusColor = (status: PrescriptionStatus): string => {
        switch (status) {
            case PrescriptionStatus.CREATED:
                return "blue";
            case PrescriptionStatus.READY_FOR_PROCESSING:
                return "orange";
            case PrescriptionStatus.PROCESSING:
                return "cyan";
            case PrescriptionStatus.READY:
                return "green";
            case PrescriptionStatus.EXPIRED:
                return "red";
            case PrescriptionStatus.CANCELLED:
                return "default";
            default:
                return "default";
        }
    };

    const getStatusIcon = (status: PrescriptionStatus) => {
        switch (status) {
            case PrescriptionStatus.CREATED:
                return <FileText className="w-3 h-3" />;
            case PrescriptionStatus.READY_FOR_PROCESSING:
                return <Clock className="w-3 h-3" />;
            case PrescriptionStatus.PROCESSING:
                return <Activity className="w-3 h-3" />;
            case PrescriptionStatus.READY:
                return <CheckCircle className="w-3 h-3" />;
            case PrescriptionStatus.EXPIRED:
                return <AlertTriangle className="w-3 h-3" />;
            case PrescriptionStatus.CANCELLED:
                return <FileText className="w-3 h-3" />;
            default:
                return <FileText className="w-3 h-3" />;
        }
    };

    const getStatusDisplayName = (status: PrescriptionStatus): string => {
        switch (status) {
            case PrescriptionStatus.READY_FOR_PROCESSING:
                return "Ready for Processing";
            case PrescriptionStatus.PROCESSING:
                return "Processing";
            default:
                return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ');
        }
    };

    const isExpiringSoon = (expiryDate: string): boolean => {
        const expiry = dayjs(Number(expiryDate) * 1000);
        const now = dayjs();
        const daysUntilExpiry = expiry.diff(now, 'day');
        return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
    };

    const getBorderColor = (status: PrescriptionStatus): string => {
        const colorMap = {
            [PrescriptionStatus.CREATED]: '#1890ff',
            [PrescriptionStatus.READY_FOR_PROCESSING]: '#fa8c16',
            [PrescriptionStatus.PROCESSING]: '#13c2c2',
            [PrescriptionStatus.READY]: '#52c41a',
            [PrescriptionStatus.EXPIRED]: '#ff4d4f',
            [PrescriptionStatus.CANCELLED]: '#d9d9d9'
        };
        return colorMap[status] || '#d9d9d9';
    };

    return (
        <div className="space-y-6">
            {/* Results Summary */}
            {filterState && (
                <div className="flex justify-between items-center">
                    <Text className="text-gray-600">
                        Showing {prescriptions.length} prescriptions
                        {filterState.searchTerm && (
                            <span className="ml-1">matching &ldquo;{filterState.searchTerm}&rdquo;</span>
                        )}
                        {filterState.selectedStatus !== "all" && (
                            <span className="ml-1">with status &ldquo;{getStatusDisplayName(filterState.selectedStatus)}&rdquo;</span>
                        )}
                    </Text>
                    {filterState.sortField && (
                        <Text className="text-xs text-gray-500">
                            Sorted by {filterState.sortField} ({filterState.sortDirection})
                        </Text>
                    )}
                </div>
            )}

            {/* Prescriptions List */}
            {prescriptions.length === 0 ? (
                <Card>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            filterState?.searchTerm || filterState?.selectedStatus !== "all" || filterState?.dateRange
                                ? "No prescriptions found matching your criteria"
                                : "No prescriptions created yet"
                        }
                    />
                </Card>
            ) : (
                <List
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 1,
                        md: 2,
                        lg: 2,
                        xl: 3,
                        xxl: 3,
                    }}
                    dataSource={prescriptions}
                    renderItem={(prescription) => (
                        <List.Item>
                            <Card
                                className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4"
                                style={{ borderLeftColor: getBorderColor(prescription.status) }}
                                onClick={() => handleViewDetails(prescription)}
                                tabIndex={0}
                                aria-label={`View prescription ${prescription.prescriptionNumber} for patient ${prescription.appointment.patient.name}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleViewDetails(prescription);
                                    }
                                }}
                            >
                                <div className="space-y-3">
                                    {/* Header with Status */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <Text className="font-medium text-gray-900 block truncate">
                                                {prescription.prescriptionNumber}
                                            </Text>
                                            <Text className="text-sm text-gray-500">
                                                #{prescription.id.substring(0, 8)}...
                                            </Text>
                                        </div>
                                        <Tag
                                            color={getStatusColor(prescription.status)}
                                            className="flex items-center gap-1"
                                        >
                                            {getStatusIcon(prescription.status)}
                                            <span className="text-xs">
                                                {getStatusDisplayName(prescription.status)}
                                            </span>
                                        </Tag>
                                    </div>

                                    {/* Patient Info */}
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <Text className="text-sm text-gray-700 truncate">
                                            {prescription.appointment.patient.name}
                                        </Text>
                                    </div>

                                    {/* Diagnosis */}
                                    <div className="space-y-1">
                                        <Text className="text-xs text-gray-500 uppercase tracking-wide">
                                            Diagnosis
                                        </Text>
                                        <Text className="text-sm text-gray-700 line-clamp-2">
                                            {prescription.diagnosis}
                                        </Text>
                                    </div>

                                    {/* Medication Count */}
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <Text className="text-sm text-gray-700">
                                            {prescription.prescriptionItems.length} medication{prescription.prescriptionItems.length !== 1 ? 's' : ''}
                                        </Text>
                                    </div>

                                    {/* Dates with Expiry Warning */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>Created: {dayjs(Number(prescription.createdAt) * 1000).format('MMM D, YYYY')}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span className={isExpiringSoon(prescription.expiryDate) ? 'text-orange-600 font-medium' : ''}>
                                                    Expires: {dayjs(Number(prescription.expiryDate) * 1000).format('MMM D, YYYY')}
                                                </span>
                                            </div>
                                        </div>
                                        {isExpiringSoon(prescription.expiryDate) && (
                                            <div className="flex items-center gap-1 text-xs text-orange-600">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span>Expires soon</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-2 border-t">
                                        <Button
                                            type="link"
                                            icon={<Eye className="w-4 h-4" />}
                                            className="p-0 h-auto text-green-600 hover:text-green-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDetails(prescription);
                                            }}
                                            aria-label={`View details for prescription ${prescription.prescriptionNumber}`}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            )}

            {/* Prescription Detail Modal */}
            <PrescriptionDetailModal
                prescription={selectedPrescription}
                visible={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedPrescription(null);
                }}
                onRefresh={onRefresh}
            />
        </div>
    );
};

export default MyPrescriptionsTab; 