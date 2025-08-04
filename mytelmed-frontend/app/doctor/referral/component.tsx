"use client";

import { useState } from "react";
import {
    Typography,
    Button,
    Spin,
    Card,
    Alert,
    Row,
    Col,
    Statistic,
    Tabs,
    Input,
    Select,
    DatePicker,
    Tag,
} from "antd";
import {
    CalendarOutlined,
} from "@ant-design/icons";
import {
    Clock,
    CheckCircle,
    TrendingUp,
    Send,
    UserCheck,
    FileText,
    Plus,
    Search,
    Filter,
    RotateCcw,
    ArrowUp,
    ArrowDown,
    Activity,
    AlertTriangle,
    Calendar,
    Globe,
    Home,
} from "lucide-react";
import { ReferralStatisticsDto, ReferralStatus, ReferralPriority, ReferralType } from "@/app/api/referral/props";
import MyReferralsTab from "./components/MyReferralsTab";
import ReferralsForMeTab from "./components/ReferralsForMeTab";
import type { Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

type SortField = "createdAt" | "expiryDate" | "patientName" | "status" | "priority";
type SortDirection = "asc" | "desc";

interface FilterState {
    searchTerm: string;
    selectedStatus: ReferralStatus | "all";
    selectedPriority: ReferralPriority | "all";
    selectedType: ReferralType | "all";
    dateRange: [Dayjs | null, Dayjs | null] | null;
    sortField: SortField;
    sortDirection: SortDirection;
    showFilters: boolean;
}

interface DoctorReferralComponentProps {
    statistics: ReferralStatisticsDto | null;
    onRefresh: () => void;
    onCreateReferral: () => void;
    loading: boolean;
    error?: string | null;
    refreshTrigger: number;
}

const DoctorReferralComponent: React.FC<DoctorReferralComponentProps> = ({
    statistics,
    onRefresh,
    onCreateReferral,
    loading,
    error,
    refreshTrigger,
}) => {
    const [activeTab, setActiveTab] = useState("outgoing");

    // Filter and search state
    const [filterState, setFilterState] = useState<FilterState>({
        searchTerm: "",
        selectedStatus: "all",
        selectedPriority: "all",
        selectedType: "all",
        dateRange: null,
        sortField: "createdAt",
        sortDirection: "desc",
        showFilters: false,
    });

    // Handle filter updates
    const updateFilterState = (updates: Partial<FilterState>) => {
        setFilterState(prev => ({ ...prev, ...updates }));
    };

    // Handle filter reset
    const handleResetFilters = () => {
        setFilterState({
            searchTerm: "",
            selectedStatus: "all",
            selectedPriority: "all",
            selectedType: "all",
            dateRange: null,
            sortField: "createdAt",
            sortDirection: "desc",
            showFilters: false,
        });
    };

    // Handle sort field change
    const handleSortFieldChange = (value: SortField) => {
        updateFilterState({ sortField: value });
    };

    // Handle sort direction toggle
    const handleSortDirectionToggle = () => {
        updateFilterState({
            sortDirection: filterState.sortDirection === "asc" ? "desc" : "asc"
        });
    };

    // Get status color and icon
    const getStatusColor = (status: ReferralStatus): string => {
        switch (status) {
            case ReferralStatus.PENDING:
                return "orange";
            case ReferralStatus.ACCEPTED:
                return "blue";
            case ReferralStatus.SCHEDULED:
                return "cyan";
            case ReferralStatus.COMPLETED:
                return "green";
            case ReferralStatus.REJECTED:
                return "red";
            case ReferralStatus.EXPIRED:
                return "volcano";
            case ReferralStatus.CANCELLED:
                return "default";
            default:
                return "default";
        }
    };

    const getStatusIcon = (status: ReferralStatus) => {
        switch (status) {
            case ReferralStatus.PENDING:
                return <Clock className="w-3 h-3" />;
            case ReferralStatus.ACCEPTED:
                return <CheckCircle className="w-3 h-3" />;
            case ReferralStatus.SCHEDULED:
                return <Calendar className="w-3 h-3" />;
            case ReferralStatus.COMPLETED:
                return <CheckCircle className="w-3 h-3" />;
            case ReferralStatus.REJECTED:
                return <AlertTriangle className="w-3 h-3" />;
            case ReferralStatus.EXPIRED:
                return <Clock className="w-3 h-3" />;
            case ReferralStatus.CANCELLED:
                return <FileText className="w-3 h-3" />;
            default:
                return <FileText className="w-3 h-3" />;
        }
    };

    const getPriorityColor = (priority: ReferralPriority): string => {
        switch (priority) {
            case ReferralPriority.ROUTINE:
                return "blue";
            case ReferralPriority.URGENT:
                return "orange";
            case ReferralPriority.EMERGENCY:
                return "red";
            default:
                return "default";
        }
    };

    const getPriorityIcon = (priority: ReferralPriority) => {
        switch (priority) {
            case ReferralPriority.ROUTINE:
                return <Activity className="w-3 h-3" />;
            case ReferralPriority.URGENT:
                return <TrendingUp className="w-3 h-3" />;
            case ReferralPriority.EMERGENCY:
                return <AlertTriangle className="w-3 h-3" />;
            default:
                return <Activity className="w-3 h-3" />;
        }
    };

    const getTypeIcon = (type: ReferralType) => {
        switch (type) {
            case ReferralType.INTERNAL:
                return <Home className="w-3 h-3" />;
            case ReferralType.EXTERNAL:
                return <Globe className="w-3 h-3" />;
            default:
                return <Home className="w-3 h-3" />;
        }
    };

    if (loading) {
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
                    <Title level={2} className="my-0 text-gray-800 text-xl sm:text-2xl lg:text-3xl">
                        <Send className="mr-2 inline-block" />
                        Referral Management
                    </Title>
                    <Text className="text-gray-600 text-sm sm:text-base">
                        Manage patient referrals and collaborate with other doctors
                    </Text>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        icon={<Filter className="w-4 h-4" />}
                        onClick={() => updateFilterState({ showFilters: !filterState.showFilters })}
                        size="large"
                        className="w-full sm:w-auto"
                        aria-label="Toggle referral filters"
                        aria-expanded={filterState.showFilters}
                    >
                        {filterState.showFilters ? "Hide Filters" : "Show Filters"}
                    </Button>
                    <Button
                        type="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={onCreateReferral}
                        size="large"
                        className="bg-green-600 hover:bg-green-700 border-green-600 w-full sm:w-auto"
                        aria-label="Create new referral"
                    >
                        New Referral
                    </Button>
                    <Button
                        type="default"
                        icon={<FileText className="w-4 h-4" />}
                        onClick={onRefresh}
                        size="large"
                        className="border-green-600 text-green-600 hover:bg-green-50 w-full sm:w-auto"
                        aria-label="Refresh referrals"
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters Panel */}
            {filterState.showFilters && (
                <Card className="mb-6 border-green-200">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-gray-700">Filter & Sort Referrals</span>
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
                                    <label className="text-sm font-medium text-gray-700" htmlFor="referral-search">
                                        Search
                                    </label>
                                    <Input
                                        id="referral-search"
                                        placeholder="Search referrals, patients, reasons..."
                                        prefix={<Search className="w-4 h-4 text-gray-400" />}
                                        value={filterState.searchTerm}
                                        onChange={(e) => updateFilterState({ searchTerm: e.target.value })}
                                        allowClear
                                        aria-label="Search referrals by number, patient name, or reason"
                                    />
                                </div>
                            </Col>

                            {/* Status Filter */}
                            <Col xs={24} sm={12} md={4}>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700" htmlFor="status-filter">
                                        Status
                                    </label>
                                    <Select
                                        id="status-filter"
                                        placeholder="Filter by status"
                                        value={filterState.selectedStatus}
                                        onChange={(value) => updateFilterState({ selectedStatus: value })}
                                        style={{ width: "100%" }}
                                        allowClear
                                        aria-label="Filter referrals by status"
                                    >
                                        <Option value="all">All Statuses</Option>
                                        <Option value={ReferralStatus.PENDING}>
                                            <span className="flex items-center gap-2">
                                                {getStatusIcon(ReferralStatus.PENDING)}
                                                Pending
                                            </span>
                                        </Option>
                                        <Option value={ReferralStatus.ACCEPTED}>
                                            <span className="flex items-center gap-2">
                                                {getStatusIcon(ReferralStatus.ACCEPTED)}
                                                Accepted
                                            </span>
                                        </Option>
                                        <Option value={ReferralStatus.SCHEDULED}>
                                            <span className="flex items-center gap-2">
                                                {getStatusIcon(ReferralStatus.SCHEDULED)}
                                                Scheduled
                                            </span>
                                        </Option>
                                        <Option value={ReferralStatus.COMPLETED}>
                                            <span className="flex items-center gap-2">
                                                {getStatusIcon(ReferralStatus.COMPLETED)}
                                                Completed
                                            </span>
                                        </Option>
                                        <Option value={ReferralStatus.REJECTED}>
                                            <span className="flex items-center gap-2">
                                                {getStatusIcon(ReferralStatus.REJECTED)}
                                                Rejected
                                            </span>
                                        </Option>
                                        <Option value={ReferralStatus.EXPIRED}>
                                            <span className="flex items-center gap-2">
                                                {getStatusIcon(ReferralStatus.EXPIRED)}
                                                Expired
                                            </span>
                                        </Option>
                                        <Option value={ReferralStatus.CANCELLED}>
                                            <span className="flex items-center gap-2">
                                                {getStatusIcon(ReferralStatus.CANCELLED)}
                                                Cancelled
                                            </span>
                                        </Option>
                                    </Select>
                                </div>
                            </Col>

                            {/* Priority Filter */}
                            <Col xs={24} sm={12} md={4}>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700" htmlFor="priority-filter">
                                        Priority
                                    </label>
                                    <Select
                                        id="priority-filter"
                                        placeholder="Filter by priority"
                                        value={filterState.selectedPriority}
                                        onChange={(value) => updateFilterState({ selectedPriority: value })}
                                        style={{ width: "100%" }}
                                        allowClear
                                        aria-label="Filter referrals by priority"
                                    >
                                        <Option value="all">All Priorities</Option>
                                        <Option value={ReferralPriority.ROUTINE}>
                                            <span className="flex items-center gap-2">
                                                {getPriorityIcon(ReferralPriority.ROUTINE)}
                                                Routine
                                            </span>
                                        </Option>
                                        <Option value={ReferralPriority.URGENT}>
                                            <span className="flex items-center gap-2">
                                                {getPriorityIcon(ReferralPriority.URGENT)}
                                                Urgent
                                            </span>
                                        </Option>
                                        <Option value={ReferralPriority.EMERGENCY}>
                                            <span className="flex items-center gap-2">
                                                {getPriorityIcon(ReferralPriority.EMERGENCY)}
                                                Emergency
                                            </span>
                                        </Option>
                                    </Select>
                                </div>
                            </Col>

                            {/* Type Filter */}
                            <Col xs={24} sm={12} md={3}>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700" htmlFor="type-filter">
                                        Type
                                    </label>
                                    <Select
                                        id="type-filter"
                                        placeholder="Filter by type"
                                        value={filterState.selectedType}
                                        onChange={(value) => updateFilterState({ selectedType: value })}
                                        style={{ width: "100%" }}
                                        allowClear
                                        aria-label="Filter referrals by type"
                                    >
                                        <Option value="all">All Types</Option>
                                        <Option value={ReferralType.INTERNAL}>
                                            <span className="flex items-center gap-2">
                                                {getTypeIcon(ReferralType.INTERNAL)}
                                                Internal
                                            </span>
                                        </Option>
                                        <Option value={ReferralType.EXTERNAL}>
                                            <span className="flex items-center gap-2">
                                                {getTypeIcon(ReferralType.EXTERNAL)}
                                                External
                                            </span>
                                        </Option>
                                    </Select>
                                </div>
                            </Col>

                            {/* Date Range */}
                            <Col xs={24} sm={12} md={5}>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700" htmlFor="date-range">
                                        Created Date Range
                                    </label>
                                    <RangePicker
                                        id="date-range"
                                        value={filterState.dateRange}
                                        onChange={(range) => updateFilterState({ dateRange: range })}
                                        style={{ width: "100%" }}
                                        placeholder={["Start Date", "End Date"]}
                                        allowClear
                                        aria-label="Filter referrals by creation date range"
                                    />
                                </div>
                            </Col>
                        </Row>

                        {/* Sorting Controls */}
                        <Row gutter={[16, 16]} align="middle" className="pt-4 border-t">
                            <Col xs={24} sm={12} md={4}>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700" htmlFor="sort-field">
                                        Sort By
                                    </label>
                                    <Select
                                        id="sort-field"
                                        placeholder="Sort by field"
                                        value={filterState.sortField}
                                        onChange={handleSortFieldChange}
                                        style={{ width: "100%" }}
                                        aria-label="Select field to sort by"
                                    >
                                        <Option value="createdAt">Created Date</Option>
                                        <Option value="expiryDate">Expiry Date</Option>
                                        <Option value="patientName">Patient Name</Option>
                                        <Option value="status">Status</Option>
                                        <Option value="priority">Priority</Option>
                                    </Select>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={3}>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-gray-700 block mb-1">
                                        Sort Order
                                    </span>
                                    <Button
                                        icon={
                                            filterState.sortDirection === "asc" ? (
                                                <ArrowUp className="w-4 h-4" />
                                            ) : (
                                                <ArrowDown className="w-4 h-4" />
                                            )
                                        }
                                        onClick={handleSortDirectionToggle}
                                        style={{ width: "100%" }}
                                        title={`Sort ${filterState.sortDirection === "asc" ? "Ascending" : "Descending"}`}
                                        aria-label={`Change sort direction to ${filterState.sortDirection === "asc" ? "descending" : "ascending"} - currently ${filterState.sortDirection === "asc" ? "ascending" : "descending"}`}
                                    >
                                        {filterState.sortDirection === "asc" ? "Asc" : "Desc"}
                                    </Button>
                                </div>
                            </Col>
                        </Row>

                        {/* Active Filters Summary */}
                        {(filterState.searchTerm ||
                            filterState.selectedStatus !== "all" ||
                            filterState.selectedPriority !== "all" ||
                            filterState.selectedType !== "all" ||
                            filterState.dateRange ||
                            filterState.sortField !== "createdAt" ||
                            filterState.sortDirection !== "desc") && (
                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                                    <span className="text-sm text-gray-600">Active filters:</span>
                                    {filterState.searchTerm && (
                                        <Tag closable onClose={() => updateFilterState({ searchTerm: "" })} className="mb-1">
                                            Search: {filterState.searchTerm}
                                        </Tag>
                                    )}
                                    {filterState.selectedStatus !== "all" && (
                                        <Tag closable onClose={() => updateFilterState({ selectedStatus: "all" })} className="mb-1">
                                            Status: {filterState.selectedStatus}
                                        </Tag>
                                    )}
                                    {filterState.selectedPriority !== "all" && (
                                        <Tag closable onClose={() => updateFilterState({ selectedPriority: "all" })} className="mb-1">
                                            Priority: {filterState.selectedPriority}
                                        </Tag>
                                    )}
                                    {filterState.selectedType !== "all" && (
                                        <Tag closable onClose={() => updateFilterState({ selectedType: "all" })} className="mb-1">
                                            Type: {filterState.selectedType}
                                        </Tag>
                                    )}
                                    {filterState.dateRange && (
                                        <Tag closable onClose={() => updateFilterState({ dateRange: null })} className="mb-1">
                                            Date: {filterState.dateRange[0]?.format("MMM D")} - {filterState.dateRange[1]?.format("MMM D")}
                                        </Tag>
                                    )}
                                    {(filterState.sortField !== "createdAt" || filterState.sortDirection !== "desc") && (
                                        <Tag
                                            closable
                                            onClose={() => updateFilterState({ sortField: "createdAt", sortDirection: "desc" })}
                                            className="mb-1"
                                            color="blue"
                                        >
                                            Sort: {filterState.sortField} ({filterState.sortDirection})
                                        </Tag>
                                    )}
                                </div>
                            )}
                    </div>
                </Card>
            )}

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

            {/* Statistics Cards */}
            {statistics && (
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={6}>
                        <Card className="shadow-lg border-0 bg-white">
                            <Statistic
                                title={
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 text-orange-500 mr-2" />
                                        <Text className="text-gray-700">Pending</Text>
                                    </div>
                                }
                                value={statistics.pendingCount}
                                valueStyle={{ color: "#f97316", fontSize: "24px", fontWeight: "bold" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Card className="shadow-lg border-0 bg-white">
                            <Statistic
                                title={
                                    <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                        <Text className="text-gray-700">Accepted</Text>
                                    </div>
                                }
                                value={statistics.acceptedCount}
                                valueStyle={{ color: "#22c55e", fontSize: "24px", fontWeight: "bold" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Card className="shadow-lg border-0 bg-white">
                            <Statistic
                                title={
                                    <div className="flex items-center">
                                        <CalendarOutlined className="text-green-600 mr-2" />
                                        <Text className="text-gray-700">Scheduled</Text>
                                    </div>
                                }
                                value={statistics.scheduledCount}
                                valueStyle={{ color: "#22c55e", fontSize: "24px", fontWeight: "bold" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Card className="shadow-lg border-0 bg-white">
                            <Statistic
                                title={
                                    <div className="flex items-center">
                                        <TrendingUp className="w-4 h-4 text-gray-500 mr-2" />
                                        <Text className="text-gray-700">Completed</Text>
                                    </div>
                                }
                                value={statistics.completedCount}
                                valueStyle={{ color: "#6b7280", fontSize: "24px", fontWeight: "bold" }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Main Content Tabs */}
            <main aria-label="Referral management content">
                <Card className="shadow-lg border-0 bg-white">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            {
                                key: "outgoing",
                                label: (
                                    <span className="flex items-center gap-2" role="tab" aria-selected={activeTab === "outgoing"}>
                                        <Send className="w-4 h-4" />
                                        <span className="hidden sm:inline">My Referrals</span>
                                        <span className="sm:hidden">Sent</span>
                                    </span>
                                ),
                                children: (
                                    <div role="tabpanel" aria-labelledby="outgoing-referrals-tab">
                                        <MyReferralsTab
                                            refreshTrigger={refreshTrigger}
                                            filterState={filterState}
                                            getStatusColor={getStatusColor}
                                            getStatusIcon={getStatusIcon}
                                            getPriorityColor={getPriorityColor}
                                            getPriorityIcon={getPriorityIcon}
                                        />
                                    </div>
                                ),
                            },
                            {
                                key: "incoming",
                                label: (
                                    <span className="flex items-center gap-2" role="tab" aria-selected={activeTab === "incoming"}>
                                        <UserCheck className="w-4 h-4" />
                                        <span className="hidden sm:inline">Referrals for Me</span>
                                        <span className="sm:hidden">Received</span>
                                    </span>
                                ),
                                children: (
                                    <div role="tabpanel" aria-labelledby="incoming-referrals-tab">
                                        <ReferralsForMeTab
                                            refreshTrigger={refreshTrigger}
                                            onRefresh={onRefresh}
                                            filterState={filterState}
                                            getStatusColor={getStatusColor}
                                            getStatusIcon={getStatusIcon}
                                            getPriorityColor={getPriorityColor}
                                            getPriorityIcon={getPriorityIcon}
                                        />
                                    </div>
                                ),
                            },
                        ]}
                        aria-label="Referral management tabs"
                    />
                </Card>
            </main>


        </div>
    );
};

export default DoctorReferralComponent;
