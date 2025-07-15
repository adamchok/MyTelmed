"use client";

import React from "react";
import { Modal, Form, Input, Button, Typography, Select } from "antd";
import { Truck, Package, Phone, Hash } from "lucide-react";

const { Text } = Typography;

interface CourierDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (courierDetails: {
        courierName: string;
        trackingReference: string;
        contactPhone?: string;
    }) => Promise<void>;
}

export default function CourierDetailsModal({
    visible,
    onClose,
    onSubmit
}: Readonly<CourierDetailsModalProps>) {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            await onSubmit({
                courierName: values.courierName,
                trackingReference: values.trackingReference,
                contactPhone: values.contactPhone
            });
            form.resetFields();
            onClose();
        } catch {
            // Error is handled by parent component
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    // Predefined courier options for quick selection
    const courierOptions = [
        "Pos Malaysia",
        "GDex",
        "City-Link Express",
        "J&T Express",
        "DHL",
        "FedEx",
        "Ninja Van",
        "Shopee Express",
        "Lalamove",
        "Other"
    ];

    return (
        <Modal
            title={
                <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-purple-500" />
                    <span>Mark Out for Delivery</span>
                </div>
            }
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={600}
            destroyOnHidden={true}
            centered
        >
            <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <Text className="text-purple-800">
                        <Package className="w-4 h-4 inline mr-2" />
                        Please provide courier details so the patient can track their medication delivery.
                    </Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="space-y-4"
                >
                    <Form.Item
                        label={
                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                <Truck className="mr-2 text-purple-500" size={16} />
                                Courier Company
                            </span>
                        }
                        name="courierName"
                        rules={[
                            { required: true, message: "Please select or enter the courier company name" },
                            { min: 2, message: "Courier name must be at least 2 characters" },
                            { max: 100, message: "Courier name cannot exceed 100 characters" }
                        ]}
                    >
                        <Select
                            placeholder="Select or enter courier company"
                            className="h-10 rounded-lg"
                            size="large"
                            showSearch
                            allowClear
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {courierOptions.map(courier => (
                                <Select.Option key={courier} value={courier}>
                                    {courier}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={
                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                <Hash className="mr-2 text-purple-500" size={16} />
                                Tracking Reference
                            </span>
                        }
                        name="trackingReference"
                        rules={[
                            { required: true, message: "Please enter the tracking reference number" },
                            { min: 3, message: "Tracking reference must be at least 3 characters" },
                            { max: 50, message: "Tracking reference cannot exceed 50 characters" }
                        ]}
                    >
                        <Input
                            placeholder="Enter tracking number (e.g., MY123456789)"
                            className="h-10 rounded-lg border-gray-200 hover:border-purple-400 focus:border-purple-500"
                            size="large"
                            maxLength={50}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span className="text-sm font-medium text-gray-700 flex items-center">
                                <Phone className="mr-2 text-purple-500" size={16} />
                                Contact Phone (Optional)
                            </span>
                        }
                        name="contactPhone"
                        rules={[
                            {
                                pattern: /^(\+?6?01[0-9]{8,9}|03[0-9]{8}|0[4-9][0-9]{7,8})$/,
                                message: "Please enter a valid Malaysian phone number"
                            },
                            { max: 10, message: "Phone number cannot exceed 10 characters" }
                        ]}
                    >
                        <Input
                            placeholder="e.g., 0123456789"
                            className="h-10 rounded-lg border-gray-200 hover:border-purple-400 focus:border-purple-500"
                            size="large"
                            maxLength={10}
                        />
                    </Form.Item>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <Text className="text-gray-600 text-sm">
                            <strong>Note:</strong> Once marked out for delivery, the patient will receive a notification
                            with the tracking details. Please ensure all information is accurate.
                        </Text>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <Button
                            onClick={handleCancel}
                            disabled={loading}
                            className="min-w-[100px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="bg-purple-500 hover:bg-purple-600 min-w-[120px]"
                            icon={<Truck className="w-4 h-4" />}
                        >
                            Mark Out for Delivery
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );
} 