"use client";

import React, { useState } from "react";
import {
    List,
    Card,
    Typography,
    Button,
    Empty,
    Input,
    Row,
} from "antd";
import {
    Calendar,
    Clock,
    User,
    Eye,
    Search,
} from "lucide-react";
import dayjs from "dayjs";
import { PrescriptionDto } from "@/app/api/prescription/props";
import PrescriptionDetailModal from "./PrescriptionDetailModal";

const { Text } = Typography;
const { Search: AntSearch } = Input;

interface MyPrescriptionsTabProps {
    prescriptions: PrescriptionDto[];
    refreshTrigger: number;
    onRefresh: () => void;
}

const MyPrescriptionsTab: React.FC<MyPrescriptionsTabProps> = ({
    prescriptions,
    onRefresh
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDto | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // Filter prescriptions based on search and status
    const filteredPrescriptions = prescriptions.filter(prescription => {
        const matchesSearch = searchTerm === "" ||
            prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const handleViewDetails = (prescription: PrescriptionDto) => {
        setSelectedPrescription(prescription);
        setDetailModalVisible(true);
    };

    return (
        <div className="space-y-6">
            {/* Search and Filter Controls */}
            <Card className="bg-gray-50">
                <Row gutter={[16, 16]} align="middle">
                    <AntSearch
                        placeholder="Search by prescription number, patient name, or diagnosis..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        prefix={<Search className="w-4 h-4 text-gray-400" />}
                        className="w-full"
                    />
                </Row>
            </Card>

            {/* Results Summary */}
            <div className="flex justify-between items-center">
                <Text className="text-gray-600">
                    Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
                </Text>
            </div>

            {/* Prescriptions List */}
            {filteredPrescriptions.length === 0 ? (
                <Card>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            searchTerm
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
                    dataSource={filteredPrescriptions}
                    renderItem={(prescription) => (
                        <List.Item>
                            <Card
                                className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer"
                                onClick={() => handleViewDetails(prescription)}
                                styles={{
                                    body: {
                                        padding: '16px',
                                    },
                                }}
                            >
                                <div className="space-y-3">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <Text className="font-medium text-gray-900 block truncate">
                                                {prescription.prescriptionNumber}
                                            </Text>
                                            <Text className="text-sm text-gray-500">
                                                #{prescription.id.substring(0, 8)}...
                                            </Text>
                                        </div>
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

                                    {/* Dates */}
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>Created: {dayjs(Number(prescription.createdAt) * 1000).format('MMM D, YYYY')}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>Expires: {dayjs(Number(prescription.expiryDate) * 1000).format('MMM D, YYYY')}</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-2 border-t">
                                        <Button
                                            type="link"
                                            icon={<Eye className="w-4 h-4" />}
                                            className="p-0 h-auto text-blue-600 hover:text-blue-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDetails(prescription);
                                            }}
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