"use client";

import { useState, useEffect } from "react";
import { Modal, Form, Input, Typography, Button, message } from "antd";
import { Edit } from "lucide-react";
import { EditDocumentModalProps } from "../props";
import { formatFileSize } from "@/app/utils/FileSizeUtils";

const { Title, Text } = Typography;

const EditDocumentModal: React.FC<EditDocumentModalProps> = ({ document, isVisible, onClose, onUpdate }) => {
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);

    // Reset form when document changes or modal opens
    useEffect(() => {
        if (isVisible && document) {
            form.setFieldsValue({
                documentName: document.documentName,
            });
        }
    }, [form, document, isVisible]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            console.log("Form values:", values); // Debug log
            console.log("Document object:", document); // Debug log
            console.log("Document ID:", document?.id); // Debug log

            // Validate document name
            if (!values.documentName || values.documentName.trim() === "") {
                message.error("Document name cannot be empty");
                return;
            }

            if (!document?.id) {
                message.error("Document ID is missing");
                return;
            }

            const request = {
                documentName: values.documentName.trim(), // Ensure no leading/trailing spaces
            };

            console.log("Update document request:", request); // Debug log

            await onUpdate(document.id, request);

            message.success("Document updated successfully");
            onClose();
        } catch (error: any) {
            console.error("Failed to update document:", error);
            console.error("Error response:", error.response?.data); // Debug log

            // Handle specific error cases
            if (error.response?.status === 400) {
                const errorMessage = error.response?.data?.message || "Invalid document data";
                message.error(`Validation Error: ${errorMessage}`);
            } else if (error.response?.status === 403) {
                message.error("You don't have permission to update this document");
            } else if (error.response?.status === 404) {
                message.error("Document not found");
            } else {
                message.error(error.response?.data?.message || error.message || "Failed to update document");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            title={
                <Title level={4} className="my-0 flex items-center">
                    <Edit className="mr-2 w-5 h-5" />
                    Edit Document
                </Title>
            }
            open={isVisible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmit} loading={isLoading}>
                    Save Changes
                </Button>,
            ]}
            centered
            width={500}
        >
            <div className="py-2">
                <div className="mb-4">
                    <Text>Update the document information below.</Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        documentName: document?.documentName || "",
                    }}
                >
                    <Form.Item
                        name="documentName"
                        label="Document Name"
                        rules={[
                            { required: true, message: "Please enter a document name" },
                            { min: 1, message: "Document name cannot be empty" },
                            { max: 255, message: "Document name is too long" },
                        ]}
                    >
                        <Input placeholder="Enter document name" disabled={isLoading} />
                    </Form.Item>
                </Form>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <Text strong className="block mb-2">
                        Current Document Info:
                    </Text>
                    <div className="text-sm text-gray-600 space-y-1">
                        <div>
                            Type:{" "}
                            {document?.documentType
                                ?.toString()
                                .replace(/_/g, " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </div>
                        <div>Size: {document?.documentSize ? formatFileSize(document.documentSize) : "Unknown"}</div>
                        <div>
                            Created:{" "}
                            {document?.createdAt ? new Date(document.createdAt).toLocaleDateString() : "Unknown"}
                        </div>
                        <div>
                            Last Updated:{" "}
                            {document?.updatedAt ? new Date(document.updatedAt).toLocaleDateString() : "Unknown"}
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                    <Text type="secondary">
                        Note: Only the document name can be changed. The document type, file, and other metadata cannot
                        be modified after upload.
                    </Text>
                </div>
            </div>
        </Modal>
    );
};

export default EditDocumentModal;
