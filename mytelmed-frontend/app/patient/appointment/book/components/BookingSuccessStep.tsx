"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Typography, Avatar, Tag, Result, Badge } from "antd";
import { CheckCircle, Calendar, Eye, Home, Clock, MapPin, Video, User, Languages } from "lucide-react";
import dayjs from "dayjs";
import { RootState } from "@/lib/store";
import { resetBookingState } from "@/lib/reducers/appointment-booking-reducer";
import { ConsultationMode } from "@/app/api/props";

const { Title, Text } = Typography;

export default function BookingSuccessStep() {
    const router = useRouter();
    const dispatch = useDispatch();

    const { selectedDoctor, selectedTimeSlot, appointmentDetails, appointmentId } = useSelector(
        (state: RootState) => state.rootReducer.appointmentBooking
    );

    const handleViewAppointment = () => {
        if (appointmentId) {
            dispatch(resetBookingState());
            router.push(`/patient/appointment/${appointmentId}`);
        }
    };

    const handleBackToAppointments = () => {
        dispatch(resetBookingState());
        router.push("/patient/appointment");
    };

    const handleBackToDashboard = () => {
        dispatch(resetBookingState());
        router.push("/patient/dashboard");
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

    const getNextSteps = () => {
        if (selectedTimeSlot?.consultationMode === ConsultationMode.VIRTUAL) {
            return [
                "Complete payment within 30 minutes to secure your appointment",
                "You'll receive a confirmation email with appointment details",
                "Join the virtual consultation at the scheduled time",
                "Prepare any questions you'd like to ask the doctor",
            ];
        } else {
            return [
                "You'll receive a confirmation email with appointment details",
                "Arrive 15 minutes early at the medical facility",
                "Bring a valid ID and any relevant medical documents",
                "Complete any required forms before your appointment",
            ];
        }
    };

    return (
        <div className="space-y-6">
            {/* Success Message */}
            <Card className="shadow-lg text-center">
                <Result
                    status="success"
                    title="Appointment Booked Successfully!"
                    subTitle="Your appointment has been confirmed. Details are shown below."
                    icon={<CheckCircle className="w-16 h-16 text-green-600 mx-auto" />}
                />
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

            {/* Appointment Summary */}
            <Card title="Appointment Summary" className="shadow-lg">
                <div className="space-y-4">
                    {/* Appointment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <User className="w-5 h-5 text-purple-600" />
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
                    </div>

                    {/* Reason for Visit */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <Text className="font-medium text-gray-700">Reason for Visit:</Text>
                        <br />
                        <Text className="text-gray-600">{appointmentDetails.reasonForVisit}</Text>
                    </div>
                </div>
            </Card>

            {/* Next Steps */}
            <Card title="Next Steps" className="shadow-lg">
                <div className="space-y-3">
                    {getNextSteps().map((step, index) => (
                        <div key={`step-${index}-${step.substring(0, 10)}`} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                            </div>
                            <Text className="text-gray-700">{step}</Text>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Payment Notice for Virtual Appointments */}
            {selectedTimeSlot?.consultationMode === ConsultationMode.VIRTUAL && (
                <Card className="shadow-lg border-l-4 border-l-yellow-500">
                    <Title level={4} className="text-yellow-700 mb-3 mt-0">
                        Payment Required
                    </Title>
                    <Text className="text-gray-700">
                        Virtual appointments require payment within 30 minutes of booking. You can complete the payment
                        by viewing your appointment details.
                    </Text>
                </Card>
            )}

            {/* Action Buttons */}
            <Card className="shadow-lg">
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleViewAppointment}
                        icon={<Eye className="w-4 h-4" />}
                        className="w-full sm:w-auto"
                    >
                        View Appointment Details
                    </Button>
                    <Button
                        size="large"
                        onClick={handleBackToAppointments}
                        icon={<Calendar className="w-4 h-4" />}
                        className="w-full sm:w-auto"
                    >
                        All Appointments
                    </Button>
                    <Button
                        size="large"
                        onClick={handleBackToDashboard}
                        icon={<Home className="w-4 h-4" />}
                        className="w-full sm:w-auto"
                    >
                        Dashboard
                    </Button>
                </div>
            </Card>
        </div>
    );
}
