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
} from "lucide-react";

import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

// Import API services
import AppointmentApi from "../../api/appointment";
import { AppointmentDto, AppointmentStatus, CancelAppointmentRequestDto } from "../../api/appointment/props";
import { parseLocalDateTime } from "../../utils/DateUtils";

import { AppointmentCard } from "./components/AppointmentCard";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

type ViewMode = "calendar" | "table";

export default function DoctorAppointments() {
    const router = useRouter();

    // State variables
    const [loading, setLoading] = useState(true);
    const [allAppointments, setAllAppointments] = useState<AppointmentDto[]>([]); // All appointments for both views
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(5);

    // View mode state
    const [viewMode, setViewMode] = useState<ViewMode>("table"); // Default to table view for mobile
    const [calendarValue, setCalendarValue] = useState<Dayjs>(dayjs());

    // Check if device is mobile (screen width < 768px)
    const [isMobile, setIsMobile] = useState(false);

    // Filter states
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | "all">("all");
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

    // Cancel appointment modal state
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState<AppointmentDto | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelForm] = Form.useForm();

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Load appointments on component mount
    useEffect(() => {
        loadAllAppointments();
    }, []);

    const loadAllAppointments = async () => {
        try {
            setLoading(true);
            const response = await AppointmentApi.getAllAppointmentsByAccount();

            if (response.data.isSuccess && response.data.data) {
                // Filter out pending payment appointments as they are reserved for patients
                const filteredAppointments = response.data.data
                    .filter(appointment => appointment.status !== "PENDING_PAYMENT")
                    .map(appointment => ({
                        ...appointment,
                        hasAttachedDocuments: appointment.attachedDocuments && appointment.attachedDocuments.length > 0
                    }));

                setAllAppointments(filteredAppointments);
            } else {
                setAllAppointments([]);
                message.error("Failed to load appointments");
            }
        } catch (error: any) {
            console.error("Error loading appointments:", error);
            message.error(error.response?.data?.message || "Failed to load appointments");
            setAllAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    // Get appointments for a specific date (used by calendar)
    const getAppointmentsForDate = (date: Dayjs) => {
        return allAppointments.filter((appointment) =>
            parseLocalDateTime(appointment.appointmentDateTime).isSame(date, "day")
        );
    };

    // Handle calendar date selection
    const handleCalendarSelect = (date: Dayjs) => {
        setCalendarValue(date);
    };

    // Filter appointments based on current filters
    const filteredAppointments = allAppointments.filter((appointment) => {
        // Text search filter - search in patient name and reason for visit
        const matchesSearch =
            searchTerm === "" ||
            appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

        switch (activeTab) {
            case "pending":
                matchesTab = appointment.status === "PENDING";
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

        return matchesSearch && matchesStatus && matchesDateRange && matchesTab;
    });

    // Get paginated data for table view
    const getPaginatedAppointments = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredAppointments.slice(startIndex, endIndex);
    };

    // Get status color for all status types - using green theme
    const getStatusColor = (status: AppointmentStatus): string => {
        switch (status) {
            case "PENDING":
                return "warning";
            case "CONFIRMED":
                return "processing";
            case "READY_FOR_CALL":
                return "cyan";
            case "IN_PROGRESS":
                return "blue";
            case "COMPLETED":
                return "green";
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

    // Calculate statistics
    const getAppointmentStats = () => {
        const today = dayjs();
        const todayAppointments = allAppointments.filter(
            (apt) =>
                parseLocalDateTime(apt.appointmentDateTime).isSame(today, "day") &&
                apt.status !== "CANCELLED" &&
                apt.status !== "NO_SHOW"
        );
        const upcomingAppointments = allAppointments.filter(
            (apt) =>
                parseLocalDateTime(apt.appointmentDateTime).isAfter(today) &&
                apt.status !== "CANCELLED" &&
                apt.status !== "NO_SHOW" &&
                apt.status !== "COMPLETED"
        );

        const pendingAppointments = allAppointments.filter((apt) => apt.status === "PENDING");
        const completedToday = allAppointments.filter(
            (apt) => parseLocalDateTime(apt.appointmentDateTime).isSame(today, "day") && apt.status === "COMPLETED"
        );

        const confirmedAppointments = allAppointments.filter((apt) => apt.status === "CONFIRMED");
        const readyForCallAppointments = allAppointments.filter((apt) => apt.status === "READY_FOR_CALL");
        const inProgressAppointments = allAppointments.filter((apt) => apt.status === "IN_PROGRESS");
        const cancelledAppointments = allAppointments.filter(
            (apt) => apt.status === "CANCELLED" || apt.status === "NO_SHOW"
        );

        return {
            total: allAppointments.length,
            today: todayAppointments.length,
            upcoming: upcomingAppointments.length,
            pending: pendingAppointments.length,
            confirmed: confirmedAppointments.length,
            readyForCall: readyForCallAppointments.length,
            inProgress: inProgressAppointments.length,
            completedToday: completedToday.length,
            cancelled: cancelledAppointments.length,
        };
    };

    const stats = getAppointmentStats();

    // Get appointments for selected date in calendar
    const selectedDateAppointments = getAppointmentsForDate(calendarValue);

    // Calendar cell renderer
    const cellRender = (current: Dayjs) => {
        // Always use allAppointments for calendar rendering
        const dayAppointments = allAppointments.filter((appointment) =>
            parseLocalDateTime(appointment.appointmentDateTime).isSame(current, "day")
        );

        if (dayAppointments.length === 0) return null;

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
                        style={{ backgroundColor: "#52c41a", fontSize: "10px" }}
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
                        style={{ backgroundColor: "#1890ff", fontSize: "10px" }}
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
                        style={{ backgroundColor: "#ff4d4f", fontSize: "10px" }}
                        title={`${cancelledCount} cancelled appointments`}
                    />
                )}
            </div>
        );
    };

    // Handle cancel appointment
    const handleCancelAppointment = (appointment: AppointmentDto) => {
        setAppointmentToCancel(appointment);
        setCancelModalVisible(true);
    };

    // Handle cancel submit
    const handleCancelSubmit = async (values: { reason?: string }) => {
        if (!appointmentToCancel) return;

        try {
            setCancelLoading(true);
            const cancelRequest: CancelAppointmentRequestDto = {
                reason: values.reason || "",
            };

            await AppointmentApi.cancelAppointment(appointmentToCancel.id, cancelRequest);

            message.success("Appointment cancelled successfully");
            setCancelModalVisible(false);
            setAppointmentToCancel(null);
            cancelForm.resetFields();

            // Reload appointments
            await loadAllAppointments();
        } catch (error: any) {
            console.error("Error cancelling appointment:", error);
            message.error(error.response?.data?.message || "Failed to cancel appointment");
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <div className="container mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
                <div>
                    <Title level={2} className="text-green-900 mb-2">
                        <Calendar className="mr-2" />
                        My Appointments
                    </Title>
                    <Text className="text-gray-600">
                        Manage your appointments with patients
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
                            prefix={<Calendar className="text-blue-600" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center border-l-4 border-l-green-500">
                        <Statistic
                            title="Upcoming"
                            value={stats.upcoming}
                            prefix={<Clock className="text-green-600" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center border-l-4 border-l-yellow-500">
                        <Statistic
                            title="Pending"
                            value={stats.pending}
                            prefix={<AlertTriangle className="text-yellow-600" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center border-l-4 border-l-orange-500">
                        <Statistic
                            title="Completed Today"
                            value={stats.completedToday}
                            prefix={<CheckCircle className="text-orange-600" />}
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
                            }}
                            className={`w-full sm:w-auto ${viewMode === "calendar" ? "bg-green-600 border-green-600" : ""
                                }`}
                        >
                            Calendar
                        </Button>
                        <Button
                            type={viewMode === "table" ? "primary" : "default"}
                            icon={<ListIcon />}
                            onClick={() => setViewMode("table")}
                            className={`w-full sm:w-auto ${viewMode === "table" ? "bg-green-600 border-green-600" : ""}`}
                        >
                            List
                        </Button>
                    </Space.Compact>
                </div>
                <Link href="/doctor/time-slot" className="w-full sm:w-auto">
                    <Button type="primary" icon={<Plus />} className="bg-green-600 border-green-600 w-full sm:w-auto">
                        Manage Time Slots
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
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Badge count={1} style={{ backgroundColor: "#faad14", fontSize: "10px" }} />
                                    <Text className="text-sm font-medium">Pending</Text>
                                </div>
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Badge count={1} style={{ backgroundColor: "#52c41a", fontSize: "10px" }} />
                                    <Text className="text-sm font-medium">Confirmed</Text>
                                </div>
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Badge count={1} style={{ backgroundColor: "#13c2c2", fontSize: "10px" }} />
                                    <Text className="text-sm font-medium">Ready for Call</Text>
                                </div>
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Badge count={1} style={{ backgroundColor: "#1890ff", fontSize: "10px" }} />
                                    <Text className="text-sm font-medium">In Progress</Text>
                                </div>
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Badge count={1} style={{ backgroundColor: "#52c41a", fontSize: "10px" }} />
                                    <Text className="text-sm font-medium">Completed</Text>
                                </div>
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                    <Badge count={1} style={{ backgroundColor: "#ff4d4f", fontSize: "10px" }} />
                                    <Text className="text-sm font-medium">Cancelled</Text>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Mobile View Notice */}
            {isMobile && (
                <Card className="mb-6 bg-green-50 border-green-200">
                    <div className="flex items-center">
                        <ListIcon className="text-green-600 mr-2" />
                        <Text className="text-green-800">
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
                                placeholder="Search patient or reason..."
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
                                <Option value="CONFIRMED">Confirmed</Option>
                                <Option value="READY_FOR_CALL">Ready for Call</Option>
                                <Option value="IN_PROGRESS">In Progress</Option>
                                <Option value="COMPLETED">Completed</Option>
                                <Option value="CANCELLED">Cancelled</Option>
                                <Option value="NO_SHOW">No Show</Option>
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
                                        <Grid3x3 className="mr-2 text-green-600" />
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
                                                        router.push(`/doctor/appointment/${appointment.id}`)
                                                    }
                                                    className="text-green-600 hover:text-green-800"
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
                                                        className="bg-green-600"
                                                        icon={<User />}
                                                        src={appointment.patient.profileImageUrl}
                                                    />
                                                }
                                                title={
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <Text strong>Patient: {appointment.patient.name}</Text>
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
                                                                    <FileText className="text-green-600 mr-1" />
                                                                    <Text className="text-green-600 text-sm">
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
                <Card>
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
                                label: `Completed (${allAppointments.filter((apt) => apt.status === "COMPLETED").length
                                    })`,
                                children: null,
                            },
                            {
                                key: "cancelled",
                                label: `Cancelled (${stats.cancelled})`,
                                children: null,
                            },
                        ]}
                        className="mx-4"
                    />

                    <div className="mt-0">
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
                                    <Empty description="No appointments found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                );
                            }

                            return (
                                <div className="space-y-4">
                                    {getPaginatedAppointments().map((appointment) => (
                                        <AppointmentCard
                                            key={appointment.id}
                                            appointment={appointment}
                                            onView={(appointment) => {
                                                router.push(`/doctor/appointment/${appointment.id}`);
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
            )
            }

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
                                This action cannot be undone. The appointment with Patient {appointmentToCancel.patient.name}{" "}
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
        </div >
    );
}
