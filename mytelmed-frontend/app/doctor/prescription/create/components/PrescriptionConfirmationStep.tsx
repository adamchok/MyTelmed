"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Typography, Row, Col, Avatar, Badge, Divider, Spin, message, Modal } from "antd";
import { ArrowLeft, CheckCircle, User, Calendar, Clock, FileText, Pill, Stethoscope, AlertTriangle } from "lucide-react";
import { RootState } from "@/lib/store";
import {
    setIsCreating,
    setCreationSuccess,
    setCreatedPrescriptionId,
    nextStep,
    previousStep
} from "@/lib/reducers/prescription-creation-reducer";
import PrescriptionApi from "@/app/api/prescription";
import { CreatePrescriptionRequestDto } from "@/app/api/prescription/props";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function PrescriptionConfirmationStep() {
    const dispatch = useDispatch();
    const {
        selectedAppointment,
        prescriptionDetails,
        medications,
        isCreating
    } = useSelector((state: RootState) => state.rootReducer.prescriptionCreation);

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handlePrevious = () => {
        dispatch(previousStep());
    };

    const handleCreatePrescription = async () => {
        if (!selectedAppointment) {
            message.error("No appointment selected");
            return;
        }

        try {
            dispatch(setIsCreating(true));

            const createRequest: CreatePrescriptionRequestDto = {
                appointmentId: selectedAppointment.id,
                diagnosis: prescriptionDetails.diagnosis,
                notes: prescriptionDetails.notes,
                instructions: prescriptionDetails.instructions,
                prescriptionItems: medications
            };

            const response = await PrescriptionApi.createPrescription(createRequest);

            if (response.data.isSuccess && response.data.data) {
                dispatch(setCreatedPrescriptionId(response.data.data.id));
                dispatch(setCreationSuccess(true));
                dispatch(nextStep());
                message.success("Prescription created successfully!");
            } else {
                throw new Error(response.data.message || "Failed to create prescription");
            }
        } catch (error: any) {
            console.error("Failed to create prescription:", error);
            message.error(error.message || "Failed to create prescription. Please try again.");
        } finally {
            dispatch(setIsCreating(false));
            setShowConfirmModal(false);
        }
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

    const getTotalMedications = () => {
        return medications.length;
    };

    const hasRequiredInfo = () => {
        return selectedAppointment &&
            prescriptionDetails.diagnosis &&
            prescriptionDetails.instructions &&
            medications.length > 0;
    };

    if (isCreating) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Spin size="large" />
                    <Text className="block mt-4 text-gray-600 text-lg">
                        Creating prescription...
                    </Text>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6" style={{ backgroundColor: "white" }}>
            {/* Header */}
            <Card className="shadow-sm" style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}>
                <div className="text-center mb-6">
                    <Title level={3} className="text-green-800 mb-2">
                        Review & Confirm Prescription
                    </Title>
                    <Text className="text-gray-600">
                        Please review all the details before creating the prescription
                    </Text>
                </div>
            </Card>

            {/* Patient & Appointment Information */}
            {selectedAppointment && (
                <Card
                    title={
                        <span className="flex items-center gap-2 text-green-800">
                            <User className="w-5 h-5" />
                            Patient & Appointment Details
                        </span>
                    }
                    className="shadow-sm"
                    style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
                >
                    <div className="flex items-center space-x-4 mb-4">
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
                                <span className="flex items-center text-gray-600 text-sm">
                                    <User className="w-4 h-4 mr-1" />
                                    {selectedAppointment.consultationMode}
                                </span>
                            </div>
                        </div>
                    </div>
                    {selectedAppointment.reasonForVisit && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <Text className="text-sm text-gray-700">
                                <FileText className="w-4 h-4 inline mr-1" />
                                <span className="font-medium">Reason for Visit:</span> {selectedAppointment.reasonForVisit}
                            </Text>
                        </div>
                    )}
                </Card>
            )}

            {/* Prescription Details */}
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
                <Row gutter={[24, 24]}>
                    <Col xs={24}>
                        <div className="space-y-4">
                            <div>
                                <Text className="font-semibold text-gray-700 block mb-2">Diagnosis:</Text>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <Text className="text-gray-800">{prescriptionDetails.diagnosis}</Text>
                                </div>
                            </div>

                            <div>
                                <Text className="font-semibold text-gray-700 block mb-2">General Instructions:</Text>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <Text className="text-gray-800">{prescriptionDetails.instructions}</Text>
                                </div>
                            </div>

                            {prescriptionDetails.notes && (
                                <div>
                                    <Text className="font-semibold text-gray-700 block mb-2">Additional Notes:</Text>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <Text className="text-gray-800">{prescriptionDetails.notes}</Text>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Medications */}
            <Card
                title={
                    <span className="flex items-center gap-2 text-green-800">
                        <Pill className="w-5 h-5" />
                        Medications ({getTotalMedications()})
                    </span>
                }
                className="shadow-sm"
                style={{ backgroundColor: "white", borderColor: "#e5e7eb" }}
            >
                <div className="space-y-4">
                    {medications.map((medication, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <div>
                                        <Text className="font-semibold text-gray-900 text-base block">
                                            {medication.medicationName}
                                        </Text>
                                        {medication.genericName && (
                                            <Text className="text-gray-600 text-sm block">
                                                Generic: {medication.genericName}
                                            </Text>
                                        )}
                                        <Text className="text-gray-700 text-sm">
                                            {medication.dosageForm} - {medication.strength}
                                        </Text>
                                    </div>
                                </Col>
                                <Col xs={24} md={12}>
                                    <div className="space-y-1">
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-700">Quantity:</span> {medication.quantity}
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-700">Frequency:</span> {medication.frequency}
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-700">Duration:</span> {medication.duration}
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={24}>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-700">Instructions:</span> {medication.instructions}
                                        </div>
                                        {medication.notes && (
                                            <div className="text-sm mt-2">
                                                <span className="font-medium text-gray-700">Notes:</span> {medication.notes}
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                            {index < medications.length - 1 && <Divider className="my-4" />}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Final Confirmation Notice */}
            <Card className="border-l-4 border-l-green-500" style={{ backgroundColor: "#f0fdf4" }}>
                <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                        <Title level={5} className="text-green-800 mb-2">
                            Ready to Create Prescription
                        </Title>
                        <div className="space-y-1 text-sm text-green-700">
                            <div>• All required information has been provided</div>
                            <div>• Prescription will be valid for 30 days from creation date</div>
                            <div>• Patient will be notified once prescription is created</div>
                            <div>• You can modify or cancel this prescription if needed</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Validation Error */}
            {!hasRequiredInfo() && (
                <Card className="border-l-4 border-l-red-500" style={{ backgroundColor: "#fef2f2" }}>
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                        <div>
                            <Title level={5} className="text-red-800 mb-2">
                                Missing Required Information
                            </Title>
                            <div className="space-y-1 text-sm text-red-700">
                                {!selectedAppointment && <div>• No appointment selected</div>}
                                {!prescriptionDetails.diagnosis && <div>• Diagnosis is required</div>}
                                {!prescriptionDetails.instructions && <div>• General instructions are required</div>}
                                {medications.length === 0 && <div>• At least one medication is required</div>}
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
                    Back to Medications
                </Button>
                <Button
                    type="primary"
                    size="large"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={!hasRequiredInfo()}
                    className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 disabled:bg-gray-400 disabled:border-gray-400"
                    style={{ backgroundColor: hasRequiredInfo() ? "#059669" : undefined }}
                >
                    Create Prescription
                    <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
            </div>

            {/* Confirmation Modal */}
            <Modal
                title="Confirm Prescription Creation"
                open={showConfirmModal}
                onCancel={() => setShowConfirmModal(false)}
                footer={null}
                className="prescription-confirm-modal"
                centered
            >
                <div className="text-center py-4">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <Title level={4} className="text-gray-800 mb-2">
                        Create Prescription?
                    </Title>
                    <Text className="text-gray-600 block mb-6">
                        Are you sure you want to create this prescription for {getPatientName()}?<br></br>
                        <span className="font-bold">This action cannot be undone and you cannot modify or cancel the prescription later.</span>
                    </Text>
                    <div className="flex justify-center space-x-3">
                        <Button
                            onClick={() => setShowConfirmModal(false)}
                            className="border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleCreatePrescription}
                            loading={isCreating}
                            className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                            style={{ backgroundColor: "#059669" }}
                        >
                            Yes, Create Prescription
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
} 