"use client";

import { useState, useEffect } from "react";
import { Modal, Typography, Descriptions, Tag, Button, Divider, Alert, Spin } from "antd";
import { FileText, Lock, Calendar, Maximize2, Minimize2, RefreshCw } from "lucide-react";
import { DocumentDetailModalProps } from "../props";
import { DocumentType } from "@/app/api/props";
import { formatFileSize } from "@/app/utils/FileSizeUtils";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
    document,
    isVisible,
    onClose,
    isViewingOwnDocuments,
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState<number>(0);

    // Reset iframe states when document changes
    useEffect(() => {
        if (document?.documentUrl) {
            setLoading(true);
            setError(null);
            setRetryCount(0);
        }
    }, [document?.id, document?.documentUrl]);

    // Reset fullscreen when modal closes
    useEffect(() => {
        if (!isVisible) {
            setIsFullscreen(false);
        }
    }, [isVisible]);

    if (!document) return null;

    const handleRetry = () => {
        setRetryCount((prev) => prev + 1);
        setLoading(true);
        setError(null);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Format dates
    const formatDate = (dateString: string) => {
        return dayjs(dateString).format("MMMM DD, YYYY HH:mm");
    };

    const formatDateOnly = (dateString: string) => {
        return dayjs(dateString).format("MMMM DD, YYYY");
    };

    // Check if access is expired
    const isAccessExpired = () => {
        if (!document.documentAccess?.expiryDate) return false;
        const expiryDate = dayjs(document.documentAccess?.expiryDate);
        const today = dayjs();
        return expiryDate.isBefore(today);
    };

    // Check if user can view the document
    const canViewDocument = () => {
        if (isViewingOwnDocuments) return true;
        return document.documentAccess.canView && !isAccessExpired();
    };

    // Get document type color
    const getDocumentTypeColor = (type: DocumentType | undefined) => {
        if (!type) return "default";
        switch (type) {
            case DocumentType.PRESCRIPTION:
                return "green";
            case DocumentType.LAB_REPORT:
                return "blue";
            case DocumentType.RADIOLOGY_REPORT:
                return "purple";
            case DocumentType.DISCHARGE_SUMMARY:
                return "orange";
            default:
                return "default";
        }
    };

    // Get document type display name
    const getDocumentTypeDisplayName = (type: DocumentType | undefined) => {
        if (!type) return "Unknown";
        return type
            .toString()
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Calculate days until expiry
    const getDaysUntilExpiry = () => {
        if (!document.documentAccess?.expiryDate) return null;
        const expiryDate = dayjs(document.documentAccess?.expiryDate);
        const today = dayjs();
        const diffDays = expiryDate.diff(today, "day");
        return diffDays;
    };

    // Check if the document URL is valid
    const isValidDocumentUrl = (url: string) => {
        if (!url || url.trim() === "") return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const daysUntilExpiry = getDaysUntilExpiry();
    const expired = isAccessExpired();
    const canView = canViewDocument();
    const isValidUrl = isValidDocumentUrl(document.documentUrl || "");

    const getExpiryTextType = () => {
        if (expired) {
            return "danger";
        }
        if (daysUntilExpiry !== null && daysUntilExpiry <= 7) {
            return "warning";
        }
        return "secondary";
    };

    // Handle actions
    // Render document viewer
    const renderDocumentViewer = () => {
        if (!canView || !document.documentUrl) {
            return (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <Text>
                        {!canView
                            ? "You don't have permission to view this document."
                            : "Document not available for viewing."}
                    </Text>
                </div>
            );
        }

        return (
            <div
                className="relative border rounded bg-gray-50"
                style={{ height: isFullscreen ? "calc(100vh - 120px)" : "400px" }}
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                        <Spin size="large" />
                        <div className="ml-3">
                            <Text className="text-sm text-gray-600">Loading document...</Text>
                        </div>
                    </div>
                )}

                {error || !isValidUrl ? (
                    <div className="flex items-center justify-center h-full p-4">
                        <Alert
                            message="Document Display Issue"
                            description={
                                <div className="space-y-2">
                                    <p>{error || "Invalid document URL. The document link may have expired."}</p>
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
                                <div className="flex flex-col gap-2">
                                    {retryCount < 2 && (
                                        <Button onClick={handleRetry} icon={<RefreshCw className="w-4 h-4" />}>
                                            Retry Loading
                                        </Button>
                                    )}
                                </div>
                            }
                        />
                    </div>
                ) : (
                    <div className="h-full">
                        <iframe
                            src={document.documentUrl}
                            className="w-full h-full border-0"
                            title={document.documentName}
                        />
                    </div>
                )}
            </div>
        );
    };

    // Fullscreen modal
    if (isFullscreen) {
        return (
            <Modal
                title={null}
                open={isVisible}
                onCancel={() => setIsFullscreen(false)}
                footer={null}
                width="100vw"
                style={{
                    maxWidth: "none",
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
                centered={false}
                destroyOnHidden={true}
                maskClosable={true}
                keyboard={true}
                zIndex={1100}
                getContainer={false}
            >
                <div className="h-full flex flex-col bg-white">
                    {/* Fullscreen Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-white">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-blue-500" />
                            <div>
                                <Title level={4} className="m-0">
                                    {document.documentName}
                                </Title>
                                <Tag color={getDocumentTypeColor(document.documentType)} className="text-sm mt-1">
                                    {getDocumentTypeDisplayName(document.documentType)}
                                </Tag>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {error && retryCount < 2 && (
                                <Button
                                    icon={<RefreshCw className="w-4 h-4" />}
                                    onClick={handleRetry}
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
                    <div className="flex-1 p-4">{renderDocumentViewer()}</div>
                </div>
            </Modal>
        );
    }

    // Regular modal
    return (
        <Modal
            open={isVisible}
            title={
                <div className="flex items-center gap-3">
                    <FileText className="text-blue-500 text-xl w-5 h-5" />
                    <Title level={4} className="m-0">
                        Document Details
                    </Title>
                </div>
            }
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="close" onClick={onClose}>
                    Close
                </Button>,
            ]}
        >
            <div className="py-2">
                {/* Header with Document Name and Type */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-3">
                    <div>
                        <Title level={5} className="m-0 text-blue-800 mb-2">
                            {document.documentName}
                        </Title>
                        <Tag color={getDocumentTypeColor(document.documentType)} className="text-sm">
                            {getDocumentTypeDisplayName(document.documentType)}
                        </Tag>
                    </div>
                    {!canView && (
                        <Tag color="red" icon={<Lock className="w-3 h-3" />} className="text-sm">
                            No Access
                        </Tag>
                    )}
                </div>

                {/* Access Status Alerts */}
                {!isViewingOwnDocuments && expired && (
                    <Alert
                        message="Access Expired"
                        description="Your access to this document has expired and you can no longer view or download it."
                        type="error"
                        showIcon
                        className="mb-4"
                    />
                )}

                {!isViewingOwnDocuments &&
                    !expired &&
                    daysUntilExpiry !== null &&
                    daysUntilExpiry <= 7 &&
                    daysUntilExpiry > 0 && (
                        <Alert
                            message={`Access expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"}`}
                            description="Your access to this document will expire soon."
                            type="warning"
                            showIcon
                            className="mb-4"
                        />
                    )}

                {!canView && !expired && (
                    <Alert
                        message="Access Denied"
                        description="You do not have permission to view this document."
                        type="info"
                        showIcon
                        className="mb-4"
                    />
                )}

                <Divider className="my-4" />

                {/* Basic Information */}
                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small">
                    <Descriptions.Item label="Document Name" span={2}>
                        <Text strong>{document.documentName}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Document Type">
                        <Tag color={getDocumentTypeColor(document.documentType)}>
                            {getDocumentTypeDisplayName(document.documentType)}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="File Size">
                        <Text>{formatFileSize(document.documentSize)}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Created Date">
                        <div className="flex items-center gap-1">
                            <Calendar className="text-gray-500 w-4 h-4" />
                            <Text>{formatDate(document.createdAt)}</Text>
                        </div>
                    </Descriptions.Item>

                    <Descriptions.Item label="Last Updated">
                        <div className="flex items-center gap-1">
                            <Calendar className="text-gray-500 w-4 h-4" />
                            <Text>{formatDate(document.updatedAt)}</Text>
                        </div>
                    </Descriptions.Item>

                    <Descriptions.Item label="Patient" span={2}>
                        <Text>{document.patient?.name}</Text>
                        {!isViewingOwnDocuments && (
                            <Text type="secondary" className="ml-2">
                                (NRIC: {document.patient?.nric})
                            </Text>
                        )}
                    </Descriptions.Item>
                </Descriptions>

                {/* Access Information */}
                <Divider className="my-4" />
                <Title level={5} className="mb-3">
                    Access Information
                </Title>

                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Can View Document">
                        <Tag color={document.documentAccess?.canView ? "green" : "red"}>
                            {document.documentAccess?.canView ? "Yes" : "No"}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Can Download Document">
                        <Tag color={document.documentAccess?.canAttach ? "green" : "red"}>
                            {document.documentAccess?.canAttach ? "Yes" : "No"}
                        </Tag>
                    </Descriptions.Item>

                    {document.documentAccess?.expiryDate && (
                        <Descriptions.Item label="Access Expires">
                            <div className="flex items-center gap-2">
                                <Text type={getExpiryTextType()}>
                                    {formatDateOnly(document.documentAccess?.expiryDate)}
                                </Text>
                                {expired && <Tag color="red">EXPIRED</Tag>}
                                {!expired && daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
                                    <Tag color="orange">EXPIRES SOON</Tag>
                                )}
                            </div>
                        </Descriptions.Item>
                    )}
                </Descriptions>

                {/* Document Preview */}
                {canView && document.documentUrl && (
                    <>
                        <Divider className="my-4" />
                        <div className="flex items-center justify-between mb-3">
                            <Title level={5} className="mb-0">
                                Document Preview
                            </Title>
                            <div className="flex items-center gap-2">
                                {error && retryCount < 2 && (
                                    <Button
                                        size="small"
                                        icon={<RefreshCw className="w-4 h-4" />}
                                        onClick={handleRetry}
                                        title="Retry Loading"
                                    >
                                        Retry
                                    </Button>
                                )}
                                <Button
                                    size="small"
                                    icon={<Maximize2 className="w-4 h-4" />}
                                    onClick={toggleFullscreen}
                                    title="View Fullscreen"
                                >
                                    Fullscreen
                                </Button>
                            </div>
                        </div>
                        {renderDocumentViewer()}
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <Text className="text-sm text-blue-700">
                                <strong>Tip:</strong> Click the fullscreen button for a better viewing experience.
                                Document URLs expire after 10 minutes for security.
                            </Text>
                        </div>
                    </>
                )}

                {/* Document Access Info (when can't view) */}
                {!canView && (
                    <>
                        <Divider className="my-4" />
                        <div>
                            <Title level={5} className="mb-3">
                                Document Access
                            </Title>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <Text>
                                    {expired
                                        ? "Your access to this document has expired. You can no longer view or download it."
                                        : "You don't have permission to view this document. Contact the patient to request access."}
                                </Text>
                            </div>
                        </div>
                    </>
                )}

                {/* Security Notice */}
                <Divider className="my-4" />
                <div className="bg-blue-50 p-4 rounded-lg">
                    <Text strong className="block mb-2 text-blue-800">
                        Security & Privacy
                    </Text>
                    <ul className="text-sm text-blue-700 space-y-1 mb-0">
                        <li>• All documents are encrypted and stored securely</li>
                        <li>• Access permissions are enforced at all times</li>
                        <li>• Document access is logged for security purposes</li>
                        {!isViewingOwnDocuments && (
                            <li>• You can only access documents shared with you by the patient</li>
                        )}
                    </ul>
                </div>
            </div>
        </Modal>
    );
};

export default DocumentDetailModal;
