"use client";

import React, { useState, useEffect, forwardRef } from "react";
import { Typography, Tag, Button, Form, Input, Select, Modal, message, Tooltip, Upload, Progress, Image } from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";
import DataTable, { DataTableColumn, DataTableAction } from "../../components/DataTable/DataTable";
import FormModal from "../../components/FormModal/FormModal";
import { Article, CreateArticleRequest, UpdateArticleRequest } from "../../api/article/props";
import ArticleApi from "../../api/article";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
    ssr: false,
    loading: () => <div className="h-32 bg-gray-100 rounded animate-pulse"></div>,
});

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

// Quill editor configuration
const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
    ],
};

const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "color",
    "background",
    "align",
    "link",
    "image",
];

// Custom QuillEditor component that integrates with Ant Design Form
const QuillEditor = forwardRef<any, any>(({ value, onChange, placeholder, ...props }) => {
    return (
        <div className="border border-gray-300 rounded-lg">
            <ReactQuill
                theme="snow"
                value={value || ""}
                onChange={onChange}
                modules={quillModules}
                formats={quillFormats}
                placeholder={placeholder}
                style={{ height: "300px" }}
                {...props}
            />
        </div>
    );
});

QuillEditor.displayName = "QuillEditor";

const subjects = [
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "General Medicine",
];

