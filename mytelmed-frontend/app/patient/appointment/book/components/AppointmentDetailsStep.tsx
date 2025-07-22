"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Button, Typography, Form, Input, Select, Avatar, List, Upload, message, Spin } from "antd";
import { FileText, User, ArrowRight, ArrowLeft, Users, Upload as UploadIcon, X } from "lucide-react";
import { RootState } from "@/lib/store";
import {
    setAppointmentDetails,
    addDocumentToAppointment,
    removeDocumentFromAppointment,
    setFamilyMembers,
    nextStep,
    previousStep,
} from "@/lib/reducers/appointment-booking-reducer";
import DocumentApi from "@/app/api/document";
import { Document } from "@/app/api/document/props";
import { Patient } from "@/app/api/patient/props";
import { DocumentType } from "@/app/api/props";
import { useFamilyPermissions } from "@/app/hooks/useFamilyPermissions";
import { formatFileSize } from "@/app/utils/FileSizeUtils";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function AppointmentDetailsStep() {
    const dispatch = useDispatch();
    const { selectedDoctor, selectedTimeSlot, appointmentDetails, familyMembers } = useSelector(
        (state: RootState) => state.rootReducer.appointmentBooking
    );

    // Family permissions hook
    const {
        currentPatient,
        familyMembers: authorizedFamilyMembers,
        loading: familyLoading
    } = useFamilyPermissions();

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [availableDocuments, setAvailableDocuments] = useState<Document[]>([]);
    const [uploadingDocument, setUploadingDocument] = useState(false);

    // Load data when family permissions are ready
    useEffect(() => {
        if (!familyLoading) {
            loadInitialData();
        }
    }, [familyLoading, currentPatient, authorizedFamilyMembers]);

    useEffect(() => {
        if (selectedPatient) {
            loadDocuments();
        } else {
            setAvailableDocuments([]);
        }
    }, [selectedPatient]);

    // Update form when appointmentDetails change
    useEffect(() => {
        form.setFieldsValue({
            patientId: appointmentDetails.patientId,
            patientNotes: appointmentDetails.patientNotes,
            reasonForVisit: appointmentDetails.reasonForVisit,
        });
    }, [appointmentDetails, form]);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            // Wait for family permissions to load
            if (familyLoading) {
                return;
            }

            // Set current patient and default selection
            if (currentPatient) {
                setSelectedPatient(currentPatient);

                // Set default to self if not already set
                if (!appointmentDetails.patientId) {
                    dispatch(
                        setAppointmentDetails({
                            patientId: currentPatient.id,
                            patientName: currentPatient.name,
                            isForSelf: true,
                        })
                    );
                }
            }

            // Set authorized family members from hook
            const authorizedMembers = authorizedFamilyMembers.filter(member => member.canManageAppointments && !member.pending);
            dispatch(setFamilyMembers(authorizedMembers));
        } catch {
            message.error("Failed to load appointment details");
        } finally {
            setLoading(false);
        }
    };

    const loadDocuments = async () => {
        // Don't load documents if no patient is selected
        if (!selectedPatient?.id) {
            setAvailableDocuments([]);
            return;
        }

        try {
            setDocumentsLoading(true);

            let response;
            if (selectedPatient.id === currentPatient?.id) {
                response = await DocumentApi.getDocumentsByPatientAccount();
            } else {
                response = await DocumentApi.getDocumentsByPatientId(selectedPatient.id);
            }

            if (response.data.isSuccess && response.data.data) {
                const documents = response.data.data || [];
                // Filter documents that can be attached
                const attachableDocuments = documents.filter(
                    (doc) => doc.documentAccess?.canAttach && doc.patient?.id === selectedPatient.id
                );
                setAvailableDocuments(attachableDocuments);
            } else {
                setAvailableDocuments([]);
            }
        } catch (error) {
            console.error("Failed to load documents:", error);
            message.error("Failed to load documents");
            setAvailableDocuments([]);
        } finally {
            setDocumentsLoading(false);
        }
    };

    const handleFormChange = (changedFields: any) => {
        const updates: any = {};

        changedFields.forEach((field: any) => {
            if (field.name[0] === "patientId") {
                const patientId = field.value;
                if (patientId === currentPatient?.id && currentPatient) {
                    updates.patientId = patientId;
                    updates.patientName = currentPatient.name;
                    updates.isForSelf = true;
                    setSelectedPatient(currentPatient);
                } else {
                    const selectedMember = familyMembers.find((m) => m.patient?.id === patientId);
                    if (selectedMember) {
                        updates.patientId = patientId;
                        updates.patientName = selectedMember.patient?.name;
                        updates.isForSelf = false;
                        setSelectedPatient(selectedMember.patient ?? null);
                    }
                }
            } else if (field.name[0] === "patientNotes") {
                updates.patientNotes = field.value;
            } else if (field.name[0] === "reasonForVisit") {
                updates.reasonForVisit = field.value;
            }
        });

        if (Object.keys(updates).length > 0) {
            dispatch(setAppointmentDetails(updates));
        }
    };

    const handleDocumentSelect = (documentId: string) => {
        const document = availableDocuments.find((doc) => doc.id === documentId);
        if (document) {
            dispatch(addDocumentToAppointment(document));
        }
    };

    const handleDocumentRemove = (documentId: string) => {
        dispatch(removeDocumentFromAppointment(documentId));
    };

    const handleFileUpload = async (file: File) => {
        try {
            setUploadingDocument(true);

            // Create document first
            const createResponse = await DocumentApi.createDocument({
                documentName: file.name,
                documentType: DocumentType.OTHER, // You can make this configurable
            });

            if (createResponse.data.isSuccess && createResponse.data.data) {
                const documentId = createResponse.data.data;

                // Upload the file
                await DocumentApi.uploadDocument(documentId, file);

                // Reload documents to get the new one
                await loadDocuments();

                message.success("Document uploaded successfully");
            }
        } catch {
            message.error("Failed to upload document");
        } finally {
            setUploadingDocument(false);
        }
    };

    const handleNext = async () => {
        try {
            await form.validateFields();

            if (!appointmentDetails.patientId) {
                message.warning("Please select who this appointment is for");
                return;
            }

            dispatch(nextStep());
        } catch {
            message.error("Please fill in all required fields");
        }
    };

    const handlePrevious = () => {
        dispatch(previousStep());
    };

    const getPatientOptions = () => {
        const options = [];

        // Add self option
        if (currentPatient) {
            options.push({
                value: currentPatient.id,
                label: "Myself",
                patient: currentPatient,
            });
        }

        // Add authorized family members with appointment management permissions
        authorizedFamilyMembers
            .filter(member => member.canManageAppointments && !member.pending && member.patient)
            .forEach((member) => {
                options.push({
                    value: member.patient?.id,
                    label: `${member.patient?.name} (${member.relationship})`,
                    patient: member.patient,
                });
            });

        return options;
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Appointment Summary */}
            <Card className="shadow-lg border-l-4 border-l-blue-500">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <div className="flex items-center space-x-3">
                            <Avatar
                                src={selectedDoctor?.profileImageUrl}
                                icon={<User className="w-5 h-5" />}
                                size={40}
                            />
                            <div>
                                <Text className="font-medium">Dr. {selectedDoctor?.name}</Text>
                                <br />
                                <Text className="text-gray-600 text-sm">{selectedDoctor?.facility.name}</Text>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className="text-right">
                            <Text className="font-medium">
                                {selectedTimeSlot && new Date(selectedTimeSlot.startTime).toLocaleDateString()}
                            </Text>
                            <br />
                            <Text className="text-gray-600 text-sm">
                                {selectedTimeSlot &&
                                    new Date(selectedTimeSlot.startTime).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}{" "}
                                • {selectedTimeSlot?.consultationMode}
                            </Text>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Appointment Details Form */}
            <Card title="Appointment Details" className="shadow-lg">
                <Form form={form} layout="vertical" onFieldsChange={handleFormChange} className="space-y-6">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={
                                    <span className="text-sm font-medium text-gray-700">
                                        <Users className="inline w-4 h-4 mr-1" />
                                        This appointment is for
                                    </span>
                                }
                                name="patientId"
                                rules={[{ required: true, message: "Please select who this appointment is for" }]}
                            >
                                <Select placeholder="Select patient" className="h-10">
                                    {getPatientOptions().map((option) => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={
                                    <span className="text-sm font-medium text-gray-700">
                                        <FileText className="inline w-4 h-4 mr-1" />
                                        Reason for Visit
                                    </span>
                                }
                                name="reasonForVisit"
                                rules={[{ required: true, message: "Please enter the reason for visit" }]}
                            >
                                <Input placeholder="e.g., Regular checkup, flu symptoms, etc." className="h-10" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label={
                            <span className="text-sm font-medium text-gray-700">
                                <FileText className="inline w-4 h-4 mr-1" />
                                Additional Notes (Optional)
                            </span>
                        }
                        name="patientNotes"
                    >
                        <TextArea
                            placeholder="Any additional information you'd like to share with the doctor..."
                            rows={4}
                            className="resize-none"
                        />
                    </Form.Item>
                </Form>
            </Card>

            {/* Document Attachments */}
            <Card title="Document Attachments (Optional)" className="shadow-lg">
                <div className="space-y-4">
                    {selectedPatient?.id === currentPatient?.id && (
                        <>
                            {/* Upload New Document */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload
                                    accept=".pdf"
                                    showUploadList={false}
                                    beforeUpload={(file) => {
                                        handleFileUpload(file);
                                        return false;
                                    }}
                                    disabled={uploadingDocument}
                                >
                                    <Button
                                        type="dashed"
                                        icon={<UploadIcon className="w-4 h-4" />}
                                        loading={uploadingDocument}
                                        className="mb-2"
                                    >
                                        Upload New Document
                                    </Button>
                                </Upload>
                            </div>
                        </>
                    )}
                    {/* Available Documents */}
                    {documentsLoading ? (
                        <div className="text-center py-4">
                            <Spin />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Text className="font-medium">Select from existing documents:</Text>
                            <List
                                dataSource={availableDocuments}
                                renderItem={(doc) => (
                                    <List.Item
                                        key={doc.id}
                                        className="flex"
                                        actions={[
                                            appointmentDetails.documentIds.includes(doc.id) ? (
                                                <Button
                                                    type="link"
                                                    danger
                                                    onClick={() => handleDocumentRemove(doc.id)}
                                                    className="gap-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Remove
                                                </Button>
                                            ) : (
                                                <Button type="link" onClick={() => handleDocumentSelect(doc.id)}>
                                                    Attach
                                                </Button>
                                            ),
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={<span className="text-sm sm:text-base truncate block" title={doc.documentName}>{doc.documentName}</span>}
                                            className="flex-1 min-w-0"
                                            description={<span className="text-xs sm:text-sm">{`${doc.documentType} • ${formatFileSize(doc.documentSize)}`}</span>}
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>
                    )}

                    {/* Selected Documents */}
                    {appointmentDetails.attachedDocuments.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <Text className="font-medium mb-2 block">
                                Selected Documents ({appointmentDetails.attachedDocuments.length}):
                            </Text>
                            <div className="space-y-1">
                                {appointmentDetails.attachedDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between bg-white p-2 rounded"
                                    >
                                        <span className="text-sm sm:text-base truncate block mr-2" title={doc.documentName}>{doc.documentName}</span>
                                        <Button
                                            type="text"
                                            size="small"
                                            onClick={() => handleDocumentRemove(doc.id)}
                                            icon={<X className="w-3 h-3" />}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Navigation */}
            <Card className="shadow-lg">
                <div className="flex flex-col md:flex-row gap-2 justify-between">
                    <Button onClick={handlePrevious} icon={<ArrowLeft className="w-4 h-4" />}>
                        Previous
                    </Button>
                    <Button type="primary" size="middle" onClick={handleNext}>
                        <ArrowRight className="w-4 h-4 " />
                        Confirm Booking
                    </Button>
                </div>
            </Card>
        </div>
    );
}
