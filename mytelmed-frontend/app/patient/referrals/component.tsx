"use client";

import { useState } from "react";
import {
    Typography,
    Select,
    Input,
    Pagination,
    Empty,
    DatePicker,
    Button,
    Spin,
    Divider,
    Card,
    Alert,
    Row,
    Col,
    Statistic,
} from "antd";
import {
    SearchOutlined,
    FilterOutlined,
    ClearOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import { ReferralsComponentProps } from "./props";
import ReferralCard from "./components/ReferralCard";
import ReferralDetailModal from "./components/ReferralDetailModal";
import { ReferralStatus, ReferralPriority, ReferralType } from "@/app/api/referral/props";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ReferralsComponent: React.FC<ReferralsComponentProps> = ({
    referrals,
    filteredReferrals,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    filters,
    statusOptions,
    specialtyOptions,
    priorityOptions,
    referralTypeOptions,
    searchQuery,
    onSearchChange,
    onFilterChange,
    onPageChange,
    onRefresh,
    isLoading,
    error,
}) => {
    const [selectedReferral, setSelectedReferral] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Handle view details click
    const handleViewDetails = (referral: any) => {
        setSelectedReferral(referral);
        setModalVisible(true);
    };

    // Handle date range change
    const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
        if (dates) {
            onFilterChange({ dateRange: dateStrings });
        } else {
            onFilterChange({ dateRange: undefined });
        }
    };

    // Handle status change
    const handleStatusChange = (values: ReferralStatus[]) => {
        onFilterChange({ status: values.length > 0 ? values : undefined });
    };

    // Handle priority change
    const handlePriorityChange = (values: ReferralPriority[]) => {
        onFilterChange({ priority: values.length > 0 ? values : undefined });
    };

    // Handle referral type change
    const handleReferralTypeChange = (values: ReferralType[]) => {
        onFilterChange({ referralType: values.length > 0 ? values : undefined });
    };

    // Handle specialty change
    const handleSpecialtyChange = (value: string) => {
        onFilterChange({ specialty: value || undefined });
    };

    // Handle doctor name change
    const handleDoctorNameChange = (value: string) => {
        onFilterChange({ doctorName: value || undefined });
    };

    // Clear all filters
    const handleClearFilters = () => {
        onFilterChange({
            status: undefined,
            dateRange: undefined,
            doctorName: undefined,
            specialty: undefined,
            priority: undefined,
            referralType: undefined,
        });
        onSearchChange("");
    };

    // Toggle filters visibility
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    // Format page info text
    const getPageInfoText = () => {
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, totalItems);
        return `Showing ${start}-${end} of ${totalItems} referrals`;
    };

    const hasActiveFilters = () => {
        return Boolean(
            searchQuery ||
                filters.status ||
                filters.dateRange ||
                filters.doctorName ||
                filters.specialty ||
                filters.priority ||
                filters.referralType
        );
    };

    // Calculate statistics
    const getStatistics = () => {
        const active = referrals.filter(
            (r) =>
                r.status === ReferralStatus.ACCEPTED ||
                r.status === ReferralStatus.PENDING ||
                r.status === ReferralStatus.SCHEDULED
        ).length;

        const completed = referrals.filter((r) => r.status === ReferralStatus.COMPLETED).length;
        const expired = referrals.filter((r) => r.status === ReferralStatus.EXPIRED).length;

        return { active, completed, expired };
    };

    const stats = getStatistics();

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-center items-center min-h-[400px]">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
                <div>
                    <Title level={2} className="my-0 text-blue-900 text-xl sm:text-2xl lg:text-3xl">
                        My Referrals
                    </Title>
                    <Text className="text-gray-600 text-sm sm:text-base">Manage and track your medical referrals</Text>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        icon={<FilterOutlined />}
                        onClick={toggleFilters}
                        type={showFilters ? "primary" : "default"}
                    >
                        Filters
                    </Button>
                    {hasActiveFilters() && (
                        <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={8}>
                    <Card className="shadow-lg border-0 bg-white">
                        <Statistic
                            title={
                                <div className="flex items-center">
                                    <CheckCircleOutlined className="text-green-500 mr-2" />
                                    <Text className="text-gray-700">Active</Text>
                                </div>
                            }
                            value={stats.active}
                            valueStyle={{ color: "#52c41a", fontSize: "24px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="shadow-lg border-0 bg-white">
                        <Statistic
                            title={
                                <div className="flex items-center">
                                    <CalendarOutlined className="text-blue-500 mr-2" />
                                    <Text className="text-gray-700">Completed</Text>
                                </div>
                            }
                            value={stats.completed}
                            valueStyle={{ color: "#1890ff", fontSize: "24px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="shadow-lg border-0 bg-white">
                        <Statistic
                            title={
                                <div className="flex items-center">
                                    <ExclamationCircleOutlined className="text-orange-500 mr-2" />
                                    <Text className="text-gray-700">Expired</Text>
                                </div>
                            }
                            value={stats.expired}
                            valueStyle={{ color: "#fa8c16", fontSize: "24px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Error Alert */}
            {error && (
                <Alert
                    message="Error Loading Referrals"
                    description={error}
                    type="error"
                    showIcon
                    className="mb-6"
                    action={
                        <Button size="small" danger onClick={onRefresh}>
                            Retry
                        </Button>
                    }
                />
            )}

            {/* Search and Filters */}
            <Card className="shadow-sm border-0 bg-white mb-6">
                {/* Search */}
                <div className="mb-4">
                    <Input
                        placeholder="Search referrals by reason, doctor, or facility..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        prefix={<SearchOutlined />}
                        allowClear
                        size="large"
                        className="rounded-lg"
                    />
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="mb-4">
                        <Divider orientation="left" orientationMargin="0">
                            <Text strong className="flex items-center">
                                <FilterOutlined className="mr-2" /> Filter Options
                            </Text>
                        </Divider>

                        <Row gutter={[16, 16]} className="mt-4">
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <div>
                                    <Text strong className="block mb-2">
                                        Status
                                    </Text>
                                    <Select
                                        mode="multiple"
                                        placeholder="Filter by status"
                                        onChange={handleStatusChange}
                                        value={filters.status || []}
                                        style={{ width: "100%" }}
                                        options={statusOptions}
                                        allowClear
                                        size="middle"
                                    />
                                </div>
                            </Col>

                            <Col xs={24} sm={12} md={8} lg={6}>
                                <div>
                                    <Text strong className="block mb-2">
                                        Priority
                                    </Text>
                                    <Select
                                        mode="multiple"
                                        placeholder="Filter by priority"
                                        onChange={handlePriorityChange}
                                        value={filters.priority || []}
                                        style={{ width: "100%" }}
                                        options={priorityOptions}
                                        allowClear
                                        size="middle"
                                    />
                                </div>
                            </Col>

                            <Col xs={24} sm={12} md={8} lg={6}>
                                <div>
                                    <Text strong className="block mb-2">
                                        Type
                                    </Text>
                                    <Select
                                        mode="multiple"
                                        placeholder="Filter by type"
                                        onChange={handleReferralTypeChange}
                                        value={filters.referralType || []}
                                        style={{ width: "100%" }}
                                        options={referralTypeOptions}
                                        allowClear
                                        size="middle"
                                    />
                                </div>
                            </Col>

                            <Col xs={24} sm={12} md={8} lg={6}>
                                <div>
                                    <Text strong className="block mb-2">
                                        Specialty
                                    </Text>
                                    <Select
                                        placeholder="Filter by specialty"
                                        onChange={handleSpecialtyChange}
                                        value={filters.specialty || undefined}
                                        style={{ width: "100%" }}
                                        options={specialtyOptions}
                                        allowClear
                                        size="middle"
                                    />
                                </div>
                            </Col>

                            <Col xs={24} sm={12} md={8} lg={6}>
                                <div>
                                    <Text strong className="block mb-2">
                                        Date Range
                                    </Text>
                                    <RangePicker
                                        style={{ width: "100%" }}
                                        onChange={handleDateRangeChange}
                                        value={
                                            filters.dateRange
                                                ? ([
                                                      filters.dateRange[0] ? dayjs(filters.dateRange[0]) : null,
                                                      filters.dateRange[1] ? dayjs(filters.dateRange[1]) : null,
                                                  ] as any)
                                                : null
                                        }
                                        placeholder={["Start Date", "End Date"]}
                                        size="middle"
                                    />
                                </div>
                            </Col>

                            <Col xs={24} sm={12} md={8} lg={6}>
                                <div>
                                    <Text strong className="block mb-2">
                                        Doctor Name
                                    </Text>
                                    <Input
                                        placeholder="Doctor name"
                                        value={filters.doctorName || ""}
                                        onChange={(e) => handleDoctorNameChange(e.target.value)}
                                        allowClear
                                        size="middle"
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
            </Card>

            {/* Referrals List */}
            <Card className="shadow-sm border-0 bg-white mb-6">
                {filteredReferrals.length > 0 ? (
                    <div>
                        {filteredReferrals.map((referral) => (
                            <ReferralCard key={referral.id} referral={referral} onViewDetails={handleViewDetails} />
                        ))}

                        {totalPages > 1 && (
                            <div className="flex flex-col items-center mt-8 mb-4">
                                <div className="text-sm text-gray-600 mb-2">{getPageInfoText()}</div>
                                <Pagination
                                    current={currentPage}
                                    pageSize={itemsPerPage}
                                    total={totalItems}
                                    onChange={onPageChange}
                                    showSizeChanger={false}
                                    showQuickJumper={totalItems > itemsPerPage * 3}
                                    showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <Empty
                        description={hasActiveFilters() ? "No referrals match your filters" : "No referrals found"}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        {hasActiveFilters() && <Button onClick={handleClearFilters}>Clear Filters</Button>}
                    </Empty>
                )}
            </Card>

            {/* Referral Detail Modal */}
            <ReferralDetailModal
                referral={selectedReferral}
                isVisible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </div>
    );
};

export default ReferralsComponent;
