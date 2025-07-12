"use client";

import { useState } from "react";
import {
    Typography,
    Select,
    Input,
    Pagination,
    Empty,
    DatePicker,
    Button,
    Spin,
    Divider,
    Card,
    Alert,
    Row,
    Col,
    Statistic,
    Tooltip,
    message,
} from "antd";
import { Search, Filter, X, FileText, Plus, Info, CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { MedicalRecordsComponentProps } from "./props";
import DocumentCard from "./components/DocumentCard";
import DocumentDetailModal from "./components/DocumentDetailModal";
import AccessModal from "./components/AccessModal";
import { DocumentType } from "@/app/api/props";
import { Document } from "@/app/api/document/props";
import dayjs from "dayjs";
import EditDocumentModal from "./components/EditDocumentModal";
import DocumentUpload from "./components/DocumentUpload";
import DocumentComparisonModal from "./components/DocumentComparisonModal";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const MedicalRecordsComponent: React.FC<MedicalRecordsComponentProps> = ({
    documents,
    filteredDocuments,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    filters,
    documentTypeOptions,
    searchQuery,
    patientOptions,
    selectedPatientId,
    isViewingOwnDocuments,
    onUploadDocument,
    onDeleteDocument,
    onUpdateDocument,
    onUpdateAccess,
    onRevokeAllAccess,
    onSearchChange,
    onFilterChange,
    onPageChange,
    onPatientChange,
    onRefresh,
    isLoading,
    error,
}) => {
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [accessModalVisible, setAccessModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Document comparison state
    const [comparisonMode, setComparisonMode] = useState(false);
    const [selectedForComparison, setSelectedForComparison] = useState<Document[]>([]);
    const [comparisonModalVisible, setComparisonModalVisible] = useState(false);

    // Helper functions to reduce cognitive complexity
    const handleViewDetails = (document: any) => {
        setSelectedDocument(document);
        setDetailModalVisible(true);
    };

    const handleManageAccess = (documentId: string) => {
        const document = documents.find((d) => d.id === documentId);
        if (document) {
            setSelectedDocument(document);
            setAccessModalVisible(true);
        }
    };

    const handleEditDocument = (documentId: string) => {
        const document = documents.find((d) => d.id === documentId);
        if (document) {
            setSelectedDocument(document);
            setEditModalVisible(true);
        }
    };

    const handleDownload = (documentId: string) => {
        const document = documents.find((d) => d.id === documentId);
        if (document?.documentUrl) {
            window.open(document.documentUrl, "_blank");
        }
    };

    const handleAddToComparison = (document: Document) => {
        if (selectedForComparison.length >= 4) {
            message.warning("You can compare up to 4 documents at a time");
            return;
        }
        setSelectedForComparison((prev) => [...prev, document]);
    };

    const handleRemoveFromComparison = (document: Document) => {
        setSelectedForComparison((prev) => prev.filter((d) => d.id !== document.id));
    };

    const handleToggleComparisonMode = () => {
        setComparisonMode(!comparisonMode);
        setSelectedForComparison([]);
    };

    const handleExitComparisonMode = () => {
        setComparisonMode(false);
        setSelectedForComparison([]);
    };

    const handleClearAllComparison = () => {
        setSelectedForComparison([]);
    };

    const handleStartComparison = async () => {
        if (selectedForComparison.length < 2) {
            message.warning("Please select at least 2 documents to compare");
            return;
        }

        // Refresh documents to get fresh URLs before comparison
        try {
            await onRefresh();
            setComparisonModalVisible(true);
        } catch (error) {
            console.error("Failed to refresh documents:", error);
            message.warning(
                "Failed to refresh document URLs. Proceeding with comparison, but some documents may not load properly."
            );
            setComparisonModalVisible(true);
        }
    };

    const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
        if (dates) {
            onFilterChange({ dateRange: dateStrings });
        } else {
            onFilterChange({ dateRange: undefined });
        }
    };

    const handleDocumentTypeChange = (values: DocumentType[]) => {
        onFilterChange({ documentType: values.length > 0 ? values : undefined });
    };

    const handleClearFilters = () => {
        onFilterChange({
            documentType: undefined,
            dateRange: undefined,
            searchQuery: undefined,
        });
        onSearchChange("");
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const getPageInfoText = () => {
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, totalItems);
        return `Showing ${start}-${end} of ${totalItems} documents`;
    };

    const hasActiveFilters = () => {
        return Boolean(searchQuery || filters.documentType || filters.dateRange);
    };

    const getStatistics = () => {
        const total = documents.length;
        const accessible = documents.filter((d) => {
            if (isViewingOwnDocuments) return true;
            if (d.documentAccess.expiryDate) {
                const expiryDate = dayjs(d.documentAccess.expiryDate);
                const today = dayjs();
                return d.documentAccess.canView && expiryDate.isAfter(today);
            }
            return d.documentAccess.canView;
        }).length;

        const expired = documents.filter((d) => {
            if (isViewingOwnDocuments) return false;
            if (d.documentAccess.expiryDate) {
                const expiryDate = dayjs(d.documentAccess.expiryDate);
                const today = dayjs();
                return expiryDate.isBefore(today);
            }
            return false;
        }).length;

        return { total, accessible, expired };
    };

    const getSelectedPatientName = () => {
        const selectedPatient = patientOptions.find((p) => p.id === selectedPatientId);
        return selectedPatient ? selectedPatient.name : "Unknown";
    };

    const renderHeader = () => (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <div>
                <Title level={2} className="my-0 text-blue-900 text-xl sm:text-2xl lg:text-3xl">
                    Medical Records
                </Title>
                <Text className="text-gray-600 text-sm sm:text-base">
                    {getSelectedPatientName() === "You"
                        ? "Manage and view your medical documents"
                        : `View ${getSelectedPatientName()}'s medical documents`}
                </Text>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                {hasActiveFilters() && (
                    <Button icon={<X className="w-4 h-4" />} onClick={handleClearFilters}>
                        Clear Filters
                    </Button>
                )}

                {!comparisonMode && (
                    <Button type="default" icon={<Eye className="w-4 h-4" />} onClick={handleToggleComparisonMode}>
                        Compare Docs
                    </Button>
                )}

                {comparisonMode && (
                    <>
                        <Button
                            type="primary"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={handleStartComparison}
                            loading={isLoading}
                            disabled={selectedForComparison.length < 2}
                        >
                            Compare ({selectedForComparison.length})
                        </Button>

                        {selectedForComparison.length > 0 && (
                            <Button type="default" icon={<X className="w-4 h-4" />} onClick={handleClearAllComparison}>
                                Clear All
                            </Button>
                        )}

                        <Button
                            type="default"
                            danger
                            icon={<X className="w-4 h-4" />}
                            onClick={handleExitComparisonMode}
                        >
                            Exit Compare
                        </Button>
                    </>
                )}

                {isViewingOwnDocuments && (
                    <Button
                        type="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setUploadModalVisible(true)}
                    >
                        Upload Document
                    </Button>
                )}
            </div>
        </div>
    );

    const renderStatistics = () => {
        const stats = getStatistics();
        return (
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={8}>
                    <Card className="shadow-lg border-0 bg-white">
                        <Statistic
                            title={
                                <div className="flex items-center">
                                    <FileText className="text-blue-500 mr-2 w-5 h-5" />
                                    <Text className="text-gray-700">Total Documents</Text>
                                </div>
                            }
                            value={stats.total}
                            valueStyle={{ color: "#1890ff", fontSize: "24px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="shadow-lg border-0 bg-white">
                        <Statistic
                            title={
                                <div className="flex items-center">
                                    <CheckCircle className="text-green-500 mr-2 w-5 h-5" />
                                    <Text className="text-gray-700">Accessible</Text>
                                </div>
                            }
                            value={stats.accessible}
                            valueStyle={{ color: "#52c41a", fontSize: "24px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="shadow-lg border-0 bg-white">
                        <Statistic
                            title={
                                <div className="flex items-center">
                                    <AlertTriangle className="text-orange-500 mr-2 w-5 h-5" />
                                    <Text className="text-gray-700">Expired Access</Text>
                                </div>
                            }
                            value={stats.expired}
                            valueStyle={{ color: "#fa8c16", fontSize: "24px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
            </Row>
        );
    };

    const renderSearchAndFilters = () => (
        <Card className="shadow-sm border-0 bg-white mb-6">
            <Row gutter={[16, 16]} className="mb-4">
                <Col xs={24} md={14}>
                    <div>
                        <Text strong className="block mb-2">
                            Search Documents
                        </Text>
                        <Input
                            placeholder="Search documents by name or type..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            prefix={<Search className="w-4 h-4" />}
                            allowClear
                            size="large"
                            className="rounded-lg"
                        />
                    </div>
                </Col>
                <Col xs={24} md={7}>
                    <div>
                        <div className="flex items-center mb-2">
                            <Text strong className="mr-2">
                                View Documents For
                            </Text>
                            <span className="text-red-500 mr-2">*</span>
                            <Tooltip
                                title="You can only view documents for family members who have granted you 'View Medical Records' permission."
                                placement="top"
                            >
                                <Info className="text-blue-500 cursor-help w-4 h-4" />
                            </Tooltip>
                        </div>
                        <Select
                            value={selectedPatientId}
                            onChange={onPatientChange}
                            style={{ width: "100%" }}
                            size="large"
                            placeholder="Select patient"
                            className="rounded-lg"
                        >
                            {patientOptions.map((option) => (
                                <Select.Option key={option.id} value={option.id}>
                                    <div className="flex items-center justify-between">
                                        <span>
                                            {option.name}
                                            {option.relationship !== "You" && (
                                                <span className="text-gray-500 ml-2">({option.relationship})</span>
                                            )}
                                        </span>
                                        {option.canViewDocuments && (
                                            <CheckCircle className="text-green-500 ml-2 w-4 h-4" />
                                        )}
                                    </div>
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                </Col>
                <Col xs={24} md={3}>
                    <div>
                        <div className="flex items-center mb-2">
                            <Text strong className="mr-2">
                                Filter
                            </Text>
                        </div>
                        <Tooltip title="Show/Hide Filters" placement="top">
                            <Button
                                icon={<Filter className="w-4 h-4" />}
                                onClick={toggleFilters}
                                type={showFilters ? "primary" : "default"}
                                size="large"
                                className="w-full rounded-lg"
                            />
                        </Tooltip>
                    </div>
                </Col>
            </Row>

            {showFilters && (
                <div className="mb-4">
                    <Divider orientation="left" orientationMargin="0">
                        <div className="flex items-center justify-between">
                            <Text strong className="flex items-center">
                                <Filter className="mr-2 w-4 h-4" /> Filter Options
                            </Text>
                            {hasActiveFilters() && (
                                <Button
                                    icon={<X className="w-4 h-4" />}
                                    onClick={handleClearFilters}
                                    size="small"
                                    type="text"
                                    danger
                                    className="ml-3"
                                >
                                    Clear All Filters
                                </Button>
                            )}
                        </div>
                    </Divider>

                    <Row gutter={[16, 16]} className="mt-4">
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <div>
                                <Text strong className="block mb-2">
                                    Document Type
                                </Text>
                                <Select
                                    mode="multiple"
                                    placeholder="Filter by type"
                                    onChange={handleDocumentTypeChange}
                                    value={filters.documentType || []}
                                    style={{ width: "100%" }}
                                    options={documentTypeOptions}
                                    allowClear
                                    size="middle"
                                />
                            </div>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6}>
                            <div>
                                <Text strong className="block mb-2">
                                    Date Range
                                </Text>
                                <RangePicker
                                    style={{ width: "100%" }}
                                    onChange={handleDateRangeChange}
                                    value={
                                        filters.dateRange
                                            ? ([
                                                  filters.dateRange[0] ? dayjs(filters.dateRange[0]) : null,
                                                  filters.dateRange[1] ? dayjs(filters.dateRange[1]) : null,
                                              ] as any)
                                            : null
                                    }
                                    placeholder={["Start Date", "End Date"]}
                                    size="middle"
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
            )}
        </Card>
    );

    const getEmptyDescription = () => {
        if (!selectedPatientId) {
            return "Please select a patient to view documents";
        }
        if (hasActiveFilters()) {
            return "No documents match your filters";
        }
        return "No documents found";
    };

    const renderDocumentsList = () => (
        <Card className="shadow-sm border-0 bg-white mb-6">
            {filteredDocuments.length > 0 ? (
                <div>
                    {filteredDocuments.map((document) => (
                        <DocumentCard
                            key={document.id}
                            document={document}
                            isViewingOwnDocuments={isViewingOwnDocuments}
                            onDelete={onDeleteDocument}
                            onUpdate={handleEditDocument}
                            onUpdateAccess={handleManageAccess}
                            onRevokeAllAccess={onRevokeAllAccess}
                            onDownload={handleDownload}
                            onViewDetails={handleViewDetails}
                            onAddToComparison={handleAddToComparison}
                            onRemoveFromComparison={handleRemoveFromComparison}
                            isSelected={selectedForComparison.some((d) => d.id === document.id)}
                            canSelectForComparison={comparisonMode}
                        />
                    ))}

                    {totalPages > 1 && (
                        <div className="flex flex-col items-center mt-8 mb-4">
                            <div className="text-sm text-gray-600 mb-2">{getPageInfoText()}</div>
                            <Pagination
                                current={currentPage}
                                pageSize={itemsPerPage}
                                total={totalItems}
                                onChange={onPageChange}
                                showSizeChanger={false}
                                showQuickJumper={totalItems > itemsPerPage * 3}
                                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <Empty description={getEmptyDescription()} image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    {hasActiveFilters() && <Button onClick={handleClearFilters}>Clear Filters</Button>}
                </Empty>
            )}
        </Card>
    );

    const renderModals = () => (
        <>
            <DocumentUpload
                onUpload={onUploadDocument}
                isVisible={uploadModalVisible}
                onVisibleChange={setUploadModalVisible}
            />

            <DocumentDetailModal
                document={selectedDocument}
                isVisible={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                isViewingOwnDocuments={isViewingOwnDocuments}
            />

            <DocumentComparisonModal
                documents={selectedForComparison}
                isVisible={comparisonModalVisible}
                onClose={() => setComparisonModalVisible(false)}
            />

            {selectedDocument && (
                <>
                    <AccessModal
                        document={selectedDocument}
                        isVisible={accessModalVisible}
                        onClose={() => setAccessModalVisible(false)}
                        onUpdateAccess={onUpdateAccess}
                        onRevokeAllAccess={onRevokeAllAccess}
                    />

                    <EditDocumentModal
                        document={selectedDocument}
                        isVisible={editModalVisible}
                        onClose={() => setEditModalVisible(false)}
                        onUpdate={onUpdateDocument}
                    />
                </>
            )}
        </>
    );

    if (isLoading) {
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
            {renderHeader()}

            {comparisonMode && (
                <Alert
                    message="Document Comparison Mode"
                    description={`Select 2-4 documents to compare them side by side. Currently selected: ${selectedForComparison.length}/4`}
                    type="info"
                    showIcon
                    className="mb-6"
                    action={
                        <div className="flex gap-2">
                            {selectedForComparison.length > 0 && (
                                <Button size="small" onClick={handleClearAllComparison}>
                                    Clear All
                                </Button>
                            )}
                            {selectedForComparison.length >= 2 && (
                                <Button size="small" type="primary" onClick={handleStartComparison}>
                                    Compare Now
                                </Button>
                            )}
                        </div>
                    }
                />
            )}

            {renderStatistics()}

            {error && (
                <Alert
                    message="Error Loading Documents"
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

            {renderSearchAndFilters()}
            {renderDocumentsList()}
            {renderModals()}
        </div>
    );
};

export default MedicalRecordsComponent;
