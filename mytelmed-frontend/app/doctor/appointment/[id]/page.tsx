"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Card,
    Row,
    Col,
    Button,
    Avatar,
    Typography,
    Tag,
    Space,
    Spin,
    Alert,
    Divider,
    List,
    Tooltip,
    message,
    Modal,
    Form,
    Input,
} from "antd";
import {
    Calendar,
    User,
    ArrowLeft,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Clock,
    FileText,
    Eye,
    Phone,
    Mail,
    Edit,
    Save,
    Video,
    MapPin,
    Trash2,
    RefreshCw,
    Maximize2,
    Minimize2,
    Lock,
} from "lucide-react";
import { parseLocalDateTime } from "../../../utils/DateUtils";

// Import API services
import AppointmentApi from "../../../api/appointment";
import { AppointmentDto, AppointmentStatus, CancelAppointmentRequestDto } from "../../../api/appointment/props";
import { AppointmentDocumentDto } from "@/app/api/props";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function DoctorAppointmentDetails() {
    const router = useRouter();
    const params = useParams();
    const appointmentId = params.id as string;

    // State variables
    const [loading, setLoading] = useState(true);
    const [appointment, setAppointment] = useState<AppointmentDto | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Doctor notes editing state
    const [editingNotes, setEditingNotes] = useState(false);
    const [doctorNotes, setDoctorNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);

    // Document viewing states
    const [selectedDocument, setSelectedDocument] = useState<AppointmentDocumentDto | null>(null);
    const [previewModal, setPreviewModal] = useState(false);
    const [documentLoading, setDocumentLoading] = useState(false);
    const [documentError, setDocumentError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [iframeKey, setIframeKey] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);

    // Document comparison states
    const [comparisonMode, setComparisonMode] = useState(false);
    const [selectedForComparison, setSelectedForComparison] = useState<AppointmentDocumentDto[]>([]);

    // Cancel appointment states
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelForm] = Form.useForm();

    // Load appointment details
    const loadAppointmentDetails = async () => {
        if (!appointmentId) {
            setError("Appointment ID is missing");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await AppointmentApi.getAppointmentById(appointmentId);

            if (response.data.isSuccess && response.data.data) {
                const appointmentData = {
                    ...response.data.data,
                    hasAttachedDocuments:
                        response.data.data.attachedDocuments && response.data.data.attachedDocuments.length > 0,
                };
                setAppointment(appointmentData);
                setDoctorNotes(appointmentData.doctorNotes || "");
            } else {
                setError(response.data.message || "Failed to load appointment details");
            }
        } catch (error: any) {
            console.error("Error loading appointment details:", error);
            setError(error.response?.data?.message || "Failed to load appointment details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointmentDetails();
    }, [appointmentId]);

    // Get status color - using green theme
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
            case "NO_SHOW":
                return "error";
            default:
                return "default";
        }
    };

    // Get status icon
    const getStatusIcon = (status: AppointmentStatus) => {
        switch (status) {
            case "PENDING":
                return <Clock className="w-5 h-5" />;
            case "CONFIRMED":
                return <CheckCircle className="w-5 h-5" />;
            case "READY_FOR_CALL":
                return <Video className="w-5 h-5" />;
            case "IN_PROGRESS":
                return <RefreshCw className="w-5 h-5 animate-spin" />;
            case "COMPLETED":
                return <CheckCircle className="w-5 h-5" />;
            case "CANCELLED":
            case "NO_SHOW":
                return <XCircle className="w-5 h-5" />;
            default:
                return <AlertTriangle className="w-5 h-5" />;
        }
    };

    // Save doctor notes
    const handleSaveDoctorNotes = async () => {
        if (!appointment) return;

        try {
            setSavingNotes(true);
            await AppointmentApi.completeAppointment(appointment.id, doctorNotes);

            message.success("Doctor notes saved successfully");
            setEditingNotes(false);

            // Reload appointment to get updated data
            await loadAppointmentDetails();
        } catch (error: any) {
            console.error("Error saving doctor notes:", error);
            message.error(error.response?.data?.message || "Failed to save doctor notes");
        } finally {
            setSavingNotes(false);
        }
    };

    // Check if document can be viewed based on access controls
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const canViewDocument = (document: AppointmentDocumentDto): boolean => {
        // For appointment documents attached by patients, doctors should generally be able to view them
        // In a more complex system, you would check document.documentAccess properties here
        return true;
    };

    // Check if document access has expired
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isDocumentAccessExpired = (document: AppointmentDocumentDto): boolean => {
        // Check if document access has expired based on documentAccess.expiryDate
        // For appointment documents, they typically don't expire once attached
        return false;
    };

    // Handle document viewing
    const handleDocumentView = (document: AppointmentDocumentDto) => {
        if (!canViewDocument(document)) {
            message.error("You don't have permission to view this document");
            return;
        }

        if (isDocumentAccessExpired(document)) {
            message.error("Your access to this document has expired");
            return;
        }

        setSelectedDocument(document);
        setPreviewModal(true);
        setDocumentError(false);
        setRetryCount(0);
        setDocumentLoading(true);
    };

    // Document comparison handlers
    const handleToggleComparisonMode = () => {
        setComparisonMode(!comparisonMode);
        setSelectedForComparison([]);
    };

    const handleAddToComparison = (document: AppointmentDocumentDto) => {
        if (!canViewDocument(document)) {
            message.error("You don't have permission to view this document");
            return;
        }

        if (selectedForComparison.length >= 4) {
            message.warning("You can compare up to 4 documents at a time");
            return;
        }
        setSelectedForComparison((prev) => [...prev, document]);
    };

    const handleRemoveFromComparison = (document: AppointmentDocumentDto) => {
        setSelectedForComparison((prev) => prev.filter((d) => d.id !== document.id));
    };

    const handleClearAllComparison = () => {
        setSelectedForComparison([]);
    };

    const handleStartComparison = () => {
        message.info("Document comparison feature would open here");
    };

    // Cancel appointment
    const handleCancelAppointment = () => {
        if (!appointment) return;

        if (appointment.status !== "PENDING") {
            message.error("Only pending appointments can be cancelled");
            return;
        }

        setCancelModalVisible(true);
    };

    const handleCancelSubmit = async (values: { reason?: string }) => {
        if (!appointment) return;

        try {
            setCancelLoading(true);
            const cancelRequest: CancelAppointmentRequestDto = {
                reason: values.reason || "",
            };

            await AppointmentApi.cancelAppointment(appointment.id, cancelRequest);

            message.success("Appointment cancelled successfully");
            setCancelModalVisible(false);
            cancelForm.resetFields();

            // Reload appointment details
            await loadAppointmentDetails();
        } catch (error: any) {
            console.error("Error cancelling appointment:", error);
            message.error(error.response?.data?.message || "Failed to cancel appointment");
        } finally {
            setCancelLoading(false);
        }
    };

    // Document viewer component
    const renderDocumentViewer = () => {
        if (!selectedDocument) return null;

        const isValidUrl = selectedDocument.documentUrl && selectedDocument.documentUrl.trim() !== "";

        return (
            <div className="h-full">
                {documentLoading && (
                    <div className="flex items-center justify-center h-64">
                        <Spin size="large" />
                        <Text className="ml-3">Loading document...</Text>
                    </div>
                )}
                {documentError && !documentLoading && (
                    <div className="h-64">
                        <Alert
                            message="Failed to load document"
                            description="The document could not be loaded. Please try again or contact support if the problem persists."
                            type="error"
                            showIcon
                            action={
                                retryCount < 2 && (
                                    <Button
                                        onClick={() => {
                                            setDocumentError(false);
                                            setDocumentLoading(true);
                                            setIframeKey((prev) => prev + 1);
                                            setRetryCount((prev) => prev + 1);
                                        }}
                                        icon={<RefreshCw className="w-4 h-4" />}
                                    >
                                        Retry Loading
                                    </Button>
                                )
                            }
                        />
                    </div>
                )}
                {!documentError && !documentLoading && isValidUrl && (
                    <div className="h-full">
                        <iframe
                            key={iframeKey}
                            src={selectedDocument.documentUrl}
                            className="w-full h-full border-0"
                            title={selectedDocument.documentName}
                            onLoad={() => {
                                setDocumentLoading(false);
                                setDocumentError(false);
                            }}
                            onError={() => {
                                setDocumentLoading(false);
                                setDocumentError(true);
                                setRetryCount((prev) => prev + 1);
                            }}
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-top-navigation"
                        />
                    </div>
                )}
                {!documentError && !documentLoading && !isValidUrl && (
                    <div className="h-64">
                        <Alert
                            message="Invalid Document URL"
                            description="The document URL is missing or invalid."
                            type="warning"
                            showIcon
                        />
                    </div>
                )}
            </div>
        );
    };

    // Get document type display name
    const getDocumentTypeDisplayName = (documentType: string) => {
        return documentType
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Format file size
    const formatFileSize = (sizeStr: string) => {
        const size = parseInt(sizeStr);
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Render loading state
    if (loading) {
        return (
            <div className="bg-white min-h-screen p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-16">
                        <Spin size="large" />
                        <div className="mt-4">
                            <Text className="text-lg">Loading appointment details...</Text>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render error state
    if (error || !appointment) {
        return (
            <div className="bg-white min-h-screen p-4">
                <div className="max-w-6xl mx-auto">
                    <Button
                        type="text"
                        icon={<ArrowLeft />}
                        onClick={() => router.push("/doctor/appointment")}
                        className="mb-4"
                    >
                        Back to Appointments
                    </Button>

                    <div className="text-center py-16">
                        <Alert
                            message="Error Loading Appointment"
                            description={error || "Appointment not found"}
                            type="error"
                            showIcon
                            className="max-w-md mx-auto"
                            action={
                                <Space direction="vertical">
                                    <Button size="small" onClick={loadAppointmentDetails}>
                                        Retry
                                    </Button>
                                    <Button
                                        size="small"
                                        type="primary"
                                        onClick={() => router.push("/doctor/appointment")}
                                        className="bg-green-600 border-green-600"
                                    >
                                        Back to Appointments
                                    </Button>
                                </Space>
                            }
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-6xl mx-auto p-4">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        type="text"
                        icon={<ArrowLeft />}
                        onClick={() => router.push("/doctor/appointment")}
                        className="mb-4"
                    >
                        Back to Appointments
                    </Button>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <Title level={2} className="text-green-800 mb-2">
                                <Calendar className="mr-2" />
                                Appointment Details
                            </Title>
                            <Text className="text-gray-600">
                                Manage appointment with patient {appointment.patient.name}
                            </Text>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Tag
                                color={getStatusColor(appointment.status as AppointmentStatus)}
                                icon={getStatusIcon(appointment.status as AppointmentStatus)}
                                className="px-3 py-1 text-sm"
                            >
                                {appointment.status.replaceAll("_", " ")}
                            </Tag>

                            <Tag
                                color={appointment.consultationMode === "VIRTUAL" ? "blue" : "green"}
                                className="px-3 py-1 text-sm"
                            >
                                {appointment.consultationMode === "VIRTUAL" ? "Virtual" : "Physical"}
                            </Tag>

                            {appointment.status === "PENDING" && (
                                <Button
                                    type="primary"
                                    danger
                                    icon={<Trash2 className="w-4 h-4" />}
                                    onClick={handleCancelAppointment}
                                    size="large"
                                >
                                    Cancel Appointment
                                </Button>
                            )}

                            {(appointment.status === "READY_FOR_CALL" || appointment.status === "IN_PROGRESS") && (
                                <Button
                                    type="primary"
                                    icon={<Video className="w-4 h-4" />}
                                    onClick={() => window.open(`/video-call/${appointment.id}`, "_blank")}
                                    className="bg-green-600 border-green-600 hover:bg-green-700"
                                    size="large"
                                >
                                    {appointment.status === "IN_PROGRESS" ? "Join Video Call" : "Start Video Call"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <Row gutter={[24, 24]}>
                    {/* Left Column - Patient & Appointment Info */}
                    <Col xs={24} lg={12}>
                        {/* Patient Information */}
                        <Card title="Patient Information" className="mb-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <Avatar
                                        size={64}
                                        src={appointment.patient.profileImageUrl}
                                        icon={<User />}
                                        className="bg-green-100"
                                    />
                                    <div>
                                        <Title level={4} className="mb-1">
                                            {appointment.patient.name}
                                        </Title>
                                        <Text className="text-gray-600">Patient ID: {appointment.patient.id}</Text>
                                    </div>
                                </div>

                                <Divider />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Mail className="w-4 h-4 text-green-600" />
                                        <div>
                                            <Text className="text-sm text-gray-500">Email</Text>
                                            <div>{appointment.patient.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-green-600" />
                                        <div>
                                            <Text className="text-sm text-gray-500">Phone</Text>
                                            <div>{appointment.patient.phone}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-green-600" />
                                        <div>
                                            <Text className="text-sm text-gray-500">NRIC</Text>
                                            <div>{appointment.patient.nric}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Appointment Information */}
                        <Card title="Appointment Information">
                            <div className="space-y-4">
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-green-600" />
                                            <div>
                                                <Text className="text-sm text-gray-500">Date</Text>
                                                <div className="font-medium">
                                                    {parseLocalDateTime(appointment.appointmentDateTime).format(
                                                        "MMMM DD, YYYY"
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-green-600" />
                                            <div>
                                                <Text className="text-sm text-gray-500">Time</Text>
                                                <div className="font-medium">
                                                    {parseLocalDateTime(appointment.appointmentDateTime).format(
                                                        "h:mm A"
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-green-600" />
                                    <div>
                                        <Text className="text-sm text-gray-500">Duration</Text>
                                        <div className="font-medium">{appointment.durationMinutes} minutes</div>
                                    </div>
                                </div>

                                {appointment.reasonForVisit && (
                                    <div>
                                        <Text className="text-sm text-gray-500">Reason for Visit</Text>
                                        <div className="bg-green-50 p-3 rounded-lg mt-1 border border-green-100">
                                            <Text>{appointment.reasonForVisit}</Text>
                                        </div>
                                    </div>
                                )}

                                {appointment.patientNotes && (
                                    <div>
                                        <Text className="text-sm text-gray-500">Patient Notes</Text>
                                        <div className="bg-blue-50 p-3 rounded-lg mt-1 border border-blue-100">
                                            <Text>{appointment.patientNotes}</Text>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </Col>

                    {/* Right Column - Doctor Notes & Documents */}
                    <Col xs={24} lg={12}>
                        {/* Doctor Notes Section */}
                        <Card
                            title="Doctor Notes"
                            extra={
                                !editingNotes ? (
                                    <Button
                                        type="text"
                                        icon={<Edit className="w-4 h-4" />}
                                        onClick={() => setEditingNotes(true)}
                                        className="text-green-600 hover:text-green-700"
                                    >
                                        Edit Notes
                                    </Button>
                                ) : (
                                    <Space>
                                        <Button
                                            onClick={() => {
                                                setEditingNotes(false);
                                                setDoctorNotes(appointment.doctorNotes || "");
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="primary"
                                            icon={<Save className="w-4 h-4" />}
                                            onClick={handleSaveDoctorNotes}
                                            loading={savingNotes}
                                            className="bg-green-600 border-green-600 hover:bg-green-700"
                                        >
                                            Save
                                        </Button>
                                    </Space>
                                )
                            }
                            className="mb-6"
                        >
                            {editingNotes ? (
                                <TextArea
                                    value={doctorNotes}
                                    onChange={(e) => setDoctorNotes(e.target.value)}
                                    placeholder="Enter your notes about this appointment..."
                                    rows={6}
                                    maxLength={1000}
                                    showCount
                                />
                            ) : (
                                <div className="min-h-[120px]">
                                    {appointment.doctorNotes ? (
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <Text>{appointment.doctorNotes}</Text>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                            <Text>
                                                No doctor notes yet. Click &apos;Edit Notes&apos; to add your notes.
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>

                        {/* Attached Documents */}
                        {appointment.hasAttachedDocuments && (
                            <Card
                                title={`Attached Documents (${appointment.attachedDocuments.length})`}
                                extra={
                                    appointment.attachedDocuments.length > 1 && (
                                        <Button
                                            type="text"
                                            onClick={handleToggleComparisonMode}
                                            className="text-green-600"
                                        >
                                            {comparisonMode ? "Exit Comparison" : "Compare Documents"}
                                        </Button>
                                    )
                                }
                            >
                                {comparisonMode && (
                                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between">
                                            <Text strong className="text-green-800">
                                                Comparison Mode: Select up to 4 documents to compare
                                            </Text>
                                            <div>
                                                <Text className="text-green-600 mr-2">
                                                    Selected: {selectedForComparison.length}/4
                                                </Text>
                                                {selectedForComparison.length > 0 && (
                                                    <Button size="small" onClick={handleClearAllComparison}>
                                                        Clear All
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        {selectedForComparison.length >= 2 && (
                                            <Button
                                                type="primary"
                                                className="mt-2 bg-green-600 border-green-600"
                                                onClick={handleStartComparison}
                                            >
                                                Start Comparison
                                            </Button>
                                        )}
                                    </div>
                                )}

                                <List
                                    dataSource={appointment.attachedDocuments}
                                    renderItem={(document) => {
                                        const isSelected = selectedForComparison.some((d) => d.id === document.id);
                                        const canView = canViewDocument(document);
                                        const isExpired = isDocumentAccessExpired(document);

                                        return (
                                            <List.Item
                                                className={`${
                                                    isSelected ? "bg-green-50 border border-green-200 rounded-lg" : ""
                                                } ${!canView || isExpired ? "opacity-60" : ""}`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center space-x-3">
                                                        {comparisonMode && canView && !isExpired && (
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        handleAddToComparison(document);
                                                                    } else {
                                                                        handleRemoveFromComparison(document);
                                                                    }
                                                                }}
                                                                className="w-4 h-4 text-green-600"
                                                            />
                                                        )}
                                                        <FileText className="w-5 h-5 text-green-600" />
                                                        <div>
                                                            <div className="font-medium">{document.documentName}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {getDocumentTypeDisplayName(document.documentType)} •
                                                                {formatFileSize(document.documentSize)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        {!canView || isExpired ? (
                                                            <Tooltip
                                                                title={
                                                                    isExpired ? "Access expired" : "No view permission"
                                                                }
                                                            >
                                                                <Button
                                                                    icon={<Lock className="w-4 h-4" />}
                                                                    disabled
                                                                    size="small"
                                                                >
                                                                    No Access
                                                                </Button>
                                                            </Tooltip>
                                                        ) : (
                                                            <Button
                                                                type="primary"
                                                                icon={<Eye className="w-4 h-4" />}
                                                                onClick={() => handleDocumentView(document)}
                                                                size="small"
                                                                className="bg-green-600 border-green-600 hover:bg-green-700"
                                                            >
                                                                View
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </List.Item>
                                        );
                                    }}
                                />
                            </Card>
                        )}
                    </Col>
                </Row>

                {/* Document Preview Modal */}
                <Modal
                    title={
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FileText className="mr-2 text-green-600" />
                                {selectedDocument?.documentName}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    type="text"
                                    icon={
                                        fullscreen ? (
                                            <Minimize2 className="w-4 h-4" />
                                        ) : (
                                            <Maximize2 className="w-4 h-4" />
                                        )
                                    }
                                    onClick={() => setFullscreen(!fullscreen)}
                                />
                            </div>
                        </div>
                    }
                    open={previewModal}
                    onCancel={() => {
                        setPreviewModal(false);
                        setSelectedDocument(null);
                        setFullscreen(false);
                    }}
                    footer={null}
                    width={fullscreen ? "95%" : "80%"}
                    style={{ top: fullscreen ? 10 : 50 }}
                    bodyStyle={{ height: fullscreen ? "85vh" : "70vh", padding: 0 }}
                    centered={!fullscreen}
                >
                    {renderDocumentViewer()}
                </Modal>

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
                        cancelForm.resetFields();
                    }}
                    footer={null}
                    width={500}
                    centered
                >
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <AlertTriangle className="text-red-600 mr-2" />
                                <Text strong className="text-red-800">
                                    Are you sure you want to cancel this appointment?
                                </Text>
                            </div>
                            <div className="mt-2 text-sm text-red-700">
                                This action cannot be undone. The appointment with {appointment.patient.name} on{" "}
                                {parseLocalDateTime(appointment.appointmentDateTime).format("MMMM DD, YYYY at h:mm A")}{" "}
                                will be permanently cancelled.
                            </div>
                        </div>

                        <Form form={cancelForm} layout="vertical" onFinish={handleCancelSubmit}>
                            <Form.Item
                                name="reason"
                                label="Cancellation Reason (Optional)"
                                extra="Please provide a reason for cancelling this appointment."
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="e.g., Emergency, Schedule conflict, Patient request..."
                                    maxLength={500}
                                    showCount
                                />
                            </Form.Item>

                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                <Button
                                    onClick={() => {
                                        setCancelModalVisible(false);
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
                </Modal>
            </div>
        </div>
    );
}
