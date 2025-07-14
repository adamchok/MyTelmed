"use client";

import React, { useState, useEffect } from "react";
import {
    Modal,
    Form,
    Input,
    DatePicker,
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
    Radio,
} from "antd";
import { User, Clock, AlertTriangle, CheckCircle, Building } from "lucide-react";
import dayjs from "dayjs";
import AppointmentApi from "@/app/api/appointment";

import ReferralApi from "@/app/api/referral";
import { AppointmentDto } from "@/app/api/appointment/props";
import { Doctor } from "@/app/api/doctor/props";
import { CreateReferralRequestDto, ReferralType, ReferralPriority } from "@/app/api/referral/props";
import DoctorSelectionModal from "./DoctorSelectionModal";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

interface CreateReferralModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const CreateReferralModal: React.FC<CreateReferralModalProps> = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [completedAppointments, setCompletedAppointments] = useState<AppointmentDto[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDto | null>(null);
    const [referralType, setReferralType] = useState<ReferralType>(ReferralType.INTERNAL);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [doctorSelectionModalVisible, setDoctorSelectionModalVisible] = useState(false);

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
            setReferralType(ReferralType.INTERNAL);
            setSelectedDoctor(null);
            setDoctorSelectionModalVisible(false);
        }
    }, [visible, form]);

    const loadCompletedAppointments = async () => {
        try {
            const response = await AppointmentApi.getAllAppointmentsByAccount();
            if (response.data.isSuccess && response.data.data) {
                // Filter only completed appointments
                const completed = response.data.data.filter((apt) => apt.status === "COMPLETED");
                setCompletedAppointments(completed);
            }
        } catch {
            message.error("Failed to load appointments");
        }
    };

    const handleDoctorSelect = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        form.setFieldsValue({ referredDoctorId: doctor.id });
        setDoctorSelectionModalVisible(false);
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

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            const requestData: CreateReferralRequestDto = {
                patientId: selectedAppointment!.patient.id,
                referralType: referralType,
                priority: values.priority,
                clinicalSummary: values.clinicalSummary,
                reasonForReferral: values.reasonForReferral,
                investigationsDone: values.investigationsDone,
                currentMedications: values.currentMedications,
                allergies: values.allergies,
                vitalSigns: values.vitalSigns,
                expiryDate: dayjs(values.expiryDate).format("DD-MM-YYYY"),
                notes: values.notes,
            };

            if (referralType === ReferralType.INTERNAL) {
                requestData.referredDoctorId = values.referredDoctorId;
            } else {
                requestData.externalDoctorName = values.externalDoctorName;
                requestData.externalDoctorSpeciality = values.externalDoctorSpeciality;
                requestData.externalFacilityName = values.externalFacilityName;
                requestData.externalFacilityAddress = values.externalFacilityAddress;
                requestData.externalContactNumber = values.externalContactNumber;
                requestData.externalEmail = values.externalEmail;
            }

            await ReferralApi.createReferral(requestData);
            onSuccess();
        } catch {
            message.error("Failed to create referral");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: "Select Patient",
            description: "Choose from completed appointments",
        },
        {
            title: "Referral Type",
            description: "Internal or external referral",
        },
        {
            title: "Clinical Details",
            description: "Add medical information",
        },
        {
            title: "Review & Submit",
            description: "Confirm referral details",
        },
    ];

    const getPriorityTextColor = (priority: ReferralPriority) => {
        switch (priority) {
            case ReferralPriority.EMERGENCY:
                return "#ef4444";
            case ReferralPriority.URGENT:
                return "#f97316";
            case ReferralPriority.ROUTINE:
                return "#22c55e";
            default:
                return "#000000";
        }
    };

    const getPriorityIcon = (priority: ReferralPriority) => {
        switch (priority) {
            case ReferralPriority.EMERGENCY:
                return <AlertTriangle className="w-4 h-4" />;
            case ReferralPriority.URGENT:
                return <Clock className="w-4 h-4" />;
            case ReferralPriority.ROUTINE:
                return <CheckCircle className="w-4 h-4" />;
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <Title level={4}>Select Patient from Completed Appointments</Title>
                        <Text type="secondary">You can only refer patients from appointments you have completed.</Text>

                        {completedAppointments.length === 0 ? (
                            <div className="text-center py-8">
                                <Text type="secondary">No completed appointments found</Text>
                            </div>
                        ) : (
                            <div className="max-h-64 overflow-y-auto space-y-2">
                                {completedAppointments.map((appointment) => (
                                    <Card
                                        key={appointment.id}
                                        hoverable
                                        className={`cursor-pointer border-2 transition-all ${
                                            selectedAppointment?.id === appointment.id
                                                ? "border-green-500 bg-green-50"
                                                : "border-gray-200 hover:border-green-300"
                                        }`}
                                        onClick={() => setSelectedAppointment(appointment)}
                                        size="small"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Avatar
                                                src={appointment.patient.profileImageUrl}
                                                icon={<User className="w-4 h-4" />}
                                                size={40}
                                            />
                                            <div className="flex-1">
                                                <Text strong>{appointment.patient.name}</Text>
                                                <div className="text-xs text-gray-500">
                                                    Completed:{" "}
                                                    {appointment.completedAt
                                                        ? dayjs(Number(appointment.completedAt) * 1000).format(
                                                              "MMM DD, YYYY HH:mm"
                                                          )
                                                        : "N/A"}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {appointment.reasonForVisit}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-6">
                        <Title level={4}>Referral Type & Recipient</Title>

                        <Form.Item label="Referral Type" required>
                            <Radio.Group
                                value={referralType}
                                onChange={(e) => setReferralType(e.target.value)}
                                className="w-full"
                            >
                                <Space direction="vertical" className="w-full">
                                    <Radio value={ReferralType.INTERNAL}>
                                        <Space>
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span>Internal Referral - To doctor within the system</span>
                                        </Space>
                                    </Radio>
                                    <Radio value={ReferralType.EXTERNAL}>
                                        <Space>
                                            <Building className="w-4 h-4 text-blue-600" />
                                            <span>External Referral - To doctor outside the system</span>
                                        </Space>
                                    </Radio>
                                </Space>
                            </Radio.Group>
                        </Form.Item>

                        {referralType === ReferralType.INTERNAL ? (
                            <Form.Item
                                name="referredDoctorId"
                                label="Select Doctor"
                                rules={[{ required: true, message: "Please select a doctor" }]}
                            >
                                <div className="space-y-3">
                                    {selectedDoctor ? (
                                        <Card size="small" className="border-green-200 bg-green-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar
                                                        src={selectedDoctor.profileImageUrl}
                                                        icon={<User className="w-4 h-4" />}
                                                        size={40}
                                                    />
                                                    <div>
                                                        <Text strong>{selectedDoctor.name}</Text>
                                                        <div className="text-xs text-gray-600">
                                                            {selectedDoctor.specialityList?.join(", ") || "General"}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {selectedDoctor.facility.name}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="link"
                                                    onClick={() => setDoctorSelectionModalVisible(true)}
                                                    className="text-green-700"
                                                >
                                                    Change
                                                </Button>
                                            </div>
                                        </Card>
                                    ) : (
                                        <Button
                                            type="dashed"
                                            size="large"
                                            onClick={() => setDoctorSelectionModalVisible(true)}
                                            className="w-full h-16 border-green-300 text-green-700 hover:border-green-500"
                                        >
                                            <div className="flex flex-col items-center space-y-1">
                                                <User className="w-5 h-5" />
                                                <span>Select Doctor</span>
                                            </div>
                                        </Button>
                                    )}
                                </div>
                            </Form.Item>
                        ) : (
                            <div className="space-y-4">
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="externalDoctorName"
                                            label="Doctor Name"
                                            rules={[{ required: true, message: "Please enter doctor name" }]}
                                        >
                                            <Input placeholder="Enter doctor name" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="externalDoctorSpeciality"
                                            label="Speciality"
                                            rules={[{ required: true, message: "Please enter speciality" }]}
                                        >
                                            <Input placeholder="Enter speciality" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item
                                    name="externalFacilityName"
                                    label="Facility Name"
                                    rules={[{ required: true, message: "Please enter facility name" }]}
                                >
                                    <Input placeholder="Enter facility/hospital name" />
                                </Form.Item>

                                <Form.Item
                                    name="externalFacilityAddress"
                                    label="Facility Address"
                                    rules={[{ required: true, message: "Please enter facility address" }]}
                                >
                                    <TextArea rows={2} placeholder="Enter facility address" />
                                </Form.Item>

                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="externalContactNumber" label="Contact Number">
                                            <Input placeholder="Enter contact number" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="externalEmail"
                                            label="Email"
                                            rules={[{ type: "email", message: "Please enter valid email" }]}
                                        >
                                            <Input placeholder="Enter email" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        )}

                        <Form.Item
                            name="priority"
                            label="Priority Level"
                            rules={[{ required: true, message: "Please select priority" }]}
                        >
                            <Radio.Group>
                                <Space direction="vertical">
                                    {Object.values(ReferralPriority).map((priority) => (
                                        <Radio key={priority} value={priority}>
                                            <Space>
                                                {getPriorityIcon(priority)}
                                                <span style={{ color: getPriorityTextColor(priority) }}>
                                                    {priority}
                                                </span>
                                            </Space>
                                        </Radio>
                                    ))}
                                </Space>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            name="expiryDate"
                            label="Expiry Date"
                            rules={[{ required: true, message: "Please select expiry date" }]}
                        >
                            <DatePicker
                                className="w-full"
                                format="DD-MM-YYYY"
                                disabledDate={(current) => current && current <= dayjs().endOf("day")}
                                placeholder="Select expiry date"
                            />
                        </Form.Item>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <Title level={4}>Clinical Information</Title>

                        <Form.Item
                            name="reasonForReferral"
                            label="Reason for Referral"
                            rules={[{ required: true, message: "Please enter reason for referral" }]}
                        >
                            <TextArea
                                rows={3}
                                placeholder="Explain why this referral is needed..."
                                maxLength={1000}
                                showCount
                            />
                        </Form.Item>

                        <Form.Item
                            name="clinicalSummary"
                            label="Clinical Summary"
                            rules={[{ required: true, message: "Please enter clinical summary" }]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Provide a summary of the patient's condition..."
                                maxLength={2000}
                                showCount
                            />
                        </Form.Item>

                        <Form.Item name="investigationsDone" label="Investigations Done">
                            <TextArea
                                rows={3}
                                placeholder="List any tests, scans, or investigations performed..."
                                maxLength={1000}
                                showCount
                            />
                        </Form.Item>

                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                                <Form.Item name="currentMedications" label="Current Medications">
                                    <TextArea
                                        rows={3}
                                        placeholder="List current medications..."
                                        maxLength={500}
                                        showCount
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item name="allergies" label="Known Allergies">
                                    <TextArea
                                        rows={3}
                                        placeholder="List any known allergies..."
                                        maxLength={500}
                                        showCount
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="vitalSigns" label="Vital Signs">
                            <TextArea rows={2} placeholder="BP, HR, Temp, etc..." maxLength={300} showCount />
                        </Form.Item>

                        <Form.Item name="notes" label="Additional Notes">
                            <TextArea
                                rows={3}
                                placeholder="Any additional notes or instructions..."
                                maxLength={1000}
                                showCount
                            />
                        </Form.Item>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <Title level={4}>Review Referral Details</Title>

                        {selectedAppointment && (
                            <Card title="Patient Information" size="small">
                                <div className="flex items-center space-x-4">
                                    <Avatar
                                        src={selectedAppointment.patient.profileImageUrl}
                                        icon={<User className="w-4 h-4" />}
                                        size={48}
                                    />
                                    <div>
                                        <Text strong className="block">
                                            {selectedAppointment.patient.name}
                                        </Text>
                                        <Text type="secondary">{selectedAppointment.patient.email}</Text>
                                        <Text type="secondary" className="block">
                                            {selectedAppointment.patient.phone}
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        )}

                        <Card title="Referral Summary" size="small">
                            <div className="space-y-2">
                                <div>
                                    <Text strong>Type:</Text> {referralType}
                                </div>
                                <div>
                                    <Text strong>Priority:</Text> {form.getFieldValue("priority")}
                                </div>
                                <div>
                                    <Text strong>Expiry Date:</Text>{" "}
                                    {form.getFieldValue("expiryDate")?.format("DD-MM-YYYY")}
                                </div>
                                {referralType === ReferralType.INTERNAL ? (
                                    <div>
                                        <Text strong>Referred To:</Text> {selectedDoctor?.name || "No doctor selected"}
                                    </div>
                                ) : (
                                    <div>
                                        <Text strong>External Doctor:</Text> {form.getFieldValue("externalDoctorName")}{" "}
                                        - {form.getFieldValue("externalDoctorSpeciality")}
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Card title="Clinical Information" size="small">
                            <div className="space-y-3">
                                <div>
                                    <Text strong className="block">
                                        Reason for Referral:
                                    </Text>
                                    <Text>{form.getFieldValue("reasonForReferral")}</Text>
                                </div>
                                <Divider className="my-2" />
                                <div>
                                    <Text strong className="block">
                                        Clinical Summary:
                                    </Text>
                                    <Text>{form.getFieldValue("clinicalSummary")}</Text>
                                </div>
                            </div>
                        </Card>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Modal
            title="Create New Referral"
            open={visible}
            onCancel={onCancel}
            width={800}
            footer={null}
            className="top-4"
        >
            <div className="space-y-6">
                <Steps current={currentStep} size="small">
                    {steps.map((step) => (
                        <Step
                            key={step.title}
                            title={<span className="text-xs sm:text-sm">{step.title}</span>}
                            description={<span className="text-xs hidden sm:block">{step.description}</span>}
                        />
                    ))}
                </Steps>

                <Form form={form} layout="vertical" className="mt-6">
                    {renderStepContent()}
                </Form>

                <div className="flex justify-between pt-4 border-t">
                    <Button onClick={handleStepPrev} disabled={currentStep === 0}>
                        Previous
                    </Button>

                    <Space>
                        <Button onClick={onCancel}>Cancel</Button>

                        {currentStep < steps.length - 1 ? (
                            <Button
                                type="primary"
                                onClick={handleStepNext}
                                disabled={currentStep === 0 && !selectedAppointment}
                                className="bg-green-700 hover:bg-green-800 border-green-700"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                onClick={handleSubmit}
                                loading={loading}
                                className="bg-green-700 hover:bg-green-800 border-green-700"
                            >
                                Create Referral
                            </Button>
                        )}
                    </Space>
                </div>
            </div>

            {/* Doctor Selection Modal */}
            <DoctorSelectionModal
                visible={doctorSelectionModalVisible}
                onCancel={() => setDoctorSelectionModalVisible(false)}
                onSelect={handleDoctorSelect}
                selectedDoctorId={selectedDoctor?.id}
            />
        </Modal>
    );
};

export default CreateReferralModal;
