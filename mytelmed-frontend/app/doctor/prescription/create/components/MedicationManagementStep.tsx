"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Form, Input, Button, Typography, Row, Col, Select, InputNumber, Table, Modal, Space, message, Divider } from "antd";
import { ArrowRight, ArrowLeft, Plus, Edit, Trash2, Pill, AlertTriangle } from "lucide-react";
import { RootState } from "@/lib/store";
import {
    addMedication,
    updateMedication,
    removeMedication,
    initializeNewMedication,
    setCurrentMedication,
    nextStep,
    previousStep
} from "@/lib/reducers/prescription-creation-reducer";
import { CreatePrescriptionItemRequestDto } from "@/app/api/prescription/props";

const { Title, Text } = Typography;
const { Option } = Select;

const dosageForms = [
    "Tablet", "Capsule", "Syrup", "Injection", "Cream", "Ointment",
    "Drops", "Inhaler", "Patch", "Suppository", "Powder", "Gel"
];

const frequencies = [
    "Once daily", "Twice daily", "Three times daily", "Four times daily",
    "Every 4 hours", "Every 6 hours", "Every 8 hours", "Every 12 hours",
    "As needed", "Before meals", "After meals", "At bedtime"
];

const durations = [
    "3 days", "5 days", "7 days", "10 days", "14 days", "21 days", "30 days",
    "2 months", "3 months", "6 months", "Until symptoms resolve", "Continuous"
];

