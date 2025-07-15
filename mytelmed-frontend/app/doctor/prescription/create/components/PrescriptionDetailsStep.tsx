"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Form, Input, Button, Typography, Row, Col, Avatar, Badge } from "antd";
import { ArrowRight, ArrowLeft, FileText, Stethoscope, User, Calendar, Clock } from "lucide-react";
import { RootState } from "@/lib/store";
import { setPrescriptionDetails, nextStep, previousStep } from "@/lib/reducers/prescription-creation-reducer";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PrescriptionDetailsStep() {
    const dispatch = useDispatch();
    const { selectedAppointment, prescriptionDetails } = useSelector(
        (state: RootState) => state.rootReducer.prescriptionCreation
    );

    const [form] = Form.useForm();

    const handlePrevious = () => {
        dispatch(previousStep());
    };

    const handleNext = () => {
        form.validateFields().then((values) => {
            dispatch(setPrescriptionDetails(values));
            dispatch(nextStep());
        }).catch((errorInfo) => {
            console.log('Failed:', errorInfo);
        });
    };

    const handleFormChange = () => {
        const formData = form.getFieldsValue();
        dispatch(setPrescriptionDetails(formData));
    };

    const getPatientName = () => {
        if (!selectedAppointment) return "";
        return `${selectedAppointment.patient.name}`;
    };

    const getPatientInitials = () => {
        if (!selectedAppointment) return "";
        return `${selectedAppointment.patient.name.charAt(0)}`;
    };

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format("MMM DD, YYYY");
    };

    const formatTime = (dateString: string) => {
        return dayjs(dateString).format("h:mm A");
    };

    return (
        <div className="space-y-6" style={{ backgroundColor: "white" }}>
            {/* Header */}
            <Card className="shadow-sm" style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}>
                <div className="text-center mb-6">
                    <Title level={3} className="text-green-800 mb-2">
                        Prescription Details
                    </Title>
                    <Text className="text-gray-600">
                        Enter the diagnosis, instructions, and notes for this prescription
                    </Text>
                </div>
            </Card>

            {/* Selected Appointment Summary */}
            {selectedAppointment && (
                <Card
                    title={
                        <span className="flex items-center gap-2 text-green-800">
                            <User className="w-5 h-5" />
                            Selected Appointment
                        </span>
                    }
                    className="shadow-sm"
                    style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
                >
                    <div className="flex items-center space-x-4">
                        <Avatar
                            size={48}
                            className="bg-green-500 text-white font-semibold"
                        >
                            {getPatientInitials()}
                        </Avatar>
                        <div>
                            <div className="flex items-center space-x-2">
                                <Text className="font-semibold text-gray-900 text-base">
                                    {getPatientName()}
                                </Text>
                                <Badge
                                    color="green"
                                    text={selectedAppointment.status}
                                    className="text-xs"
                                />
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                                <span className="flex items-center text-gray-600 text-sm">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {formatDate(selectedAppointment.appointmentDateTime)}
                                </span>
                                <span className="flex items-center text-gray-600 text-sm">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {formatTime(selectedAppointment.appointmentDateTime)}
                                </span>
                            </div>
                            {selectedAppointment.reasonForVisit && (
                                <div className="flex items-center mt-2 text-gray-600 text-sm">
                                    <FileText className="w-4 h-4 mr-1" />
                                    <span className="italic">{selectedAppointment.reasonForVisit}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Prescription Form */}
            <Card
                title={
                    <span className="flex items-center gap-2 text-green-800">
                        <Stethoscope className="w-5 h-5" />
                        Prescription Information
                    </span>
                }
                className="shadow-sm"
                style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={prescriptionDetails}
                    onFieldsChange={handleFormChange}
                    className="space-y-4"
                >
                    <Row gutter={[24, 24]}>
                        <Col xs={24}>
                            <Form.Item
                                name="diagnosis"
                                label={
                                    <span className="text-sm font-medium text-gray-700">
                                        Diagnosis *
                                    </span>
                                }
                                rules={[
                                    { required: true, message: "Please enter the diagnosis" },
                                    { min: 3, message: "Diagnosis must be at least 3 characters" }
                                ]}
                            >
                                <TextArea
                                    placeholder="Enter the patient's diagnosis..."
                                    rows={3}
                                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    style={{ resize: 'vertical' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[24, 24]}>
                        <Col xs={24}>
                            <Form.Item
                                name="instructions"
                                label={
                                    <span className="text-sm font-medium text-gray-700">
                                        General Instructions *
                                    </span>
                                }
                                rules={[
                                    { required: true, message: "Please enter general instructions" },
                                    { min: 10, message: "Instructions must be at least 10 characters" }
                                ]}
                            >
                                <TextArea
                                    placeholder="Enter general instructions for the patient (e.g., take with food, avoid alcohol, etc.)..."
                                    rows={4}
                                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    style={{ resize: 'vertical' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[24, 24]}>
                        <Col xs={24}>
                            <Form.Item
                                name="notes"
                                label={
                                    <span className="text-sm font-medium text-gray-700">
                                        Additional Notes
                                    </span>
                                }
                            >
                                <TextArea
                                    placeholder="Any additional notes or special considerations..."
                                    rows={3}
                                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    style={{ resize: 'vertical' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                {/* Guidelines */}
                <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Title level={5} className="text-green-800 mb-3 mt-0">
                        Prescription Guidelines
                    </Title>
                    <div className="space-y-2 text-sm text-green-700">
                        <div className="flex items-start space-x-2">
                            <span className="font-medium">•</span>
                            <span>Ensure diagnosis is specific and accurate for proper treatment</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="font-medium">•</span>
                            <span>Include clear, patient-friendly instructions for medication usage</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="font-medium">•</span>
                            <span>Note any important warnings, side effects, or drug interactions</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="font-medium">•</span>
                            <span>Consider patient&apos;s medical history and current medications</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
                <Button
                    size="large"
                    onClick={handlePrevious}
                    className="border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Appointment Selection
                </Button>
                <Button
                    type="primary"
                    size="large"
                    onClick={handleNext}
                    className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                    style={{ backgroundColor: "#059669" }}
                >
                    Continue to Add Medications
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
} 