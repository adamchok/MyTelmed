"use client";

import { useState, useEffect } from "react";
import { Form, Button, Switch, Typography, Divider } from "antd";
import { Shield, Eye, Edit, CreditCard, Calendar, FileText, Pill } from "lucide-react";
import { FamilyMember, UpdateFamilyPermissionsRequest } from "@/app/api/family/props";

const { Title, Text } = Typography;

interface PermissionsModalProps {
    member: FamilyMember;
    onSubmit: (permissions: UpdateFamilyPermissionsRequest) => void;
    onCancel: () => void;
}

interface PermissionItem {
    key: keyof UpdateFamilyPermissionsRequest;
    label: string;
    description: string;
    icon: React.ReactNode;
    category: string;
}

const permissionItems: PermissionItem[] = [
    {
        key: "canViewMedicalRecords",
        label: "View Medical Records",
        description: "Access to medical history, test results, and health documents",
        icon: <FileText className="w-5 h-5" />,
        category: "Medical Records",
    },
    {
        key: "canViewAppointments",
        label: "View Appointments",
        description: "See scheduled appointments and consultation history",
        icon: <Calendar className="w-5 h-5" />,
        category: "Appointments",
    },
    {
        key: "canManageAppointments",
        label: "Manage Appointments",
        description: "Book, reschedule, or cancel appointments",
        icon: <Edit className="w-5 h-5" />,
        category: "Appointments",
    },
    {
        key: "canViewPrescriptions",
        label: "View Prescriptions",
        description: "Access to prescription history and medication information",
        icon: <Pill className="w-5 h-5" />,
        category: "Prescriptions",
    },
    {
        key: "canManagePrescriptions",
        label: "Manage Prescriptions",
        description: "Request refills and manage medication delivery",
        icon: <Shield className="w-5 h-5" />,
        category: "Prescriptions",
    },
    {
        key: "canViewBilling",
        label: "View Billing",
        description: "Access to payment history and billing information",
        icon: <Eye className="w-5 h-5" />,
        category: "Billing",
    },
    {
        key: "canManageBilling",
        label: "Manage Billing",
        description: "Make payments and manage billing settings",
        icon: <CreditCard className="w-5 h-5" />,
        category: "Billing",
    },
];

const PermissionsModal: React.FC<PermissionsModalProps> = ({ member, onSubmit, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Initialize form with current permissions
    useEffect(() => {
        form.setFieldsValue({
            canViewMedicalRecords: member.canViewMedicalRecords,
            canViewAppointments: member.canViewAppointments,
            canManageAppointments: member.canManageAppointments,
            canViewPrescriptions: member.canViewPrescriptions,
            canManagePrescriptions: member.canManagePrescriptions,
            canViewBilling: member.canViewBilling,
            canManageBilling: member.canManageBilling,
        });
    }, [form, member]);

    const handleSubmit = async (values: UpdateFamilyPermissionsRequest) => {
        try {
            setLoading(true);
            await onSubmit(values);
        } finally {
            setLoading(false);
        }
    };

    // Group permissions by category
    const groupedPermissions = permissionItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, PermissionItem[]>);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Title level={4} className="mb-2">
                    Manage Permissions for {member.name}
                </Title>
                <Text className="text-gray-600">Control what {member.name} can do with your health information</Text>
            </div>

            <Form form={form} onFinish={handleSubmit} layout="vertical">
                {Object.entries(groupedPermissions).map(([category, items]) => (
                    <div key={category} className="mb-6">
                        <Divider orientation="left" className="mb-4">
                            <span className="text-gray-700 font-semibold">{category}</span>
                        </Divider>

                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.key} className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <div className="text-blue-500 mt-1">{item.icon}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <Text strong className="text-gray-800">
                                                        {item.label}
                                                    </Text>
                                                    <Form.Item name={item.key} valuePropName="checked" className="mb-0">
                                                        <Switch />
                                                    </Form.Item>
                                                </div>
                                                <Text className="text-gray-600 text-sm mt-1">{item.description}</Text>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <Divider />

                <div className="flex justify-end space-x-3">
                    <Button onClick={onCancel} size="large">
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading} size="large" className="shadow-lg">
                        Update Permissions
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default PermissionsModal;
