"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Button, Typography, Tag, List, message, Spin, Image } from "antd";
import {
    Clock,
    MapPin,
    Video,
    FileText,
    Users,
    Calendar,
    ArrowLeft,
    CheckCircle,
    Phone,
    Building2,
} from "lucide-react";
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

    console.log("doctor", selectedDoctor);

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="shadow-lg text-center">
                <Title level={2} className="text-blue-900 mb-2 text-xl sm:text-2xl lg:text-3xl">
                    Confirm Your Appointment
                </Title>
                <Text className="text-gray-600 text-sm sm:text-base">
                    Please review your appointment details before confirming
                </Text>
            </Card>

            {/* Doctor Information */}
            <Card
                title={
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                        <span className="text-lg font-semibold text-gray-800">Doctor Information</span>
                    </div>
                }
                className="shadow-lg border-0"
                headStyle={{ borderBottom: "2px solid #f0f8ff", padding: "20px 24px" }}
                bodyStyle={{ padding: "24px" }}
            >
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="relative">
                                <Image
                                    src={selectedDoctor?.profileImageUrl}
                                    width={120}
                                    height={120}
                                    className="rounded-full border-4 border-blue-50 shadow-lg"
                                    style={{
                                        backgroundColor: "#f0f8ff",
                                        objectFit: "cover",
                                    }}
                                    alt={selectedDoctor?.name}
                                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZjBmOGZmIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNDUiIHI9IjE1IiBmaWxsPSIjY2JkYmY2Ii8+CjxwYXRoIGQ9Ik0yMCA5MGMwLTE2LjU2OSAxMy40MzEtMzAgMzAtMzBzMzAgMTMuNDMxIDMwIDMwIiBmaWxsPSIjY2JkYmY2Ii8+Cjwvc3ZnPgo="
                                />
                            </div>
                            <div className="text-center sm:text-left flex-1">
                                <Title level={3} className="mb-2 text-xl sm:text-2xl font-bold text-gray-900">
                                    Dr. {selectedDoctor?.name}
                                </Title>
                                <div className="mb-3 gap-2">
                                    <Tag color="blue" className="text-xs font-medium px-2 py-1 rounded-full">
                                        {selectedDoctor?.specialityList.join(", ")}
                                    </Tag>
                                    {selectedDoctor?.languageList.map((language, index) => (
                                        <Tag key={index} color="green" className="text-xs px-2 py-0.5 rounded-full">
                                            {language}
                                        </Tag>
                                    ))}
                                </div>
                                <Text className="text-gray-600 text-sm leading-relaxed">
                                    {selectedDoctor?.qualifications}
                                </Text>
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
                            <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-2">
                                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <Text className="font-medium text-sm sm:text-base">Date & Time</Text>
                                    <br />
                                    <Text className="text-gray-600 text-sm sm:text-base">
                                        {selectedTimeSlot && formatDateTime(selectedTimeSlot.startTime)}
                                    </Text>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-2">
                                <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <div>
                                    <Text className="font-medium text-sm sm:text-base">Duration</Text>
                                    <br />
                                    <Text className="text-gray-600 text-sm sm:text-base">
                                        {selectedTimeSlot?.durationMinutes} minutes
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className="space-y-3 mt-4 md:mt-0">
                            <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-2">
                                {getConsultationModeIcon(
                                    selectedTimeSlot?.consultationMode || ConsultationMode.PHYSICAL
                                )}
                                <div>
                                    <Text className="font-medium text-sm sm:text-base">Consultation Mode</Text>
                                    <br />
                                    <Tag
                                        color={getConsultationModeColor(
                                            selectedTimeSlot?.consultationMode || ConsultationMode.PHYSICAL
                                        )}
                                        className="mt-1 text-xs sm:text-sm"
                                    >
                                        {selectedTimeSlot?.consultationMode}
                                    </Tag>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-2">
                                <Users className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                <div>
                                    <Text className="font-medium text-sm sm:text-base">Patient</Text>
                                    <br />
                                    <Text className="text-gray-600 text-sm sm:text-base">
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
                        <Text className="font-medium text-gray-700 text-sm sm:text-base">Reason for Visit:</Text>
                        <div className="mt-1 p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <Text className="text-sm sm:text-base">{appointmentDetails.reasonForVisit}</Text>
                        </div>
                    </div>
                    {appointmentDetails.patientNotes && (
                        <div>
                            <Text className="font-medium text-gray-700 text-sm sm:text-base">Additional Notes:</Text>
                            <div className="mt-1 p-2 sm:p-3 bg-gray-50 rounded-lg">
                                <Text className="text-sm sm:text-base">{appointmentDetails.patientNotes}</Text>
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

            {/* Medical Facility */}
            {selectedDoctor?.facility && (
                <Card title="Medical Facility" className="shadow-lg">
                    <Row gutter={[16, 16]} align="top">
                        <Col xs={24} md={10}>
                            {selectedDoctor.facility.thumbnailUrl ? (
                                <Image
                                    src={selectedDoctor.facility.thumbnailUrl}
                                    alt={selectedDoctor.facility.name}
                                    width="100%"
                                    height={200}
                                    className="w-full h-36 sm:h-48 object-cover rounded-lg"
                                    preview={false}
                                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDQwMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjZjVmNWY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K"
                                    onError={() => {
                                        console.error(
                                            "Facility image failed to load:",
                                            selectedDoctor.facility.thumbnailUrl
                                        );
                                    }}
                                />
                            ) : (
                                <div className="w-full h-36 sm:h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
                                        <Text className="text-gray-500 text-sm sm:text-base">No Image Available</Text>
                                    </div>
                                </div>
                            )}
                        </Col>
                        <Col xs={24} md={14}>
                            <div className="space-y-3 sm:space-y-4 mt-4 md:mt-0">
                                <div>
                                    <Title level={4} className="mb-2 text-blue-900 text-lg sm:text-xl">
                                        {selectedDoctor.facility.name}
                                    </Title>
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
                                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <Text className="font-medium text-gray-700 text-sm sm:text-base">
                                                Address
                                            </Text>
                                            <br />
                                            <Text className="text-gray-600 text-sm sm:text-base">
                                                {selectedDoctor.facility.address}
                                            </Text>
                                        </div>
                                    </div>
                                    {selectedDoctor.facility.telephone && (
                                        <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
                                            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <Text className="font-medium text-gray-700 text-sm sm:text-base">
                                                    Phone
                                                </Text>
                                                <br />
                                                <Text className="text-gray-600 text-sm sm:text-base">
                                                    {selectedDoctor.facility.telephone}
                                                </Text>
                                            </div>
                                        </div>
                                    )}
                                    {selectedDoctor.facility.facilityType && (
                                        <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
                                            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <Text className="font-medium text-gray-700 text-sm sm:text-base">
                                                    Facility Type
                                                </Text>
                                                <br />
                                                <Tag color="blue" className="mt-1 text-xs sm:text-sm">
                                                    {selectedDoctor.facility.facilityType}
                                                </Tag>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* Action Buttons */}
            <Card className="shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                    <Button
                        onClick={handlePrevious}
                        icon={<ArrowLeft className="w-4 h-4" />}
                        disabled={confirmationLoading}
                        className="w-full sm:w-auto text-sm sm:text-base"
                    >
                        Previous
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleBookAppointment}
                        loading={confirmationLoading}
                        icon={<CheckCircle className="w-4 h-4" />}
                        className="bg-green-600 hover:bg-green-700 border-green-600 w-full sm:w-auto text-sm sm:text-base"
                    >
                        <span className="hidden sm:inline">Confirm & Book Appointment</span>
                        <span className="sm:hidden">Book Appointment</span>
                    </Button>
                </div>
            </Card>
        </div>
    );
}