const ArticleManagement = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [thumbnailUploadModalVisible, setThumbnailUploadModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [createLoading, setCreateLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSubject, setSelectedSubject] = useState<string | undefined>(undefined);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        loadArticles();
    }, []);

    // Force Quill editor re-initialization when edit modal opens
    useEffect(() => {
        if (editModalVisible && selectedArticle) {
            // Small delay to ensure modal is fully rendered
            const timer = setTimeout(() => {
                // Trigger a re-render of the Quill editor
                editForm.setFieldsValue({
                    content: selectedArticle.content
                });
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [editModalVisible, selectedArticle]);

    const loadArticles = async () => {
        setLoading(true);
        try {
            const response = await ArticleApi.getAllArticles();
            const responseData = response.data;

            if (responseData.isSuccess && responseData.data) {
                setArticles(responseData.data);
                setFilteredArticles(responseData.data);
            } else {
                message.error(responseData.message);
            }

            setLoading(false);
        } catch {
            message.error("Failed to load articles");
            setLoading(false);
        }
    };

    // Filter and search effect
    useEffect(() => {
        let filtered = [...articles];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (article) =>
                    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    article.content
                        .replace(/<[^>]*>/g, "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
        }

        // Subject filter
        if (selectedSubject) {
            filtered = filtered.filter((article) => article.subject === selectedSubject);
        }

        setFilteredArticles(filtered);
    }, [articles, searchTerm, selectedSubject]);

    const handleCreateArticle = async () => {
        try {
            const values = await createForm.validateFields();
            setCreateLoading(true);

            const createData: CreateArticleRequest = {
                title: values.title,
                content: values.content,
                subject: values.subject,
            };

            const response = await ArticleApi.createArticle(createData);
            const responseData = response.data;

            if (responseData.isSuccess) {
                message.success("Article created successfully");
                loadArticles();
            } else {
                message.error(responseData.message);
            }

            setCreateModalVisible(false);
            createForm.resetFields();
            setCreateLoading(false);
        } catch {
            message.error("Failed to create article");
            setCreateLoading(false);
        }
    };

    const handleEditArticle = async () => {
        if (!selectedArticle) return;

        try {
            const values = await editForm.validateFields();
            setEditLoading(true);

            const updateData: UpdateArticleRequest = {
                title: values.title,
                content: values.content,
            };

            const response = await ArticleApi.updateArticle(selectedArticle.id, updateData);
            const responseData = response.data;

            if (responseData.isSuccess) {
                message.success("Article updated successfully");
                loadArticles();
            } else {
                message.error(responseData.message);
            }

            setEditModalVisible(false);
            setSelectedArticle(null);
            editForm.resetFields();
            setEditLoading(false);
        } catch {
            message.error("Failed to update article");
            setEditLoading(false);
        }
    };

    const handleDeleteArticle = async (articleId: string) => {
        confirm({
            title: "Delete Article",
            icon: <ExclamationCircleOutlined />,
            content: "Are you sure you want to delete this article? This action cannot be undone.",
            okType: "danger",
            onOk: async () => {
                try {
                    const response = await ArticleApi.deleteArticle(articleId);
                    const responseData = response.data;

                    if (responseData.isSuccess) {
                        message.success("Article deleted successfully");
                        loadArticles();
                    } else {
                        message.error(responseData.message);
                    }
                } catch {
                    message.error("Failed to delete article");
                }
            },
            centered: true
        });
    };

    const handleViewArticle = (article: Article) => {
        setSelectedArticle(article);
        setViewModalVisible(true);
    };

    const handleEditClick = (article: Article) => {
        setSelectedArticle(article);
        editForm.setFieldsValue({
            title: article.title,
            content: article.content,
            subject: article.subject,
        });
        setEditModalVisible(true);
    };

    const handleThumbnailUpload = async (file: File) => {
        if (!file) return Upload.LIST_IGNORE;

        if (!selectedArticle) return false;

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

            const response = await ArticleApi.uploadArticleThumbnail(selectedArticle.id, file);

            if (response.data.isSuccess) {
                setThumbnailUploadProgress(100);
                message.success("Thumbnail uploaded successfully");
                setTimeout(() => {
                    setThumbnailUploadModalVisible(false);
                    setThumbnailUploadProgress(0);
                    loadArticles();
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

    const handleUploadThumbnail = (article: Article) => {
        setSelectedArticle(article);
        setThumbnailUploadModalVisible(true);
        setThumbnailUploadProgress(0);
    };

    const columns: DataTableColumn<Article>[] = [
        {
            title: "Thumbnail",
            dataIndex: "thumbnailUrl",
            key: "thumbnail",
            width: 120,
            render: (value, record) => (
                <div className="flex items-center justify-center">
                    {value ? (
                        <Image
                            src={record.thumbnailUrl}
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
            width: 250,
            render: (value) => (
                <div className="font-medium">
                    <div className="line-clamp-3 leading-relaxed">{value}</div>
                </div>
            ),
        },
        {
            title: "Subject",
            dataIndex: "subject",
            key: "subject",
            render: (value) => <Tag color="blue">{value}</Tag>,
        },
        {
            title: "Content Preview",
            dataIndex: "content",
            key: "content",
            width: 400,
            render: (value) => {
                // Strip HTML tags for preview
                const plainText = value.replace(/<[^>]*>/g, "");
                return (
                    <div className="text-sm text-gray-600">
                        <div className="line-clamp-3 leading-relaxed">{plainText}</div>
                    </div>
                );
            },
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (value) => new Date(Number(value) * 1000).toLocaleDateString(),
        },
        {
            title: "Updated",
            dataIndex: "updatedAt",
            key: "updatedAt",
            render: (value) => new Date(Number(value) * 1000).toLocaleDateString(),
        },
    ];

    const actions: DataTableAction<Article>[] = [
        {
            label: "",
            onClick: (record) => handleViewArticle(record),
            icon: (
                <Tooltip title="View article details">
                    <EyeOutlined />
                </Tooltip>
            ),
            type: "default",
        },
        {
            label: "",
            onClick: (record) => handleEditClick(record),
            icon: (
                <Tooltip title="Edit article">
                    <EditOutlined />
                </Tooltip>
            ),
            type: "primary",
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
            onClick: (record) => void handleDeleteArticle(record.id),
            icon: (
                <Tooltip title="Delete article">
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
                    Article Management
                </Title>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="block text-sm font-medium text-gray-700 mb-2">Search</span>
                        <Input
                            placeholder="Search by title or content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                        />
                    </div>
                    <div>
                        <span className="block text-sm font-medium text-gray-700 mb-2">Subject</span>
                        <Select
                            placeholder="All subjects"
                            value={selectedSubject}
                            onChange={setSelectedSubject}
                            allowClear
                            className="w-full"
                        >
                            {subjects.map((subject) => (
                                <Option key={subject} value={subject}>
                                    {subject}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>

                {/* Filter Summary */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing {filteredArticles.length} of {articles.length} articles
                    </div>
                    {(searchTerm || selectedSubject) && (
                        <Button
                            size="small"
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedSubject(undefined);
                            }}
                        >
                            Clear All Filters
                        </Button>
                    )}
                </div>
            </div>

            <DataTable<Article>
                title="Health Articles"
                data={filteredArticles}
                columns={columns}
                loading={loading}
                onAdd={() => setCreateModalVisible(true)}
                addButtonText="Create Article"
                actions={actions}
                rowKey="id"
                actionButtonSize="large"
                actionColumnWidth="auto"
                pagination={{
                    pageSize: 10,
                    total: filteredArticles.length,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} articles`,
                }}
            />

            {/* Create Article Modal */}
            <FormModal
                title="Create New Article"
                visible={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    createForm.resetFields();
                }}
                onOk={handleCreateArticle}
                loading={createLoading}
                form={createForm}
                width={900}
                centered={true}
            >
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true, message: "Please enter article title" }]}
                >
                    <Input placeholder="Enter article title" />
                </Form.Item>

                <Form.Item
                    label="Subject"
                    name="subject"
                    rules={[{ required: true, message: "Please select subject" }]}
                >
                    <Select placeholder="Select subject">
                        {subjects.map((subject) => (
                            <Option key={subject} value={subject}>
                                {subject}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Content"
                    name="content"
                    rules={[{ required: true, message: "Please enter article content" }]}
                >
                    <QuillEditor
                        key="create-quill"
                        placeholder="Write your article content here..."
                    />
                </Form.Item>
            </FormModal>

            {/* Edit Article Modal */}
            <FormModal
                title="Edit Article"
                visible={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setSelectedArticle(null);
                    editForm.resetFields();
                }}
                onOk={handleEditArticle}
                loading={editLoading}
                form={editForm}
                width={900}
                centered={true}
            >
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true, message: "Please enter article title" }]}
                >
                    <Input placeholder="Enter article title" />
                </Form.Item>

                <Form.Item
                    label="Subject"
                    name="subject"
                    rules={[{ required: true, message: "Please select subject" }]}
                >
                    <Select placeholder="Select subject">
                        {subjects.map((subject) => (
                            <Option key={subject} value={subject}>
                                {subject}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Content"
                    name="content"
                    rules={[{ required: true, message: "Please enter article content" }]}
                >
                    <QuillEditor
                        key={`edit-quill-${selectedArticle?.id || 'new'}`}
                        placeholder="Write your article content here..."
                    />
                </Form.Item>
            </FormModal>

            {/* View Article Modal */}
            <Modal
                title={selectedArticle?.title}
                open={viewModalVisible}
                onCancel={() => {
                    setViewModalVisible(false);
                    setSelectedArticle(null);
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
                            handleEditClick(selectedArticle!);
                        }}
                    >
                        Edit Article
                    </Button>,
                ]}
                width={900}
                centered={true}
            >
                {selectedArticle && (
                    <div className="space-y-4">
                        <div>
                            <Title level={5}>Subject</Title>
                            <Tag color="blue">{selectedArticle.subject}</Tag>
                        </div>
                        {selectedArticle.thumbnailUrl && (
                            <div>
                                <Title level={5}>Thumbnail</Title>
                                <Image
                                    src={selectedArticle.thumbnailUrl}
                                    alt="Article thumbnail"
                                    className="rounded border shadow-sm"
                                />
                            </div>
                        )}
                        <div>
                            <Title level={5}>Content</Title>
                            <div
                                className="bg-gray-50 p-4 rounded-lg prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                            />
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Created: {new Date(Number(selectedArticle.createdAt) * 1000).toLocaleString()}</span>
                            <span>Updated: {new Date(Number(selectedArticle.updatedAt) * 1000).toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Upload Thumbnail Modal */}
            <Modal
                title="Upload Article Thumbnail"
                open={thumbnailUploadModalVisible}
                onCancel={() => {
                    setThumbnailUploadModalVisible(false);
                    setThumbnailUploadProgress(0);
                }}
                footer={null}
                width={500}
                centered={true}
            >
                <div className="space-y-4">
                    <div>
                        <Title level={5}>Article: {selectedArticle?.title}</Title>
                    </div>

                    {selectedArticle?.thumbnailUrl && (
                        <div>
                            <Title level={5}>Current Thumbnail</Title>
                            <Image
                                src={selectedArticle.thumbnailUrl}
                                alt="Current thumbnail"
                                className="object-cover rounded border"
                            />
                        </div>
                    )}

                    <div className="flex flex-col justify-center items-center">
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

                        <div className="text-sm text-gray-500 text-center">
                            <p>Supported formats: JPG, PNG, GIF, WebP</p>
                            <p>Maximum file size: 5MB</p>
                            <p>Recommended size: 1280x720 pixels</p>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const ArticleManagementPage = () => {
    return <ArticleManagement />;
};

export default ArticleManagementPage;
