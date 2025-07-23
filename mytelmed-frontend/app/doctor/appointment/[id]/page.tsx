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
    Tooltip,
    Badge,
    message,
    Modal,
    Form,
    Input,
    Checkbox,
} from "antd";
import {
    CalendarOutlined,
    UserOutlined,
    LeftOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    EyeOutlined,
    PhoneOutlined,
    MailOutlined,
    FileOutlined,
    VideoCameraOutlined,
} from "@ant-design/icons";
import {
    Trash2,
    RefreshCw,
    Maximize2,
    Minimize2,
    Lock,
    X,
} from "lucide-react";
import dayjs from "dayjs";

// Import API services
import AppointmentApi from "../../../api/appointment";
import { AppointmentDto, AppointmentStatus, CancelAppointmentRequestDto } from "../../../api/appointment/props";
import { AppointmentDocumentDto } from "@/app/api/props";
import TranscriptionSummary from "@/app/components/TranscriptionSummary/TranscriptionSummary";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function DoctorAppointmentDetails() {
    const router = useRouter();
    const params = useParams();
    const appointmentId = params.id as string;

    // State variables
    const [loading, setLoading] = useState(true);
    const [appointment, setAppointment] = useState<AppointmentDto | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Document viewing states
    const [selectedDocument, setSelectedDocument] = useState<AppointmentDocumentDto | null>(null);
    const [previewModal, setPreviewModal] = useState(false);
    const [documentError, setDocumentError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Document comparison states
    const [comparisonMode, setComparisonMode] = useState(false);
    const [selectedForComparison, setSelectedForComparison] = useState<AppointmentDocumentDto[]>([]);
    const [comparisonModalVisible, setComparisonModalVisible] = useState(false);

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

    // Parse timestamp correctly - handles both ISO strings and Unix timestamps
    const parseTimestamp = (timestamp: string | number) => {
        if (!timestamp) return dayjs();

        // If it's a string, try to parse it as ISO first
        if (typeof timestamp === "string") {
            // If it's a pure number string, convert to number
            if (/^\d+$/.test(timestamp)) {
                const numTimestamp = parseInt(timestamp);
                // If timestamp is in seconds (less than year 2000 in milliseconds)
                if (numTimestamp < 946684800000) {
                    return dayjs.unix(numTimestamp);
                }
                return dayjs(numTimestamp);
            }
            // Try to parse as ISO string
            return dayjs(timestamp);
        }

        // If it's a number
        if (typeof timestamp === "number") {
            // If timestamp is in seconds (less than year 2000 in milliseconds)
            if (timestamp < 946684800000) {
                return dayjs.unix(timestamp);
            }
            return dayjs(timestamp);
        }

        return dayjs();
    };

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
                return "success";
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
                return <ClockCircleOutlined />;
            case "CONFIRMED":
                return <CheckCircleOutlined />;
            case "READY_FOR_CALL":
                return <VideoCameraOutlined />;
            case "IN_PROGRESS":
                return <ClockCircleOutlined />;
            case "COMPLETED":
                return <CheckCircleOutlined />;
            case "CANCELLED":
            case "NO_SHOW":
                return <CloseCircleOutlined />;
            default:
                return <ExclamationCircleOutlined />;
        }
    };

    // Check if document can be viewed based on access controls and appointment status
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const canViewDocument = (document: AppointmentDocumentDto): boolean => {
        // Doctors can only view documents if appointment is not CANCELLED or COMPLETED
        if (appointment?.status === "CANCELLED" || appointment?.status === "COMPLETED") {
            return false;
        }
        // For appointment documents attached by patients, doctors should generally be able to view them
        return true;
    };

    // Check if document access has expired
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isDocumentAccessExpired = (document: AppointmentDocumentDto): boolean => {
        // Check if document access has expired based on documentAccess.expiryDate
        return false;
    };

    // Document comparison handlers
    const handleToggleComparisonMode = () => {
        setComparisonMode(!comparisonMode);
        setSelectedForComparison([]);
    };

    const handleAddToComparison = (document: AppointmentDocumentDto) => {
        if (!canViewDocument(document)) {
            if (appointment?.status === "CANCELLED") {
                message.error("Documents cannot be viewed for cancelled appointments");
            } else if (appointment?.status === "COMPLETED") {
                message.error("Documents cannot be viewed for completed appointments");
            } else {
                message.error("You don't have permission to view this document");
            }
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
        if (selectedForComparison.length < 2) {
            message.warning("Please select at least 2 documents to compare");
            return;
        }
        setComparisonModalVisible(true);
    };

    const handleExitComparisonMode = () => {
        setComparisonMode(false);
        setSelectedForComparison([]);
    };

    // Handle document viewing
    const handleDocumentView = (document: AppointmentDocumentDto) => {
        if (!canViewDocument(document)) {
            if (appointment?.status === "CANCELLED") {
                message.error("Documents cannot be viewed for cancelled appointments");
            } else if (appointment?.status === "COMPLETED") {
                message.error("Documents cannot be viewed for completed appointments");
            } else {
                message.error("You don't have permission to view this document");
            }
            return;
        }

        if (isDocumentAccessExpired(document)) {
            message.error("Your access to this document has expired");
            return;
        }

        setSelectedDocument(document);
        setPreviewModal(true);
        setDocumentError(null);
        setRetryCount(0);
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

    // Document viewer helpers
    const handleDocumentRetry = () => {
        setRetryCount((prev) => prev + 1);
        setDocumentError(null);
    };

    const isValidDocumentUrl = (url: string) => {
        if (!url || url.trim() === "") return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    // Reset document states when selected document changes
    useEffect(() => {
        if (selectedDocument?.documentUrl) {
            setDocumentError(null);
            setRetryCount(0);
        }
    }, [selectedDocument?.id, selectedDocument?.documentUrl]);

    // Reset fullscreen when modal closes
    useEffect(() => {
        if (!previewModal) {
            setIsFullscreen(false);
        }
    }, [previewModal]);

    // Document viewer component
    const renderDocumentViewer = () => {
        if (!selectedDocument?.documentUrl) {
            return (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <Text className="text-gray-500">Document not available for viewing.</Text>
                </div>
            );
        }

        const isValidUrl = isValidDocumentUrl(selectedDocument.documentUrl);

        return (
            <div
                className="relative border rounded bg-gray-50"
                style={{ height: isFullscreen ? "calc(100vh - 120px)" : "500px" }}
            >
                {(documentError || !isValidUrl) && (
                    <div className="flex items-center justify-center h-full p-4">
                        <Alert
                            message="Document Display Issue"
                            description={
                                <div className="space-y-2">
                                    <p>
                                        {documentError || "Invalid document URL. The document link may have expired."}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Common causes:</strong>
                                    </p>
                                    <ul className="text-sm list-disc list-inside space-y-1">
                                        <li>Document access URL has expired (URLs expire after 10 minutes)</li>
                                        <li>Browser security restrictions for PDF display</li>
                                        <li>Network connectivity issues</li>
                                        <li>Document format not supported for inline viewing</li>
                                    </ul>
                                </div>
                            }
                            type="warning"
                            showIcon
                            action={
                                retryCount < 2 && (
                                    <Button
                                        onClick={handleDocumentRetry}
                                        icon={<RefreshCw className="w-4 h-4" />}
                                    >
                                        Retry Loading
                                    </Button>
                                )
                            }
                        />
                    </div>
                )}
                {!documentError && isValidUrl && (
                    <div className="h-full">
                        <embed
                            src={selectedDocument.documentUrl + "#toolbar=0"}
                            className="w-full h-full border-0"
                            title={selectedDocument.documentName}
                        />
                    </div>
                )}
            </div>
        );
    };

    // Get document type display name
    const getDocumentTypeDisplayName = (documentType: string) => {
        switch (documentType) {
            case "PRESCRIPTION":
                return "Prescription";
            case "LAB_REPORT":
                return "Lab Report";
            case "RADIOLOGY_REPORT":
                return "Radiology Report";
            case "DISCHARGE_SUMMARY":
                return "Discharge Summary";
            case "OPERATIVE_REPORT":
                return "Operative Report";
            case "CONSULTATION_NOTE":
                return "Consultation Note";
            case "PROGRESS_NOTE":
                return "Progress Note";
            case "PATHOLOGY_REPORT":
                return "Pathology Report";
            case "IMMUNIZATION_RECORD":
                return "Immunization Record";
            case "REFERRAL_LETTER":
                return "Referral Letter";
            case "MEDICAL_CERTIFICATE":
                return "Medical Certificate";
            case "HISTORY_AND_PHYSICAL":
                return "History and Physical";
            case "EMERGENCY_ROOM_REPORT":
                return "Emergency Room Report";
            case "ANESTHESIA_RECORD":
                return "Anesthesia Record";
            case "INPATIENT_SUMMARY":
                return "Inpatient Summary";
            case "OUTPATIENT_SUMMARY":
                return "Outpatient Summary";
            case "NURSING_NOTE":
                return "Nursing Note";
            case "MENTAL_HEALTH_NOTE":
                return "Mental Health Note";
            case "MEDICAL_IMAGING":
                return "Medical Imaging";
            case "CLINICAL_TRIAL_DOCUMENT":
                return "Clinical Trial Document";
            case "TREATMENT_PLAN":
                return "Treatment Plan";
            case "DIAGNOSTIC_REPORT":
                return "Diagnostic Report";
            case "VITAL_SIGNS_RECORD":
                return "Vital Signs Record";
            case "ALLERGY_RECORD":
                return "Allergy Record";
            case "MEDICAL_RECORD":
                return "Medical Record";
            case "IMAGING":
                return "Imaging";
            case "OTHER":
                return "Other";
            default:
                return documentType;
        }
    };

    // Get file icon based on file type
    const getFileIcon = (fileType: string) => {
        const type = fileType.toLowerCase();
        switch (type) {
            case "pdf":
                return <FileOutlined className="text-red-500" />;
            case "doc":
            case "docx":
                return <FileTextOutlined className="text-blue-500" />;
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
            case "bmp":
            case "webp":
                return <FileOutlined className="text-green-500" />;
            default:
                return <FileTextOutlined className="text-gray-500" />;
        }
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
            <div className="container mx-auto px-4 py-4">
                <div className="text-center py-16">
                    <Spin size="large" />
                    <div className="mt-4">
                        <Text className="text-lg">Loading appointment details...</Text>
                    </div>
                </div>
            </div>
        );
    }

    // Render error state
    if (error || !appointment) {
        return (
            <div className="container mx-auto px-4 py-4">
                <Button
                    type="text"
                    icon={<LeftOutlined />}
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
        );
    }

    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Button
                    type="text"
                    icon={<LeftOutlined />}
                    onClick={() => router.push("/doctor/appointment")}
                    className="px-0"
                >
                    Back to Appointments
                </Button>

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <Title level={2} className="text-green-800 mb-2">
                            <CalendarOutlined className="mr-2" />
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
                                size="middle"
                            >
                                Cancel Appointment
                            </Button>
                        )}

                        {(appointment.status === "READY_FOR_CALL" || appointment.status === "IN_PROGRESS") && (
                            <Button
                                type="primary"
                                icon={<VideoCameraOutlined />}
                                onClick={() => window.open(`/video-call/${appointment.id}`, "_blank")}
                                className="bg-green-600 border-green-600 hover:bg-green-700"
                                size="middle"
                            >
                                {appointment.status === "IN_PROGRESS" ? "Join Video Call" : "Start Video Call"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                {/* Left Column - Patient & Appointment Info */}
                <Col xs={24} lg={16}>
                    {/* Patient Information */}
                    <Card
                        className="mb-6"
                        title={
                            <div className="flex items-center">
                                <UserOutlined className="mr-2 text-green-600" />
                                Patient Information
                            </div>
                        }
                    >
                        <div className="flex flex-col sm:flex-row items-center space-x-4 mb-4">
                            <Avatar
                                size={80}
                                src={appointment.patient.profileImageUrl}
                                icon={<UserOutlined />}
                                className="bg-green-100 border-2 border-green-100"
                            />
                            <div className="flex-1">
                                <Title level={3} className="mb-1 mt-0">
                                    {appointment.patient.name}
                                </Title>
                                <Text className="text-gray-600 block mb-2">Patient ID: {appointment.patient.id}</Text>
                                <div className="flex flex-col justify-center sm:flex-row sm:justify-normal items-center space-x-4">
                                    <Tooltip title="Email">
                                        <div className="flex items-center text-gray-600">
                                            <MailOutlined className="mr-1" />
                                            <Text className="text-sm">{appointment.patient.email}</Text>
                                        </div>
                                    </Tooltip>
                                    <Tooltip title="Phone">
                                        <div className="flex items-center text-gray-600">
                                            <PhoneOutlined className="mr-1" />
                                            <Text className="text-sm">{appointment.patient.phone}</Text>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Text strong>NRIC: </Text>
                                <Text>{appointment.patient.nric}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Gender: </Text>
                                <Text className="capitalize">{appointment.patient.gender?.toLowerCase() || "Not specified"}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Date of Birth: </Text>
                                <Text>{appointment.patient.dateOfBirth || "Not specified"}</Text>
                            </Col>
                        </Row>
                    </Card>

                    {/* Appointment Information */}
                    <Card
                        className="mb-6"
                        title={
                            <div className="flex items-center">
                                <CalendarOutlined className="mr-2 text-green-600" />
                                Appointment Information
                            </div>
                        }
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <CalendarOutlined className="text-2xl text-green-600 mb-2" />
                                    <div className="text-xl font-semibold text-green-800">
                                        {parseTimestamp(appointment.appointmentDateTime).format("MMMM DD, YYYY")}
                                    </div>
                                    <div className="text-lg text-green-600">
                                        {parseTimestamp(appointment.appointmentDateTime).format("h:mm A")}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Duration: {appointment.durationMinutes} minutes
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Divider />

                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Text strong>Consultation Mode: </Text>
                                <Tag color={appointment.consultationMode === "VIRTUAL" ? "blue" : "green"}>
                                    {appointment.consultationMode}
                                </Tag>
                            </Col>
                            <Col span={12}>
                                <Text strong>Status: </Text>
                                <Tag color={getStatusColor(appointment.status as AppointmentStatus)}>
                                    {appointment.status.replaceAll("_", " ")}
                                </Tag>
                            </Col>
                            <Col span={12}>
                                <Text strong>Created: </Text>
                                <Text>{parseTimestamp(appointment.createdAt).format("MMM DD, YYYY h:mm A")}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Last Updated: </Text>
                                <Text>{parseTimestamp(appointment.updatedAt).format("MMM DD, YYYY h:mm A")}</Text>
                            </Col>
                            {appointment.completedAt && (
                                <Col span={12}>
                                    <Text strong>Completed: </Text>
                                    <Text>{parseTimestamp(appointment.completedAt).format("MMM DD, YYYY h:mm A")}</Text>
                                </Col>
                            )}
                            {appointment.cancelledBy && (
                                <Col span={12}>
                                    <Text strong>Cancelled By: </Text>
                                    <Text>{appointment.cancelledBy}</Text>
                                </Col>
                            )}
                        </Row>

                        {appointment.reasonForVisit && (
                            <>
                                <Divider />
                                <div>
                                    <Text strong className="text-green-600">Reason for Visit:</Text>
                                    <Paragraph className="mt-1 p-3 bg-green-50 border border-green-200 rounded">
                                        {appointment.reasonForVisit}
                                    </Paragraph>
                                </div>
                            </>
                        )}

                        {appointment.patientNotes && (
                            <>
                                <Divider />
                                <div>
                                    <Text strong className="text-blue-600">Patient Notes:</Text>
                                    <Paragraph className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded">
                                        {appointment.patientNotes}
                                    </Paragraph>
                                </div>
                            </>
                        )}

                        {appointment.cancellationReason && (
                            <>
                                <Divider />
                                <div>
                                    <Text strong>Cancellation Reason:</Text>
                                    <Paragraph className="mt-1 p-3 bg-red-50 border border-red-200 rounded">
                                        {appointment.cancellationReason}
                                    </Paragraph>
                                </div>
                            </>
                        )}
                    </Card>
                </Col>

                {/* Right Column - Doctor Notes & Documents */}
                <Col xs={24} lg={8}>
                    {/* AI Transcription Summary */}
                    {appointment.consultationMode === "VIRTUAL" && (
                        <TranscriptionSummary
                            transcriptionSummary={appointment.transcriptionSummary}
                            userType="doctor"
                            appointmentId={appointment.id}
                        />
                    )}

                    {/* Attached Documents */}
                    <Card
                        title={
                            <div className="flex flex-col gap-2">
                                {/* Title Row */}
                                <div className="flex flex-col 3xl:flex-row 3xl:items-center 3xl:justify-between gap-2 py-3">
                                    <div className="flex items-center gap-2">
                                        <FileOutlined className="text-green-600 text-base sm:text-lg" />
                                        <span className="text-base sm:text-sm font-semibold text-gray-800">Attached Documents</span>
                                        <Badge
                                            count={appointment.attachedDocuments.length}
                                            color="green"
                                            className="ml-1"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    {appointment.attachedDocuments.length > 1 && appointment.attachedDocuments.some(doc => canViewDocument(doc)) && (
                                        <div className="flex flex-col xl:flex-row gap-2 sm:gap-1">
                                            {!comparisonMode ? (
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<EyeOutlined />}
                                                    onClick={handleToggleComparisonMode}
                                                    className="text-green-600 hover:text-green-800 text-sm font-medium justify-start sm:justify-center"
                                                >
                                                    Compare
                                                </Button>
                                            ) : (
                                                <div className="flex flex-col xl:flex-row gap-2 xl:gap-3 flex-wrap">
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        icon={<EyeOutlined />}
                                                        onClick={handleStartComparison}
                                                        disabled={selectedForComparison.length < 2}
                                                        className="text-sm font-medium bg-green-600 border-green-600"
                                                    >
                                                        Compare ({selectedForComparison.length})
                                                    </Button>
                                                    {selectedForComparison.length > 0 && (
                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            icon={<CloseCircleOutlined />}
                                                            onClick={handleClearAllComparison}
                                                            className="text-sm"
                                                        >
                                                            Clear All
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        danger
                                                        icon={<CloseCircleOutlined />}
                                                        onClick={handleExitComparisonMode}
                                                        className="text-sm"
                                                    >
                                                        Exit Mode
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        }
                        className="shadow-sm"
                    >
                        {(appointment.status === "CANCELLED" || appointment.status === "COMPLETED") && appointment.attachedDocuments.length > 0 && (
                            <Alert
                                message={
                                    appointment.status === "CANCELLED"
                                        ? "Document Access Restricted - Appointment Cancelled"
                                        : "Document Access Restricted - Appointment Completed"
                                }
                                description={
                                    appointment.status === "CANCELLED"
                                        ? "Documents cannot be viewed for cancelled appointments due to privacy and security policies."
                                        : "Documents cannot be viewed for completed appointments due to privacy and security policies."
                                }
                                type="warning"
                                showIcon
                                className="mb-4"
                            />
                        )}

                        {comparisonMode && appointment.attachedDocuments.length > 1 && appointment.attachedDocuments.some(doc => canViewDocument(doc)) && (
                            <Alert
                                message={
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-green-800">
                                            Document Comparison Mode
                                        </span>
                                        <span className="text-xs text-green-600 font-medium">
                                            {selectedForComparison.length}/4 selected
                                        </span>
                                    </div>
                                }
                                description={
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-3">
                                            Select 2-4 documents to compare them side by side.
                                            <span className="block sm:inline"> Use checkboxes or tap document cards to select.</span>
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            {selectedForComparison.length > 0 && (
                                                <Button
                                                    size="small"
                                                    onClick={handleClearAllComparison}
                                                    className="text-sm justify-start sm:justify-center"
                                                >
                                                    Clear All Selections
                                                </Button>
                                            )}
                                            {selectedForComparison.length >= 2 && (
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    onClick={handleStartComparison}
                                                    className="text-sm justify-start sm:justify-center bg-green-600 border-green-600"
                                                >
                                                    Start Comparison Now
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                }
                                type="info"
                                showIcon
                                className="mb-4"
                            />
                        )}

                        {appointment.attachedDocuments.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <FileOutlined className="text-4xl text-gray-300 mb-3" />
                                <div className="space-y-1">
                                    <Text className="text-gray-500 text-sm block">No documents attached</Text>
                                    <Text className="text-gray-400 text-xs block">Documents will appear here when added to the appointment</Text>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {appointment.attachedDocuments.map((docItem) => {
                                    const isSelected = selectedForComparison.some((d) => d.id === docItem.id);

                                    return (
                                        <Card
                                            key={docItem.id}
                                            size="small"
                                            className={`w-full hover:shadow-md transition-all duration-200 ${comparisonMode && canViewDocument(docItem) ? "cursor-pointer hover:bg-gray-50" : ""
                                                } ${isSelected
                                                    ? "border-green-500 bg-green-50 shadow-md"
                                                    : "border-gray-200 hover:border-gray-300"
                                                } ${!canViewDocument(docItem) ? "opacity-60" : ""}`}
                                            styles={{ body: { padding: "16px" } }}
                                            onClick={() => {
                                                if (comparisonMode && canViewDocument(docItem)) {
                                                    if (isSelected) {
                                                        handleRemoveFromComparison(docItem);
                                                    } else {
                                                        handleAddToComparison(docItem);
                                                    }
                                                }
                                            }}
                                        >
                                            <div className="flex flex-col space-y-3">
                                                {/* Document Header */}
                                                <div className="flex items-start gap-3">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        {comparisonMode && (
                                                            <div className="flex-shrink-0">
                                                                <Checkbox
                                                                    checked={isSelected}
                                                                    disabled={!canViewDocument(docItem)}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        if (canViewDocument(docItem)) {
                                                                            if (isSelected) {
                                                                                handleRemoveFromComparison(docItem);
                                                                            } else {
                                                                                handleAddToComparison(docItem);
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="text-base"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <Tooltip title={docItem.documentName} placement="topLeft">
                                                                <Text strong className="block truncate text-base leading-snug mb-1">
                                                                    {getFileIcon("pdf")} {docItem.documentName}
                                                                </Text>
                                                            </Tooltip>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                                                    <Tag color="green" className="text-xs font-medium">
                                                                        {getDocumentTypeDisplayName(docItem.documentType)}
                                                                    </Tag>
                                                                    <span className="text-gray-500">PDF</span>
                                                                    <span className="text-gray-500">•</span>
                                                                    <span className="text-gray-500">{formatFileSize(docItem.documentSize)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        {!canViewDocument(docItem) ? (
                                                            <Tooltip
                                                                title={
                                                                    appointment?.status === "CANCELLED"
                                                                        ? "Documents cannot be viewed for cancelled appointments"
                                                                        : appointment?.status === "COMPLETED"
                                                                            ? "Documents cannot be viewed for completed appointments"
                                                                            : "No access"
                                                                }
                                                            >
                                                                <Button
                                                                    icon={<Lock className="w-4 h-4" />}
                                                                    disabled
                                                                    size="middle"
                                                                    className="h-10 w-10 flex items-center justify-center rounded-lg"
                                                                />
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip title="View Document">
                                                                <Button
                                                                    type="text"
                                                                    size="middle"
                                                                    icon={<EyeOutlined />}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDocumentView(docItem);
                                                                    }}
                                                                    className="text-green-600 hover:text-green-800 hover:bg-green-50 h-10 w-10 flex items-center justify-center rounded-lg"
                                                                />
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Document Metadata */}
                                                <div className="pt-3 border-t border-gray-100">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                            <span className="text-xs text-gray-600 font-medium">
                                                                Uploaded: {parseTimestamp(docItem.createdAt).format("MMM DD, YYYY")}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {parseTimestamp(docItem.createdAt).format("h:mm A")}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {docItem.notes && (
                                                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                            <Text className="text-green-800 text-xs leading-relaxed">
                                                                <span className="font-semibold">Note:</span> {docItem.notes}
                                                            </Text>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Document Preview Modal */}
            <Modal
                title={
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <EyeOutlined className="mr-2" />
                            Document Preview
                        </div>
                        {selectedDocument && (
                            <div className="flex items-center gap-2">
                                {documentError && retryCount < 2 && (
                                    <Button
                                        size="small"
                                        icon={<RefreshCw className="w-4 h-4" />}
                                        onClick={handleDocumentRetry}
                                        title="Retry Loading"
                                    >
                                        Retry
                                    </Button>
                                )}
                                <Button
                                    size="small"
                                    icon={<Maximize2 className="w-4 h-4" />}
                                    onClick={() => setIsFullscreen(true)}
                                    title="View Fullscreen"
                                >
                                    Fullscreen
                                </Button>
                            </div>
                        )}
                    </div>
                }
                open={previewModal}
                onCancel={() => setPreviewModal(false)}
                footer={[
                    <Button key="close" onClick={() => setPreviewModal(false)}>
                        Close
                    </Button>,
                ]}
                width="80vw"
                style={{ maxWidth: "1200px" }}
                centered
                closable={false}
            >
                {selectedDocument && (
                    <div className="space-y-4">
                        {/* Document Metadata */}
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between mb-3">
                                <Title level={4} className="mb-0">
                                    {selectedDocument.documentName}
                                </Title>
                                <div className="flex items-center space-x-2">
                                    <Tag color="green">{getDocumentTypeDisplayName(selectedDocument.documentType)}</Tag>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                <span>Size: {formatFileSize(selectedDocument.documentSize)}</span>
                                <span>•</span>
                                <span>
                                    Uploaded: {parseTimestamp(selectedDocument.createdAt).format("MMM DD, YYYY")}
                                </span>
                            </div>

                            {selectedDocument.notes && (
                                <div>
                                    <Text strong className="text-green-600">
                                        Notes:
                                    </Text>
                                    <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded">
                                        <Text className="text-green-800">{selectedDocument.notes}</Text>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Document Viewer */}
                        {renderDocumentViewer()}

                        <div className="p-3 bg-green-50 rounded-lg">
                            <Text className="text-sm text-green-700">
                                <strong>Tip:</strong> Click the fullscreen button for a better viewing experience.
                                Document URLs expire after 10 minutes for security.
                            </Text>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Fullscreen Document Modal */}
            {
                isFullscreen && selectedDocument && (
                    <Modal
                        title={null}
                        open={true}
                        onCancel={() => setIsFullscreen(false)}
                        footer={null}
                        width="100vw"
                        style={{
                            margin: 0,
                            padding: 0,
                            top: 0,
                            left: 0,
                            height: "100vh",
                        }}
                        styles={{
                            body: {
                                padding: 0,
                                height: "100vh",
                                display: "flex",
                                flexDirection: "column",
                            },
                            content: {
                                height: "100vh",
                                display: "flex",
                                flexDirection: "column",
                            },
                            mask: {
                                backgroundColor: "rgba(0, 0, 0, 0.8)",
                            },
                        }}
                        centered={true}
                        destroyOnHidden={true}
                        maskClosable={true}
                        keyboard={true}
                        zIndex={1100}
                        getContainer={false}
                        closable={false}
                    >
                        <div className="h-full flex flex-col bg-white">
                            {/* Fullscreen Header */}
                            <div className="flex items-center justify-between border-b bg-white mb-4">
                                <div className="flex items-center gap-3">
                                    <FileOutlined className="w-6 h-6 text-green-500" />
                                    <div>
                                        <Title level={4} className="m-0">
                                            {selectedDocument.documentName}
                                        </Title>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {documentError && retryCount < 2 && (
                                        <Button
                                            icon={<RefreshCw className="w-4 h-4" />}
                                            onClick={handleDocumentRetry}
                                            title="Retry Loading"
                                        >
                                            Retry
                                        </Button>
                                    )}
                                    <Button
                                        icon={<Minimize2 className="w-4 h-4" />}
                                        onClick={() => setIsFullscreen(false)}
                                        title="Exit Fullscreen"
                                    >
                                        Exit Fullscreen
                                    </Button>
                                </div>
                            </div>

                            {/* Fullscreen Document Viewer */}
                            <div className="flex-1">{renderDocumentViewer()}</div>
                        </div>
                    </Modal>
                )
            }

            {/* Document Comparison Modal */}
            <Modal
                title={null}
                open={comparisonModalVisible}
                onCancel={() => setComparisonModalVisible(false)}
                footer={null}
                width="100vw"
                style={{
                    margin: 0,
                    padding: 0,
                    top: 0,
                    left: 0,
                    height: "100vh",
                }}
                styles={{
                    body: {
                        padding: 0,
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                    },
                    content: {
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                    },
                    mask: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                    },
                }}
                centered={true}
                destroyOnHidden={true}
                maskClosable={true}
                keyboard={true}
                zIndex={1100}
                getContainer={false}
                closable={false}
            >
                <div className="h-full flex flex-col bg-white">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 border-b bg-white">
                        <div className="flex items-center gap-3">
                            <FileOutlined className="w-6 h-6 text-green-500" />
                            <Title level={4} className="m-0">
                                Document Comparison ({selectedForComparison.length} documents)
                            </Title>
                        </div>
                        <Button
                            type="text"
                            icon={<X className="w-5 h-5" />}
                            onClick={() => setComparisonModalVisible(false)}
                            className="hover:bg-gray-100"
                            size="middle"
                        >
                            Close Comparison
                        </Button>
                    </div>

                    {/* Document Grid */}
                    <div className="flex-1">
                        <div
                            className={`grid ${selectedForComparison.length === 1
                                ? "grid-cols-1"
                                : selectedForComparison.length === 2
                                    ? "grid-cols-2"
                                    : selectedForComparison.length === 3
                                        ? "grid-cols-3"
                                        : "grid-cols-2"
                                } ${selectedForComparison.length <= 2 ? "grid-rows-1" : "grid-rows-2"} gap-4 h-full`}
                        >
                            {selectedForComparison.map((docItem) => (
                                <Card
                                    key={docItem.id}
                                    className="h-full flex flex-col"
                                    styles={{
                                        body: {
                                            padding: "12px",
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                        },
                                    }}
                                >
                                    {/* Document Header */}
                                    <div className="flex items-center justify-between mb-3 border-b pb-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div className="text-lg flex-shrink-0">{getFileIcon("pdf")}</div>
                                            <Tooltip title={docItem.documentName}>
                                                <Text strong className="block truncate text-sm">
                                                    {docItem.documentName}
                                                </Text>
                                            </Tooltip>
                                        </div>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<CloseCircleOutlined />}
                                            onClick={() => handleRemoveFromComparison(docItem)}
                                            className="text-red-600 hover:text-red-800"
                                        />
                                    </div>

                                    {/* Document Viewer */}
                                    <div className="flex-1 overflow-auto border rounded bg-gray-50 relative">
                                        {docItem.documentUrl ? (
                                            <div className="h-full">
                                                <embed
                                                    src={docItem.documentUrl + "#toolbar=0"}
                                                    className="w-full h-full border-0"
                                                    title={docItem.documentName}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full p-4">
                                                <Text className="text-gray-500">
                                                    Document not available for viewing
                                                </Text>
                                            </div>
                                        )}
                                    </div>

                                    {/* Document Notes */}
                                    {docItem.notes && (
                                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                            <Text className="text-green-800">
                                                <strong>Note:</strong> {docItem.notes}
                                            </Text>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Footer with tips */}
                    <div className="p-4 border-t mt-4 bg-green-50">
                        <Text className="text-sm text-green-700">
                            <strong>Tip:</strong> Document URLs expire after 10 minutes for security. If documents fail
                            to load, try refreshing the page. Some PDFs may not display properly in browsers due to
                            security restrictions.
                        </Text>
                    </div>
                </div>
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
                            <ExclamationCircleOutlined className="text-red-600 mr-2" />
                            <Text strong className="text-red-800">
                                Are you sure you want to cancel this appointment?
                            </Text>
                        </div>
                        <div className="mt-2 text-sm text-red-700">
                            This action cannot be undone. The appointment with {appointment.patient.name} on{" "}
                            {parseTimestamp(appointment.appointmentDateTime).format("MMMM DD, YYYY")} at {parseTimestamp(appointment.appointmentDateTime).format("h:mm A")}{" "}
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
        </div >
    );
}
