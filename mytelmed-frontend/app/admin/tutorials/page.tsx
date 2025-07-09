"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Typography, Tag, Button, Form, Input, Select, Modal, message, Upload, Progress } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    UploadOutlined,
    PlayCircleOutlined,
} from '@ant-design/icons';
import AdminLayout from '../layout';
import DataTable, { DataTableColumn, DataTableAction } from '../../components/DataTable/DataTable';
import FormModal from '../../components/FormModal/FormModal';
import TutorialApi from '../../api/tutorial';
import { Tutorial, CreateTutorialRequest, UpdateTutorialRequest } from '../../api/tutorial/props';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const categories = [
    'Registration',
    'Appointments',
    'Telemedicine',
    'Medical Records',
    'Prescriptions',
    'Referrals',
    'Family Access',
    'General',
];

const TutorialManagement = () => {
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
    const [createLoading, setCreateLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const loadTutorials = useCallback(async () => {
        setLoading(true);
        try {
            const response = await TutorialApi.getTutorialsByCategory(
                "", // category filter - can be implemented later
                pagination.current - 1, // API uses 0-based pagination
                pagination.pageSize
            );

            if (response.data.isSuccess && response.data.data) {
                const tutorialData = response.data.data;
                setTutorials(tutorialData.content);
                setPagination(prev => ({
                    ...prev,
                    total: tutorialData.totalElements,
                }));
            } else {
                message.error(response.data.message || 'Failed to load tutorials');
            }
        } catch (error) {
            console.error('Error loading tutorials:', error);
            message.error('Failed to load tutorials');
        } finally {
            setLoading(false);
        }
    }, [pagination]);

    useEffect(() => {
        loadTutorials();
    }, [loadTutorials]);

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
                message.success('Tutorial created successfully');
                setCreateModalVisible(false);
                createForm.resetFields();
                loadTutorials();
            } else {
                message.error(response.data.message || 'Failed to create tutorial');
            }
        } catch (error) {
            console.error('Error creating tutorial:', error);
            message.error('Failed to create tutorial');
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
                message.success('Tutorial updated successfully');
                setEditModalVisible(false);
                setSelectedTutorial(null);
                editForm.resetFields();
                loadTutorials();
            } else {
                message.error(response.data.message || 'Failed to update tutorial');
            }
        } catch (error) {
            console.error('Error updating tutorial:', error);
            message.error('Failed to update tutorial');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteTutorial = async (tutorialId: string) => {
        confirm({
            title: 'Delete Tutorial',
            icon: <ExclamationCircleOutlined />,
            content: 'Are you sure you want to delete this tutorial? This action cannot be undone.',
            okType: 'danger',
            onOk: async () => {
                try {
                    const response = await TutorialApi.deleteTutorial(tutorialId);

                    if (response.data.isSuccess) {
                        message.success('Tutorial deleted successfully');
                        loadTutorials();
                    } else {
                        message.error(response.data.message || 'Failed to delete tutorial');
                    }
                } catch (error) {
                    console.error('Error deleting tutorial:', error);
                    message.error('Failed to delete tutorial');
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

    const handleVideoUpload = async (file: File) => {
        if (!file) return Upload.LIST_IGNORE;

        if (!selectedTutorial) return false;

        try {
            setUploadProgress(10);

            const response = await TutorialApi.uploadTutorialVideo(selectedTutorial.id, file);

            if (response.data.isSuccess) {
                setUploadProgress(100);
                message.success('Video uploaded successfully');
                setTimeout(() => {
                    setUploadModalVisible(false);
                    setUploadProgress(0);
                    loadTutorials();
                }, 1000);
            } else {
                message.error(response.data.message || 'Failed to upload video');
                setUploadProgress(0);
            }
        } catch (error) {
            console.error('Error uploading video:', error);
            message.error('Failed to upload video');
            setUploadProgress(0);
        }

        return false;
    };

    const handleTableChange = (page: number, pageSize?: number) => {
        setPagination(prev => ({
            ...prev,
            current: page,
            pageSize: pageSize ?? prev.pageSize,
        }));
    };

    const columns: DataTableColumn<Tutorial>[] = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (value) => (
                <div className="font-medium">{value}</div>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (value) => <Tag color="purple">{value}</Tag>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (value) => (
                <div className="text-sm text-gray-600 max-w-xs truncate">
                    {value.substring(0, 80)}...
                </div>
            ),
        },
        {
            title: 'Duration',
            dataIndex: 'duration',
            key: 'duration',
            render: (value) => (
                <span className="text-sm">
                    {value ? `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}` : 'N/A'}
                </span>
            ),
        },
        {
            title: 'Video Status',
            dataIndex: 'videoUrl',
            key: 'videoUrl',
            render: (value) => (
                <Tag color={value ? 'green' : 'orange'}>
                    {value ? 'Uploaded' : 'Pending'}
                </Tag>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (value) => new Date(value).toLocaleDateString(),
        },
    ];

    const actions: DataTableAction<Tutorial>[] = [
        {
            label: 'View',
            onClick: (record) => handleViewTutorial(record),
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
            label: 'Upload Video',
            onClick: (record) => handleUploadVideo(record),
            icon: <UploadOutlined />,
            type: 'default',
        },
        {
            label: 'Delete',
            onClick: (record) => void handleDeleteTutorial(record.id),
            icon: <DeleteOutlined />,
            type: 'default',
            danger: true,
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <Title level={2} className="mb-2">Tutorial Management</Title>
            </div>

            <DataTable<Tutorial>
                title="Educational Tutorials"
                data={tutorials}
                columns={columns}
                loading={loading}
                onAdd={() => setCreateModalVisible(true)}
                addButtonText="Create Tutorial"
                actions={actions}
                rowKey="id"
                pagination={{
                    ...pagination,
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
                    rules={[{ required: true, message: 'Please enter tutorial title' }]}
                >
                    <Input placeholder="Enter tutorial title" />
                </Form.Item>

                <Form.Item
                    label="Category"
                    name="category"
                    rules={[{ required: true, message: 'Please select category' }]}
                >
                    <Select placeholder="Select category">
                        {categories.map(category => (
                            <Option key={category} value={category}>{category}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                    rules={[{ required: true, message: 'Please enter tutorial description' }]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Enter tutorial description..."
                    />
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
                    rules={[{ required: true, message: 'Please enter tutorial title' }]}
                >
                    <Input placeholder="Enter tutorial title" />
                </Form.Item>

                <Form.Item
                    label="Category"
                    name="category"
                    rules={[{ required: true, message: 'Please select category' }]}
                >
                    <Select placeholder="Select category">
                        {categories.map(category => (
                            <Option key={category} value={category}>{category}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                    rules={[{ required: true, message: 'Please enter tutorial description' }]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Enter tutorial description..."
                    />
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
                width={800}
            >
                {selectedTutorial && (
                    <div className="space-y-4">
                        <div>
                            <Title level={5}>Category</Title>
                            <Tag color="purple">{selectedTutorial.category}</Tag>
                        </div>
                        <div>
                            <Title level={5}>Description</Title>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                {selectedTutorial.description}
                            </div>
                        </div>
                        {!!selectedTutorial.duration && (
                            <div>
                                <Title level={5}>Duration</Title>
                                <span className="text-gray-600">
                                    {Math.floor(selectedTutorial.duration / 60)}:{(selectedTutorial.duration % 60).toString().padStart(2, '0')} minutes
                                </span>
                            </div>
                        )}
                        {selectedTutorial.videoUrl && (
                            <div>
                                <Title level={5}>Video</Title>
                                <div className="flex items-center space-x-2">
                                    <PlayCircleOutlined className="text-green-500" />
                                    <span className="text-green-600">Video available</span>
                                    <Button size="small" type="link" href={selectedTutorial.videoUrl} target="_blank">
                                        Watch Video
                                    </Button>
                                </div>
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
                            <span>Created: {new Date(selectedTutorial.createdAt).toLocaleString()}</span>
                            <span>Updated: {new Date(selectedTutorial.updatedAt).toLocaleString()}</span>
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
                            <div className="text-center text-sm text-gray-500 mt-2">
                                Uploading video...
                            </div>
                        </div>
                    )}

                    {uploadProgress === 0 && (
                        <Upload
                            beforeUpload={handleVideoUpload}
                            accept="video/*"
                            showUploadList={false}
                        >
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
        </div>
    );
};

const TutorialManagementPage = () => {
    return (
        <AdminLayout>
            <TutorialManagement />
        </AdminLayout>
    );
};

export default TutorialManagementPage; 