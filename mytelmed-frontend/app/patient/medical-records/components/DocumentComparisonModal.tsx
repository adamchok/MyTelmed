"use client";

import { useState, useEffect } from "react";
import { Modal, Typography, Button, Card, Tag, Alert, Spin } from "antd";
import { X, FileText, Calendar, User, Maximize2, Minimize2, RefreshCw } from "lucide-react";
import { Document } from "@/app/api/document/props";
import { DocumentType } from "@/app/api/props";
import { formatFileSize } from "@/app/utils/FileSizeUtils";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface DocumentComparisonModalProps {
    documents: Document[];
    isVisible: boolean;
    onClose: () => void;
    onDownload?: (documentId: string) => void;
}

interface DocumentViewerProps {
    document: Document;
    onRemove: () => void;
    onDownload?: () => void;
    isFullscreen?: boolean;
    onToggleFullscreen?: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
    document,
    onRemove,
    onDownload,
    isFullscreen = false,
    onToggleFullscreen,
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState<number>(0);
    const [iframeKey, setIframeKey] = useState<number>(0);

    const handleLoad = () => {
        setLoading(false);
        setError(null);
    };

    const handleError = () => {
        setLoading(false);

        // Provide more specific error messages based on common issues
        if (retryCount === 0) {
            setError("Document failed to load. This might be due to URL expiry or browser security restrictions.");
        } else {
            setError("Unable to display document in browser. Please download the document to view it.");
        }
    };

    const handleRetry = () => {
        setRetryCount((prev) => prev + 1);
        setLoading(true);
        setError(null);
        setIframeKey((prev) => prev + 1); // Force iframe recreation
    };

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

    const getDocumentTypeDisplayName = (type: DocumentType | undefined) => {
        if (!type) return "Unknown";
        return type
            .toString()
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format("MMM DD, YYYY");
    };

