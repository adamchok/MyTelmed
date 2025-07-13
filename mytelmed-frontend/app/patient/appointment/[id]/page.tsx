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
    Badge,
    message,
    Modal,
    Image,
    Form,
    Input,
    Select,
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
    DownloadOutlined,
    EyeOutlined,
    PhoneOutlined,
    MailOutlined,
    FileOutlined,
    EditOutlined,
    SaveOutlined,
    VideoCameraOutlined,
    HomeOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

// Import API services
import AppointmentApi from "../../../api/appointment";
import {
    AppointmentDto,
    AppointmentStatus,
    UpdateAppointmentRequestDto,
    AddAppointmentDocumentRequestDto,
    CancelAppointmentRequestDto,
} from "../../../api/appointment/props";
import { AppointmentDocumentDto } from "@/app/api/props";
import DocumentApi from "@/app/api/document";
import { Document } from "@/app/api/document/props";

const { Title, Text, Paragraph } = Typography;

export default function AppointmentDetails() {
    const router = useRouter();
    const params = useParams();
    const appointmentId = params.id as string;

    // State variables
    const [loading, setLoading] = useState(true);
    const [appointment, setAppointment] = useState<AppointmentDto | null>(null);
    const [error, setError] = useState<string | null>(null);

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
                // Add hasAttachedDocuments field for convenience
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
            const errorMessage = error.response?.data?.message || error.message || "Failed to load appointment details";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointmentDetails();
    }, [appointmentId]);

    // Get status color
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

    // Format file size
    const formatFileSize = (sizeStr: string) => {
        const size = parseInt(sizeStr);
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

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

    // State for document preview
    const [previewModal, setPreviewModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<AppointmentDocumentDto | null>(null);

    // State for update appointment modal
    const [updateModal, setUpdateModal] = useState(false);
    const [updateForm] = Form.useForm();
    const [updateLoading, setUpdateLoading] = useState(false);
    const [availableDocuments, setAvailableDocuments] = useState<Document[]>([]);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

    // State for cancel appointment modal
    const [cancelModal, setCancelModal] = useState(false);
    const [cancelForm] = Form.useForm();
    const [cancelLoading, setCancelLoading] = useState(false);

    // Convert document type enum to display name
    const getDocumentTypeDisplayName = (documentType: string) => {
        switch (documentType) {
            case "LAB_REPORT":
                return "Lab Report";
            case "MEDICAL_RECORD":
                return "Medical Record";
            case "PRESCRIPTION":
                return "Prescription";
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

    // Render document preview content
    const renderDocumentPreview = (docItem: AppointmentDocumentDto) => {
        const doc = docItem;

        // Document metadata section
        const DocumentMetadata = () => (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                    <Title level={4} className="mb-0">
                        {doc.documentName}
                    </Title>
                    <div className="flex items-center space-x-2">
                        <Tag color="blue">{getDocumentTypeDisplayName(doc.documentType)}</Tag>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-4">
                        <span>Size: {formatFileSize(doc.documentSize)}</span>
                        <span>•</span>
                        <span>Uploaded: {parseTimestamp(doc.createdAt).format("MMM DD, YYYY")}</span>
                    </div>
                </div>

                {docItem.notes && (
                    <div>
                        <Text strong className="text-blue-600">
                            Notes:
                        </Text>
                        <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded">
                            <Text className="text-blue-800">{docItem.notes}</Text>
                        </div>
                    </div>
                )}
            </div>
        );

        if (!doc.documentUrl) {
            return (
                <div>
                    <DocumentMetadata />
                    <div className="text-center p-8">
                        <div className="text-6xl mb-4 text-gray-400">{getFileIcon(doc.documentType)}</div>
                        <Text className="text-gray-500">Document URL not available</Text>
                    </div>
                </div>
            );
        }

        const fileType = doc.documentUrl.split(".").pop()?.toLowerCase() || "pdf";

        // Handle images
        if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(fileType)) {
            return (
                <div>
                    <DocumentMetadata />
                    <div className="text-center">
                        <Image
                            src={doc.documentUrl}
                            alt={doc.documentName}
                            className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.nextElementSibling?.classList.remove("hidden");
                            }}
                        />
                        <div className="hidden text-center p-8">
                            <Text className="text-red-500">Failed to load image</Text>
                        </div>
                    </div>
                </div>
            );
        }

        // Handle PDFs
        if (fileType === "pdf") {
            return (
                <div>
                    <DocumentMetadata />
                    <div className="w-full h-[60vh]">
                        <iframe
                            src={doc.documentUrl}
                            className="w-full h-full border-0 rounded-lg"
                            title={doc.documentName}
                        />
                    </div>
                </div>
            );
        }

        // Handle other file types
        return (
            <div>
                <DocumentMetadata />
                <div className="text-center p-8">
                    <div className="text-6xl mb-4">{getFileIcon(fileType)}</div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <Text className="text-gray-500">Preview not available for {fileType.toUpperCase()} files</Text>
                        <br />
                        <Button
                            type="link"
                            icon={<DownloadOutlined />}
                            onClick={() => window.open(doc.documentUrl, "_blank")}
                            className="mt-2"
                        >
                            Open in new tab
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    // Handle document view/download
    const handleDocumentAction = (docItem: AppointmentDocumentDto, action: "view" | "download") => {
        if (docItem.documentUrl) {
            if (action === "view") {
                setSelectedDocument(docItem);
                setPreviewModal(true);
            } else {
                window.open(docItem.documentUrl, "_blank");
            }
        } else {
            message.error("Document URL not available");
        }
    };

    // Load available documents for patient
    const loadAvailableDocuments = async () => {
        try {
            setDocumentsLoading(true);
            const response = await DocumentApi.getDocumentsByPatientAccount();

            if (response.data.isSuccess && response.data.data) {
                setAvailableDocuments(response.data.data);
            } else {
                message.error("Failed to load available documents");
            }
        } catch (error: any) {
            console.error("Error loading documents:", error);
            message.error("Failed to load available documents");
        } finally {
            setDocumentsLoading(false);
        }
    };

    // Open update appointment modal
    const openUpdateModal = () => {
        if (!appointment) return;

        const attachedDocIds = appointment.attachedDocuments.map((doc) => doc.documentId);
        const formValues: any = {
            patientNotes: appointment.patientNotes || "",
            reasonForVisit: appointment.reasonForVisit || "",
            selectedDocuments: attachedDocIds,
        };

        // Pre-fill existing document notes
        appointment.attachedDocuments.forEach((docItem) => {
            if (docItem.notes) {
                formValues[`documentNote_${docItem.documentId}`] = docItem.notes;
            }
        });

        // Pre-fill form with current appointment data
        updateForm.setFieldsValue(formValues);
        setSelectedDocuments(attachedDocIds);

        // Load available documents
        loadAvailableDocuments();
        setUpdateModal(true);
    };

    // Handle update appointment
    const handleUpdateAppointment = async (values: any) => {
        if (!appointment) return;

        try {
            setUpdateLoading(true);

            // Prepare document requests with individual notes
            const documentRequestList: AddAppointmentDocumentRequestDto[] = [];

            if (values.selectedDocuments && values.selectedDocuments.length > 0) {
                for (const documentId of values.selectedDocuments) {
                    const noteFieldName = `documentNote_${documentId}`;
                    documentRequestList.push({
                        documentId,
                        notes: values[noteFieldName] || undefined,
                    });
                }
            }

            const updateRequest: UpdateAppointmentRequestDto = {
                patientNotes: values.patientNotes || undefined,
                reasonForVisit: values.reasonForVisit || undefined,
                documentRequestList: documentRequestList.length > 0 ? documentRequestList : undefined,
            };

            const response = await AppointmentApi.updateAppointment(appointment.id, updateRequest);

            if (response.data.isSuccess) {
                message.success("Appointment updated successfully");
                setUpdateModal(false);
                updateForm.resetFields();
                setSelectedDocuments([]);
                // Reload appointment details
                await loadAppointmentDetails();
            } else {
                message.error(response.data.message || "Failed to update appointment");
            }
        } catch (error: any) {
            console.error("Error updating appointment:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to update appointment";
            message.error(errorMessage);
        } finally {
            setUpdateLoading(false);
        }
    };

    // Handle cancel appointment
    const handleCancelAppointment = () => {
        if (!appointment) return;
        setCancelModal(true);
    };

    // Handle cancel appointment form submission
    const handleCancelSubmit = async (values: { reason?: string }) => {
        if (!appointment) return;

        try {
            setCancelLoading(true);
            const request: CancelAppointmentRequestDto = {
                reason: values.reason,
            };

            const response = await AppointmentApi.cancelAppointment(appointment.id, request);

            if (response.data.isSuccess) {
                message.success("Appointment cancelled successfully!");
                setCancelModal(false);
                cancelForm.resetFields();
                // Reload appointment details
                await loadAppointmentDetails();
            } else {
                message.error(response.data.message || "Failed to cancel appointment");
            }
        } catch (error: any) {
            console.error("Error cancelling appointment:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to cancel appointment";
            message.error(errorMessage);
        } finally {
            setCancelLoading(false);
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div className="bg-gray-50 p-4 mx-8">
                <div className="max-w-5xl mx-auto">
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
            <div className="bg-gray-50 p-4 mx-8">
                <div className="max-w-5xl mx-auto">
                    <Button
                        type="text"
                        icon={<LeftOutlined />}
                        onClick={() => router.push("/patient/appointment")}
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
                                        onClick={() => router.push("/patient/appointment")}
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

    const canEditAppointment = appointment.status === "PENDING" || appointment.status === "PENDING_PAYMENT";

    const canCancelAppointment = appointment.status === "PENDING" || appointment.status === "PENDING_PAYMENT";

    const canStartCall = appointment.status === "READY_FOR_CALL" || appointment.status === "IN_PROGRESS";

    return (
        <div className="bg-gray-50 p-4 mx-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        type="text"
                        icon={<LeftOutlined />}
                        onClick={() => router.push("/patient/appointment")}
                        className="mb-4"
                    >
                        Back to Appointments
                    </Button>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <Title level={2} className="text-blue-900 mb-2">
                                <CalendarOutlined className="mr-2" />
                                Appointment Details
                            </Title>
                            <Text className="text-gray-600">
                                View your appointment information and attached documents
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

                            {canStartCall && (
                                <Button
                                    type="primary"
                                    icon={<VideoCameraOutlined />}
                                    onClick={() => window.open(`/video-call/${appointment.id}`, "_blank")}
                                    className="bg-green-600 border-green-600 hover:bg-green-700"
                                >
                                    {appointment.status === "IN_PROGRESS" ? "Join Video Call" : "Start Video Call"}
                                </Button>
                            )}

                            {canEditAppointment && (
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={openUpdateModal}
                                    className="bg-blue-600 border-blue-600 hover:bg-blue-700"
                                >
                                    Edit Appointment
                                </Button>
                            )}

                            {canCancelAppointment && (
                                <Button
                                    type="primary"
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={handleCancelAppointment}
                                    className="bg-red-600 border-red-600 hover:bg-red-700"
                                >
                                    Cancel Appointment
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <Row gutter={[24, 24]}>
                    {/* Left Column - Doctor & Appointment Info */}
                    <Col xs={24} lg={16}>
                        {/* Doctor Information */}
                        <Card
                            className="mb-6"
                            title={
                                <div className="flex items-center">
                                    <UserOutlined className="mr-2 text-blue-600" />
                                    Doctor Information
                                </div>
                            }
                        >
                            <div className="flex items-center space-x-4 mb-4">
                                <Avatar
                                    size={80}
                                    src={appointment.doctor.profileImageUrl}
                                    className="bg-blue-600 border-2 border-blue-100"
                                    icon={<UserOutlined />}
                                />
                                <div className="flex-1">
                                    <Title level={3} className="mb-1 mt-0">
                                        Dr. {appointment.doctor.name}
                                    </Title>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <Tooltip title="Email">
                                            <div className="flex items-center text-gray-600">
                                                <MailOutlined className="mr-1" />
                                                <Text className="text-sm">{appointment.doctor.email}</Text>
                                            </div>
                                        </Tooltip>
                                        <Tooltip title="Phone">
                                            <div className="flex items-center text-gray-600">
                                                <PhoneOutlined className="mr-1" />
                                                <Text className="text-sm">{appointment.doctor.phone}</Text>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Text strong>Gender: </Text>
                                    <Text className="capitalize">{appointment.doctor.gender.toLowerCase()}</Text>
                                </Col>
                                <Col span={12}>
                                    <Text strong>Date of Birth: </Text>
                                    <Text>
                                        {appointment.doctor.dateOfBirth
                                            ? dayjs(appointment.doctor.dateOfBirth).format("MMM DD, YYYY")
                                            : "N/A"}
                                    </Text>
                                </Col>
                                <Col span={12}>
                                    <Text strong>Specialities: </Text>
                                    <Text>
                                        {appointment.doctor.specialityList &&
                                        appointment.doctor.specialityList.length > 0
                                            ? appointment.doctor.specialityList.join(", ")
                                            : "General Practice"}
                                    </Text>
                                </Col>
                                <Col span={12}>
                                    <Text strong>Languages: </Text>
                                    <Text>
                                        {appointment.doctor.languageList && appointment.doctor.languageList.length > 0
                                            ? appointment.doctor.languageList.join(", ")
                                            : "English"}
                                    </Text>
                                </Col>
                            </Row>

                            {appointment.doctor.qualifications && (
                                <>
                                    <Divider />
                                    <div>
                                        <Text strong>Qualifications: </Text>
                                        <Paragraph className="mt-1">{appointment.doctor.qualifications}</Paragraph>
                                    </div>
                                </>
                            )}
                        </Card>

                        {/* Facility Information */}
                        {appointment.doctor.facility && (
                            <Card
                                className="mb-6"
                                title={
                                    <div className="flex items-center">
                                        <HomeOutlined className="mr-2 text-blue-600" />
                                        Facility Information
                                    </div>
                                }
                            >
                                <div className="flex items-center space-x-4 mb-4">
                                    <Avatar
                                        size={60}
                                        src={appointment.doctor.facility.thumbnailUrl}
                                        className="bg-green-600 border-2 border-green-100"
                                        icon={<HomeOutlined />}
                                    />
                                    <div className="flex-1">
                                        <Title level={4} className="mb-1 mt-0">
                                            {appointment.doctor.facility.name}
                                        </Title>
                                        <Tag color="green">{appointment.doctor.facility.facilityType}</Tag>
                                    </div>
                                </div>

                                <Divider />

                                <Row gutter={[16, 16]}>
                                    <Col span={24}>
                                        <div className="flex items-center text-gray-600 mb-2">
                                            <EnvironmentOutlined className="mr-2" />
                                            <Text>{appointment.doctor.facility.address}</Text>
                                        </div>
                                        <div className="flex items-center text-gray-600 mb-2">
                                            <Text>
                                                {appointment.doctor.facility.city}, {appointment.doctor.facility.state}
                                            </Text>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <PhoneOutlined className="mr-2" />
                                            <Text>{appointment.doctor.facility.telephone}</Text>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        )}

                        {/* Appointment Information */}
                        <Card
                            className="mb-6"
                            title={
                                <div className="flex items-center">
                                    <CalendarOutlined className="mr-2 text-blue-600" />
                                    Appointment Information
                                </div>
                            }
                        >
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <CalendarOutlined className="text-2xl text-blue-600 mb-2" />
                                        <div className="text-xl font-semibold text-blue-800">
                                            {parseTimestamp(appointment.appointmentDateTime).format("MMMM DD, YYYY")}
                                        </div>
                                        <div className="text-lg text-blue-600">
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
                                    <Text strong>Patient: </Text>
                                    <Text>{appointment.patient.name}</Text>
                                </Col>
                                <Col span={12}>
                                    <Text strong>Consultation Mode: </Text>
                                    <Tag color={appointment.consultationMode === "VIRTUAL" ? "blue" : "green"}>
                                        {appointment.consultationMode}
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
                                        <Text>
                                            {parseTimestamp(appointment.completedAt).format("MMM DD, YYYY h:mm A")}
                                        </Text>
                                    </Col>
                                )}
                                {appointment.cancelledBy && (
                                    <Col span={12}>
                                        <Text strong>Cancelled By: </Text>
                                        <Text>{appointment.cancelledBy}</Text>
                                    </Col>
                                )}
                            </Row>

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

                    {/* Right Column - Notes & Documents */}
                    <Col xs={24} lg={8}>
                        {/* Notes Section */}
                        <Card
                            className="mb-6"
                            title={
                                <div className="flex items-center">
                                    <FileTextOutlined className="mr-2 text-blue-600" />
                                    Notes & Reasons
                                </div>
                            }
                        >
                            {appointment.reasonForVisit && (
                                <div className="mb-4">
                                    <Text strong className="text-blue-600">
                                        Reason for Visit:
                                    </Text>
                                    <Paragraph className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded">
                                        {appointment.reasonForVisit}
                                    </Paragraph>
                                </div>
                            )}

                            {appointment.patientNotes && (
                                <div className="mb-4">
                                    <Text strong className="text-green-600">
                                        Your Notes:
                                    </Text>
                                    <Paragraph className="mt-1 p-3 bg-green-50 border border-green-200 rounded">
                                        {appointment.patientNotes}
                                    </Paragraph>
                                </div>
                            )}

                            {appointment.doctorNotes && (
                                <div>
                                    <Text strong className="text-orange-600">
                                        Doctor Notes:
                                    </Text>
                                    <Paragraph className="mt-1 p-3 bg-orange-50 border border-orange-200 rounded">
                                        {appointment.doctorNotes}
                                    </Paragraph>
                                </div>
                            )}

                            {!appointment.reasonForVisit && !appointment.patientNotes && !appointment.doctorNotes && (
                                <div className="text-center py-4">
                                    <FileTextOutlined className="text-4xl text-gray-300 mb-2" />
                                    <Text className="text-gray-500">No notes available</Text>
                                </div>
                            )}
                        </Card>

                        {/* Attached Documents */}
                        <Card
                            title={
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FileOutlined className="mr-2 text-blue-600" />
                                        Attached Documents
                                    </div>
                                    <Badge count={appointment.attachedDocuments.length} color="blue" />
                                </div>
                            }
                        >
                            {appointment.attachedDocuments.length === 0 ? (
                                <div className="text-center py-6">
                                    <FileOutlined className="text-4xl text-gray-300 mb-2" />
                                    <div>
                                        <Text className="text-gray-500">No documents attached</Text>
                                    </div>
                                </div>
                            ) : (
                                <List
                                    dataSource={appointment.attachedDocuments}
                                    renderItem={(docItem) => (
                                        <List.Item className="px-0">
                                            <Card
                                                size="small"
                                                className="w-full hover:shadow-md transition-shadow"
                                                styles={{ body: { padding: "12px" } }}
                                            >
                                                <div className="space-y-3">
                                                    {/* Document Header */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                            <div className="text-xl flex-shrink-0">
                                                                {getFileIcon("pdf")}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <Tooltip title={docItem.documentName}>
                                                                    <Text strong className="block truncate text-sm">
                                                                        {docItem.documentName}
                                                                    </Text>
                                                                </Tooltip>
                                                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                                    <span>
                                                                        {getDocumentTypeDisplayName(
                                                                            docItem.documentType
                                                                        )}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span>PDF</span>
                                                                    <span>•</span>
                                                                    <span>{formatFileSize(docItem.documentSize)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-1 flex-shrink-0">
                                                            <Tooltip title="View Document">
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={<EyeOutlined />}
                                                                    onClick={() =>
                                                                        handleDocumentAction(docItem, "view")
                                                                    }
                                                                    className="text-blue-600 hover:text-blue-800"
                                                                />
                                                            </Tooltip>
                                                            <Tooltip title="Download Document">
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={<DownloadOutlined />}
                                                                    onClick={() =>
                                                                        handleDocumentAction(docItem, "download")
                                                                    }
                                                                    className="text-green-600 hover:text-green-800"
                                                                />
                                                            </Tooltip>
                                                        </div>
                                                    </div>

                                                    {/* Document Metadata */}
                                                    <div className="pt-2 border-t border-gray-100">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-gray-500">
                                                                {parseTimestamp(docItem.createdAt).format(
                                                                    "MMM DD, YYYY"
                                                                )}
                                                            </span>
                                                        </div>

                                                        {docItem.notes && (
                                                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                                                <Text className="text-gray-700">
                                                                    <strong>Note:</strong> {docItem.notes}
                                                                </Text>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Document Preview Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        <EyeOutlined className="mr-2" />
                        Document Preview
                    </div>
                }
                open={previewModal}
                onCancel={() => setPreviewModal(false)}
                footer={[
                    <Button
                        key="download"
                        icon={<DownloadOutlined />}
                        onClick={() =>
                            selectedDocument?.documentUrl && window.open(selectedDocument.documentUrl, "_blank")
                        }
                        disabled={!selectedDocument?.documentUrl}
                    >
                        Download
                    </Button>,
                    <Button key="close" onClick={() => setPreviewModal(false)}>
                        Close
                    </Button>,
                ]}
                width="80vw"
                style={{ maxWidth: "1200px" }}
                centered
            >
                {selectedDocument && renderDocumentPreview(selectedDocument)}
            </Modal>

            {/* Update Appointment Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        <EditOutlined className="mr-2" />
                        Update Appointment
                    </div>
                }
                open={updateModal}
                onCancel={() => {
                    setUpdateModal(false);
                    updateForm.resetFields();
                    setSelectedDocuments([]);
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setUpdateModal(false);
                            updateForm.resetFields();
                            setSelectedDocuments([]);
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={updateLoading}
                        onClick={() => updateForm.submit()}
                        className="bg-blue-600 border-blue-600 hover:bg-blue-700"
                    >
                        Update Appointment
                    </Button>,
                ]}
                width={800}
                centered
                destroyOnHidden
            >
                <Form form={updateForm} layout="vertical" onFinish={handleUpdateAppointment} className="mt-4">
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label="Reason for Visit"
                                name="reasonForVisit"
                                rules={[
                                    {
                                        max: 500,
                                        message: "Reason for visit cannot exceed 500 characters",
                                    },
                                ]}
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Describe the reason for your visit"
                                    showCount
                                    maxLength={500}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label="Patient Notes"
                                name="patientNotes"
                                rules={[
                                    {
                                        max: 1000,
                                        message: "Patient notes cannot exceed 1000 characters",
                                    },
                                ]}
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Add any additional notes or information"
                                    showCount
                                    maxLength={1000}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {availableDocuments.length > 0 ? (
                        <>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        label="Select Documents"
                                        name="selectedDocuments"
                                        help="Choose documents from your health reports to attach to this appointment"
                                    >
                                        <Select
                                            mode="multiple"
                                            placeholder="Select documents to attach"
                                            loading={documentsLoading}
                                            allowClear
                                            showSearch
                                            onChange={(value: string[]) => {
                                                setSelectedDocuments(value || []);
                                            }}
                                            filterOption={(input, option) =>
                                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                            }
                                            options={availableDocuments.map((doc) => ({
                                                value: doc.id,
                                                label: doc.documentName,
                                                key: doc.id,
                                            }))}
                                            optionRender={(option) => {
                                                const doc = availableDocuments.find((d) => d.id === option.value);
                                                if (!doc) return option.label;

                                                return (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="text-lg">
                                                                {getFileIcon(doc.documentType)}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-sm">
                                                                    {doc.documentName}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {getDocumentTypeDisplayName(doc.documentType)} •{" "}
                                                                    {doc.documentType.toUpperCase()} •{" "}
                                                                    {formatFileSize(doc.documentSize)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Individual Document Notes */}
                            {selectedDocuments.length > 0 && (
                                <div>
                                    <Text strong className="text-gray-700 mb-2 block">
                                        Document Notes
                                    </Text>
                                    <Text className="text-gray-500 text-sm mb-4 block">
                                        Add specific notes for each selected document
                                    </Text>
                                    {selectedDocuments.map((docId) => {
                                        const doc = availableDocuments.find((d) => d.id === docId);
                                        if (!doc) return null;

                                        return (
                                            <Row gutter={16} key={docId} className="mb-4">
                                                <Col span={24}>
                                                    <Card size="small" className="border border-gray-200">
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <div className="flex-1">
                                                                <Text strong className="text-sm">
                                                                    {doc.documentName}
                                                                </Text>
                                                                <div className="text-xs text-gray-500">
                                                                    {getDocumentTypeDisplayName(doc.documentType)} •{" "}
                                                                    {doc.documentType.toUpperCase()} •{" "}
                                                                    {formatFileSize(doc.documentSize)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Form.Item name={`documentNote_${docId}`} className="mb-3">
                                                            <Input.TextArea
                                                                rows={2}
                                                                placeholder={`Add notes for ${doc.documentName}...`}
                                                                maxLength={500}
                                                                showCount
                                                            />
                                                        </Form.Item>
                                                    </Card>
                                                </Col>
                                            </Row>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : !documentsLoading ? (
                        <Alert
                            message="No Documents Available"
                            description="You don't have any health reports to attach. You can upload documents from your profile."
                            type="info"
                            showIcon
                            className="mb-4"
                        />
                    ) : null}
                </Form>
            </Modal>

            {/* Cancel Appointment Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        <CloseCircleOutlined className="mr-2 text-red-600" />
                        Cancel Appointment
                    </div>
                }
                open={cancelModal}
                onCancel={() => {
                    setCancelModal(false);
                    cancelForm.resetFields();
                }}
                footer={null}
                width={500}
                centered
            >
                {appointment && (
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <ExclamationCircleOutlined className="text-red-600 mr-2" />
                                <Text strong className="text-red-800">
                                    Are you sure you want to cancel this appointment?
                                </Text>
                            </div>
                            <div className="mt-2 text-sm text-red-700">
                                This action cannot be undone. The appointment with Dr. {appointment.doctor.name} on{" "}
                                {parseTimestamp(appointment.appointmentDateTime).format("MMMM DD, YYYY at h:mm A")} will
                                be permanently cancelled.
                            </div>
                        </div>

                        <Form form={cancelForm} layout="vertical" onFinish={handleCancelSubmit}>
                            <Form.Item
                                name="reason"
                                label="Cancellation Reason (Optional)"
                                extra="Please provide a reason for cancelling this appointment. This helps us improve our service."
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="e.g., Schedule conflict, feeling better, need to reschedule..."
                                    maxLength={500}
                                    showCount
                                    className="mb-6"
                                />
                            </Form.Item>

                            <div className="flex justify-end space-x-2 border-t pt-4">
                                <Button
                                    onClick={() => {
                                        setCancelModal(false);
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
                                    icon={<CloseCircleOutlined />}
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
