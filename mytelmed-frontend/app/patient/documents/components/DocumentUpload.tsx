"use client";

import { useState, useEffect } from "react";
import { Upload, message, Input, Modal, Form, Select } from "antd";
import { Inbox } from "lucide-react";
import { DocumentUploadProps } from "../props";
import { DocumentType } from "@/app/api/props";
import { CreateDocumentRequest } from "@/app/api/document/props";
import { MAX_UPLOAD_SIZE_DISPLAY, MAX_UPLOAD_SIZE_BYTES } from "@/app/utils/FileSizeUtils";

const { Dragger } = Upload;

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload, isVisible, onVisibleChange, isLoading = false }) => {
    const [fileList, setFileList] = useState<any[]>([]);
    const [form] = Form.useForm();
    const [uploading, setUploading] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isVisible) {
            setFileList([]);
            form.resetFields();
            // Auto-select the first document type option
            form.setFieldsValue({
                documentType: DocumentType.PRESCRIPTION
            });
        }
    }, [isVisible, form]);

    const resetForm = () => {
        setFileList([]);
        form.resetFields();
        // Auto-select the first document type option
        form.setFieldsValue({
            documentType: DocumentType.PRESCRIPTION
        });
    };

    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.error("Please select a file to upload");
            return;
        }

        try {
            const values = await form.validateFields();
            setUploading(true);

            const file = fileList[0].originFileObj;
            const request: CreateDocumentRequest = {
                documentName: values.documentName || file.name,
                documentType: values.documentType,
            };

            await onUpload(request, file);
            message.success(`${file.name} uploaded successfully`);

            // Reset the form and close modal
            resetForm();
            onVisibleChange(false);
        } catch (error: any) {
            console.error("Upload failed:", error);
            message.error(error.message || "Failed to upload document");
        } finally {
            setUploading(false);
        }
    };

    const uploadProps = {
        onRemove: () => {
            setFileList([]);
        },
        beforeUpload: (file: File) => {
            // Validate file type - restrict to PDF files
            const isPDF = file.type === "application/pdf";
            if (!isPDF) {
                message.error("You can only upload PDF files!");
                return Upload.LIST_IGNORE;
            }

            // Validate file size (limit to 10MB)
            const isLt10M = file.size <= MAX_UPLOAD_SIZE_BYTES;
            if (!isLt10M) {
                message.error(`File must be smaller than ${MAX_UPLOAD_SIZE_DISPLAY}!`);
                return Upload.LIST_IGNORE;
            }

            // Add file to the fileList state
            setFileList([
                {
                    uid: "-1",
                    name: file.name,
                    status: "ready",
                    size: file.size,
                    type: file.type,
                    originFileObj: file,
                },
            ]);

            // Set default document name to file name
            form.setFieldsValue({
                documentName: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
            });

            // Prevent automatic upload
            return false;
        },
        fileList,
    };

    // Document type options
    const documentTypeOptions = [
        { label: "Prescription", value: DocumentType.PRESCRIPTION },
        { label: "Lab Report", value: DocumentType.LAB_REPORT },
        { label: "Radiology Report", value: DocumentType.RADIOLOGY_REPORT },
        { label: "Discharge Summary", value: DocumentType.DISCHARGE_SUMMARY },
        { label: "Operative Report", value: DocumentType.OPERATIVE_REPORT },
        { label: "Consultation Note", value: DocumentType.CONSULTATION_NOTE },
        { label: "Progress Note", value: DocumentType.PROGRESS_NOTE },
        { label: "Pathology Report", value: DocumentType.PATHOLOGY_REPORT },
        { label: "Immunization Record", value: DocumentType.IMMUNIZATION_RECORD },
        { label: "Referral Letter", value: DocumentType.REFERRAL_LETTER },
        { label: "Medical Certificate", value: DocumentType.MEDICAL_CERTIFICATE },
        { label: "History and Physical", value: DocumentType.HISTORY_AND_PHYSICAL },
        { label: "Emergency Room Report", value: DocumentType.EMERGENCY_ROOM_REPORT },
        { label: "Anesthesia Record", value: DocumentType.ANESTHESIA_RECORD },
        { label: "Inpatient Summary", value: DocumentType.INPATIENT_SUMMARY },
        { label: "Outpatient Summary", value: DocumentType.OUTPATIENT_SUMMARY },
        { label: "Nursing Note", value: DocumentType.NURSING_NOTE },
        { label: "Mental Health Note", value: DocumentType.MENTAL_HEALTH_NOTE },
        { label: "Medical Imaging", value: DocumentType.MEDICAL_IMAGING },
        { label: "Clinical Trial Document", value: DocumentType.CLINICAL_TRIAL_DOCUMENT },
        { label: "Treatment Plan", value: DocumentType.TREATMENT_PLAN },
        { label: "Diagnostic Report", value: DocumentType.DIAGNOSTIC_REPORT },
        { label: "Vital Signs Record", value: DocumentType.VITAL_SIGNS_RECORD },
        { label: "Allergy Record", value: DocumentType.ALLERGY_RECORD },
        { label: "Other", value: DocumentType.OTHER },
    ];

    return (
        <Modal
            title="Upload Medical Document"
            open={isVisible}
            onOk={handleUpload}
            onCancel={() => {
                onVisibleChange(false);
                resetForm();
            }}
            okText="Upload"
            okButtonProps={{
                disabled: fileList.length === 0,
                loading: uploading || isLoading,
            }}
            cancelButtonProps={{ disabled: uploading || isLoading }}
            centered
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    documentType: DocumentType.OTHER,
                }}
            >
                <Form.Item
                    label="Document Name"
                    name="documentName"
                    rules={[{ required: true, message: "Please enter a document name" }]}
                >
                    <Input placeholder="Enter document name" disabled={uploading || isLoading} />
                </Form.Item>

                <Form.Item
                    label="Document Type"
                    name="documentType"
                    rules={[{ required: true, message: "Please select a document type" }]}
                >
                    <Select
                        placeholder="Select document type"
                        options={documentTypeOptions}
                        disabled={uploading || isLoading}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>

                <Form.Item label="File" name="file" rules={[{ required: true, message: "Please upload a file" }]}>
                    <Dragger {...uploadProps} maxCount={1} disabled={uploading || isLoading} accept=".pdf">
                        <p className="ant-upload-drag-icon">
                            <Inbox className="w-12 h-12 mx-auto text-gray-400" />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">
                            Only PDF files are supported. Maximum size: {MAX_UPLOAD_SIZE_DISPLAY}.
                        </p>
                    </Dragger>
                </Form.Item>
            </Form>

            <div className="text-sm text-gray-500 mt-4">
                <p>
                    <strong>Supported Document Types:</strong>
                </p>
                <ul className="list-disc pl-5 mt-2">
                    <li>Medical reports and lab results</li>
                    <li>Prescription and medication records</li>
                    <li>Imaging and radiology reports</li>
                    <li>Discharge summaries and consultation notes</li>
                    <li>Any other medical documents in PDF format</li>
                </ul>
                <p className="mt-2">
                    <strong>Note:</strong> Uploaded documents will be encrypted and stored securely. You can manage
                    access permissions after upload.
                </p>
            </div>
        </Modal>
    );
};

export default DocumentUpload;
