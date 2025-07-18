"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    Row,
    Col,
    Button,
    Typography,
    Input,
    Select,
    Spin,
    Empty,
    Pagination,
    Space,
    Tag,
    Statistic,
    message,
    Alert
} from "antd";
import {
    FileText,
    Search,
    Filter,
    X,
    Pill,
    TrendingUp,
    Clock
} from "lucide-react";

import PrescriptionApi from "@/app/api/prescription";
import { PrescriptionDto, PrescriptionStatus } from "@/app/api/prescription/props";
import { useFamilyPermissions } from "@/app/hooks/useFamilyPermissions";
import PrescriptionCard from "./components/PrescriptionCard";

const { Title, Text } = Typography;

const ITEMS_PER_PAGE = 6;

const PrescriptionListingPage = () => {
    const router = useRouter();

    // Family permissions hook
    const {
        currentPatient,
        loading: familyLoading,
        getAuthorizedPatientsForPrescriptions
    } = useFamilyPermissions();

    // State management
    const [prescriptions, setPrescriptions] = useState<PrescriptionDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    // Filters
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedPatientId, setSelectedPatientId] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<PrescriptionStatus | "ALL">("ALL");

    // Patient options for dropdown
    const getPatientOptions = () => {
        const authorizedPatients = getAuthorizedPatientsForPrescriptions();
        const options = [{ value: "all", label: "All Patients" }];

        authorizedPatients.forEach(patient => {
            if (patient.id === currentPatient?.id) {
                options.push({
                    value: patient.id,
                    label: `${patient.name} (You)`
                });
            } else {
                options.push({
                    value: patient.id,
                    label: patient.name
                });
            }
        });

        return options;
    };

    // Check if viewing own prescriptions
    const isViewingOwnPrescriptions = useMemo(() => {
        return selectedPatientId === "all" || selectedPatientId === currentPatient?.id;
    }, [selectedPatientId, currentPatient?.id]);

    // Fetch prescriptions data
    const fetchPrescriptions = async () => {
        if (familyLoading) return;

        try {
            setIsLoading(true);
            setError(null);

            const options = {
                page: currentPage - 1, // 0-indexed
                size: ITEMS_PER_PAGE
            };

            let response;
            if (selectedPatientId !== "all") {
                response = await PrescriptionApi.getPrescriptionsByPatient(selectedPatientId, options);
            } else {
                response = await PrescriptionApi.getPrescriptions(options);
            }

            if (response.data.isSuccess && response.data.data) {
                const allPrescriptions = response.data.data.content || [];

                // Apply client-side filtering
                const filteredPrescriptions = allPrescriptions.filter(prescription => {
                    // Filter by search query
                    if (searchQuery.trim()) {
                        const query = searchQuery.toLowerCase();
                        const matchesSearch = prescription.prescriptionNumber.toLowerCase().includes(query) ||
                            prescription.diagnosis.toLowerCase().includes(query) ||
                            prescription.appointment.doctor.name.toLowerCase().includes(query);
                        if (!matchesSearch) return false;
                    }

                    // Filter by status
                    if (selectedStatus !== "ALL") {
                        if (prescription.status !== selectedStatus) return false;
                    }

                    return true;
                });

                setPrescriptions(filteredPrescriptions);
                setTotalItems(response.data.data.totalElements || 0);
                setTotalPages(response.data.data.totalPages || 0);
            } else {
                throw new Error("Failed to fetch prescriptions");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to load prescriptions";
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Load prescriptions on component mount and when dependencies change
    useEffect(() => {
        fetchPrescriptions();
    }, [familyLoading, currentPage, selectedPatientId]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedStatus]);

    // Apply client-side filtering when search or status filter changes
    useEffect(() => {
        if (!isLoading) {
            fetchPrescriptions();
        }
    }, [searchQuery, selectedStatus]);

    // Event handlers
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handlePatientChange = (patientId: string) => {
        setSelectedPatientId(patientId);
    };

    const handleStatusChange = (status: PrescriptionStatus | "ALL") => {
        setSelectedStatus(status);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleRefresh = () => {
        fetchPrescriptions();
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setSelectedPatientId("all");
        setSelectedStatus("ALL");
        setCurrentPage(1);
    };

    const handleViewDetails = (prescription: PrescriptionDto) => {
        router.push(`/patient/prescription/${prescription.id}`);
    };

    // Get active filters count
    const getActiveFiltersCount = () => {
        let count = 0;
        if (searchQuery) count++;
        if (selectedPatientId !== "all") count++;
        if (selectedStatus !== "ALL") count++;
        return count;
    };

    // Calculate statistics
    const stats = useMemo(() => {
        const activeCount = prescriptions.filter(p =>
            p.status !== PrescriptionStatus.EXPIRED &&
            p.status !== PrescriptionStatus.CANCELLED
        ).length;

        const actionRequiredCount = prescriptions.filter(p =>
            p.status === PrescriptionStatus.CREATED
        ).length;

        return {
            totalPrescriptions: totalItems,
            activePrescriptions: activeCount,
            actionRequired: actionRequiredCount,
        };
    }, [prescriptions, totalItems]);

    // Render statistics cards
    const renderStatistics = () => (
        <Row gutter={[16, 16]} className="mb-8">
            <Col xs={24} sm={8} lg={8}>
                <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                    <Statistic
                        title={
                            <div className="flex items-center space-x-2">
                                <FileText className="w-5 h-5 text-blue-500" />
                                <Text className="text-gray-700 font-medium">Total Prescriptions</Text>
                            </div>
                        }
                        value={stats.totalPrescriptions}
                        valueStyle={{ color: "#1890ff", fontSize: "28px", fontWeight: "bold" }}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={8} lg={8}>
                <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                    <Statistic
                        title={
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                <Text className="text-gray-700 font-medium">Active</Text>
                            </div>
                        }
                        value={stats.activePrescriptions}
                        valueStyle={{ color: "#52c41a", fontSize: "28px", fontWeight: "bold" }}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={8} lg={8}>
                <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                    <Statistic
                        title={
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-orange-500" />
                                <Text className="text-gray-700 font-medium">Action Required</Text>
                            </div>
                        }
                        value={stats.actionRequired}
                        valueStyle={{ color: "#fa8c16", fontSize: "28px", fontWeight: "bold" }}
                    />
                </Card>
            </Col>
        </Row>
    );

    // Render search and filters
    const renderSearchAndFilters = () => (
        <Card className="mb-6 shadow-sm border border-gray-200" styles={{ body: { padding: "24px" } }}>
            <div className="flex flex-col space-y-4">
                {/* Search and Main Filters Row */}
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <Input
                            placeholder="Search prescriptions..."
                            prefix={<Search className="w-4 h-4 text-gray-400" />}
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            allowClear
                        />
                    </Col>

                    {getPatientOptions().length > 1 && (
                        <Col xs={24} sm={8} md={4}>
                            <Select
                                placeholder="Select Patient"
                                value={selectedPatientId}
                                onChange={handlePatientChange}
                                style={{ width: "100%" }}
                                options={getPatientOptions()}
                            />
                        </Col>
                    )}

                    <Col xs={24} sm={8} md={4}>
                        <Select
                            placeholder="Status"
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            style={{ width: "100%" }}
                            options={[
                                { value: "ALL", label: "All Status" },
                                { value: PrescriptionStatus.CREATED, label: "Created" },
                                { value: PrescriptionStatus.READY_FOR_PROCESSING, label: "Ready for Processing" },
                                { value: PrescriptionStatus.PROCESSING, label: "Processing" },
                                { value: PrescriptionStatus.READY, label: "Ready" },
                                { value: PrescriptionStatus.EXPIRED, label: "Expired" },
                                { value: PrescriptionStatus.CANCELLED, label: "Cancelled" },
                            ]}
                        />
                    </Col>
                </Row>

                {/* Action Buttons */}
                {getActiveFiltersCount() > 0 && (
                    <Row gutter={[16, 16]} align="middle" className="pt-2">
                        <Col flex="auto">
                            <Space>
                                <Tag color="blue" className="px-3 py-1">
                                    <Filter className="w-3 h-3 mr-1" />
                                    {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? 's' : ''} active
                                </Tag>
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                <Button
                                    icon={<X className="w-4 h-4" />}
                                    onClick={handleClearFilters}
                                >
                                    Clear
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                )}
            </div>
        </Card>
    );

    // Render prescriptions list
    const renderPrescriptionsList = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-12">
                    <Spin size="large" />
                </div>
            );
        }

        if (prescriptions.length === 0) {
            const isFiltered = getActiveFiltersCount() > 0;
            return (
                <Card className="text-center py-12">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div>
                                <Text className="text-gray-500 text-lg block mb-2">
                                    {isFiltered ? "No prescriptions match your current filters" : "No prescriptions found"}
                                </Text>
                                <Text className="text-gray-400">
                                    {isFiltered
                                        ? "Try adjusting your filters or search criteria"
                                        : "Prescriptions from your appointments will appear here"
                                    }
                                </Text>
                            </div>
                        }
                    >
                        {isFiltered && (
                            <Button type="primary" onClick={handleClearFilters} className="mt-4">
                                Clear Filters
                            </Button>
                        )}
                    </Empty>
                </Card>
            );
        }

        return (
            <>
                <Row gutter={[16, 16]}>
                    {prescriptions.map((prescription) => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={8} key={prescription.id}>
                            <PrescriptionCard
                                prescription={prescription}
                                delivery={prescription.delivery}
                                showPatientInfo={!isViewingOwnPrescriptions}
                                onViewDetails={handleViewDetails}
                            />
                        </Col>
                    ))}
                </Row>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <Pagination
                            current={currentPage}
                            total={totalItems}
                            pageSize={ITEMS_PER_PAGE}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                            showQuickJumper
                            showTotal={(total, range) =>
                                `${range[0]}-${range[1]} of ${total} prescriptions`
                            }
                        />
                    </div>
                )}
            </>
        );
    };

    if (familyLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
                <div>
                    <Title level={2} className="text-gray-800 mb-2 mt-0 text-xl md:text-3xl">
                        <Pill className="mr-3" />
                        My Prescriptions
                    </Title>
                    <Text className="text-gray-600 text-sm md:text-base">
                        View your prescription history and manage delivery options
                    </Text>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert
                    message="Error Loading Prescriptions"
                    description={error}
                    type="error"
                    showIcon
                    className="mb-6"
                    action={
                        <Button size="small" danger onClick={handleRefresh}>
                            Retry
                        </Button>
                    }
                />
            )}

            {/* Statistics */}
            {renderStatistics()}

            {/* Search and Filters */}
            {renderSearchAndFilters()}

            {/* Prescriptions List */}
            {renderPrescriptionsList()}
        </div>
    );
};

export default PrescriptionListingPage;
