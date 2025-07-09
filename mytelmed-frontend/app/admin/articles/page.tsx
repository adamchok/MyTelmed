"use client";

import React, { useState, useEffect } from 'react';
import { Typography, Tag, Button, Form, Input, Select, Modal, message } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import AdminLayout from '../layout';
import DataTable, { DataTableColumn, DataTableAction } from '../../components/DataTable/DataTable';
import FormModal from '../../components/FormModal/FormModal';
import { Article, CreateArticleRequest, UpdateArticleRequest } from '../../api/admin';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

// Mock data - in real app, this would come from AdminApi
const mockArticles: Article[] = [
    {
        id: '1',
        title: 'Heart Health Guidelines',
        content: 'Comprehensive guide on maintaining cardiovascular health...',
        speciality: 'Cardiology',
        createdAt: '2023-10-01T10:00:00Z',
        updatedAt: '2023-10-01T10:00:00Z',
    },
    {
        id: '2',
        title: 'Diabetes Management Tips',
        content: 'Essential tips for managing diabetes effectively...',
        speciality: 'Endocrinology',
        createdAt: '2023-10-02T11:00:00Z',
        updatedAt: '2023-10-02T11:00:00Z',
    },
    {
        id: '3',
        title: 'Skin Care Basics',
        content: 'Basic skin care routines for healthy skin...',
        speciality: 'Dermatology',
        createdAt: '2023-10-03T12:00:00Z',
        updatedAt: '2023-10-03T12:00:00Z',
    },
];

const specialities = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'General Medicine',
];

const ArticleManagement = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [createLoading, setCreateLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        setLoading(true);
        try {
            // In real app: const response = await AdminApi.getAllArticles();
            // Simulating API call
            setTimeout(() => {
                setArticles(mockArticles);
                setLoading(false);
            }, 1000);
        } catch {
            message.error('Failed to load articles');
            setLoading(false);
        }
    };

    const handleCreateArticle = async () => {
        try {
            const values = await createForm.validateFields();
            setCreateLoading(true);

            const createData: CreateArticleRequest = {
                title: values.title,
                content: values.content,
                speciality: values.speciality,
            };

            // In real app: await AdminApi.createArticle(createData);
            console.log('Creating article:', createData);
            // Simulating API call
            setTimeout(() => {
                message.success('Article created successfully');
                setCreateModalVisible(false);
                createForm.resetFields();
                setCreateLoading(false);
                loadArticles();
            }, 1000);
        } catch {
            message.error('Failed to create article');
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
                speciality: values.speciality,
            };

            // In real app: await AdminApi.updateArticle(selectedArticle.id, updateData);
            console.log('Updating article:', updateData);
            // Simulating API call
            setTimeout(() => {
                message.success('Article updated successfully');
                setEditModalVisible(false);
                setSelectedArticle(null);
                editForm.resetFields();
                setEditLoading(false);
                loadArticles();
            }, 1000);
        } catch {
            message.error('Failed to update article');
            setEditLoading(false);
        }
    };

    const handleDeleteArticle = async (articleId: string) => {
        confirm({
            title: 'Delete Article',
            icon: <ExclamationCircleOutlined />,
            content: 'Are you sure you want to delete this article? This action cannot be undone.',
            okType: 'danger',
            onOk: async () => {
                try {
                    // In real app: await AdminApi.deleteArticle(articleId);
                    message.success('Article deleted successfully');
                    loadArticles();
                } catch (error) {
                    message.error('Failed to delete article');
                }
            },
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
            speciality: article.speciality,
        });
        setEditModalVisible(true);
    };

    const columns: DataTableColumn<Article>[] = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (value) => (
                <div className="font-medium">{value}</div>
            ),
        },
        {
            title: 'Speciality',
            dataIndex: 'speciality',
            key: 'speciality',
            render: (value) => <Tag color="blue">{value}</Tag>,
        },
        {
            title: 'Content Preview',
            dataIndex: 'content',
            key: 'content',
            render: (value) => (
                <div className="text-sm text-gray-600 max-w-xs truncate">
                    {value.substring(0, 100)}...
                </div>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (value) => new Date(value).toLocaleDateString(),
        },
        {
            title: 'Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (value) => new Date(value).toLocaleDateString(),
        },
    ];

    const actions: DataTableAction<Article>[] = [
        {
            label: 'View',
            onClick: (record) => handleViewArticle(record),
            icon: <EyeOutlined />,
            type: 'default',
        },
        {
            label: 'Edit',
            onClick: (record) => handleEditClick(record),
            icon: <EditOutlined />,
            type: 'primary',
        },
        {
            label: 'Delete',
            onClick: (record) => handleDeleteArticle(record.id),
            icon: <DeleteOutlined />,
            type: 'default',
            danger: true,
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <Title level={2} className="mb-2">Article Management</Title>
            </div>

            <DataTable<Article>
                title="Health Articles"
                data={articles}
                columns={columns}
                loading={loading}
                onAdd={() => setCreateModalVisible(true)}
                addButtonText="Create Article"
                actions={actions}
                rowKey="id"
                pagination={{
                    pageSize: 10,
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
                width={800}
            >
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true, message: 'Please enter article title' }]}
                >
                    <Input placeholder="Enter article title" />
                </Form.Item>

                <Form.Item
                    label="Speciality"
                    name="speciality"
                    rules={[{ required: true, message: 'Please select speciality' }]}
                >
                    <Select placeholder="Select speciality">
                        {specialities.map(speciality => (
                            <Option key={speciality} value={speciality}>{speciality}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Content"
                    name="content"
                    rules={[{ required: true, message: 'Please enter article content' }]}
                >
                    <TextArea
                        rows={8}
                        placeholder="Enter article content..."
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
                width={800}
            >
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true, message: 'Please enter article title' }]}
                >
                    <Input placeholder="Enter article title" />
                </Form.Item>

                <Form.Item
                    label="Speciality"
                    name="speciality"
                    rules={[{ required: true, message: 'Please select speciality' }]}
                >
                    <Select placeholder="Select speciality">
                        {specialities.map(speciality => (
                            <Option key={speciality} value={speciality}>{speciality}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Content"
                    name="content"
                    rules={[{ required: true, message: 'Please enter article content' }]}
                >
                    <TextArea
                        rows={8}
                        placeholder="Enter article content..."
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
                width={800}
            >
                {selectedArticle && (
                    <div className="space-y-4">
                        <div>
                            <Title level={5}>Speciality</Title>
                            <Tag color="blue">{selectedArticle.speciality}</Tag>
                        </div>
                        <div>
                            <Title level={5}>Content</Title>
                            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                                {selectedArticle.content}
                            </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Created: {new Date(selectedArticle.createdAt).toLocaleString()}</span>
                            <span>Updated: {new Date(selectedArticle.updatedAt).toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const ArticleManagementPage = () => {
    return (
        <AdminLayout>
            <ArticleManagement />
        </AdminLayout>
    );
};

export default ArticleManagementPage; 