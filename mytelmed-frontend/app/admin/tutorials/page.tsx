"use client";

import React, { useState, useEffect } from "react";
import { Typography, Tag, Button, Form, Input, Select, Modal, message, Upload, Progress, Tooltip, Image } from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    UploadOutlined,
    PlayCircleOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import DataTable, { DataTableColumn, DataTableAction } from "../../components/DataTable/DataTable";
import FormModal from "../../components/FormModal/FormModal";
import TutorialApi from "../../api/tutorial";
import { Tutorial, CreateTutorialRequest, UpdateTutorialRequest } from "../../api/tutorial/props";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const categories = [
    "Registration",
    "Appointments",
    "Telemedicine",
    "Medical Records",
    "Prescriptions",
    "Referrals",
    "Family Access",
    "General",
];

const TutorialManagement = () => {
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [filteredTutorials, setFilteredTutorials] = useState<Tutorial[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [thumbnailUploadModalVisible, setThumbnailUploadModalVisible] = useState(false);
    const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
    const [createLoading, setCreateLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    const [selectedVideoStatus, setSelectedVideoStatus] = useState<string | undefined>(undefined);
    const [selectedThumbnailStatus, setSelectedThumbnailStatus] = useState<string | undefined>(undefined);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const loadTutorials = async () => {
        setLoading(true);
        try {
            const response = await TutorialApi.getTutorialsByCategory("", pagination.current - 1, pagination.pageSize);

            if (response.data.isSuccess && response.data.data) {
                const tutorialData = response.data.data;
                setTutorials(tutorialData.content);
                setFilteredTutorials(tutorialData.content);
                setPagination((prev) => ({
                    ...prev,
                    total: tutorialData.totalElements,
                }));
            } else {
                message.error(response.data.message || "Failed to load tutorials");
            }
        } catch (error) {
            console.error("Error loading tutorials:", error);
            message.error("Failed to load tutorials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTutorials();
    }, [pagination.pageSize, pagination.current]);

    // Filter and search effect
    useEffect(() => {
        let filtered = [...tutorials];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (tutorial) =>
                    tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    tutorial.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter((tutorial) => tutorial.category === selectedCategory);
        }

        // Video status filter
        if (selectedVideoStatus) {
            if (selectedVideoStatus === "uploaded") {
                filtered = filtered.filter((tutorial) => !!tutorial.videoUrl);
            } else if (selectedVideoStatus === "pending") {
                filtered = filtered.filter((tutorial) => !tutorial.videoUrl);
            }
        }

        // Thumbnail status filter
        if (selectedThumbnailStatus) {
            if (selectedThumbnailStatus === "available") {
                filtered = filtered.filter((tutorial) => !!tutorial.thumbnailUrl);
            } else if (selectedThumbnailStatus === "none") {
                filtered = filtered.filter((tutorial) => !tutorial.thumbnailUrl);
            }
        }

        setFilteredTutorials(filtered);
    }, [tutorials, searchTerm, selectedCategory, selectedVideoStatus, selectedThumbnailStatus]);

    const handleCreateTutorial = async () => {
        try {
            const values = await createForm.validateFields();
            setCreateLoading(true);

            const createData: CreateTutorialRequest = {
                title: values.title,
                description: values.description,
                category: values.category,
            };

            const response = await TutorialApi.createTutorial(createData);

            if (response.data.isSuccess) {
                message.success("Tutorial created successfully");
                setCreateModalVisible(false);
                createForm.resetFields();
                loadTutorials();
            } else {
                message.error(response.data.message || "Failed to create tutorial");
            }
        } catch (error) {
            console.error("Error creating tutorial:", error);
            message.error("Failed to create tutorial");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEditTutorial = async () => {
        if (!selectedTutorial) return;

        try {
            const values = await editForm.validateFields();
            setEditLoading(true);

            const updateData: UpdateTutorialRequest = {
                title: values.title,
                description: values.description,
                category: values.category,
            };

            const response = await TutorialApi.updateTutorial(selectedTutorial.id, updateData);

            if (response.data.isSuccess) {
                message.success("Tutorial updated successfully");
                setEditModalVisible(false);
                setSelectedTutorial(null);
                editForm.resetFields();
                loadTutorials();
            } else {
                message.error(response.data.message || "Failed to update tutorial");
            }
        } catch (error) {
            console.error("Error updating tutorial:", error);
            message.error("Failed to update tutorial");
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteTutorial = async (tutorialId: string) => {
        confirm({
            title: "Delete Tutorial",
            icon: <ExclamationCircleOutlined />,
            content: "Are you sure you want to delete this tutorial? This action cannot be undone.",
            okType: "danger",
            onOk: async () => {
                try {
                    const response = await TutorialApi.deleteTutorial(tutorialId);

                    if (response.data.isSuccess) {
                        message.success("Tutorial deleted successfully");
                        loadTutorials();
                    } else {
                        message.error(response.data.message || "Failed to delete tutorial");
                    }
                } catch (error) {
                    console.error("Error deleting tutorial:", error);
                    message.error("Failed to delete tutorial");
                }
            },
        });
    };

    const handleViewTutorial = (tutorial: Tutorial) => {
        setSelectedTutorial(tutorial);
        setViewModalVisible(true);
    };

    const handleEditClick = (tutorial: Tutorial) => {
        setSelectedTutorial(tutorial);
        editForm.setFieldsValue({
            title: tutorial.title,
            description: tutorial.description,
            category: tutorial.category,
        });
        setEditModalVisible(true);
    };

    const handleUploadVideo = (tutorial: Tutorial) => {
        setSelectedTutorial(tutorial);
        setUploadModalVisible(true);
        setUploadProgress(0);
    };

    const handleUploadThumbnail = (tutorial: Tutorial) => {
        setSelectedTutorial(tutorial);
        setThumbnailUploadModalVisible(true);
        setThumbnailUploadProgress(0);
    };

    const handleVideoUpload = async (file: File) => {
        if (!file) return Upload.LIST_IGNORE;

        if (!selectedTutorial) return false;

        try {
            setUploadProgress(10);

            const response = await TutorialApi.uploadTutorialVideo(selectedTutorial.id, file);

            if (response.data.isSuccess) {
                setUploadProgress(100);
                message.success("Video uploaded successfully");
                setTimeout(() => {
                    setUploadModalVisible(false);
                    setUploadProgress(0);
                    loadTutorials();
                }, 1000);
            } else {
                message.error(response.data.message || "Failed to upload video");
                setUploadProgress(0);
            }
        } catch (error) {
            console.error("Error uploading video:", error);
            message.error("Failed to upload video");
            setUploadProgress(0);
        }

        return false;
    };

    const handleThumbnailUpload = async (file: File) => {
        if (!file) return Upload.LIST_IGNORE;

        if (!selectedTutorial) return false;

        // Validate file type
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error("Please upload an image file (JPG, PNG, etc.)");
            return false;
        }

        // Validate file size (5MB limit)
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error("Image must be smaller than 5MB");
            return false;
        }

        try {
            setThumbnailUploadProgress(20);

            const response = await TutorialApi.uploadTutorialThumbnail(selectedTutorial.id, file);

            if (response.data.isSuccess) {
                setThumbnailUploadProgress(100);
                message.success("Thumbnail uploaded successfully");
                setTimeout(() => {
                    setThumbnailUploadModalVisible(false);
                    setThumbnailUploadProgress(0);
                    loadTutorials();
                }, 1000);
            } else {
                message.error(response.data.message || "Failed to upload thumbnail");
                setThumbnailUploadProgress(0);
            }
        } catch (error) {
            console.error("Error uploading thumbnail:", error);
            message.error("Failed to upload thumbnail");
            setThumbnailUploadProgress(0);
        }

        return false;
    };

    const handleTableChange = (page: number, pageSize?: number) => {
        setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize: pageSize ?? prev.pageSize,
        }));
    };

    const columns: DataTableColumn<Tutorial>[] = [
        {
            title: "Thumbnail",
            dataIndex: "thumbnailUrl",
            key: "thumbnail",
            width: 120,
            render: (value, record) => (
                <div className="flex items-center justify-center">
                    {value ? (
                        <Image
                            src={value}
                            alt={`${record.title} thumbnail`}
                            width={100}
                            height={60}
                            className="object-cover rounded border shadow-sm"
                        />
                    ) : (
                        <div className="w-25 h-15 bg-gray-100 rounded border flex items-center justify-center">
                            <PictureOutlined className="text-gray-400" />
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (value) => <div className="font-medium">{value}</div>,
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            render: (value) => <Tag color="purple">{value}</Tag>,
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            width: 300,
            render: (value) => (
                <div className="text-sm text-gray-600 max-w-xs">
                    <div className="line-clamp-3 leading-relaxed">{value}</div>
                </div>
            ),
        },
        {
            title: "Video Status",
            dataIndex: "videoUrl",
            key: "videoUrl",
            render: (value) => <Tag color={value ? "green" : "orange"}>{value ? "Uploaded" : "Pending"}</Tag>,
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (value) => new Date(Number(value) * 1000).toLocaleDateString(),
        },
    ];

    const actions: DataTableAction<Tutorial>[] = [
        {
            label: "",
            onClick: (record) => handleViewTutorial(record),
            icon: (
                <Tooltip title="View tutorial details">
                    <EyeOutlined />
                </Tooltip>
            ),
            type: "default",
        },
        {
            label: "",
            onClick: (record) => handleEditClick(record),
            icon: (
                <Tooltip title="Edit tutorial">
                    <EditOutlined />
                </Tooltip>
            ),
            type: "primary",
        },
        {
            label: "",
            onClick: (record) => handleUploadVideo(record),
            icon: (
                <Tooltip title="Upload video">
                    <UploadOutlined />
                </Tooltip>
            ),
            type: "default",
        },
        {
            label: "",
            onClick: (record) => handleUploadThumbnail(record),
            icon: (
                <Tooltip title="Upload thumbnail">
                    <PictureOutlined />
                </Tooltip>
            ),
            type: "default",
        },
        {
            label: "",
            onClick: (record) => void handleDeleteTutorial(record.id),
            icon: (
                <Tooltip title="Delete tutorial">
                    <DeleteOutlined />
                </Tooltip>
            ),
            type: "default",
            danger: true,
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <Title level={2} className="mb-2">
                    Tutorial Management
                </Title>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <span className="block text-sm font-medium text-gray-700 mb-2">Search</span>
                        <Input
                            placeholder="Search by title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                        />
                    </div>
                    <div>
                        <span className="block text-sm font-medium text-gray-700 mb-2">Category</span>
                        <Select
                            placeholder="All categories"
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            allowClear
                            className="w-full"
                        >
                            {categories.map((category) => (
                                <Option key={category} value={category}>
                                    {category}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <span className="block text-sm font-medium text-gray-700 mb-2">Video Status</span>
                        <Select
                            placeholder="All statuses"
                            value={selectedVideoStatus}
                            onChange={setSelectedVideoStatus}
                            allowClear
                            className="w-full"
                        >
                            <Option value="uploaded">Uploaded</Option>
                            <Option value="pending">Pending</Option>
                        </Select>
                    </div>
                    <div>
                        <span className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Status</span>
                        <Select
                            placeholder="All statuses"
                            value={selectedThumbnailStatus}
                            onChange={setSelectedThumbnailStatus}
                            allowClear
                            className="w-full"
                        >
                            <Option value="available">Available</Option>
                            <Option value="none">None</Option>
                        </Select>
                    </div>
                </div>

                {/* Filter Summary */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing {filteredTutorials.length} of {tutorials.length} tutorials
                    </div>
                    {(searchTerm || selectedCategory || selectedVideoStatus || selectedThumbnailStatus) && (
                        <Button
                            size="small"
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedCategory(undefined);
                                setSelectedVideoStatus(undefined);
                                setSelectedThumbnailStatus(undefined);
                            }}
                        >
                            Clear All Filters
                        </Button>
                    )}
                </div>
            </div>

            <DataTable<Tutorial>
                title="Platform Tutorials"
                data={filteredTutorials}
                columns={columns}
                loading={loading}
                onAdd={() => setCreateModalVisible(true)}
                addButtonText="Create Tutorial"
                actions={actions}
                rowKey="id"
                actionButtonSize="large"
                actionColumnWidth="auto"
                pagination={{
                    ...pagination,
                    total: filteredTutorials.length,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tutorials`,
                    onChange: handleTableChange,
                    onShowSizeChange: handleTableChange,
                }}
            />

            {/* Create Tutorial Modal */}
            <FormModal
                title="Create New Tutorial"
                visible={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    createForm.resetFields();
                }}
                onOk={handleCreateTutorial}
                loading={createLoading}
                form={createForm}
                width={600}
            >
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true, message: "Please enter tutorial title" }]}
                >
                    <Input placeholder="Enter tutorial title" />
                </Form.Item>

                <Form.Item
                    label="Category"
                    name="category"
                    rules={[{ required: true, message: "Please select category" }]}
                >
                    <Select placeholder="Select category">
                        {categories.map((category) => (
                            <Option key={category} value={category}>
                                {category}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                    rules={[{ required: true, message: "Please enter tutorial description" }]}
                >
                    <TextArea rows={4} placeholder="Enter tutorial description..." />
                </Form.Item>
            </FormModal>

            {/* Edit Tutorial Modal */}
            <FormModal
                title="Edit Tutorial"
                visible={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setSelectedTutorial(null);
                    editForm.resetFields();
                }}
                onOk={handleEditTutorial}
                loading={editLoading}
                form={editForm}
                width={600}
            >
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true, message: "Please enter tutorial title" }]}
                >
                    <Input placeholder="Enter tutorial title" />
                </Form.Item>

                <Form.Item
                    label="Category"
                    name="category"
                    rules={[{ required: true, message: "Please select category" }]}
                >
                    <Select placeholder="Select category">
                        {categories.map((category) => (
                            <Option key={category} value={category}>
                                {category}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                    rules={[{ required: true, message: "Please enter tutorial description" }]}
                >
                    <TextArea rows={4} placeholder="Enter tutorial description..." />
                </Form.Item>
            </FormModal>

            {/* View Tutorial Modal */}
            <Modal
                title={selectedTutorial?.title}
                open={viewModalVisible}
                onCancel={() => {
                    setViewModalVisible(false);
                    setSelectedTutorial(null);
                }}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>,
                    <Button
                        key="edit"
                        type="primary"
                        onClick={() => {
                            setViewModalVisible(false);
                            handleEditClick(selectedTutorial!);
                        }}
                    >
                        Edit Tutorial
                    </Button>,
                ]}
                width={900}
                destroyOnHidden={true}
            >
                {selectedTutorial && (
                    <div className="space-y-4">
                        <div>
                            <Title level={5}>Category</Title>
                            <Tag color="purple">{selectedTutorial.category}</Tag>
                        </div>
                        <div>
                            <Title level={5}>Description</Title>
                            <div className="bg-gray-50 p-4 rounded-lg">{selectedTutorial.description}</div>
                        </div>
                        {!!selectedTutorial.duration && (
                            <div>
                                <Title level={5}>Duration</Title>
                                <span className="text-gray-600">
                                    {Math.floor(selectedTutorial.duration / 60)}:
                                    {(selectedTutorial.duration % 60).toString().padStart(2, "0")} minutes
                                </span>
                            </div>
                        )}
                        {selectedTutorial.videoUrl && (
                            <div>
                                <Title level={5}>Video</Title>
                                <div className="bg-black rounded-lg overflow-hidden">
                                    <video
                                        controls
                                        className="w-full h-auto max-h-96"
                                        poster={selectedTutorial.thumbnailUrl}
                                        preload="metadata"
                                    >
                                        <source src={selectedTutorial.videoUrl} type="video/mp4" />
                                        <source src={selectedTutorial.videoUrl} type="video/webm" />
                                        <source src={selectedTutorial.videoUrl} type="video/ogg" />
                                        <track kind="captions" src="" label="English" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center space-x-2">
                                        <PlayCircleOutlined className="text-green-500" />
                                        <span className="text-green-600 text-sm">Video available</span>
                                    </div>
                                    <Button
                                        size="small"
                                        type="link"
                                        href={selectedTutorial.videoUrl}
                                        target="_blank"
                                        icon={<PlayCircleOutlined />}
                                    >
                                        Open in New Tab
                                    </Button>
                                </div>
                            </div>
                        )}
                        {!selectedTutorial.videoUrl && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2">
                                    <PlayCircleOutlined className="text-yellow-500" />
                                    <span className="text-yellow-700">No video uploaded yet</span>
                                </div>
                                <p className="text-yellow-600 text-sm mt-1">
                                    Upload a video to make this tutorial interactive.
                                </p>
                            </div>
                        )}
                        {selectedTutorial.thumbnailUrl && (
                            <div>
                                <Title level={5}>Thumbnail</Title>
                                <Image
                                    src={selectedTutorial.thumbnailUrl}
                                    alt="Tutorial thumbnail"
                                    width={128}
                                    height={80}
                                    className="object-cover rounded"
                                />
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Created: {new Date(Number(selectedTutorial.createdAt) * 1000).toLocaleString()}</span>
                            <span>Updated: {new Date(Number(selectedTutorial.updatedAt) * 1000).toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Upload Video Modal */}
            <Modal
                title="Upload Tutorial Video"
                open={uploadModalVisible}
                onCancel={() => {
                    setUploadModalVisible(false);
                    setUploadProgress(0);
                }}
                footer={null}
                width={500}
            >
                <div className="space-y-4">
                    <div>
                        <Title level={5}>Tutorial: {selectedTutorial?.title}</Title>
                    </div>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div>
                            <Progress percent={uploadProgress} status="active" />
                            <div className="text-center text-sm text-gray-500 mt-2">Uploading video...</div>
                        </div>
                    )}

                    {uploadProgress === 0 && (
                        <Upload beforeUpload={handleVideoUpload} accept="video/*" showUploadList={false}>
                            <Button icon={<UploadOutlined />} size="large" block>
                                Select Video File
                            </Button>
                        </Upload>
                    )}

                    <div className="text-sm text-gray-500">
                        <p>Supported formats: MP4, AVI, MOV</p>
                        <p>Maximum file size: 500MB</p>
                    </div>
                </div>
            </Modal>

            {/* Upload Thumbnail Modal */}
            <Modal
                title="Upload Tutorial Thumbnail"
                open={thumbnailUploadModalVisible}
                onCancel={() => {
                    setThumbnailUploadModalVisible(false);
                    setThumbnailUploadProgress(0);
                }}
                footer={null}
                width={500}
            >
                <div className="space-y-4">
                    <div>
                        <Title level={5}>Tutorial: {selectedTutorial?.title}</Title>
                    </div>

                    {selectedTutorial?.thumbnailUrl && (
                        <div>
                            <Title level={5}>Current Thumbnail</Title>
                            <Image
                                src={selectedTutorial.thumbnailUrl}
                                alt="Current thumbnail"
                                width={200}
                                height={112}
                                className="object-cover rounded border"
                            />
                        </div>
                    )}

                    {thumbnailUploadProgress > 0 && thumbnailUploadProgress < 100 && (
                        <div>
                            <Progress percent={thumbnailUploadProgress} status="active" />
                            <div className="text-center text-sm text-gray-500 mt-2">Uploading thumbnail...</div>
                        </div>
                    )}

                    {thumbnailUploadProgress === 0 && (
                        <Upload beforeUpload={handleThumbnailUpload} accept="image/*" showUploadList={false}>
                            <Button icon={<PictureOutlined />} size="large" block>
                                Select Thumbnail Image
                            </Button>
                        </Upload>
                    )}

                    <div className="text-sm text-gray-500">
                        <p>Supported formats: JPG, PNG, GIF, WebP</p>
                        <p>Maximum file size: 5MB</p>
                        <p>Recommended size: 1280x720 pixels</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const TutorialManagementPage = () => {
    return <TutorialManagement />;
};

export default TutorialManagementPage;
