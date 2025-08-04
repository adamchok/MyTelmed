"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    Tabs,
    Button,
    Typography,
    Row,
    Col,
    Statistic,
    Spin,
    message,
    Input,
    Select,
    DatePicker,
    Space,
    Tag,
    Badge,
} from "antd";
import {
    Pill,
    FileText,
    Clock,
    CheckCircle,
    Plus,
    Search,
    Filter,
    RotateCcw,
    ArrowUp,
    ArrowDown,
    Activity,
} from "lucide-react";
import PrescriptionApi from "@/app/api/prescription";
import { PrescriptionDto, PrescriptionStatus } from "@/app/api/prescription/props";
import MyPrescriptionsTab from "./components/MyPrescriptionsTab";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

type SortField = "createdAt" | "expiryDate" | "patientName" | "status";
type SortDirection = "asc" | "desc";

export default function DoctorPrescriptionPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("my-prescriptions");
    const [loading, setLoading] = useState(true);
    const [prescriptions, setPrescriptions] = useState<PrescriptionDto[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Statistics
    const [totalPrescriptions, setTotalPrescriptions] = useState(0);
    const [recentPrescriptions, setRecentPrescriptions] = useState(0);
    const [activePrescriptions, setActivePrescriptions] = useState(0);

    // Filter and search state
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<PrescriptionStatus | "all">("all");
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    const [sortField, setSortField] = useState<SortField>("createdAt");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [showFilters, setShowFilters] = useState(false);

    // Load prescriptions and calculate statistics
    const loadPrescriptions = async () => {
        try {
            const response = await PrescriptionApi.getPrescriptions();
            if (response.data.isSuccess && response.data.data) {
                const prescriptionList = response.data.data.content || [];
                setPrescriptions(prescriptionList);

                // Calculate statistics
                setTotalPrescriptions(prescriptionList.length);

                // Recent prescriptions (last 7 days)
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const recent = prescriptionList.filter(p =>
                    new Date(p.createdAt) >= oneWeekAgo
                ).length;
                setRecentPrescriptions(recent);

                // Active prescriptions (not expired, cancelled)
                const active = prescriptionList.filter(p =>
                    p.status === "CREATED" ||
                    p.status === "READY_FOR_PROCESSING" ||
                    p.status === "PROCESSING" ||
                    p.status === "READY"
                ).length;
                setActivePrescriptions(active);
            }
        } catch (error) {
            console.error("Failed to load prescriptions:", error);
            message.error("Failed to load prescriptions");
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await loadPrescriptions();
            } catch {
                message.error("Failed to load prescription data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [refreshTrigger]);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Filter prescriptions based on search criteria
    const filteredPrescriptions = prescriptions.filter((prescription) => {
        // Text search filter
        const matchesSearch =
            searchTerm === "" ||
            prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.prescriptionItems.some(item =>
                item.medicationName.toLowerCase().includes(searchTerm.toLowerCase())
            );

        // Status filter
        const matchesStatus = selectedStatus === "all" || prescription.status === selectedStatus;

        // Date range filter (created date)
        const matchesDateRange =
            !dateRange?.[0] ||
            !dateRange?.[1] ||
            (dayjs(Number(prescription.createdAt) * 1000).isAfter(dateRange[0]) &&
                dayjs(Number(prescription.createdAt) * 1000).isBefore(dateRange[1].add(1, "day")));

        return matchesSearch && matchesStatus && matchesDateRange;
    });

    // Sort prescriptions based on selected criteria
    const sortedPrescriptions = [...filteredPrescriptions].sort((a, b) => {
        let aValue: string | Date | number;
        let bValue: string | Date | number;

        if (sortField === "expiryDate") {
            aValue = Number(a.expiryDate);
            bValue = Number(b.expiryDate);
        } else if (sortField === "patientName") {
            aValue = a.appointment.patient.name.toLowerCase();
            bValue = b.appointment.patient.name.toLowerCase();
        } else if (sortField === "status") {
            aValue = a.status;
            bValue = b.status;
        } else {
            // Default to createdAt for both "createdAt" and any other case
            aValue = Number(a.createdAt);
            bValue = Number(b.createdAt);
        }

        let comparison = 0;
        if (aValue < bValue) {
            comparison = -1;
        } else if (aValue > bValue) {
            comparison = 1;
        }
        return sortDirection === "asc" ? comparison : -comparison;
    });

    // Handle sort change
    const handleSortFieldChange = (field: SortField) => {
        setSortField(field);
    };

    const handleSortDirectionToggle = () => {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    };

    // Handle filter reset
    const handleResetFilters = () => {
        setSearchTerm("");
        setSelectedStatus("all");
        setDateRange(null);
        setSortField("createdAt");
        setSortDirection("desc");
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
                return <Clock className="w-3 h-3" />;
            case PrescriptionStatus.CANCELLED:
                return <FileText className="w-3 h-3" />;
            default:
                return <FileText className="w-3 h-3" />;
        }
    };

    // Calculate filtered statistics
    const filteredStats = {
        total: sortedPrescriptions.length,
        created: sortedPrescriptions.filter(p => p.status === PrescriptionStatus.CREATED).length,
        processing: sortedPrescriptions.filter(p =>
            p.status === PrescriptionStatus.READY_FOR_PROCESSING ||
            p.status === PrescriptionStatus.PROCESSING
        ).length,
        ready: sortedPrescriptions.filter(p => p.status === PrescriptionStatus.READY).length,
        expired: sortedPrescriptions.filter(p => p.status === PrescriptionStatus.EXPIRED).length,
        cancelled: sortedPrescriptions.filter(p => p.status === PrescriptionStatus.CANCELLED).length,
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Title level={2} className="text-gray-800 mb-2 mt-0 text-lg sm:text-xl md:text-3xl">
                        <Pill className="mr-2 inline-block" />
                        Prescription Management
                    </Title>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                        Manage prescriptions for your patients
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                        icon={<Filter className="w-4 h-4" />}
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full sm:w-auto"
                        aria-label="Toggle prescription filters"
                        aria-expanded={showFilters}
                    >
                        {showFilters ? "Hide Filters" : "Show Filters"}
                    </Button>
                    <Button
                        type="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => router.push("/doctor/prescription/create")}
                        size="middle"
                        className="bg-green-600 hover:bg-green-700 border-green-600 w-full sm:w-auto"
                        style={{ backgroundColor: "#059669" }}
                        aria-label="Create new prescription"
                    >
                        Create Prescription
                    </Button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <Card className="border-green-200">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-gray-700">Filter & Sort Prescriptions</span>
                            </div>
                            <Button
                                type="text"
                                icon={<RotateCcw className="w-4 h-4" />}
                                onClick={handleResetFilters}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Reset all filters"
                            >
                                Reset
                            </Button>
                        </div>

                        <Row gutter={[16, 16]} align="middle">
                            {/* Search */}
                            <Col xs={24} sm={12} md={8}>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700" htmlFor="prescription-search">
                                        Search
                                    </label>
                                    <Input
                                        id="prescription-search"
                                        placeholder="Search prescriptions, patients, diagnosis, medications..."
                                        prefix={<Search className="w-4 h-4 text-gray-400" />}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        allowClear
                                        aria-label="Search prescriptions by number, patient name, diagnosis, or medication"
                                    />
                                </div>
                            </Col>

                            {/* Status Filter */}
                            <Col xs={24} sm={12} md={6}>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700" htmlFor="status-filter">
                                        Status
                                    </label>
                                    <Select
                                        id="status-filter"
                                        placeholder="Filter by status"
                                        value={selectedStatus}
                                        onChange={setSelectedStatus}
                                        style={{ width: "100%" }}
                                        allowClear
                                        aria-label="Filter prescriptions by status"
                                    >
                                        <Option value="all">All Statuses</Option>
                                        <Option value={PrescriptionStatus.CREATED}>
                                            <Space>
                                                {getStatusIcon(PrescriptionStatus.CREATED)}
                                                Created
                                            </Space>
                                        </Option>
                                        <Option value={PrescriptionStatus.READY_FOR_PROCESSING}>
                                            <Space>
                                                {getStatusIcon(PrescriptionStatus.READY_FOR_PROCESSING)}
                                                Ready for Processing
                                            </Space>
                                        </Option>
                                        <Option value={PrescriptionStatus.PROCESSING}>
                                            <Space>
                                                {getStatusIcon(PrescriptionStatus.PROCESSING)}
                                                Processing
                                            </Space>
                                        </Option>
                                        <Option value={PrescriptionStatus.READY}>
                                            <Space>
                                                {getStatusIcon(PrescriptionStatus.READY)}
                                                Ready
                                            </Space>
                                        </Option>
                                        <Option value={PrescriptionStatus.EXPIRED}>
                                            <Space>
                                                {getStatusIcon(PrescriptionStatus.EXPIRED)}
                                                Expired
                                            </Space>
                                        </Option>
                                        <Option value={PrescriptionStatus.CANCELLED}>
                                            <Space>
                                                {getStatusIcon(PrescriptionStatus.CANCELLED)}
                                                Cancelled
                                            </Space>
                                        </Option>
                                    </Select>
                                </div>
                            </Col>

                            {/* Date Range */}
                            <Col xs={24} sm={12} md={6}>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700" htmlFor="date-range">
                                        Created Date Range
                                    </label>
                                    <RangePicker
                                        id="date-range"
                                        value={dateRange}
                                        onChange={setDateRange}
                                        style={{ width: "100%" }}
                                        placeholder={["Start Date", "End Date"]}
                                        allowClear
                                        aria-label="Filter prescriptions by creation date range"
                                    />
                                </div>
                            </Col>

                            {/* Sort Options */}
                            <Col xs={24} sm={12} md={4}>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700" htmlFor="sort-field">
                                        Sort By
                                    </label>
                                    <Select
                                        id="sort-field"
                                        value={sortField}
                                        onChange={handleSortFieldChange}
                                        style={{ width: "100%" }}
                                        aria-label="Sort prescriptions by field"
                                    >
                                        <Option value="createdAt">Created Date</Option>
                                        <Option value="expiryDate">Expiry Date</Option>
                                        <Option value="patientName">Patient Name</Option>
                                        <Option value="status">Status</Option>
                                    </Select>
                                </div>
                            </Col>

                            <Col xs={24} sm={12} md={2}>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700" htmlFor="sort-direction">
                                        Order
                                    </label>
                                    <Button
                                        id="sort-direction"
                                        icon={
                                            sortDirection === "asc" ? (
                                                <ArrowUp className="w-4 h-4" />
                                            ) : (
                                                <ArrowDown className="w-4 h-4" />
                                            )
                                        }
                                        onClick={handleSortDirectionToggle}
                                        style={{ width: "100%" }}
                                        title={`Sort ${sortDirection === "asc" ? "Ascending" : "Descending"}`}
                                        aria-label={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
                                    >
                                        {sortDirection === "asc" ? "Asc" : "Desc"}
                                    </Button>
                                </div>
                            </Col>
                        </Row>

                        {/* Active Filters Summary */}
                        {(searchTerm || selectedStatus !== "all" || dateRange || sortField !== "createdAt" || sortDirection !== "desc") && (
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {searchTerm && (
                                    <Tag closable onClose={() => setSearchTerm("")} className="mb-1">
                                        Search: {searchTerm}
                                    </Tag>
                                )}
                                {selectedStatus !== "all" && (
                                    <Tag closable onClose={() => setSelectedStatus("all")} className="mb-1">
                                        Status: {selectedStatus}
                                    </Tag>
                                )}
                                {dateRange && (
                                    <Tag closable onClose={() => setDateRange(null)} className="mb-1">
                                        Date: {dateRange[0]?.format("MMM D")} - {dateRange[1]?.format("MMM D")}
                                    </Tag>
                                )}
                                {sortField !== "createdAt" && (
                                    <Tag closable onClose={() => setSortField("createdAt")} className="mb-1">
                                        Sort: {sortField}
                                    </Tag>
                                )}
                                {sortDirection !== "desc" && (
                                    <Tag closable onClose={() => setSortDirection("desc")} className="mb-1">
                                        Order: {sortDirection}
                                    </Tag>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Enhanced Statistics Cards with Filter Results */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={8}>
                    <section className="h-full !border-l-4 !border-l-blue-500 p-6 bg-white rounded-lg shadow-sm" aria-label="Total prescriptions statistics">
                        <Card className="h-full border-none shadow-none p-0">
                            <Statistic
                                title={
                                    <span className="flex items-center gap-2 text-xs sm:text-sm">
                                        <Pill className="w-4 h-4 text-blue-600" />
                                        Total Prescriptions
                                    </span>
                                }
                                value={totalPrescriptions}
                                valueStyle={{ color: '#1890ff', fontSize: '1.5rem' }}
                                suffix={
                                    filteredStats.total !== totalPrescriptions && (
                                        <span className="text-sm text-gray-500">
                                            ({filteredStats.total} filtered)
                                        </span>
                                    )
                                }
                            />
                        </Card>
                    </section>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <section className="h-full border-l-4 border-l-orange-500 p-6 bg-white rounded-lg shadow-sm" aria-label="Recent prescriptions statistics">
                        <Card className="h-full border-none shadow-none p-0">
                            <Statistic
                                title={
                                    <span className="flex items-center gap-2 text-xs sm:text-sm">
                                        <Clock className="w-4 h-4 text-orange-600" />
                                        Recent (7 days)
                                    </span>
                                }
                                value={recentPrescriptions}
                                valueStyle={{ color: '#fa8c16', fontSize: '1.5rem' }}
                            />
                        </Card>
                    </section>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <section className="h-full border-l-4 border-l-green-500 p-6 bg-white rounded-lg shadow-sm" aria-label="Active prescriptions statistics">
                        <Card className="h-full border-none shadow-none p-0">
                            <Statistic
                                title={
                                    <span className="flex items-center gap-2 text-xs sm:text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        Active Prescriptions
                                    </span>
                                }
                                value={activePrescriptions}
                                valueStyle={{ color: '#52c41a', fontSize: '1.5rem' }}
                                suffix={
                                    filteredStats.processing > 0 && (
                                        <span className="text-sm text-gray-500">
                                            ({filteredStats.processing} processing)
                                        </span>
                                    )
                                }
                            />
                        </Card>
                    </section>
                </Col>
            </Row>

            {/* Main Content Tabs */}
            <main aria-label="Prescription management content">
                <Card>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            {
                                key: "my-prescriptions",
                                label: (
                                    <span className="flex items-center gap-2" role="tab" aria-selected={activeTab === "my-prescriptions"}>
                                        <FileText className="w-4 h-4" />
                                        <span className="hidden sm:inline">My Prescriptions</span>
                                        <span className="sm:hidden">Prescriptions</span>
                                        <Badge
                                            count={filteredStats.total}
                                            size="small"
                                            style={{ backgroundColor: '#059669' }}
                                            title={`${filteredStats.total} prescriptions shown`}
                                        />
                                    </span>
                                ),
                                children: (
                                    <div role="tabpanel" aria-labelledby="my-prescriptions-tab">
                                        <MyPrescriptionsTab
                                            prescriptions={sortedPrescriptions}
                                            onRefresh={handleRefresh}
                                            filterState={{
                                                searchTerm,
                                                selectedStatus,
                                                dateRange,
                                                sortField,
                                                sortDirection,
                                                showFilters
                                            }}
                                        />
                                    </div>
                                ),
                            },
                        ]}
                        aria-label="Prescription management tabs"
                    />
                </Card>
            </main>
        </div>
    );
}
