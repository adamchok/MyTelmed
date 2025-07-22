"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Button, Typography, Tag, List, message, Spin, Image, Avatar, Badge } from "antd";
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
    User,
    Languages,
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
import { formatFileSize } from "@/app/utils/FileSizeUtils";

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

    const formatLanguage = (language: string) => {
        switch (language) {
            case "english":
                return "English";
            case "mandarin":
                return "Mandarin";
            case "malay":
                return "Bahasa Malaysia";
            case "tamil":
                return "Tamil";
            default:
                return language;
        }
    }

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
                styles={{
                    body: {
                        padding: "24px",
                    },
                    header: {
                        borderBottom: "2px solid #f0f8ff",
                        padding: "20px 24px",
                    }
                }}
            >
                <div className="flex flex-col md:flex-row md:items-start md:space-x-6 items-center text-center md:text-left space-y-3 md:space-y-0">
                    <div className="flex-shrink-0">
                        <Avatar
                            src={selectedDoctor?.profileImageUrl}
                            icon={<User className="w-6 h-6" />}
                            size={80}
                            className="border-2 border-blue-100"
                        />
                    </div>
                    <div className="flex-1 space-y-3">
                        <div>
                            <Title level={4} className="mb-1 mt-0">
                                {selectedDoctor?.name}
                            </Title>
                            <Text className="text-gray-600 text-sm">{selectedDoctor?.facility.name}</Text>
                        </div>
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                                {selectedDoctor?.specialityList.map((specialty) => (
                                    <Badge
                                        key={specialty}
                                        count={specialty}
                                        color="blue"
                                        className="text-xs"
                                    />
                                ))}
                            </div>
                            {selectedDoctor?.qualifications && (
                                <div className="text-center md:text-left">
                                    <Text className="text-gray-700 text-sm font-medium">Qualifications:</Text>
                                    <Text className="text-gray-600 text-xs block mt-1" title={selectedDoctor.qualifications}>
                                        {selectedDoctor.qualifications.length > 150
                                            ? `${selectedDoctor.qualifications.substring(0, 150)}...`
                                            : selectedDoctor.qualifications}
                                    </Text>
                                </div>
                            )}
                            <div className="flex items-center justify-center md:justify-start text-xs text-gray-500">
                                <Languages className="w-3 h-3 mr-1" />
                                {selectedDoctor?.languageList
                                    .map((lang) => formatLanguage(lang))
                                    .join(", ")}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Appointment Details */}
            <Card title="Appointment Details" className="shadow-lg">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-2 gap-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-row items-center gap-1">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    <Text className="font-medium text-sm sm:text-base">Date & Time</Text>
                                </div>
                                <Text className="text-gray-600 text-sm sm:text-base">
                                    {selectedTimeSlot && formatDateTime(selectedTimeSlot.startTime)}
                                </Text>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-row items-center gap-1">
                                    <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <Text className="font-medium text-sm sm:text-base">Duration</Text>
                                </div>
                                <Text className="text-gray-600 text-sm sm:text-base">
                                    {selectedTimeSlot?.durationMinutes} minutes
                                </Text>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-row items-center gap-1">
                                    {getConsultationModeIcon(
                                        selectedTimeSlot?.consultationMode || ConsultationMode.PHYSICAL
                                    )}
                                    <Text className="font-medium text-sm sm:text-base">Consultation Mode</Text>
                                </div>
                                <Tag
                                    color={getConsultationModeColor(
                                        selectedTimeSlot?.consultationMode || ConsultationMode.PHYSICAL
                                    )}
                                    className="text-xs sm:text-sm w-fit py-1 px-2"
                                >
                                    {selectedTimeSlot?.consultationMode}
                                </Tag>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-row items-center gap-1">
                                    <Users className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                    <Text className="font-medium text-sm sm:text-base">Patient</Text>
                                </div>
                                <Text className="text-gray-600 text-sm sm:text-base">
                                    {appointmentDetails.patientName}
                                    {appointmentDetails.isForSelf && " (You)"}
                                </Text>
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
                                    title={<span className="text-sm sm:text-base truncate block" title={doc.documentName}>{doc.documentName}</span>}
                                    description={`${doc.documentType} • ${formatFileSize(doc.documentSize)}`}
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            )}

            {/* Medical Facility */}
            {selectedDoctor?.facility && (
                <Card title="Medical Facility" className="shadow-lg">
                    <Row gutter={[16, 16]} align={"middle"}>
                        <Col xs={24} md={10}>
                            {selectedDoctor.facility.thumbnailUrl ? (
                                <Image
                                    src={selectedDoctor.facility.thumbnailUrl}
                                    alt={selectedDoctor.facility.name}
                                    width="100%"
                                    height={200}
                                    className="w-full h-36 sm:h-48 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-full h-36 sm:h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <div className="text-center items-center justify-center flex gap-1">
                                        <MapPin className="w-5 h-5 sm:w-12 sm:h-12 text-gray-400 mx-auto" />
                                        <Text className="text-gray-500 text-sm sm:text-base">No Image Available</Text>
                                    </div>
                                </div>
                            )}
                        </Col>
                        <Col xs={24} md={14}>
                            <div className="space-y-3">
                                <Title level={4} className="mt-0 text-blue-900 text-lg sm:text-xl">
                                    {selectedDoctor.facility.name}
                                </Title>
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-2">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex flex-row items-center gap-1">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <Text className="font-medium text-gray-700 text-sm sm:text-base">
                                                    Address
                                                </Text>
                                            </div>
                                            <Text className="text-gray-600 text-sm sm:text-base">
                                                {selectedDoctor.facility.address}
                                            </Text>
                                        </div>
                                    </div>

                                    {selectedDoctor.facility.telephone && (
                                        <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-2">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex flex-row items-center gap-1">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    <Text className="font-medium text-gray-700 text-sm sm:text-base">
                                                        Phone
                                                    </Text>
                                                </div>
                                                <Text className="text-gray-600 text-sm sm:text-base">
                                                    {selectedDoctor.facility.telephone}
                                                </Text>
                                            </div>
                                        </div>
                                    )}
                                    {selectedDoctor.facility.facilityType && (
                                        <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-2">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex flex-row items-center gap-1">
                                                    <Building2 className="w-4 h-4 text-gray-500" />
                                                    <Text className="font-medium text-gray-700 text-sm sm:text-base">
                                                        Facility Type
                                                    </Text>
                                                </div>
                                                <Tag color="blue" className="text-xs sm:text-sm w-fit py-1 px-2">
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
                        size="middle"
                        onClick={handleBookAppointment}
                        loading={confirmationLoading}
                        className="bg-blue-600 hover:bg-blue-700 border-blue-600 w-full sm:w-auto text-sm sm:text-base"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Book Appointment
                    </Button>
                </div>
            </Card>
        </div>
    );
}