    // Check if the document URL is valid and not expired
    const isValidDocumentUrl = (url: string) => {
        if (!url || url.trim() === "") return false;

        // Check if it's a valid URL
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const documentUrl = document.documentUrl;
    const isValidUrl = isValidDocumentUrl(documentUrl);

    // Reset states when document changes
    useEffect(() => {
        setLoading(true);
        setError(null);
        setRetryCount(0);
        setIframeKey((prev) => prev + 1);
    }, [document.id]);

    return (
        <Card
            className="h-full flex flex-col"
            styles={{ body: { padding: "12px", height: "100%", display: "flex", flexDirection: "column" } }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <Title level={5} className="m-0 text-sm truncate">
                            {document.documentName}
                        </Title>
                        <div className="flex items-center gap-2 mt-1">
                            <Tag color={getDocumentTypeColor(document.documentType)} className="text-xs">
                                {getDocumentTypeDisplayName(document.documentType)}
                            </Tag>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <Text className="text-xs">{formatDate(document.createdAt)}</Text>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {onToggleFullscreen && (
                        <Button
                            type="text"
                            size="small"
                            icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            onClick={onToggleFullscreen}
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        />
                    )}
                    <Button
                        type="text"
                        size="small"
                        icon={<X className="w-4 h-4" />}
                        onClick={onRemove}
                        title={isFullscreen ? "Exit Fullscreen" : "Remove from comparison"}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-3 gap-2">
                <div className="flex items-center gap-1">
                    {error && retryCount < 2 && (
                        <Button
                            type="text"
                            size="small"
                            icon={<RefreshCw className="w-4 h-4" />}
                            onClick={handleRetry}
                            title="Retry Loading"
                        />
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Text className="text-xs text-gray-500">{formatFileSize(document.documentSize)}</Text>
                </div>
            </div>

            {/* Document Viewer */}
            <div className="flex-1 overflow-auto border rounded bg-gray-50 relative">
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
                                    <Button type="primary" onClick={onDownload}>
                                        Download Document
                                    </Button>
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
                            key={iframeKey}
                            src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                            className="w-full h-full border-0"
                            title={document.documentName}
                            onLoad={handleLoad}
                            onError={handleError}
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        />
                    </div>
                )}
            </div>

            {/* Patient Info */}
            <div className="mt-2 pt-2 border-t">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <Text className="text-xs">Patient: {document.patient?.name}</Text>
                    <span className="mx-1">•</span>
                    <Text className="text-xs">Size: {formatFileSize(document.documentSize)}</Text>
                </div>
            </div>
        </Card>
    );
};

const DocumentComparisonModal: React.FC<DocumentComparisonModalProps> = ({
    documents,
    isVisible,
    onClose,
    onDownload,
}) => {
    const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
    const [fullscreenDocument, setFullscreenDocument] = useState<string | null>(null);

    const handleModalOpen = () => {
        setSelectedDocuments(documents.slice(0, 4)); // Max 4 documents
    };

    const handleModalClose = () => {
        setSelectedDocuments([]);
        setFullscreenDocument(null);
        onClose();
    };

    useEffect(() => {
        if (isVisible) {
            handleModalOpen();
        }
    }, [documents, isVisible]);

    useEffect(() => {
        if (!isVisible) {
            setSelectedDocuments([]);
            setFullscreenDocument(null);
        }
    }, [isVisible]);

    const handleRemoveDocument = (documentId: string) => {
        setSelectedDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    };

    const handleDownloadDocument = (documentId: string) => {
        if (onDownload) {
            onDownload(documentId);
        }
    };

    const handleToggleFullscreen = (documentId: string) => {
        setFullscreenDocument((prev) => (prev === documentId ? null : documentId));
    };

    const getGridClass = () => {
        const count = selectedDocuments.length;
        if (count === 1) return "grid-cols-1";
        if (count === 2) return "grid-cols-2";
        if (count === 3) return "grid-cols-3";
        return "grid-cols-2"; // 4 documents in 2x2 grid
    };

    const getGridRows = () => {
        const count = selectedDocuments.length;
        if (count <= 2) return "grid-rows-1";
        return "grid-rows-2";
    };

    if (selectedDocuments.length === 0) {
        return (
            <Modal
                title="Document Comparison"
                open={isVisible}
                onCancel={handleModalClose}
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
                        padding: "40px",
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
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
                <div className="text-center py-8">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <Title level={4} className="text-gray-500">
                        No Documents Selected
                    </Title>
                    <Text className="text-gray-400">Please select 2-4 documents to compare them side by side.</Text>
                </div>
            </Modal>
        );
    }

    return (
        <>
            {/* Main comparison modal - now fullscreen by default */}
            <Modal
                title={null}
                open={isVisible && !fullscreenDocument}
                onCancel={handleModalClose}
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
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-white">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-blue-500" />
                            <Title level={4} className="m-0">
                                Document Comparison ({selectedDocuments.length} documents)
                            </Title>
                        </div>
                        <Button
                            type="text"
                            icon={<X className="w-5 h-5" />}
                            onClick={handleModalClose}
                            className="hover:bg-gray-100"
                            size="large"
                        >
                            Close Comparison
                        </Button>
                    </div>

                    {/* Document Grid */}
                    <div className="flex-1 p-4">
                        <div className={`grid ${getGridClass()} ${getGridRows()} gap-4 h-full`}>
                            {selectedDocuments.map((document) => (
                                <DocumentViewer
                                    key={document.id}
                                    document={document}
                                    onRemove={() => handleRemoveDocument(document.id)}
                                    onDownload={() => handleDownloadDocument(document.id)}
                                    onToggleFullscreen={() => handleToggleFullscreen(document.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Footer with tips */}
                    <div className="p-4 border-t bg-blue-50">
                        <Text className="text-sm text-blue-700">
                            <strong>Important:</strong> Document URLs expire after 10 minutes for security. If documents
                            fail to load, try refreshing the page or use the download button to view documents locally.
                            Some PDFs may not display properly in browsers due to security restrictions.
                        </Text>
                    </div>
                </div>
            </Modal>

            {/* Individual document fullscreen viewer */}
            {fullscreenDocument && (
                <Modal
                    title={null}
                    open={true}
                    onCancel={() => setFullscreenDocument(null)}
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
                        {selectedDocuments
                            .filter((doc) => doc.id === fullscreenDocument)
                            .map((document) => (
                                <DocumentViewer
                                    key={document.id}
                                    document={document}
                                    onRemove={() => setFullscreenDocument(null)}
                                    onDownload={() => handleDownloadDocument(document.id)}
                                    isFullscreen={true}
                                    onToggleFullscreen={() => setFullscreenDocument(null)}
                                />
                            ))}
                    </div>
                </Modal>
            )}
        </>
    );
};

export default DocumentComparisonModal;
