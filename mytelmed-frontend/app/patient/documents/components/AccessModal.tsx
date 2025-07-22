"use client";

import { useState, useEffect } from "react";
import { Modal, Typography, Switch, Card, Button, DatePicker, Form, message, Alert } from "antd";
import { Settings, AlertTriangle } from "lucide-react";
import { AccessModalProps } from "../props";
import { UpdateAccessRequest } from "@/app/api/document/props";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const AccessModal: React.FC<AccessModalProps> = ({
    document,
    isVisible,
    onClose,
    onUpdateAccess,
    onRevokeAllAccess,
}) => {
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);

    // Update form when document changes
    useEffect(() => {
        if (isVisible && document) {
            form.setFieldsValue({
                canView: document.documentAccess?.canView,
                canAttach: document.documentAccess?.canAttach,
                expiryDate: document.documentAccess?.expiryDate ? dayjs(document.documentAccess?.expiryDate) : null,
            });
        }
    }, [document, isVisible, form]);

    // Handle save
    const handleSave = async () => {
        try {
            // Validate form fields first
            const values = await form.validateFields();
            setIsLoading(true);

            // Ensure boolean values are properly typed and not null/undefined
            const canView = values.canView === true;
            const canAttach = values.canAttach === true;

            // Format date as ISO string (DD/MM/YYYY)
            const expiryDateString = values.expiryDate ? values.expiryDate.format("DD/MM/YYYY") : null;

            const request: UpdateAccessRequest = {
                canView,
                canAttach,
                expiryDate: expiryDateString,
            };

            console.log("Update access request:", request); // Debug log
            console.log("Document ID:", document.id); // Debug log

            if (!document?.id) {
                message.error("Document ID is missing");
                return;
            }

            await onUpdateAccess(document.id, request);
            message.success("Document access updated successfully");
            onClose();
        } catch (error: any) {
            console.error("Failed to update access:", error);
            console.error("Error response:", error.response?.data); // Debug log

            // Handle specific error cases
            if (error.response?.status === 400) {
                const errorMessage = error.response?.data?.message || "Invalid request data";
                message.error(`Validation Error: ${errorMessage}`);
            } else if (error.response?.status === 403) {
                message.error("You don't have permission to update this document's access");
            } else if (error.response?.status === 404) {
                message.error("Document not found");
            } else {
                message.error(error.response?.data?.message || error.message || "Failed to update document access");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle revoke all access
    const handleRevokeAll = async () => {
        try {
            setIsLoading(true);
            console.log("Revoking access for document:", document.id); // Debug log
            console.log("Document object:", document); // Debug log

            if (!document?.id) {
                message.error("Document ID is missing");
                return;
            }

            await onRevokeAllAccess(document.id);
            message.success("All access revoked successfully");
            onClose();
        } catch (error: any) {
            console.error("Failed to revoke access:", error);
            console.error("Error response:", error.response?.data); // Debug log

            // Handle specific error cases
            if (error.response?.status === 400) {
                const errorMessage = error.response?.data?.message || "Invalid request";
                message.error(`Error: ${errorMessage}`);
            } else if (error.response?.status === 403) {
                message.error("You don't have permission to revoke access for this document");
            } else if (error.response?.status === 404) {
                message.error("Document not found");
            } else {
                message.error(error.response?.data?.message || error.message || "Failed to revoke access");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Check if access is expired
    const isAccessExpired = () => {
        if (!document?.documentAccess?.expiryDate) return false;
        const expiryDate = dayjs(document.documentAccess?.expiryDate);
        const today = dayjs();
        return expiryDate.isBefore(today);
    };

    const expired = isAccessExpired();

    return (
        <Modal
            title={
                <Title level={4} className="my-0 flex items-center">
                    <Settings className="mr-2 w-5 h-5" />
                    Manage Document Access
                </Title>
            }
            open={isVisible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>,
                <Button
                    key="revoke"
                    danger
                    onClick={handleRevokeAll}
                    loading={isLoading}
                    icon={<AlertTriangle className="w-4 h-4" />}
                >
                    Revoke All Access
                </Button>,
                <Button key="save" type="primary" onClick={handleSave} loading={isLoading}>
                    Save Changes
                </Button>,
            ]}
            width={600}
            centered
            destroyOnHidden={true}
        >
            <div className="py-2">
                <div className="mb-4">
                    <Text>
                        Control access permissions for <strong>{document?.documentName}</strong>. These settings
                        determine how family members can interact with this document.
                    </Text>
                </div>

                {expired && (
                    <Alert
                        message="Access Expired"
                        description="The current access permissions have expired. Update the expiry date to restore access."
                        type="warning"
                        showIcon
                        className="mb-4"
                    />
                )}

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        canView: document?.documentAccess?.canView || false,
                        canAttach: document?.documentAccess?.canAttach || false,
                        expiryDate: document?.documentAccess?.expiryDate
                            ? dayjs(document.documentAccess?.expiryDate)
                            : null,
                    }}
                >
                    <div className="space-y-4">
                        <Card className="w-full shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-md font-medium">View Access</h3>
                                    <p className="text-sm text-gray-500">Allow family members to view this document</p>
                                </div>
                                <Form.Item name="canView" valuePropName="checked" className="mb-0">
                                    <Switch disabled={isLoading} />
                                </Form.Item>
                            </div>
                        </Card>

                        <Card className="w-full shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-md font-medium">Attach Access</h3>
                                    <p className="text-sm text-gray-500">Allowed to be attached to appointments</p>
                                </div>
                                <Form.Item name="canAttach" valuePropName="checked" className="mb-0">
                                    <Switch disabled={isLoading} />
                                </Form.Item>
                            </div>
                        </Card>

                        <Card className="w-full shadow-sm">
                            <div>
                                <h3 className="text-md font-medium mb-3">Access Expiry Date (Optional)</h3>
                                <p className="text-sm text-gray-500 mb-3">Set when access permissions should expire</p>
                                <Form.Item
                                    name="expiryDate"
                                    rules={[
                                        {
                                            validator: (_, value) => {
                                                if (!value) return Promise.resolve();
                                                if (value.isBefore(dayjs(), "day")) {
                                                    return Promise.reject(
                                                        new Error("Expiry date cannot be in the past")
                                                    );
                                                }
                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                >
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        placeholder="Select expiry date"
                                        disabledDate={(current) => current && current < dayjs().startOf("day")}
                                        disabled={isLoading}
                                    />
                                </Form.Item>
                            </div>
                        </Card>
                    </div>
                </Form>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <Text strong className="block mb-2">
                        Important Notes:
                    </Text>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>Family members need &quot;View Documents&quot; permission to access documents</li>
                        <li>Expired access will automatically prevent document viewing and downloading</li>
                        <li>You can revoke all access immediately using the &quot;Revoke All Access&quot; button</li>
                        <li>Changes take effect immediately after saving</li>
                    </ul>
                </div>
            </div>
        </Modal>
    );
};

export default AccessModal;
