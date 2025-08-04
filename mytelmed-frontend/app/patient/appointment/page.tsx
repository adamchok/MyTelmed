"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Card,
    Row,
    Col,
    Button,
    Avatar,
    Typography,
    List,
    Tag,
    Space,
    Modal,
    message,
    Tabs,
    Spin,
    Empty,
    Statistic,
    Input,
    Select,
    DatePicker,
    Form,
    Badge,
    Calendar as AntdCalendar,
} from "antd";
import {
    Calendar,
    Clock,
    User,
    Search,
    Plus,
    Eye,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Trash2,
    Video,
    Grid3x3,
    List as ListIcon,
    RotateCw,
    FileText,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react";

import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

// Import API services
import AppointmentApi from "../../api/appointment";
import { AppointmentDto, AppointmentStatus, CancelAppointmentRequestDto } from "../../api/appointment/props";
import { parseLocalDateTime } from "../../utils/DateUtils";
import { useFamilyPermissions } from "../../hooks/useFamilyPermissions";

import { AppointmentCard } from "./components/AppointmentCard";

// Patient selection option for dropdown
interface PatientOption {
    id: string;
    name: string;
    relationship: string; // "You" for self, or actual relationship for family members
    canViewAppointments: boolean;
    canManageAppointments: boolean;
}

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

type ViewMode = "calendar" | "table";

export default function PatientAppointments() {
    const router = useRouter();

    // Family permissions hook
    const {
        getAuthorizedPatientsForAppointments,
        getPatientOption,
        loading: familyLoading,
    } = useFamilyPermissions();

    // State variables
    const [loading, setLoading] = useState(true);
    const [allAppointments, setAllAppointments] = useState<AppointmentDto[]>([]); // All appointments for both views
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(5);

    // Patient selection state
    const [selectedPatientId, setSelectedPatientId] = useState<string>("all");

    // View mode state
    const [viewMode, setViewMode] = useState<ViewMode>("table"); // Default to table view for mobile
    const [calendarValue, setCalendarValue] = useState<Dayjs>(dayjs());

    // Check if device is mobile (screen width < 768px)
    const [isMobile, setIsMobile] = useState(false);

    // Effect to detect mobile devices and set appropriate view mode
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile && viewMode === "calendar") {
                setViewMode("table");
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, [viewMode]);

    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState<AppointmentDto | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    // Form instance for cancel appointment
    const [cancelForm] = Form.useForm();

    // Filter states
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | "all">("all");
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

    // Sorting states
    const [sortField, setSortField] = useState<"appointmentDateTime" | "createdAt" | "completedAt">("appointmentDateTime");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    // Get patient options from the hook
    const getPatientOptions = (): PatientOption[] => {
        const authorizedPatients = getAuthorizedPatientsForAppointments();
        return authorizedPatients.map(patient => {
            const option = getPatientOption(patient.id);
            return {
                id: patient.id,
                name: option?.name || patient.name,
                relationship: option?.relationship || "Unknown",
                canViewAppointments: true, // Already filtered by hook
                canManageAppointments: true, // Already filtered by hook
            };
        });
    };

    // Load all appointments for both views
    const loadAllAppointments = async () => {
        try {
            setLoading(true);

            const response = await AppointmentApi.getAllAppointmentsByAccount();
            if (response.data.isSuccess && response.data.data) {
                const appointmentsWithAttachments = response.data.data.map((appointment) => ({
                    ...appointment,
                    hasAttachedDocuments: appointment.attachedDocuments && appointment.attachedDocuments.length > 0,
                }));
                setAllAppointments(appointmentsWithAttachments);
            }
        } catch {
            message.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    // Load appointments and patient options on component mount
    useEffect(() => {
        loadAllAppointments();
    }, []);

    // Reset current page when switching views or changing filters
    useEffect(() => {
        setCurrentPage(0);
    }, [viewMode, activeTab, searchTerm, selectedStatus, dateRange, selectedPatientId, sortField, sortDirection]);

    // Get sort value from appointment based on sort field
    const getSortValue = (appointment: AppointmentDto) => {
        switch (sortField) {
            case "appointmentDateTime":
                return appointment.appointmentDateTime;
            case "createdAt":
                return appointment.createdAt;
            default:
                return appointment.appointmentDateTime;
        }
    };

    // Handle undefined values in sorting
    const handleUndefinedSortValues = (aValue: string | undefined, bValue: string | undefined) => {
        if (!aValue && !bValue) return 0;
        if (!aValue) return sortDirection === "asc" ? 1 : -1;
        if (!bValue) return sortDirection === "asc" ? -1 : 1;
        return null; // Both values exist, continue with date comparison
    };

    // Compare two date values for sorting
    const compareDates = (aValue: string | undefined, bValue: string | undefined) => {
        const undefinedResult = handleUndefinedSortValues(aValue, bValue);
        if (undefinedResult !== null) return undefinedResult;

        const dateA = dayjs(aValue);
        const dateB = dayjs(bValue);

        if (dateA.isSame(dateB)) return 0;

        const isABefore = dateA.isBefore(dateB);

        if (sortDirection === "asc") {
            return isABefore ? -1 : 1;
        } else {
            return isABefore ? 1 : -1;
        }
    };

    // Sorting function
    const sortAppointments = (appointments: AppointmentDto[]) => {
        return [...appointments].sort((a, b) => {
            const aValue = getSortValue(a);
            const bValue = getSortValue(b);
            return compareDates(aValue, bValue);
        });
    };

    // Get appointments for a specific date
    const getAppointmentsForDate = (date: Dayjs) => {
        // For calendar view, use all appointments; for table view, use filtered appointments
        const appointmentsToFilter = viewMode === "calendar" ? allAppointments : filteredAppointments;
        return appointmentsToFilter.filter((appointment) =>
            parseLocalDateTime(appointment.appointmentDateTime).isSame(date, "day")
        );
    };

    // Handle calendar date select
    const handleCalendarSelect = (date: Dayjs) => {
        setCalendarValue(date);
    };

    // Filter appointments based on active tab and filters
    const filteredAppointments = allAppointments.filter((appointment) => {
        // Only apply filters in table view
        if (viewMode === "calendar") {
            return true; // No filtering for calendar view
        }

        // Patient filter
        const matchesPatient = selectedPatientId === "all" || appointment.patient.id === selectedPatientId;

        // Text search filter
        const matchesSearch =
            searchTerm === "" ||
            appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.reasonForVisit?.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchesStatus = selectedStatus === "all" || appointment.status === selectedStatus;

        // Date range filter
        const matchesDateRange =
            !dateRange?.[0] ||
            !dateRange?.[1] ||
            (parseLocalDateTime(appointment.appointmentDateTime).isAfter(dateRange[0]) &&
                parseLocalDateTime(appointment.appointmentDateTime).isBefore(dateRange[1].add(1, "day")));

        // Tab filter
        let matchesTab = true;
        const appointmentDate = parseLocalDateTime(appointment.appointmentDateTime);
        const now = dayjs();

        switch (activeTab) {
            case "today":
                matchesTab = appointmentDate.isSame(now, "day");
                break;
            case "upcoming":
                matchesTab = appointmentDate.isAfter(now);
                break;
            case "pending":
                matchesTab = appointment.status === "PENDING";
                break;
            case "pending_payment":
                matchesTab = appointment.status === "PENDING_PAYMENT";
                break;
            case "confirmed":
                matchesTab = appointment.status === "CONFIRMED";
                break;
            case "ready":
                matchesTab = appointment.status === "READY_FOR_CALL";
                break;
            case "in_progress":
                matchesTab = appointment.status === "IN_PROGRESS";
                break;
            case "completed":
                matchesTab = appointment.status === "COMPLETED";
                break;
            case "cancelled":
                matchesTab = appointment.status === "CANCELLED" || appointment.status === "NO_SHOW";
                break;
        }

        return matchesPatient && matchesSearch && matchesStatus && matchesDateRange && matchesTab;
    });

    // Get sorted and paginated data for table view
    const getPaginatedAppointments = () => {
        const sortedAppointments = sortAppointments(filteredAppointments);
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return sortedAppointments.slice(startIndex, endIndex);
    };

    // Get status color for all status types
    const getStatusColor = (status: AppointmentStatus): string => {
        switch (status) {
            case "PENDING":
                return "warning";
            case "PENDING_PAYMENT":
                return "orange";
            case "CONFIRMED":
                return "processing";
            case "READY_FOR_CALL":
                return "cyan";
            case "IN_PROGRESS":
                return "blue";
            case "COMPLETED":
                return "success";
            case "CANCELLED":
                return "error";
            case "NO_SHOW":
                return "red";
            default:
                return "default";
        }
    };

    // Get status icon for all status types
    const getStatusIcon = (status: AppointmentStatus) => {
        switch (status) {
            case "PENDING":
                return <Clock className="w-4 h-4" />;
            case "PENDING_PAYMENT":
                return <AlertTriangle className="w-4 h-4" />;
            case "CONFIRMED":
                return <CheckCircle className="w-4 h-4" />;
            case "READY_FOR_CALL":
                return <Video className="w-4 h-4" />;
            case "IN_PROGRESS":
                return <RotateCw className="w-4 h-4 animate-spin" />;
            case "COMPLETED":
                return <CheckCircle className="w-4 h-4" />;
            case "CANCELLED":
                return <XCircle className="w-4 h-4" />;
            case "NO_SHOW":
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <AlertTriangle className="w-4 h-4" />;
        }
    };

    // Get appointments filtered by everything except tab selection
    const getBaseFilteredAppointments = () => {
        return allAppointments.filter((appointment) => {
            // Only apply filters in table view
            if (viewMode === "calendar") {
                return true; // No filtering for calendar view
            }

            // Patient filter
            const matchesPatient = selectedPatientId === "all" || appointment.patient.id === selectedPatientId;

            // Text search filter
            const matchesSearch =
                searchTerm === "" ||
                appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.reasonForVisit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.doctor.facility.name.toLowerCase().includes(searchTerm.toLowerCase());

            // Status filter
            const matchesStatus = selectedStatus === "all" || appointment.status === selectedStatus;

            // Date range filter
            const matchesDateRange =
                !dateRange?.[0] ||
                !dateRange?.[1] ||
                (parseLocalDateTime(appointment.appointmentDateTime).isAfter(dateRange[0]) &&
                    parseLocalDateTime(appointment.appointmentDateTime).isBefore(dateRange[1].add(1, "day")));

            return matchesPatient && matchesSearch && matchesStatus && matchesDateRange;
        });
    };

    // Calculate statistics based on filtered appointments
    const getAppointmentStats = () => {
        const baseFiltered = getBaseFilteredAppointments();
        const today = dayjs();

        const todayAppointments = baseFiltered.filter(
            (apt) =>
                parseLocalDateTime(apt.appointmentDateTime).isSame(today, "day") &&
                apt.status !== "CANCELLED" &&
                apt.status !== "NO_SHOW"
        );
        const upcomingAppointments = baseFiltered.filter(
            (apt) =>
                parseLocalDateTime(apt.appointmentDateTime).isAfter(today) &&
                apt.status !== "CANCELLED" &&
                apt.status !== "NO_SHOW" &&
                apt.status !== "COMPLETED"
        );

        const pendingAppointments = baseFiltered.filter((apt) => apt.status === "PENDING");
        const completedToday = baseFiltered.filter(
            (apt) => parseLocalDateTime(apt.appointmentDateTime).isSame(today, "day") && apt.status === "COMPLETED"
        );

        const pendingPaymentAppointments = baseFiltered.filter((apt) => apt.status === "PENDING_PAYMENT");

        const confirmedAppointments = baseFiltered.filter((apt) => apt.status === "CONFIRMED");
        const readyForCallAppointments = baseFiltered.filter((apt) => apt.status === "READY_FOR_CALL");
        const inProgressAppointments = baseFiltered.filter((apt) => apt.status === "IN_PROGRESS");
        const cancelledAppointments = baseFiltered.filter(
            (apt) => apt.status === "CANCELLED" || apt.status === "NO_SHOW"
        );
        const completedAppointments = baseFiltered.filter((apt) => apt.status === "COMPLETED");

        return {
            total: baseFiltered.length,
            today: todayAppointments.length,
            upcoming: upcomingAppointments.length,
            pending: pendingAppointments.length,
            pendingPayment: pendingPaymentAppointments.length,
            confirmed: confirmedAppointments.length,
            readyForCall: readyForCallAppointments.length,
            inProgress: inProgressAppointments.length,
            completedToday: completedToday.length,
            completed: completedAppointments.length,
            cancelled: cancelledAppointments.length,
        };
    };

    const stats = getAppointmentStats();

    // Get appointments for selected date in calendar
    const selectedDateAppointments = sortAppointments(getAppointmentsForDate(calendarValue));

    // Calendar cell renderer
    const cellRender = (current: Dayjs) => {
        // Always use allAppointments for calendar rendering
        const dayAppointments = allAppointments.filter((appointment) =>
            parseLocalDateTime(appointment.appointmentDateTime).isSame(current, "day")
        );

        if (dayAppointments.length === 0) return null;

        const pendingPaymentCount = dayAppointments.filter((apt) => apt.status === "PENDING_PAYMENT").length;
        const pendingCount = dayAppointments.filter((apt) => apt.status === "PENDING").length;
        const confirmedCount = dayAppointments.filter((apt) => apt.status === "CONFIRMED").length;
        const readyForCallCount = dayAppointments.filter((apt) => apt.status === "READY_FOR_CALL").length;
        const inProgressCount = dayAppointments.filter((apt) => apt.status === "IN_PROGRESS").length;
        const completedCount = dayAppointments.filter((apt) => apt.status === "COMPLETED").length;
        const cancelledCount = dayAppointments.filter(
            (apt) => apt.status === "CANCELLED" || apt.status === "NO_SHOW"
        ).length;

        return (
            <div className="space-y-1">
                {pendingPaymentCount > 0 && (
                    <Badge
                        count={pendingPaymentCount}
                        style={{ backgroundColor: "#faad14", fontSize: "10px" }}
                        title={`${pendingPaymentCount} pending payment appointments`}
                    />
                )}
                {pendingCount > 0 && (
                    <Badge
                        count={pendingCount}
                        style={{ backgroundColor: "#faad14", fontSize: "10px" }}
                        title={`${pendingCount} pending appointments`}
                    />
                )}
                {confirmedCount > 0 && (
                    <Badge
                        count={confirmedCount}
                        style={{ backgroundColor: "#1890ff", fontSize: "10px" }}
                        title={`${confirmedCount} confirmed appointments`}
                    />
                )}
                {readyForCallCount > 0 && (
                    <Badge
                        count={readyForCallCount}
                        style={{ backgroundColor: "#13c2c2", fontSize: "10px" }}
                        title={`${readyForCallCount} ready for call`}
                    />
                )}
                {inProgressCount > 0 && (
                    <Badge
                        count={inProgressCount}
                        style={{ backgroundColor: "#722ed1", fontSize: "10px" }}
                        title={`${inProgressCount} in progress`}
                    />
                )}
                {completedCount > 0 && (
                    <Badge
                        count={completedCount}
                        style={{ backgroundColor: "#52c41a", fontSize: "10px" }}
                        title={`${completedCount} completed appointments`}
                    />
                )}
                {cancelledCount > 0 && (
                    <Badge
                        count={cancelledCount}
                        style={{ backgroundColor: "#f5222d", fontSize: "10px" }}
                        title={`${cancelledCount} cancelled/no-show appointments`}
                    />
                )}
            </div>
        );
    };

    // Handle cancel appointment button
    const handleCancelAppointment = (appointment: AppointmentDto) => {
        setAppointmentToCancel(appointment);
        setCancelModalVisible(true);
    };

    // Handle cancel appointment form submission
    const handleCancelSubmit = async (values: { reason?: string }) => {
        if (!appointmentToCancel) return;

        try {
            setCancelLoading(true);

            console.log("values", values);
            const request: CancelAppointmentRequestDto = {
                reason: values.reason,
            };

            await AppointmentApi.cancelAppointment(appointmentToCancel.id, request);

            message.success("Appointment cancelled successfully!");
            setCancelModalVisible(false);
            setAppointmentToCancel(null);
            cancelForm.resetFields();
            await loadAllAppointments(); // Reload appointments
        } catch (error: any) {
            console.error("Error cancelling appointment:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to cancel appointment";
            message.error(errorMessage);
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <div className="container mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
                <div>
                    <Title level={2} className="text-blue-900 mb-2 mt-0">
                        <Calendar className="mr-2" />
                        My Appointments
                    </Title>
                    <Text className="text-gray-600">
                        Manage your appointments with doctors and healthcare providers
                    </Text>
                </div>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[24, 24]} className="mb-8">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center border-l-4 border-l-blue-500">
                        <Statistic
                            title="Today's Appointments"
                            value={stats.today}
                            prefix={<Calendar className="text-blue-600 w-5 h-5" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center border-l-4 border-l-green-500">
                        <Statistic
                            title="Upcoming"
                            value={stats.upcoming}
                            prefix={<Clock className="text-green-600 w-5 h-5" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center border-l-4 border-l-yellow-500">
                        <Statistic
                            title="Pending"
                            value={stats.pending}
                            prefix={<AlertTriangle className="text-yellow-600 w-5 h-5" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center border-l-4 border-l-orange-500">
                        <Statistic
                            title="Completed Today"
                            value={stats.completedToday}
                            prefix={<CheckCircle className="text-orange-600 w-5 h-5" />}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4 justify-end">
                {/* View mode buttons - hidden on mobile, visible on tablet and desktop */}
                <div className="hidden md:block">
                    <Space.Compact className="w-full sm:w-auto">
                        <Button
                            type={viewMode === "calendar" ? "primary" : "default"}
                            icon={<Calendar />}
                            onClick={() => {
                                setViewMode("calendar");
                                // Reset table-specific filters when switching to calendar
                                setActiveTab("all");
                                setSearchTerm("");
                                setSelectedStatus("all");
                                setDateRange(null);
                                setSelectedPatientId("all");
                                setSortField("appointmentDateTime");
                                setSortDirection("desc");
                            }}
                            className={`w-full sm:w-auto ${viewMode === "calendar" ? "bg-blue-600 border-blue-600" : ""
                                }`}
                        >
                            Calendar
                        </Button>
                        <Button
                            type={viewMode === "table" ? "primary" : "default"}
                            icon={<ListIcon />}
                            onClick={() => setViewMode("table")}
                            className={`w-full sm:w-auto ${viewMode === "table" ? "bg-blue-600 border-blue-600" : ""}`}
                        >
                            List
                        </Button>
                    </Space.Compact>
                </div>
                <Link href="/patient/appointment/book" className="w-full sm:w-auto">
                    <Button type="primary" icon={<Plus />} className="bg-blue-600 border-blue-600 w-full sm:w-auto">
                        Book Appointment
                    </Button>
                </Link>
            </div>

            {/* Legend for Calendar View - Only show on tablet and desktop */}
            {viewMode === "calendar" && !isMobile && (
                <Card className="mb-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Text strong className="text-lg">
                                    Calendar View
                                </Text>
                                <div className="text-sm text-gray-600 mt-1">
                                    Showing all {allAppointments.length} appointments across all dates. Click on any
                                    date to view details.
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <Text strong className="text-sm text-gray-700 mb-3 block">
                                Appointment Status Legend
                            </Text>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Badge count={1} style={{ backgroundColor: "#faad14", fontSize: "10px" }} />
                                    <Text className="text-sm font-medium">Payment</Text>
                                </div>
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Badge count={1} style={{ backgroundColor: "#faad14", fontSize: "10px" }} />
                                    <Text className="text-sm font-medium">Pending</Text>
                                </div>
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Badge count={1} style={{ backgroundColor: "#1890ff", fontSize: "10px" }} />
                                    <Text className="text-sm font-medium">Confirmed</Text>
                                </div>
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Badge count={1} style={{ backgroundColor: "#13c2c2", fontSize: "10px" }} />
                                    <Text className="text-sm font-medium">Ready for Call</Text>
                                </div>
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Badge count={1} style={{ backgroundColor: "#722ed1", fontSize: "10px" }} />
                                    <Text className="text-sm font-medium">In Progress</Text>
                                </div>
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Badge count={1} style={{ backgroundColor: "#52c41a", fontSize: "10px" }} />
                                    <Text className="text-sm font-medium">Completed</Text>
                                </div>
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Badge count={1} style={{ backgroundColor: "#f5222d", fontSize: "10px" }} />
                                    <Text className="text-sm font-medium">Cancelled</Text>
                                </div>
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Badge count={1} style={{ backgroundColor: "#f5222d", fontSize: "10px" }} />
                                    <Text className="text-sm font-medium">No Show</Text>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Mobile View Notice */}
            {isMobile && (
                <Card className="mb-6 bg-blue-50 border-blue-200">
                    <div className="flex items-center">
                        <ListIcon className="text-blue-600 mr-2" />
                        <Text className="text-blue-800">
                            <strong>Mobile View:</strong> Calendar view is available on tablet and desktop devices.
                            You&apos;re currently viewing appointments in list format.
                        </Text>
                    </div>
                </Card>
            )}

            {/* Filters (for table view) */}
            {viewMode === "table" && (
                <Card className="mb-6">
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={12} md={6}>
                            <Input
                                placeholder="Search doctor, facility, or reason"
                                prefix={<Search />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                allowClear
                            />
                        </Col>
                        <Col xs={24} sm={12} md={5}>
                            <Select
                                placeholder="Filter by status"
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                style={{ width: "100%" }}
                                allowClear
                            >
                                <Option value="all">All Statuses</Option>
                                <Option value="PENDING">Pending</Option>
                                <Option value="PENDING_PAYMENT">Pending Payment</Option>
                                <Option value="CONFIRMED">Confirmed</Option>
                                <Option value="READY_FOR_CALL">Ready for Call</Option>
                                <Option value="IN_PROGRESS">In Progress</Option>
                                <Option value="COMPLETED">Completed</Option>
                                <Option value="CANCELLED">Cancelled</Option>
                                <Option value="NO_SHOW">No Show</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={5}>
                            <Select
                                placeholder="Filter by patient"
                                value={selectedPatientId}
                                onChange={setSelectedPatientId}
                                style={{ width: "100%" }}
                                loading={familyLoading}
                                allowClear
                            >
                                <Option value="all">All Patients</Option>
                                {getPatientOptions().map((option: PatientOption) => (
                                    <Option key={option.id} value={option.id}>
                                        {option.name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <RangePicker
                                value={dateRange}
                                onChange={setDateRange}
                                style={{ width: "100%" }}
                                placeholder={["Start Date", "End Date"]}
                                allowClear
                            />
                        </Col>
                    </Row>

                    {/* Sort Controls */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
                        <div className="flex items-center space-x-2">
                            <ArrowUpDown className="w-4 h-4 text-gray-500" />
                            <Text className="text-sm font-medium text-gray-700">Sort by:</Text>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <Select
                                value={sortField}
                                onChange={setSortField}
                            >
                                <Option value="appointmentDateTime">Appointment Date</Option>
                                <Option value="createdAt">Created Date</Option>
                            </Select>

                            <Button
                                onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                                icon={sortDirection === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            >
                                {sortDirection === "asc" ? "Oldest First" : "Newest First"}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Calendar View - Only show on tablet and desktop */}
            {viewMode === "calendar" && !isMobile && (
                <Row gutter={[24, 24]}>
                    <Col xs={24} xxl={16}>
                        <Card>
                            {(() => {
                                if (loading) {
                                    return (
                                        <div className="text-center py-8">
                                            <Spin size="large" />
                                            <div className="mt-4 text-gray-600">Loading all appointments...</div>
                                        </div>
                                    );
                                }

                                if (allAppointments.length === 0) {
                                    return (
                                        <div className="text-center py-8">
                                            <Empty
                                                description="No appointments found"
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            >
                                                <Link href="/patient/appointment/book">
                                                    <Button
                                                        type="primary"
                                                        icon={<Plus />}
                                                        className="bg-blue-600 border-blue-600"
                                                    >
                                                        Book Appointment
                                                    </Button>
                                                </Link>
                                            </Empty>
                                        </div>
                                    );
                                }

                                return (
                                    <AntdCalendar
                                        value={calendarValue}
                                        onSelect={handleCalendarSelect}
                                        onChange={setCalendarValue}
                                        cellRender={cellRender}
                                        className="custom-calendar"
                                    />
                                );
                            })()}
                        </Card>
                    </Col>
                    <Col xs={24} xxl={8}>
                        <Card
                            title={
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Grid3x3 className="mr-2 text-blue-600" />
                                        {calendarValue.format("MMMM DD, YYYY")}
                                    </div>
                                    <Text className="text-sm text-gray-500">
                                        {selectedDateAppointments.length} appointments
                                    </Text>
                                </div>
                            }
                        >
                            {selectedDateAppointments.length === 0 ? (
                                <Empty
                                    description="No appointments for this date"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            ) : (
                                <List
                                    dataSource={selectedDateAppointments}
                                    renderItem={(appointment) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    key="view"
                                                    type="text"
                                                    icon={<Eye />}
                                                    onClick={() =>
                                                        router.push(`/patient/appointment/${appointment.id}`)
                                                    }
                                                    className="text-blue-600 hover:text-blue-800"
                                                />,
                                                ...(appointment.status === "PENDING"
                                                    ? [
                                                        <Button
                                                            key="cancel"
                                                            type="text"
                                                            danger
                                                            size="small"
                                                            icon={<Trash2 />}
                                                            onClick={() => handleCancelAppointment(appointment)}
                                                            className="text-red-600 hover:text-red-800"
                                                        />,
                                                    ]
                                                    : []),
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar
                                                        className="bg-blue-600"
                                                        icon={<User />}
                                                        src={appointment.doctor.profileImageUrl}
                                                    />
                                                }
                                                title={
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <Text strong>Dr. {appointment.doctor.name}</Text>
                                                            <div className="text-sm text-gray-500">
                                                                {parseLocalDateTime(
                                                                    appointment.appointmentDateTime
                                                                ).format("h:mm A")}{" "}
                                                                -{" "}
                                                                {parseLocalDateTime(appointment.appointmentDateTime)
                                                                    .add(appointment.durationMinutes, "minute")
                                                                    .format("h:mm A")}
                                                            </div>
                                                        </div>
                                                        <Tag
                                                            color={getStatusColor(
                                                                appointment.status as AppointmentStatus
                                                            )}
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                {getStatusIcon(appointment.status as AppointmentStatus)}
                                                                <span>{appointment.status.replaceAll("_", " ")}</span>
                                                            </span>
                                                        </Tag>
                                                    </div>
                                                }
                                                description={
                                                    <div>
                                                        <Text className="text-gray-600">
                                                            {appointment.reasonForVisit || "General consultation"}
                                                        </Text>
                                                        <br />
                                                        <Text className="text-gray-500 text-sm">
                                                            Duration: {appointment.durationMinutes} minutes
                                                        </Text>
                                                        {appointment.hasAttachedDocuments && (
                                                            <>
                                                                <br />
                                                                <div className="flex items-center mt-1">
                                                                    <FileText className="text-blue-600 mr-1" />
                                                                    <Text className="text-blue-600 text-sm">
                                                                        Has attachments
                                                                    </Text>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            )}
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Table View */}
            {viewMode === "table" && (
                <Card styles={{
                    body: {
                        padding: "12px"
                    }
                }}>
                    {!isMobile && (
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={[
                                {
                                    key: "all",
                                    label: `All (${stats.total})`,
                                    children: null,
                                },
                                {
                                    key: "pending_payment",
                                    label: `Pending Payment (${stats.pendingPayment})`,
                                    children: null,
                                },
                                {
                                    key: "pending",
                                    label: `Pending (${stats.pending})`,
                                    children: null,
                                },
                                {
                                    key: "confirmed",
                                    label: `Confirmed (${stats.confirmed})`,
                                    children: null,
                                },
                                {
                                    key: "ready",
                                    label: `Ready (${stats.readyForCall})`,
                                    children: null,
                                },
                                {
                                    key: "in_progress",
                                    label: `In Progress (${stats.inProgress})`,
                                    children: null,
                                },
                                {
                                    key: "completed",
                                    label: `Completed (${stats.completed})`,
                                    children: null,
                                },
                                {
                                    key: "cancelled",
                                    label: `Cancelled (${stats.cancelled})`,
                                    children: null,
                                },
                            ]}
                            className="mx-2"
                        />
                    )}

                    <div>
                        {(() => {
                            if (loading) {
                                return (
                                    <div className="text-center py-8">
                                        <Spin size="large" />
                                    </div>
                                );
                            }

                            if (filteredAppointments.length === 0) {
                                return (
                                    <Empty description="No appointments found" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                                    </Empty>
                                );
                            }

                            return (
                                <div className="space-y-4">
                                    {getPaginatedAppointments().map((appointment) => (
                                        <AppointmentCard
                                            key={appointment.id}
                                            appointment={appointment}
                                            onView={(appointment) => {
                                                router.push(`/patient/appointment/${appointment.id}`);
                                            }}
                                            onCancel={
                                                appointment.status === "PENDING" ? handleCancelAppointment : undefined
                                            }
                                        />
                                    ))}

                                    {/* Pagination */}
                                    <div className="flex justify-center mt-6">
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                disabled={currentPage === 0}
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                            >
                                                Previous
                                            </Button>
                                            <span className="text-sm text-gray-600">
                                                Page {currentPage + 1} of{" "}
                                                {Math.ceil(filteredAppointments.length / pageSize)}
                                            </span>
                                            <Button
                                                disabled={
                                                    currentPage >= Math.ceil(filteredAppointments.length / pageSize) - 1
                                                }
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </Card>
            )}

            {/* Cancel Appointment Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        <Trash2 className="mr-2 text-red-600" />
                        Cancel Appointment
                    </div>
                }
                open={cancelModalVisible}
                onCancel={() => {
                    setCancelModalVisible(false);
                    setAppointmentToCancel(null);
                    cancelForm.resetFields();
                }}
                footer={null}
                width={500}
                centered
            >
                {appointmentToCancel && (
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <AlertTriangle className="text-red-600 mr-2" />
                                <Text strong className="text-red-800">
                                    Are you sure you want to cancel this appointment?
                                </Text>
                            </div>
                            <div className="mt-2 text-sm text-red-700">
                                This action cannot be undone. The appointment with Dr. {appointmentToCancel.doctor.name}{" "}
                                on {dayjs(appointmentToCancel.appointmentDateTime).format("MMMM DD, YYYY at h:mm A")}{" "}
                                will be permanently cancelled.
                            </div>
                        </div>

                        <Form form={cancelForm} layout="vertical" onFinish={handleCancelSubmit}>
                            <Form.Item
                                name="reason"
                                label="Cancellation Reason (Optional)"
                                extra="Please provide a reason for cancelling this appointment. This helps us improve our service."
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="e.g., Schedule conflict, feeling better, need to reschedule..."
                                    maxLength={500}
                                    showCount
                                    className="mb-6"
                                />
                            </Form.Item>

                            <div className="flex justify-end space-x-2 border-t">
                                <Button
                                    onClick={() => {
                                        setCancelModalVisible(false);
                                        setAppointmentToCancel(null);
                                        cancelForm.resetFields();
                                    }}
                                >
                                    Keep Appointment
                                </Button>
                                <Button
                                    type="primary"
                                    danger
                                    htmlType="submit"
                                    loading={cancelLoading}
                                    icon={<Trash2 />}
                                >
                                    Cancel Appointment
                                </Button>
                            </div>
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    );
}
