"use client";

import React, { useState, useEffect } from "react";
import "./components/PrescriptionStyles.css";
import {
    Card,
    Row,
    Col,
    Typography,
    Select,
    Input,
    message,
    Spin,
    Empty,
    MenuProps
} from "antd";
import {
    Pill,
    Search,
    Filter,
    CheckCircle,
    Play,
    Package,
    Truck,
    Clock,
} from "lucide-react";
import PrescriptionApi from "@/app/api/prescription";
import { PrescriptionDto, PrescriptionStatus } from "@/app/api/prescription/props";
import PharmacistApi from "@/app/api/pharmacist";
import DeliveryApi from "@/app/api/delivery";
import { DeliveryStatus } from "@/app/api/delivery/props";
import PrescriptionDetailModal from "./components/PrescriptionDetailModal";
import PrescriptionCard from "./components/PrescriptionCard";

const { Title, Text } = Typography;
const { Option } = Select;

export default function PharmacistPrescriptionPage() {
    // State management
    const [prescriptions, setPrescriptions] = useState<PrescriptionDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentFacilityId, setCurrentFacilityId] = useState<string>("");

    // Filter and search states
    const [statusFilter, setStatusFilter] = useState<PrescriptionStatus | "ALL">("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "status">("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    // Modal state
    const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDto | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // Pagination
    const [currentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 12;

    // Load pharmacist facility on mount
    useEffect(() => {
        loadPharmacistFacility();
    }, []);

    // Load prescriptions when facility or filters change
    useEffect(() => {
        if (currentFacilityId) {
            loadPrescriptions();
        }
    }, [currentFacilityId, statusFilter, searchQuery, sortBy, sortDirection, currentPage]);

    const loadPharmacistFacility = async () => {
        try {
            const response = await PharmacistApi.getPharmacistProfile();
            if (response.data.isSuccess && response.data.data) {
                setCurrentFacilityId(response.data.data.facility.id);
            }
        } catch (error: any) {
            message.error("Failed to load pharmacist information");
            console.error("Error loading pharmacist:", error);
        }
    };

    const loadPrescriptions = async () => {
        if (!currentFacilityId) return;

        try {
            setLoading(true);
            const response = await PrescriptionApi.getPrescriptionsByFacility(currentFacilityId, {
                page: currentPage,
                size: pageSize,
                sortBy,
                sortDirection,
                status: statusFilter === "ALL" ? undefined : statusFilter
            });

            if (response.data.isSuccess && response.data.data) {
                const data = response.data.data;
                let filteredPrescriptions = data.content;

                // Apply search filter on frontend if needed
                if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    filteredPrescriptions = data.content.filter(prescription =>
                        prescription.prescriptionNumber.toLowerCase().includes(query) ||
                        prescription.appointment.patient.name.toLowerCase().includes(query) ||
                        prescription.diagnosis.toLowerCase().includes(query)
                    );
                }

                setPrescriptions(filteredPrescriptions);
                setTotalElements(data.totalElements);
            }
        } catch (error: any) {
            message.error("Failed to load prescriptions");
            console.error("Error loading prescriptions:", error);
        } finally {
            setLoading(false);
        }
    };



    const handlePrescriptionClick = (prescription: PrescriptionDto) => {
        setSelectedPrescription(prescription);
        setDetailModalVisible(true);
    };

    const handleStatusUpdate = () => {
        loadPrescriptions(); // Reload prescriptions after status update
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getQuickActions = (prescription: PrescriptionDto): MenuProps['items'] => {
        const actions: MenuProps['items'] = [];
        const delivery = prescription.delivery;

        if (prescription.status === PrescriptionStatus.READY_FOR_PROCESSING) {
            actions.push({
                key: 'start-processing',
                label: 'Start Processing',
                icon: <Play className="w-4 h-4" />,
            });
        }

        if (prescription.status === PrescriptionStatus.PROCESSING) {
            actions.push({
                key: 'mark-ready',
                label: 'Mark Ready',
                icon: <CheckCircle className="w-4 h-4" />,
            });
        }

        // Add delivery-related actions for READY prescriptions
        if (prescription.status === PrescriptionStatus.READY && delivery) {
            if (delivery.status === DeliveryStatus.PAID) {
                actions.push({
                    key: 'process-delivery',
                    label: 'Process Delivery',
                    icon: <Clock className="w-4 h-4" />,
                });
            }

            if (delivery.status === DeliveryStatus.PREPARING) {
                if (delivery.deliveryMethod === 'PICKUP') {
                    actions.push({
                        key: 'mark-ready-for-pickup',
                        label: 'Mark Ready for Pickup',
                        icon: <CheckCircle className="w-4 h-4" />,
                    });
                } else {
                    actions.push({
                        key: 'mark-out-for-delivery',
                        label: 'Mark Out for Delivery',
                        icon: <Truck className="w-4 h-4" />,
                    });
                }
            }

            if (delivery.status === DeliveryStatus.READY_FOR_PICKUP) {
                actions.push({
                    key: 'mark-delivered',
                    label: 'Mark as Delivered',
                    icon: <CheckCircle className="w-4 h-4" />,
                });
            }
        }

        actions.push({
            key: 'view-details',
            label: 'View Details',
            icon: <Package className="w-4 h-4" />,
        });

        return actions;
    };

    const handleQuickAction = async (key: string, prescription: PrescriptionDto) => {
        try {
            const delivery = prescription.delivery;

            switch (key) {
                case 'start-processing':
                    await PrescriptionApi.startProcessing(prescription.id);
                    message.success('Prescription processing started');
                    handleStatusUpdate();
                    break;
                case 'mark-ready':
                    await PrescriptionApi.markAsReady(prescription.id);
                    message.success('Prescription marked as ready');
                    handleStatusUpdate();
                    break;
                case 'process-delivery':
                    if (delivery) {
                        await DeliveryApi.processDelivery(delivery.id);
                        message.success('Delivery processing started');
                        handleStatusUpdate();
                    }
                    break;
                case 'mark-ready-for-pickup':
                    if (delivery) {
                        await DeliveryApi.markReadyForPickup(delivery.id);
                        message.success('Pickup marked as ready for pickup');
                        handleStatusUpdate();
                    }
                    break;
                case 'mark-out-for-delivery':
                    // For this action, we should open the detail modal to collect courier details
                    message.info('Please use "View Details" to provide courier information');
                    handlePrescriptionClick(prescription);
                    break;
                case 'mark-delivered':
                    if (delivery) {
                        await DeliveryApi.markAsDelivered(delivery.id);
                        message.success('Pickup marked as delivered');
                        handleStatusUpdate();
                    }
                    break;
                case 'view-details':
                    handlePrescriptionClick(prescription);
                    break;
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Action failed');
        }
    };

    const renderPrescriptionList = () => {
        if (loading) {
            return (
                <div className="text-center py-12">
                    <Spin size="large" />
                    <Text className="block mt-4 text-gray-600">Loading prescriptions...</Text>
                </div>
            );
        }

        if (prescriptions.length === 0) {
            return (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No prescriptions found"
                    className="py-12"
                >
                    <Text className="text-gray-500">
                        {searchQuery ? 'Try adjusting your search or filters' : 'No prescriptions available at this time'}
                    </Text>
                </Empty>
            );
        }

        return (
            <>
                <Row gutter={[16, 16]}>
                    {prescriptions.map((prescription) => (
                        <Col
                            xs={24}
                            sm={12}
                            lg={8}
                            xl={8}
                            key={prescription.id}
                        >
                            <PrescriptionCard
                                prescription={prescription}
                                onPrescriptionClick={handlePrescriptionClick}
                                onQuickAction={handleQuickAction}
                                getQuickActions={getQuickActions}
                                formatDate={formatDate}
                            />
                        </Col>
                    ))}
                </Row>

                {/* Pagination Info */}
                <div className="mt-6 text-center">
                    <Text className="text-gray-500">
                        Showing {prescriptions.length} of {totalElements} prescriptions
                    </Text>
                </div>
            </>
        );
    };

    return (
        <div className="p-4 sm:p-6 mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Title level={2} className="text-gray-800 mb-2 mt-0">
                    <Pill className="w-6 h-6 inline-block mr-2 text-purple-500" />
                    Prescription Management
                </Title>
                <Text className="text-gray-600">
                    Manage and process prescriptions for your facility
                </Text>
            </div>

            {/* Filters and Search */}
            <Card className="filter-section mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <Text className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </Text>
                        <Input
                            placeholder="Search prescriptions..."
                            prefix={<Search className="w-4 h-4 text-gray-400" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <Text className="block text-sm font-medium text-gray-700 mb-1">
                            Status Filter
                        </Text>
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="w-full"
                            suffixIcon={<Filter className="w-4 h-4 text-gray-400" />}
                        >
                            <Option value="ALL">All Statuses</Option>
                            <Option value={PrescriptionStatus.CREATED}>Created</Option>
                            <Option value={PrescriptionStatus.READY_FOR_PROCESSING}>Ready for Processing</Option>
                            <Option value={PrescriptionStatus.PROCESSING}>Processing</Option>
                            <Option value={PrescriptionStatus.READY}>Ready</Option>
                            <Option value={PrescriptionStatus.EXPIRED}>Expired</Option>
                            <Option value={PrescriptionStatus.CANCELLED}>Cancelled</Option>
                        </Select>
                    </div>

                    <div>
                        <Text className="block text-sm font-medium text-gray-700 mb-1">
                            Sort By
                        </Text>
                        <Select
                            value={sortBy}
                            onChange={setSortBy}
                            className="w-full"
                        >
                            <Option value="createdAt">Created Date</Option>
                            <Option value="updatedAt">Updated Date</Option>
                            <Option value="status">Status</Option>
                        </Select>
                    </div>

                    <div>
                        <Text className="block text-sm font-medium text-gray-700 mb-1">
                            Order
                        </Text>
                        <Select
                            value={sortDirection}
                            onChange={setSortDirection}
                            className="w-full"
                        >
                            <Option value="desc">Newest First</Option>
                            <Option value="asc">Oldest First</Option>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* Prescription List */}
            {renderPrescriptionList()}

            {/* Prescription Detail Modal */}
            <PrescriptionDetailModal
                visible={detailModalVisible}
                prescription={selectedPrescription}
                onClose={() => {
                    setDetailModalVisible(false);
                    setSelectedPrescription(null);
                }}
                onStatusUpdate={handleStatusUpdate}
            />
        </div>
    );
}
