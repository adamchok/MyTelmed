"use client";

import { useState } from "react";
import {
    Typography,
    Row,
    Col,
    Card,
    Statistic,
    Input,
    Select,
    DatePicker,
    Button,
    Space,
    Empty,
    Spin,
    Alert,
    Pagination,
    Tag,
    Tooltip,
} from "antd";
import {
    Search,
    Filter,
    RefreshCw,
    X,
    CreditCard,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt,
} from "lucide-react";
import dayjs from "dayjs";
import { BillingComponentProps } from "./props";
import { BillDto } from "@/app/api/payment/props";
import BillCard from "./components/BillCard";
import BillDetailModal from "./components/BillDetailModal";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const BillingComponent: React.FC<BillingComponentProps> = ({
    bills,
    stats,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchQuery,
    selectedPatientId,
    selectedBillType,
    selectedStatus,
    dateRange,
    sortBy,
    sortDir,
    patientOptions,
    isViewingOwnBills,
    isLoading,
    error,
    onSearchChange,
    onPatientChange,
    onBillTypeChange,
    onStatusChange,
    onDateRangeChange,
    onSortChange,
    onPageChange,
    onRefresh,
    onClearFilters,
}) => {
    // Modal state
    const [selectedBill, setSelectedBill] = useState<BillDto | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Handle bill detail modal
    const handleViewDetails = (bill: BillDto) => {
        setSelectedBill(bill);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setSelectedBill(null);
        setModalVisible(false);
    };

    // Format amount helper
    const formatAmount = (amount: number) => {
        return `RM ${amount.toFixed(2)}`;
    };

    // Get active filters count
    const getActiveFiltersCount = () => {
        let count = 0;
        if (searchQuery) count++;
        if (selectedPatientId !== "all") count++;
        if (selectedBillType !== "ALL") count++;
        if (selectedStatus !== "ALL") count++;
        if (dateRange) count++;
        return count;
    };

    // Render statistics cards
    const renderStatistics = () => (
        <Row gutter={[16, 16]} className="mb-8">
            <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                    <Statistic
                        title={
                            <div className="flex items-center space-x-2">
                                <Receipt className="w-5 h-5 text-blue-500" />
                                <Text className="text-gray-700 font-medium">Total Bills</Text>
                            </div>
                        }
                        value={stats.totalBills}
                        valueStyle={{ color: "#1890ff", fontSize: "28px", fontWeight: "bold" }}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                    <Statistic
                        title={
                            <div className="flex items-center space-x-2">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                <Text className="text-gray-700 font-medium">Total Amount (Page)</Text>
                            </div>
                        }
                        value={formatAmount(stats.totalAmount)}
                        valueStyle={{ color: "#52c41a", fontSize: "24px", fontWeight: "bold" }}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                    <Statistic
                        title={
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                <Text className="text-gray-700 font-medium">Paid ({stats.paidBills} on page)</Text>
                            </div>
                        }
                        value={formatAmount(stats.paidAmount)}
                        valueStyle={{ color: "#52c41a", fontSize: "20px", fontWeight: "bold" }}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                    <Statistic
                        title={
                            <div className="flex items-center space-x-2">
                                <TrendingDown className="w-5 h-5 text-orange-500" />
                                <Text className="text-gray-700 font-medium">Unpaid ({stats.unpaidBills} on page)</Text>
                            </div>
                        }
                        value={formatAmount(stats.unpaidAmount)}
                        valueStyle={{ color: "#fa8c16", fontSize: "20px", fontWeight: "bold" }}
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
                            placeholder="Search by bill number or description..."
                            prefix={<Search className="w-4 h-4 text-gray-400" />}
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            allowClear
                        />
                    </Col>

                    {patientOptions.length > 1 && (
                        <Col xs={24} sm={8} md={4}>
                            <Select
                                placeholder="Select Patient"
                                value={selectedPatientId}
                                onChange={onPatientChange}
                                style={{ width: "100%" }}
                                options={patientOptions}
                            />
                        </Col>
                    )}

                    <Col xs={24} sm={8} md={4}>
                        <Select
                            placeholder="Bill Type"
                            value={selectedBillType}
                            onChange={onBillTypeChange}
                            style={{ width: "100%" }}
                            options={[
                                { value: "ALL", label: "All Types" },
                                { value: "CONSULTATION", label: "Consultation" },
                                { value: "MEDICATION", label: "Medication" },
                            ]}
                        />
                    </Col>

                    <Col xs={24} sm={8} md={4}>
                        <Select
                            placeholder="Status"
                            value={selectedStatus}
                            onChange={onStatusChange}
                            style={{ width: "100%" }}
                            options={[
                                { value: "ALL", label: "All Status" },
                                { value: "PAID", label: "Paid" },
                                { value: "UNPAID", label: "Unpaid" },
                                { value: "CANCELLED", label: "Cancelled" },
                            ]}
                        />
                    </Col>

                    <Col xs={24} sm={8} md={6}>
                        <RangePicker
                            value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
                            onChange={(dates) => {
                                if (dates && dates[0] && dates[1]) {
                                    onDateRangeChange([
                                        dates[0].format('YYYY-MM-DD'),
                                        dates[1].format('YYYY-MM-DD')
                                    ]);
                                } else {
                                    onDateRangeChange(null);
                                }
                            }}
                            style={{ width: "100%" }}
                            placeholder={["Start Date", "End Date"]}
                        />
                    </Col>
                </Row>

                {/* Action Buttons and Sort */}
                <Row gutter={[16, 16]} align="middle" className="pt-2">
                    <Col flex="auto">
                        <Space>
                            {getActiveFiltersCount() > 0 && (
                                <Tag color="blue" className="px-3 py-1">
                                    <Filter className="w-3 h-3 mr-1" />
                                    {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? 's' : ''} active
                                </Tag>
                            )}
                        </Space>
                    </Col>

                    <Col>
                        <Space>
                            <Select
                                value={`${sortBy}-${sortDir}`}
                                onChange={(value) => {
                                    const [newSortBy, newSortDir] = value.split('-');
                                    onSortChange(newSortBy, newSortDir);
                                }}
                                style={{ width: 160 }}
                                options={[
                                    { value: "createdAt-desc", label: "Newest First" },
                                    { value: "createdAt-asc", label: "Oldest First" },
                                    { value: "billedAt-desc", label: "Recent Bills" },
                                    { value: "amount-desc", label: "Highest Amount" },
                                    { value: "amount-asc", label: "Lowest Amount" },
                                ]}
                            />

                            {getActiveFiltersCount() > 0 && (
                                <Tooltip title="Clear all filters">
                                    <Button
                                        icon={<X className="w-4 h-4" />}
                                        onClick={onClearFilters}
                                    >
                                        Clear
                                    </Button>
                                </Tooltip>
                            )}

                            <Tooltip title="Refresh">
                                <Button
                                    icon={<RefreshCw className="w-4 h-4" />}
                                    onClick={onRefresh}
                                    loading={isLoading}
                                >
                                    Refresh
                                </Button>
                            </Tooltip>
                        </Space>
                    </Col>
                </Row>
            </div>
        </Card>
    );

    // Render bills list
    const renderBillsList = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-12">
                    <Spin size="large" />
                </div>
            );
        }

        if (bills.length === 0) {
            const isFiltered = getActiveFiltersCount() > 0;
            return (
                <Card className="text-center py-12">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div>
                                <Text className="text-gray-500 text-lg block mb-2">
                                    {isFiltered ? "No bills match your current filters" : "No bills found"}
                                </Text>
                                <Text className="text-gray-400">
                                    {isFiltered
                                        ? "Try adjusting your filters or search criteria"
                                        : "Bills will appear here when you make payments for consultations or medications"
                                    }
                                </Text>
                            </div>
                        }
                    >
                        {isFiltered && (
                            <Button type="primary" onClick={onClearFilters} className="mt-4">
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
                    {bills.map((bill) => (
                        <Col xs={24} sm={12} md={8} lg={8} xl={8} key={bill.id}>
                            <div onClick={() => handleViewDetails(bill)} className="cursor-pointer">
                                <BillCard
                                    bill={bill}
                                    showPatientInfo={!isViewingOwnBills}
                                />
                            </div>
                        </Col>
                    ))}
                </Row>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <Pagination
                            current={currentPage}
                            total={totalItems}
                            pageSize={itemsPerPage}
                            onChange={onPageChange}
                            showSizeChanger={false}
                            showQuickJumper
                            showTotal={(total, range) =>
                                `${range[0]}-${range[1]} of ${total} bills`
                            }
                        />
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
                <div>
                    <Title level={2} className="text-gray-800 mb-2 mt-0 text-xl md:text-3xl">
                        <CreditCard className="mr-3" />
                        Billing & Payments
                    </Title>
                    <Text className="text-gray-600 text-sm md:text-base">
                        View your bills, invoices, and payment receipts
                    </Text>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert
                    message="Error Loading Bills"
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

            {/* Statistics */}
            {renderStatistics()}

            {/* Search and Filters */}
            {renderSearchAndFilters()}

            {/* Bills List */}
            {renderBillsList()}

            {/* Bill Detail Modal */}
            <BillDetailModal
                bill={selectedBill}
                visible={modalVisible}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default BillingComponent; 