"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Button, Typography, Avatar, Tag, List, message, Spin, Image } from "antd";
import { User, Clock, MapPin, Video, FileText, Users, Calendar, ArrowLeft, CheckCircle } from "lucide-react";
import dayjs from "dayjs";
import { RootState } from "@/lib/store";
import {
    setIsBooking,
    setBookingSuccess,
    setAppointmentId,
    nextStep,
    previousStep,
} from "@/lib/reducers/appointment-booking-reducer";
import AppointmentApi from "@/app/api/appointment";
import { BookAppointmentRequestDto } from "@/app/api/appointment/props";
import { ConsultationMode } from "@/app/api/props";

const { Title, Text } = Typography;

export default function BookingConfirmationStep() {
    const dispatch = useDispatch();
    const { selectedDoctor, selectedTimeSlot, appointmentDetails, isBooking } = useSelector(
        (state: RootState) => state.rootReducer.appointmentBooking
    );

    const [confirmationLoading, setConfirmationLoading] = useState(false);

    const handleBookAppointment = async () => {
        if (!selectedDoctor || !selectedTimeSlot) {
            message.error("Missing required booking information");
            return;
        }

        try {
            setConfirmationLoading(true);
            dispatch(setIsBooking(true));

            const bookingRequest: BookAppointmentRequestDto = {
                doctorId: selectedDoctor.id,
                patientId: appointmentDetails.patientId,
                timeSlotId: selectedTimeSlot.id,
                consultationMode: selectedTimeSlot.consultationMode,
                patientNotes: appointmentDetails.patientNotes || undefined,
                reasonForVisit: appointmentDetails.reasonForVisit,
                documentRequestList: appointmentDetails.documentIds.map((id) => ({
                    documentId: id,
                    notes: undefined,
                })),
            };

            const response = await AppointmentApi.bookAppointment(bookingRequest);

            if (response.data.isSuccess) {
                dispatch(setBookingSuccess(true));
                dispatch(setAppointmentId(response.data.data ?? null));
                dispatch(nextStep());
                message.success("Appointment booked successfully!");
            } else {
                message.error(response.data.message || "Failed to book appointment");
            }
        } catch {
            message.error("Failed to book appointment. Please try again.");
        } finally {
            setConfirmationLoading(false);
            dispatch(setIsBooking(false));
        }
    };

    const handlePrevious = () => {
        dispatch(previousStep());
    };

    const formatDateTime = (dateTime: string) => {
        return dayjs(dateTime).format("MMMM D, YYYY [at] h:mm A");
    };

    const getConsultationModeIcon = (mode: ConsultationMode) => {
        switch (mode) {
            case ConsultationMode.VIRTUAL:
                return <Video className="w-4 h-4" />;
            case ConsultationMode.PHYSICAL:
                return <MapPin className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getConsultationModeColor = (mode: ConsultationMode) => {
        switch (mode) {
            case ConsultationMode.VIRTUAL:
                return "blue";
            case ConsultationMode.PHYSICAL:
                return "green";
            default:
                return "default";
        }
    };

    if (isBooking) {
        return (
            <div className="text-center py-12">
                <Spin size="large" />
                <Title level={3} className="mt-4">
                    Booking Your Appointment...
                </Title>
                <Text className="text-gray-600">Please wait while we confirm your appointment</Text>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="shadow-lg text-center">
                <Title level={2} className="text-blue-900 mb-2">
                    Confirm Your Appointment
                </Title>
                <Text className="text-gray-600">Please review your appointment details before confirming</Text>
            </Card>

            {/* Doctor Information */}
            <Card title="Doctor Information" className="shadow-lg">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <div className="flex items-center space-x-4">
                            <Avatar
                                src={selectedDoctor?.profileImageUrl}
                                icon={<User className="w-5 h-5" />}
                                size={64}
                                className="border-2 border-blue-100"
                            />
                            <div>
                                <Title level={4} className="mb-1">
                                    Dr. {selectedDoctor?.name}
                                </Title>
                                <Text className="text-gray-600">{selectedDoctor?.specialityList.join(", ")}</Text>
                                <br />
                                <Text className="text-gray-500 text-sm">{selectedDoctor?.qualifications}</Text>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className="h-full flex flex-col justify-center">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <Text>{selectedDoctor?.facility.name}</Text>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Text className="text-gray-500">Languages:</Text>
                                    <Text>{selectedDoctor?.languageList.join(", ")}</Text>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Appointment Details */}
            <Card title="Appointment Details" className="shadow-lg">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <div>
                                    <Text className="font-medium">Date & Time</Text>
                                    <br />
                                    <Text className="text-gray-600">
                                        {selectedTimeSlot && formatDateTime(selectedTimeSlot.startTime)}
                                    </Text>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-green-600" />
                                <div>
                                    <Text className="font-medium">Duration</Text>
                                    <br />
                                    <Text className="text-gray-600">{selectedTimeSlot?.durationMinutes} minutes</Text>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                {getConsultationModeIcon(
                                    selectedTimeSlot?.consultationMode || ConsultationMode.PHYSICAL
                                )}
                                <div>
                                    <Text className="font-medium">Consultation Mode</Text>
                                    <br />
                                    <Tag
                                        color={getConsultationModeColor(
                                            selectedTimeSlot?.consultationMode || ConsultationMode.PHYSICAL
                                        )}
                                        className="mt-1"
                                    >
                                        {selectedTimeSlot?.consultationMode}
                                    </Tag>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Users className="w-5 h-5 text-purple-600" />
                                <div>
                                    <Text className="font-medium">Patient</Text>
                                    <br />
                                    <Text className="text-gray-600">
                                        {appointmentDetails.patientName}
                                        {appointmentDetails.isForSelf && " (You)"}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Appointment Notes */}
            <Card title="Appointment Information" className="shadow-lg">
                <div className="space-y-4">
                    <div>
                        <Text className="font-medium text-gray-700">Reason for Visit:</Text>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                            <Text>{appointmentDetails.reasonForVisit}</Text>
                        </div>
                    </div>
                    {appointmentDetails.patientNotes && (
                        <div>
                            <Text className="font-medium text-gray-700">Additional Notes:</Text>
                            <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                <Text>{appointmentDetails.patientNotes}</Text>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Attached Documents */}
            {appointmentDetails.attachedDocuments.length > 0 && (
                <Card title="Attached Documents" className="shadow-lg">
                    <List
                        dataSource={appointmentDetails.attachedDocuments}
                        renderItem={(doc) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<FileText className="w-5 h-5 text-blue-600" />}
                                    title={doc.documentName}
                                    description={`${doc.documentType} • ${doc.documentSize}`}
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            )}

            {/* Facility Image */}
            {selectedDoctor?.facility.thumbnailUrl && (
                <Card title="Medical Facility" className="shadow-lg">
                    <div className="text-center">
                        <Image
                            src={selectedDoctor.facility.thumbnailUrl}
                            alt={selectedDoctor.facility.name}
                            width={400}
                            height={192}
                            className="mx-auto max-w-full h-48 object-cover rounded-lg"
                        />
                        <Text className="block mt-2 text-gray-600">{selectedDoctor.facility.name}</Text>
                    </div>
                </Card>
            )}

            {/* Action Buttons */}
            <Card className="shadow-lg">
                <div className="flex justify-between items-center">
                    <Button
                        onClick={handlePrevious}
                        icon={<ArrowLeft className="w-4 h-4" />}
                        disabled={confirmationLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleBookAppointment}
                        loading={confirmationLoading}
                        icon={<CheckCircle className="w-4 h-4" />}
                        className="bg-green-600 hover:bg-green-700 border-green-600"
                    >
                        Confirm & Book Appointment
                    </Button>
                </div>
            </Card>
        </div>
    );
}
