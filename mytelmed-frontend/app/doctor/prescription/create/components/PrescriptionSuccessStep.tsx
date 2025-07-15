"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Typography, Row, Col, Avatar, Badge, Space } from "antd";
import { CheckCircle, FileText, Home, Eye, Plus, Calendar, Clock } from "lucide-react";
import { RootState } from "@/lib/store";
import { resetCreationState } from "@/lib/reducers/prescription-creation-reducer";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function PrescriptionSuccessStep() {
    const router = useRouter();
    const dispatch = useDispatch();

    const {
        selectedAppointment,
        createdPrescriptionId,
        prescriptionDetails,
        medications
    } = useSelector((state: RootState) => state.rootReducer.prescriptionCreation);

    const handleViewPrescription = () => {
        if (createdPrescriptionId) {
            // Navigate to prescription detail view (you may need to implement this route)
            router.push(`/doctor/prescription`);
        }
    };

    const handleCreateAnother = () => {
        dispatch(resetCreationState());
        router.push("/doctor/prescription/create");
    };

    const handleBackToDashboard = () => {
        dispatch(resetCreationState());
        router.push("/doctor/prescription");
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

    const getCurrentDate = () => {
        return dayjs().format("MMM DD, YYYY [at] h:mm A");
    };

    return (
        <div className="space-y-6" style={{ backgroundColor: "white" }}>
            {/* Success Header */}
            <Card className="text-center shadow-sm" style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}>
                <div className="py-8">
                    <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />
                    <Title level={2} className="text-green-800 mb-4">
                        Prescription Created Successfully!
                    </Title>
                    <Text className="text-gray-600 text-lg block mb-2">
                        Your prescription has been created and is now available for processing.
                    </Text>
                    <Text className="text-gray-500 text-sm">
                        Created on {getCurrentDate()}
                    </Text>
                </div>
            </Card>

            {/* Prescription Summary */}
            <Card
                title={
                    <span className="flex items-center gap-2 text-green-800">
                        <FileText className="w-5 h-5" />
                        Prescription Summary
                    </span>
                }
                className="shadow-sm"
                style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
            >
                {selectedAppointment && (
                    <div className="space-y-6">
                        {/* Patient Information */}
                        <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                            <Avatar
                                size={56}
                                className="bg-green-500 text-white font-semibold"
                            >
                                {getPatientInitials()}
                            </Avatar>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <Text className="font-semibold text-gray-900 text-lg">
                                        {getPatientName()}
                                    </Text>
                                    <Badge
                                        color="green"
                                        text="Prescription Created"
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
                            </div>
                        </div>

                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={12}>
                                <div className="space-y-3">
                                    <div>
                                        <Text className="font-semibold text-gray-700 block mb-1">Diagnosis:</Text>
                                        <Text className="text-gray-800">{prescriptionDetails.diagnosis}</Text>
                                    </div>

                                    <div>
                                        <Text className="font-semibold text-gray-700 block mb-1">General Instructions:</Text>
                                        <Text className="text-gray-800">{prescriptionDetails.instructions}</Text>
                                    </div>

                                    {prescriptionDetails.notes && (
                                        <div>
                                            <Text className="font-semibold text-gray-700 block mb-1">Additional Notes:</Text>
                                            <Text className="text-gray-800">{prescriptionDetails.notes}</Text>
                                        </div>
                                    )}
                                </div>
                            </Col>

                            <Col xs={24} md={12}>
                                <div>
                                    <Text className="font-semibold text-gray-700 block mb-3">
                                        Medications ({medications.length}):
                                    </Text>
                                    <div className="space-y-2">
                                        {medications.slice(0, 3).map((medication, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                                                <Text className="font-medium text-gray-900 block">
                                                    {medication.medicationName}
                                                </Text>
                                                <Text className="text-gray-600 text-sm">
                                                    {medication.dosageForm} - {medication.strength}
                                                </Text>
                                                <Text className="text-gray-600 text-sm">
                                                    {medication.frequency} for {medication.duration}
                                                </Text>
                                            </div>
                                        ))}
                                        {medications.length > 3 && (
                                            <div className="text-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                                                <Text className="text-gray-600 text-sm">
                                                    +{medications.length - 3} more medication{medications.length - 3 > 1 ? 's' : ''}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
            </Card>

            {/* Next Steps */}
            <Card
                title={
                    <span className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        What Happens Next?
                    </span>
                }
                className="shadow-sm"
                style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
            >
                <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-green-600 font-semibold text-sm">1</span>
                        </div>
                        <div>
                            <Text className="font-semibold text-gray-900 block">Patient Notification</Text>
                            <Text className="text-gray-600 text-sm">
                                The patient will receive a notification about the new prescription and instructions for collection.
                            </Text>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-green-600 font-semibold text-sm">2</span>
                        </div>
                        <div>
                            <Text className="font-semibold text-gray-900 block">Prescription Processing</Text>
                            <Text className="text-gray-600 text-sm">
                                The prescription will be processed by the pharmacy once the patient is ready to collect.
                            </Text>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-green-600 font-semibold text-sm">3</span>
                        </div>
                        <div>
                            <Text className="font-semibold text-gray-900 block">Medication Collection</Text>
                            <Text className="text-gray-600 text-sm">
                                The patient can collect their medication from the designated pharmacy once ready.
                            </Text>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Important Reminders */}
            <Card className="border-l-4 border-l-green-500" style={{ backgroundColor: "#f0fdf4" }}>
                <Title level={5} className="text-green-800 mb-3 mt-0">
                    Important Reminders
                </Title>
                <div className="space-y-2 text-sm text-green-700">
                    <div>• The prescription is valid for 30 days from the creation date</div>
                    <div>• You can view, modify, or cancel this prescription from your dashboard</div>
                    <div>• Monitor patient progress and adjust treatment as needed</div>
                    <div>• Ensure follow-up appointments are scheduled if required</div>
                </div>
            </Card>

            {/* Action Buttons */}
            <Card className="shadow-sm" style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}>
                <div className="text-center space-y-4">
                    <Title level={4} className="text-gray-800 mb-4 mt-0">
                        What would you like to do next?
                    </Title>

                    <Space size="large" direction="vertical" className="w-full">
                        <Row gutter={[16, 16]} justify="center">
                            <Col xs={24} sm={12} md={8}>
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    icon={<Eye className="w-4 h-4" />}
                                    onClick={handleViewPrescription}
                                    className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 h-12"
                                    style={{ backgroundColor: "#059669" }}
                                >
                                    View Prescription
                                </Button>
                            </Col>

                            <Col xs={24} sm={12} md={8}>
                                <Button
                                    size="large"
                                    block
                                    icon={<Plus className="w-4 h-4" />}
                                    onClick={handleCreateAnother}
                                    className="border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 hover:text-green-700 h-12"
                                >
                                    Create Another
                                </Button>
                            </Col>

                            <Col xs={24} sm={12} md={8}>
                                <Button
                                    size="large"
                                    block
                                    icon={<Home className="w-4 h-4" />}
                                    onClick={handleBackToDashboard}
                                    className="border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 h-12"
                                >
                                    Back to Dashboard
                                </Button>
                            </Col>
                        </Row>
                    </Space>
                </div>
            </Card>
        </div>
    );
} 