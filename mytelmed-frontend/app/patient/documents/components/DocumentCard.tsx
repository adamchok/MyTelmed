"use client";

import { Card, Typography, Button, Tag, Tooltip, Popconfirm, Alert, Checkbox } from "antd";
import { FileText, Edit, Trash2, Settings, Download, Eye, Lock, User, Calendar } from "lucide-react";
import { DocumentCardProps } from "../props";
import { Document } from "@/app/api/document/props";
import { DocumentType } from "@/app/api/props";
import { formatFileSize } from "@/app/utils/FileSizeUtils";
import dayjs from "dayjs";

const { Text, Title } = Typography;

interface DocumentCardPropsExtended extends DocumentCardProps {
    onViewDetails?: (document: Document) => void;
    isSelected?: boolean;
    canSelectForComparison?: boolean;
}

const DocumentCard: React.FC<DocumentCardPropsExtended> = ({
    document,
    isViewingOwnDocuments,
    onDelete,
    onUpdate,
    onUpdateAccess,
    onRevokeAllAccess,
    onDownload,
    onViewDetails,
    onAddToComparison,
    onRemoveFromComparison,
    isSelected = false,
    canSelectForComparison = false,
}) => {
    const { id, documentName, documentType, documentSize, documentAccess, patient, createdAt, updatedAt } = document;

    // Format the dates
    const formatDate = (dateString: string) => {
        return dayjs(dateString).format("MMM DD, YYYY");
    };

    // Check if access is expired
    const isAccessExpired = () => {
        if (!documentAccess.expiryDate) return false;
        const expiryDate = dayjs(documentAccess.expiryDate);
        const today = dayjs();
        return expiryDate.isBefore(today);
    };

    // Check if user can view the document
    const canViewDocument = () => {
        if (isViewingOwnDocuments) return true;
        return documentAccess.canView && !isAccessExpired();
    };

    // Check if user can download the document
    const canDownloadDocument = () => {
        if (isViewingOwnDocuments) return true;
        return documentAccess.canAttach && !isAccessExpired();
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
        if (!documentAccess.expiryDate) return null;
        const expiryDate = dayjs(documentAccess.expiryDate);
        const today = dayjs();
        const diffDays = expiryDate.diff(today, "day");
        return diffDays;
    };

    const daysUntilExpiry = getDaysUntilExpiry();
    const expired = isAccessExpired();
    const canView = canViewDocument();

    const getExpiryTextType = () => {
        if (expired) {
            return "danger";
        }
        if (daysUntilExpiry !== null && daysUntilExpiry <= 7) {
            return "warning";
        }
        return "secondary";
    };

    const handleDelete = () => {
        onDelete(id);
    };

    const handleUpdate = () => {
        onUpdate(id, { documentName });
    };

    const handleUpdateAccess = () => {
        onUpdateAccess(id);
    };

    const handleDownload = () => {
        onDownload(id);
    };

    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(document);
        }
    };

    const handleAddToComparison = () => {
        if (onAddToComparison) {
            onAddToComparison(document);
        }
    };

    const handleRemoveFromComparison = () => {
        if (onRemoveFromComparison) onRemoveFromComparison(document);
    };

    const handleRevokeAllAccess = () => {
        if (onRevokeAllAccess) onRevokeAllAccess(document.id);
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Only handle card clicks when in comparison mode and user can view the document
        if (canSelectForComparison && canView) {
            // Prevent triggering if clicking on buttons or checkbox
            const target = e.target as HTMLElement;
            if (target.closest("button") || target.closest(".ant-checkbox") || target.closest(".ant-popconfirm")) {
                return;
            }

            if (isSelected) {
                handleRemoveFromComparison();
            } else {
                handleAddToComparison();
            }
        }
    };

    return (
        <Card
            className={`w-full hover:shadow-md transition-all duration-200 mb-4 border-2 shadow-sm bg-white ${
                isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
            } ${canSelectForComparison && canView ? "cursor-pointer" : ""}`}
            styles={{ body: { padding: "20px" } }}
            data-testid={`document-card-${id}`}
            onClick={handleCardClick}
        >
            {/* Access Expired Warning */}
            {!isViewingOwnDocuments && expired && (
                <Alert
                    message="Access Expired"
                    description="Your access to this document has expired"
                    type="warning"
                    showIcon
                    className="mb-4"
                />
            )}

            {/* Access Expiring Soon Warning */}
            {!isViewingOwnDocuments &&
                !expired &&
                daysUntilExpiry !== null &&
                daysUntilExpiry <= 7 &&
                daysUntilExpiry > 0 && (
                    <Alert
                        message={`Access expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"}`}
                        type="warning"
                        showIcon
                        className="mb-4"
                    />
                )}

            <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-grow">
                    {/* Header with Document Info */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                        <div className="flex items-center gap-3">
                            {canSelectForComparison && canView && (
                                <Checkbox
                                    checked={isSelected}
                                    onChange={(e) =>
                                        e.target.checked ? handleAddToComparison() : handleRemoveFromComparison()
                                    }
                                    className="mr-2"
                                />
                            )}
                            <div className="text-4xl text-blue-500">
                                <FileText className="w-10 h-10" />
                            </div>
                            <div>
                                <Title level={5} className="m-0 mb-2 text-base sm:text-lg text-blue-800">
                                    {documentName}
                                </Title>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <Text>{formatDate(createdAt)}</Text>
                                    </div>
                                    <span>•</span>
                                    <Text>{formatFileSize(documentSize)}</Text>
                                    <span>•</span>
                                    <Tag color={getDocumentTypeColor(documentType)}>
                                        {getDocumentTypeDisplayName(documentType)}
                                    </Tag>
                                    {!canView && (
                                        <Tag color="red" icon={<Lock className="w-3 h-3" />}>
                                            No Access
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Patient Info (when viewing family member's documents) */}
                    {!isViewingOwnDocuments && (
                        <div className="mb-3 ml-12">
                            <div className="flex items-center text-sm text-gray-600">
                                <User className="w-4 h-4 mr-1" />
                                <Text>Patient: {patient.name}</Text>
                            </div>
                        </div>
                    )}

                    {/* Access Information (when viewing family member's documents) */}
                    {!isViewingOwnDocuments && (
                        <div className="mb-3 ml-12">
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center">
                                    <Text type="secondary">Can View: {documentAccess.canView ? "Yes" : "No"}</Text>
                                </div>
                                <div className="flex items-center">
                                    <Text type="secondary">
                                        Can Download: {documentAccess.canAttach ? "Yes" : "No"}
                                    </Text>
                                </div>
                                {documentAccess.expiryDate && (
                                    <div className="flex items-center">
                                        <Text type={getExpiryTextType()}>
                                            Expires: {formatDate(documentAccess.expiryDate)}
                                        </Text>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Last Updated */}
                    <div className="ml-12">
                        <Text type="secondary" className="text-xs">
                            Last updated: {formatDate(updatedAt)}
                        </Text>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 min-w-[120px]">
                    {canView && (
                        <Tooltip title="View Details">
                            <Button
                                type="primary"
                                icon={<Eye className="w-4 h-4" />}
                                onClick={handleViewDetails}
                                className="w-full text-xs sm:text-sm"
                                size="middle"
                            >
                                View
                            </Button>
                        </Tooltip>
                    )}

                    {canDownloadDocument() && (
                        <Tooltip title="Download">
                            <Button
                                icon={<Download className="w-4 h-4" />}
                                onClick={handleDownload}
                                className="w-full text-xs sm:text-sm"
                                size="middle"
                            >
                                Download
                            </Button>
                        </Tooltip>
                    )}

                    {/* Own documents - full management */}
                    {isViewingOwnDocuments && (
                        <>
                            <Tooltip title="Manage Access">
                                <Button
                                    icon={<Settings className="w-4 h-4" />}
                                    onClick={handleUpdateAccess}
                                    className="w-full text-xs sm:text-sm"
                                    size="middle"
                                >
                                    Access
                                </Button>
                            </Tooltip>

                            <Tooltip title="Edit">
                                <Button
                                    icon={<Edit className="w-4 h-4" />}
                                    onClick={handleUpdate}
                                    className="w-full text-xs sm:text-sm"
                                    size="middle"
                                >
                                    Edit
                                </Button>
                            </Tooltip>

                            <Tooltip title="Delete">
                                <Popconfirm
                                    title="Delete this document?"
                                    description="This action cannot be undone."
                                    onConfirm={handleDelete}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        icon={<Trash2 className="w-4 h-4" />}
                                        danger
                                        className="w-full text-xs sm:text-sm"
                                        size="middle"
                                    >
                                        Delete
                                    </Button>
                                </Popconfirm>
                            </Tooltip>

                            <Tooltip title="Revoke All Access">
                                <Popconfirm
                                    title="Revoke all access to this document?"
                                    description="This will remove access for all family members."
                                    onConfirm={handleRevokeAllAccess}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        icon={<Lock className="w-4 h-4" />}
                                        danger
                                        className="w-full text-xs sm:text-sm"
                                        size="middle"
                                    >
                                        Revoke Access
                                    </Button>
                                </Popconfirm>
                            </Tooltip>
                        </>
                    )}

                    {/* Family member documents - limited access */}
                    {!isViewingOwnDocuments && !canView && (
                        <Tooltip title="Access Denied">
                            <Button
                                icon={<Lock className="w-4 h-4" />}
                                disabled
                                className="w-full text-xs sm:text-sm"
                                size="middle"
                            >
                                No Access
                            </Button>
                        </Tooltip>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default DocumentCard;