export default function MedicationManagementStep() {
    const dispatch = useDispatch();
    const { medications } = useSelector(
        (state: RootState) => state.rootReducer.prescriptionCreation
    );

    const [form] = Form.useForm();
    const [showMedicationModal, setShowMedicationModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handlePrevious = () => {
        dispatch(previousStep());
    };

    const handleNext = () => {
        if (medications.length === 0) {
            message.warning("Please add at least one medication to continue");
            return;
        }
        dispatch(nextStep());
    };

    const handleAddMedication = () => {
        dispatch(initializeNewMedication());
        setEditingIndex(null);
        form.resetFields();
        setShowMedicationModal(true);
    };

    const handleEditMedication = (index: number) => {
        const medication = medications[index];
        dispatch(setCurrentMedication(medication));
        form.setFieldsValue(medication);
        setEditingIndex(index);
        setShowMedicationModal(true);
    };

    const handleDeleteMedication = (index: number) => {
        Modal.confirm({
            title: "Delete Medication",
            content: "Are you sure you want to remove this medication from the prescription?",
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: () => {
                dispatch(removeMedication(index));
                message.success("Medication removed successfully");
            },
        });
    };

    const handleMedicationSubmit = () => {
        form.validateFields().then((values: CreatePrescriptionItemRequestDto) => {
            if (editingIndex !== null) {
                dispatch(updateMedication({ index: editingIndex, medication: values }));
                message.success("Medication updated successfully");
            } else {
                dispatch(addMedication(values));
                message.success("Medication added successfully");
            }
            setShowMedicationModal(false);
            form.resetFields();
            setEditingIndex(null);
        }).catch((errorInfo) => {
            console.log('Failed:', errorInfo);
        });
    };

    const columns = [
        {
            title: "Medication",
            key: "medication",
            render: (_: any, record: CreatePrescriptionItemRequestDto) => (
                <div>
                    <Text className="font-semibold text-gray-900">{record.medicationName}</Text>
                    {record.genericName && (
                        <div className="text-sm text-gray-600">Generic: {record.genericName}</div>
                    )}
                    <div className="text-sm text-gray-600">
                        {record.dosageForm} - {record.strength}
                    </div>
                </div>
            ),
        },
        {
            title: "Dosage & Frequency",
            key: "dosage",
            render: (_: any, record: CreatePrescriptionItemRequestDto) => (
                <div>
                    <div className="text-sm">
                        <span className="font-medium">Quantity:</span> {record.quantity}
                    </div>
                    <div className="text-sm">
                        <span className="font-medium">Frequency:</span> {record.frequency}
                    </div>
                    <div className="text-sm">
                        <span className="font-medium">Duration:</span> {record.duration}
                    </div>
                </div>
            ),
        },
        {
            title: "Instructions",
            key: "instructions",
            render: (_: any, record: CreatePrescriptionItemRequestDto) => (
                <div className="max-w-xs">
                    <div className="text-sm">
                        <span className="font-medium">Instructions:</span> {record.instructions}
                    </div>
                    {record.notes && (
                        <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Notes:</span> {record.notes}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: CreatePrescriptionItemRequestDto, index: number) => (
                <Space>
                    <Button
                        type="text"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => handleEditMedication(index)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                        Edit
                    </Button>
                    <Button
                        type="text"
                        danger
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => handleDeleteMedication(index)}
                        className="hover:bg-red-50"
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-6" style={{ backgroundColor: "white" }}>
            {/* Header */}
            <Card className="shadow-sm" style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}>
                <div className="text-center mb-6">
                    <Title level={3} className="text-green-800 mb-2">
                        Add Medications
                    </Title>
                    <Text className="text-gray-600">
                        Add the medications and their dosage instructions for this prescription
                    </Text>
                </div>
            </Card>

            {/* Medications Table */}
            <Card
                title={
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-green-800">
                            <Pill className="w-5 h-5" />
                            Prescription Medications ({medications.length})
                        </span>
                        <Button
                            type="primary"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={handleAddMedication}
                            className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                            style={{ backgroundColor: "#059669" }}
                        >
                            Add Medication
                        </Button>
                    </div>
                }
                className="shadow-sm"
                style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
            >
                {medications.length === 0 ? (
                    <div className="text-center py-12">
                        <Pill className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <Title level={4} className="text-gray-500 mb-2">
                            No medications added yet
                        </Title>
                        <Text className="text-gray-400 block mb-4">
                            Click &quot;Add Medication&quot; to start building the prescription
                        </Text>
                        <Button
                            type="primary"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={handleAddMedication}
                            className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                            style={{ backgroundColor: "#059669" }}
                        >
                            Add Your First Medication
                        </Button>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={medications}
                        rowKey={(record, index) => index?.toString() || ''}
                        pagination={false}
                        className="border-gray-200"
                    />
                )}
            </Card>

            {/* Important Notice */}
            {medications.length > 0 && (
                <Card className="border-l-4 border-l-yellow-500" style={{ backgroundColor: "#fffbeb" }}>
                    <div className="flex items-start space-x-3">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="text-yellow-600 flex-shrink-0 w-5 h-5" />
                                <Title level={5} className="text-yellow-800 my-0 inline-flex items-center gap-2">
                                    Medication Safety Reminder
                                </Title>
                            </div>
                            <div className="space-y-1 text-sm text-yellow-700">
                                <div>• Verify medication allergies and contraindications</div>
                                <div>• Check for drug interactions with existing medications</div>
                                <div>• Ensure dosage is appropriate for patient&apos;s age and weight</div>
                                <div>• Include clear instructions for patient safety</div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
                <Button
                    size="large"
                    onClick={handlePrevious}
                    className="border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Prescription Details
                </Button>
                <Button
                    type="primary"
                    size="large"
                    onClick={handleNext}
                    disabled={medications.length === 0}
                    className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 disabled:bg-gray-400 disabled:border-gray-400"
                    style={{ backgroundColor: medications.length > 0 ? "#059669" : undefined }}
                >
                    Continue to Review
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            {/* Medication Modal */}
            <Modal
                title={editingIndex !== null ? "Edit Medication" : "Add New Medication"}
                open={showMedicationModal}
                onCancel={() => {
                    setShowMedicationModal(false);
                    form.resetFields();
                    setEditingIndex(null);
                }}
                footer={null}
                width={800}
                className="medication-modal"
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleMedicationSubmit}
                    className="space-y-4"
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="medicationName"
                                label="Medication Name *"
                                rules={[{ required: true, message: "Please enter medication name" }]}
                            >
                                <Input
                                    placeholder="e.g., Paracetamol"
                                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="genericName"
                                label="Generic Name"
                            >
                                <Input
                                    placeholder="e.g., Acetaminophen"
                                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="dosageForm"
                                label="Dosage Form *"
                                rules={[{ required: true, message: "Please select dosage form" }]}
                            >
                                <Select
                                    placeholder="Select dosage form"
                                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                >
                                    {dosageForms.map(form => (
                                        <Option key={form} value={form}>{form}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="strength"
                                label="Strength *"
                                rules={[{ required: true, message: "Please enter strength" }]}
                            >
                                <Input
                                    placeholder="e.g., 500mg, 5mg/ml"
                                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                name="quantity"
                                label="Quantity *"
                                rules={[{ required: true, message: "Please enter quantity" }]}
                            >
                                <InputNumber
                                    min={1}
                                    max={1000}
                                    placeholder="Quantity"
                                    className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                name="frequency"
                                label="Frequency *"
                                rules={[{ required: true, message: "Please select frequency" }]}
                            >
                                <Select
                                    placeholder="Select frequency"
                                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                >
                                    {frequencies.map(freq => (
                                        <Option key={freq} value={freq}>{freq}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                name="duration"
                                label="Duration *"
                                rules={[{ required: true, message: "Please select duration" }]}
                            >
                                <Select
                                    placeholder="Select duration"
                                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                >
                                    {durations.map(duration => (
                                        <Option key={duration} value={duration}>{duration}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            <Form.Item
                                name="instructions"
                                label="Instructions *"
                                rules={[{ required: true, message: "Please enter instructions" }]}
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="e.g., Take with food, avoid alcohol"
                                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            <Form.Item
                                name="notes"
                                label="Additional Notes"
                            >
                                <Input.TextArea
                                    rows={2}
                                    placeholder="Any additional notes or warnings"
                                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <div className="flex justify-end space-x-3">
                        <Button
                            onClick={() => {
                                setShowMedicationModal(false);
                                form.resetFields();
                                setEditingIndex(null);
                            }}
                            className="border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                            style={{ backgroundColor: "#059669" }}
                        >
                            {editingIndex !== null ? "Update Medication" : "Add Medication"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
} 