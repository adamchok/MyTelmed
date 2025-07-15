"use client";

import React, { useState, useEffect } from "react";
import {
    Modal,
    Form,
    Input,
    Button,
    Steps,
    Card,
    Typography,
    Row,
    Col,
    Avatar,
    Space,
    message,
    Divider,
    List,
    Badge,
    InputNumber,
    Select,
} from "antd";
import {
    User,
    FileText,
    Pill,
    Plus,
    Trash2,
    Calendar,
} from "lucide-react";
import dayjs from "dayjs";
import AppointmentApi from "@/app/api/appointment";
import PrescriptionApi from "@/app/api/prescription";
import { AppointmentDto } from "@/app/api/appointment/props";
import { CreatePrescriptionRequestDto, CreatePrescriptionItemRequestDto } from "@/app/api/prescription/props";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { Option } = Select;

interface CreatePrescriptionModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const CreatePrescriptionModal: React.FC<CreatePrescriptionModalProps> = ({
    visible,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [completedAppointments, setCompletedAppointments] = useState<AppointmentDto[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDto | null>(null);
    const [prescriptionItems, setPrescriptionItems] = useState<CreatePrescriptionItemRequestDto[]>([]);

    // Load completed appointments when modal opens
    useEffect(() => {
        if (visible) {
            loadCompletedAppointments();
        }
    }, [visible]);

    // Reset form when modal closes
    useEffect(() => {
        if (!visible) {
            form.resetFields();
            setCurrentStep(0);
            setSelectedAppointment(null);
            setPrescriptionItems([]);
        }
    }, [visible, form]);

    const loadCompletedAppointments = async () => {
        try {
            const response = await AppointmentApi.getAllAppointmentsByAccount();
            if (response.data.isSuccess && response.data.data) {
                // Filter only completed appointments that don't have prescriptions yet
                const completed = response.data.data.filter(
                    (apt) => apt.status === "COMPLETED"
                );
                setCompletedAppointments(completed);
            }
        } catch {
            message.error("Failed to load appointments");
        }
    };

    const handleStepNext = () => {
        form.validateFields()
            .then(() => {
                setCurrentStep(currentStep + 1);
            })
            .catch(() => {
                message.error("Please complete all required fields");
            });
    };

    const handleStepPrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const addPrescriptionItem = () => {
        const newItem: CreatePrescriptionItemRequestDto = {
            medicationName: "",
            genericName: "",
            dosageForm: "",
            strength: "",
            quantity: 1,
            instructions: "",
            frequency: "",
            duration: "",
            notes: "",
        };
        setPrescriptionItems([...prescriptionItems, newItem]);
    };

    const removePrescriptionItem = (index: number) => {
        const updated = prescriptionItems.filter((_, i) => i !== index);
        setPrescriptionItems(updated);
    };

    const updatePrescriptionItem = (index: number, field: keyof CreatePrescriptionItemRequestDto, value: any) => {
        const updated = [...prescriptionItems];
        updated[index] = { ...updated[index], [field]: value };
        setPrescriptionItems(updated);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            if (!selectedAppointment) {
                message.error("Please select an appointment");
                return;
            }

            if (prescriptionItems.length === 0) {
                message.error("Please add at least one medication");
                return;
            }

            // Validate all prescription items
            const validItems = prescriptionItems.filter(item =>
                item.medicationName && item.dosageForm && item.strength &&
                item.quantity > 0 && item.instructions && item.frequency && item.duration
            );

            if (validItems.length !== prescriptionItems.length) {
                message.error("Please complete all medication details");
                return;
            }

            const requestData: CreatePrescriptionRequestDto = {
                appointmentId: selectedAppointment.id,
                diagnosis: values.diagnosis,
                notes: values.notes,
                instructions: values.instructions,
                prescriptionItems: validItems,
            };

            await PrescriptionApi.createPrescription(requestData);
            onSuccess();
        } catch (error: any) {
            console.error("Error creating prescription:", error);
            message.error(error.response?.data?.message || "Failed to create prescription");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: "Select Appointment",
            description: "Choose from completed appointments",
        },
        {
            title: "Clinical Details",
            description: "Add diagnosis and instructions",
        },
        {
            title: "Medications",
            description: "Add prescribed medications",
        },
        {
            title: "Review & Submit",
            description: "Confirm prescription details",
        },
    ];

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-6">
                        <Title level={4}>Select Completed Appointment</Title>

                        {completedAppointments.length === 0 ? (
                            <Card className="bg-gray-50">
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <Text className="text-gray-600">
                                        No completed appointments available for prescription
                                    </Text>
                                </div>
                            </Card>
                        ) : (
                            <List
                                grid={{
                                    gutter: 16,
                                    xs: 1,
                                    sm: 1,
                                    md: 1,
                                }}
                                dataSource={completedAppointments}
                                renderItem={(appointment) => (
                                    <List.Item>
                                        <Card
                                            className={`cursor-pointer transition-all duration-200 ${selectedAppointment?.id === appointment.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'hover:border-blue-300'
                                                }`}
                                            onClick={() => setSelectedAppointment(appointment)}
                                        >
                                            <Row gutter={16} align="middle">
                                                <Col xs={24} sm={8}>
                                                    <Space>
                                                        <Avatar
                                                            size="large"
                                                            src={appointment.patient.profileImageUrl}
                                                            icon={<User />}
                                                        />
                                                        <div>
                                                            <Text className="font-medium block">
                                                                {appointment.patient.name}
                                                            </Text>
                                                            <Text className="text-sm text-gray-500">
                                                                {appointment.patient.email}
                                                            </Text>
                                                        </div>
                                                    </Space>
                                                </Col>
                                                <Col xs={24} sm={8}>
                                                    <Space direction="vertical" size={1}>
                                                        <Text className="text-sm text-gray-600">Appointment Date</Text>
                                                        <Text className="font-medium">
                                                            {dayjs(appointment.appointmentDateTime).format('MMM D, YYYY')}
                                                        </Text>
                                                        <Text className="text-sm text-gray-500">
                                                            {dayjs(appointment.appointmentDateTime).format('h:mm A')}
                                                        </Text>
                                                    </Space>
                                                </Col>
                                                <Col xs={24} sm={8}>
                                                    <Space direction="vertical" size={1}>
                                                        <Text className="text-sm text-gray-600">Consultation Mode</Text>
                                                        <Badge
                                                            status={appointment.consultationMode === 'VIRTUAL' ? 'processing' : 'success'}
                                                            text={appointment.consultationMode === 'VIRTUAL' ? 'Virtual' : 'Physical'}
                                                        />
                                                        {appointment.reasonForVisit && (
                                                            <Text className="text-xs text-gray-500 line-clamp-1">
                                                                {appointment.reasonForVisit}
                                                            </Text>
                                                        )}
                                                    </Space>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </List.Item>
                                )}
                            />
                        )}
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-6">
                        <Title level={4}>Clinical Information</Title>

                        <Form.Item
                            label="Diagnosis"
                            name="diagnosis"
                            rules={[{ required: true, message: 'Please enter the diagnosis' }]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Enter patient diagnosis..."
                                maxLength={1000}
                                showCount
                            />
                        </Form.Item>

                        <Form.Item
                            label="General Instructions"
                            name="instructions"
                            rules={[{ required: true, message: 'Please enter general instructions' }]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Enter general instructions for the patient..."
                                maxLength={1000}
                                showCount
                            />
                        </Form.Item>

                        <Form.Item
                            label="Additional Notes"
                            name="notes"
                        >
                            <TextArea
                                rows={3}
                                placeholder="Additional notes (optional)..."
                                maxLength={1000}
                                showCount
                            />
                        </Form.Item>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <Title level={4}>Prescribed Medications</Title>
                            <Button
                                type="dashed"
                                icon={<Plus className="w-4 h-4" />}
                                onClick={addPrescriptionItem}
                            >
                                Add Medication
                            </Button>
                        </div>

                        {prescriptionItems.length === 0 ? (
                            <Card className="bg-gray-50">
                                <div className="text-center py-8">
                                    <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <Text className="text-gray-600 block mb-4">
                                        No medications added yet
                                    </Text>
                                    <Button
                                        type="primary"
                                        icon={<Plus className="w-4 h-4" />}
                                        onClick={addPrescriptionItem}
                                    >
                                        Add First Medication
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {prescriptionItems.map((item, index) => (
                                    <Card
                                        key={item.medicationName + "-" + index}
                                        size="small"
                                        title={`Medication ${index + 1}`}
                                        extra={
                                            <Button
                                                type="text"
                                                danger
                                                size="small"
                                                icon={<Trash2 className="w-4 h-4" />}
                                                onClick={() => removePrescriptionItem(index)}
                                            >
                                                Remove
                                            </Button>
                                        }
                                    >
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} sm={12}>
                                                <div>
                                                    <Text className="text-sm text-gray-600 block mb-1">
                                                        Medication Name *
                                                    </Text>
                                                    <Input
                                                        placeholder="e.g., Panadol"
                                                        value={item.medicationName}
                                                        onChange={(e) => updatePrescriptionItem(index, 'medicationName', e.target.value)}
                                                    />
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <div>
                                                    <Text className="text-sm text-gray-600 block mb-1">
                                                        Generic Name
                                                    </Text>
                                                    <Input
                                                        placeholder="e.g., Paracetamol"
                                                        value={item.genericName}
                                                        onChange={(e) => updatePrescriptionItem(index, 'genericName', e.target.value)}
                                                    />
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <div>
                                                    <Text className="text-sm text-gray-600 block mb-1">
                                                        Dosage Form *
                                                    </Text>
                                                    <Select
                                                        placeholder="Select form"
                                                        value={item.dosageForm || undefined}
                                                        onChange={(value) => updatePrescriptionItem(index, 'dosageForm', value)}
                                                        className="w-full"
                                                    >
                                                        <Option value="tablet">Tablet</Option>
                                                        <Option value="capsule">Capsule</Option>
                                                        <Option value="syrup">Syrup</Option>
                                                        <Option value="injection">Injection</Option>
                                                        <Option value="cream">Cream</Option>
                                                        <Option value="ointment">Ointment</Option>
                                                        <Option value="drops">Drops</Option>
                                                        <Option value="inhaler">Inhaler</Option>
                                                    </Select>
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <div>
                                                    <Text className="text-sm text-gray-600 block mb-1">
                                                        Strength *
                                                    </Text>
                                                    <Input
                                                        placeholder="e.g., 500mg"
                                                        value={item.strength}
                                                        onChange={(e) => updatePrescriptionItem(index, 'strength', e.target.value)}
                                                    />
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <div>
                                                    <Text className="text-sm text-gray-600 block mb-1">
                                                        Quantity *
                                                    </Text>
                                                    <InputNumber
                                                        placeholder="Quantity"
                                                        min={1}
                                                        max={1000}
                                                        value={item.quantity}
                                                        onChange={(value) => updatePrescriptionItem(index, 'quantity', value || 1)}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <div>
                                                    <Text className="text-sm text-gray-600 block mb-1">
                                                        Frequency *
                                                    </Text>
                                                    <Select
                                                        placeholder="How often"
                                                        value={item.frequency || undefined}
                                                        onChange={(value) => updatePrescriptionItem(index, 'frequency', value)}
                                                        className="w-full"
                                                    >
                                                        <Option value="Once daily">Once daily</Option>
                                                        <Option value="Twice daily">Twice daily</Option>
                                                        <Option value="Three times daily">Three times daily</Option>
                                                        <Option value="Four times daily">Four times daily</Option>
                                                        <Option value="Every 4 hours">Every 4 hours</Option>
                                                        <Option value="Every 6 hours">Every 6 hours</Option>
                                                        <Option value="Every 8 hours">Every 8 hours</Option>
                                                        <Option value="As needed">As needed</Option>
                                                    </Select>
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <div>
                                                    <Text className="text-sm text-gray-600 block mb-1">
                                                        Duration *
                                                    </Text>
                                                    <Select
                                                        placeholder="How long"
                                                        value={item.duration || undefined}
                                                        onChange={(value) => updatePrescriptionItem(index, 'duration', value)}
                                                        className="w-full"
                                                    >
                                                        <Option value="3 days">3 days</Option>
                                                        <Option value="5 days">5 days</Option>
                                                        <Option value="7 days">7 days</Option>
                                                        <Option value="10 days">10 days</Option>
                                                        <Option value="14 days">14 days</Option>
                                                        <Option value="1 month">1 month</Option>
                                                        <Option value="3 months">3 months</Option>
                                                        <Option value="Until finished">Until finished</Option>
                                                    </Select>
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <div>
                                                    <Text className="text-sm text-gray-600 block mb-1">
                                                        Instructions *
                                                    </Text>
                                                    <Select
                                                        placeholder="When to take"
                                                        value={item.instructions || undefined}
                                                        onChange={(value) => updatePrescriptionItem(index, 'instructions', value)}
                                                        className="w-full"
                                                    >
                                                        <Option value="Take with food">Take with food</Option>
                                                        <Option value="Take on empty stomach">Take on empty stomach</Option>
                                                        <Option value="Take before meals">Take before meals</Option>
                                                        <Option value="Take after meals">Take after meals</Option>
                                                        <Option value="Take with water">Take with water</Option>
                                                        <Option value="Apply to affected area">Apply to affected area</Option>
                                                        <Option value="As directed">As directed</Option>
                                                    </Select>
                                                </div>
                                            </Col>
                                            <Col xs={24}>
                                                <div>
                                                    <Text className="text-sm text-gray-600 block mb-1">
                                                        Additional Notes
                                                    </Text>
                                                    <TextArea
                                                        rows={2}
                                                        placeholder="Additional notes for this medication..."
                                                        value={item.notes}
                                                        onChange={(e) => updatePrescriptionItem(index, 'notes', e.target.value)}
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <Title level={4}>Review Prescription</Title>

                        {selectedAppointment && (
                            <Card title="Appointment Details">
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12}>
                                        <Text className="text-sm text-gray-600 block">Patient</Text>
                                        <Text className="font-medium">{selectedAppointment.patient.name}</Text>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Text className="text-sm text-gray-600 block">Appointment Date</Text>
                                        <Text className="font-medium">
                                            {dayjs(selectedAppointment.appointmentDateTime).format('MMMM D, YYYY [at] h:mm A')}
                                        </Text>
                                    </Col>
                                </Row>
                            </Card>
                        )}

                        <Card title="Clinical Information">
                            <Space direction="vertical" size={12} className="w-full">
                                <div>
                                    <Text className="text-sm text-gray-600 block">Diagnosis</Text>
                                    <Text>{form.getFieldValue('diagnosis')}</Text>
                                </div>
                                <div>
                                    <Text className="text-sm text-gray-600 block">Instructions</Text>
                                    <Text>{form.getFieldValue('instructions')}</Text>
                                </div>
                                {form.getFieldValue('notes') && (
                                    <div>
                                        <Text className="text-sm text-gray-600 block">Notes</Text>
                                        <Text>{form.getFieldValue('notes')}</Text>
                                    </div>
                                )}
                            </Space>
                        </Card>

                        <Card title={`Medications (${prescriptionItems.length})`}>
                            {prescriptionItems.map((item, index) => (
                                <div key={item.medicationName + "-" + index} className={`p-3 ${index > 0 ? 'border-t' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <Text className="font-medium text-blue-600">
                                            {item.medicationName} {item.strength}
                                        </Text>
                                        <Badge count={item.quantity} color="blue" />
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div>Form: {item.dosageForm}</div>
                                        <div>Frequency: {item.frequency}</div>
                                        <div>Duration: {item.duration}</div>
                                        <div>Instructions: {item.instructions}</div>
                                        {item.genericName && <div>Generic: {item.genericName}</div>}
                                        {item.notes && <div>Notes: {item.notes}</div>}
                                    </div>
                                </div>
                            ))}
                        </Card>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Create New Prescription</span>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={900}
            className="create-prescription-modal"
        >
            <div className="space-y-6">
                {/* Steps Header */}
                <Steps current={currentStep} size="small">
                    {steps.map((step) => (
                        <Step key={step.title} title={step.title} description={step.description} />
                    ))}
                </Steps>

                {/* Form Content */}
                <Form form={form} layout="vertical">
                    <div className="min-h-[400px]">
                        {renderStepContent()}
                    </div>
                </Form>

                <Divider />

                {/* Footer Buttons */}
                <div className="flex justify-between pt-4 border-t">
                    <Button
                        onClick={handleStepPrev}
                        disabled={currentStep === 0}
                    >
                        Previous
                    </Button>

                    <Space>
                        <Button onClick={onCancel}>
                            Cancel
                        </Button>

                        {currentStep < steps.length - 1 ? (
                            <Button
                                type="primary"
                                onClick={handleStepNext}
                                disabled={
                                    (currentStep === 0 && !selectedAppointment) ||
                                    (currentStep === 2 && prescriptionItems.length === 0)
                                }
                                className="bg-blue-600 hover:bg-blue-700 border-blue-600"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                onClick={handleSubmit}
                                loading={loading}
                                className="bg-blue-600 hover:bg-blue-700 border-blue-600"
                            >
                                Create Prescription
                            </Button>
                        )}
                    </Space>
                </div>
            </div>
        </Modal>
    );
};

export default CreatePrescriptionModal;
