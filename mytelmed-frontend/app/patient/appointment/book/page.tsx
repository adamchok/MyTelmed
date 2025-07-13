"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Steps, Card, Typography, Button, Alert, Spin } from "antd";
import { ArrowLeft, Calendar, Clock, User, CheckCircle, FileText } from "lucide-react";
import { RootState } from "@/lib/store";
import { resetBookingState } from "@/lib/reducers/appointment-booking-reducer";
import DoctorSelectionStep from "./components/DoctorSelectionStep";
import AppointmentDetailsStep from "./components/AppointmentDetailsStep";
import BookingConfirmationStep from "./components/BookingConfirmationStep";
import TimeSlotSelectionStep from "./components/TimeSlotSelectionStep";
import BookingSuccessStep from "./components/BookingSuccessStep";

const { Title, Text } = Typography;

const steps = [
    {
        title: "Select Doctor",
        icon: <User className="w-5 h-5" />,
        description: "Choose your preferred doctor",
    },
    {
        title: "Choose Time",
        icon: <Clock className="w-5 h-5" />,
        description: "Select available time slot",
    },
    {
        title: "Appointment Details",
        icon: <FileText className="w-5 h-5" />,
        description: "Add notes and documents",
    },
    {
        title: "Confirm Booking",
        icon: <Calendar className="w-5 h-5" />,
        description: "Review your appointment",
    },
    {
        title: "Success",
        icon: <CheckCircle className="w-5 h-5" />,
        description: "Booking confirmed",
    },
];

export default function BookAppointmentPage() {
    const router = useRouter();
    const dispatch = useDispatch();

    const { currentStep, loading, error } = useSelector((state: RootState) => state.rootReducer.appointmentBooking);

    useEffect(() => {
        // Reset booking state when component mounts
        dispatch(resetBookingState());
    }, [dispatch]);

    const handleBackToAppointments = () => {
        dispatch(resetBookingState());
        router.push("/patient/appointment");
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return <DoctorSelectionStep />;
            case 1:
                return <TimeSlotSelectionStep />;
            case 2:
                return <AppointmentDetailsStep />;
            case 3:
                return <BookingConfirmationStep />;
            case 4:
                return <BookingSuccessStep />;
            default:
                return <DoctorSelectionStep />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="text-center">
                    <Spin size="large" />
                    <Text className="block mt-4 text-gray-600 text-sm sm:text-base md:text-base lg:text-lg">
                        Loading appointment booking...
                    </Text>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
                <Button
                    type="text"
                    icon={<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                    onClick={handleBackToAppointments}
                    className="flex items-center text-gray-600 hover:text-blue-600 text-sm sm:text-base md:text-base lg:text-lg"
                >
                    <span className="hidden md:inline">Back to Appointments</span>
                    <span className="md:hidden">Back</span>
                </Button>
            </div>
            {/* Header */}
            <div className="flex items-center justify-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                <div className="text-center">
                    <Title level={2} className="text-blue-900 mb-2 text-xl sm:text-2xl md:text-2xl lg:text-3xl">
                        Book New Appointment
                    </Title>
                    <Text className="text-gray-600 text-sm sm:text-base md:text-base lg:text-lg">
                        Follow the steps below to book your appointment
                    </Text>
                </div>
                <div className="hidden md:block w-32"></div> {/* Spacer for centering on desktop */}
            </div>

            {/* Error Alert */}
            {error && (
                <Alert
                    message="Booking Error"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    className="mb-4 sm:mb-6 text-sm sm:text-base md:text-base lg:text-lg"
                />
            )}

            {/* Steps */}
            <Card className="mb-6 sm:mb-8 shadow-lg">
                <Steps
                    current={currentStep}
                    direction="horizontal"
                    size="small"
                    items={steps.map((step, index) => {
                        let status: "finish" | "process" | "wait" = "wait";
                        if (index < currentStep) {
                            status = "finish";
                        } else if (index === currentStep) {
                            status = "process";
                        }
                        return {
                            title: <span className="text-xs sm:text-sm md:text-sm lg:text-base">{step.title}</span>,
                            description: (
                                <span className="hidden sm:inline text-xs sm:text-sm md:text-sm lg:text-base">
                                    {step.description}
                                </span>
                            ),
                            icon: (
                                <span className="flex items-center justify-center">
                                    {React.cloneElement(step.icon as React.ReactElement, {
                                        className: "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6",
                                    })}
                                </span>
                            ),
                            status,
                        };
                    })}
                    className="px-2 sm:px-4 md:px-6 py-2 md:py-3"
                />
            </Card>

            {/* Step Content */}
            <div className="min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
                {renderStepContent()}
            </div>

            {/* Important Notices */}
            {(currentStep === 3 || currentStep === 4) && (
                <Card className="mt-6 sm:mt-8 border-l-4 border-l-yellow-500">
                    <Title
                        level={4}
                        className="text-yellow-700 mb-3 sm:mb-4 md:mb-4 lg:mb-5 text-base sm:text-lg md:text-lg lg:text-xl"
                    >
                        Important Information
                    </Title>
                    <div className="space-y-3 sm:space-y-4 md:space-y-4 lg:space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-1 sm:space-y-0 sm:space-x-3 md:space-x-3 lg:space-x-4">
                            <span className="font-semibold text-sm sm:text-base md:text-base lg:text-lg text-yellow-800 flex-shrink-0 min-w-[140px] md:min-w-[150px] lg:min-w-[160px]">
                                Refund Policy:
                            </span>
                            <span className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-700">
                                Appointments can be cancelled up to 24 hours before the scheduled time for a full
                                refund.
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-1 sm:space-y-0 sm:space-x-3 md:space-x-3 lg:space-x-4">
                            <span className="font-semibold text-sm sm:text-base md:text-base lg:text-lg text-yellow-800 flex-shrink-0 min-w-[140px] md:min-w-[150px] lg:min-w-[160px]">
                                Telemedicine Risks:
                            </span>
                            <span className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-700">
                                Virtual consultations have limitations and may not be suitable for all medical
                                conditions.
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-1 sm:space-y-0 sm:space-x-3 md:space-x-3 lg:space-x-4">
                            <span className="font-semibold text-sm sm:text-base md:text-base lg:text-lg text-yellow-800 flex-shrink-0 min-w-[140px] md:min-w-[150px] lg:min-w-[160px]">
                                Payment Grace Period:
                            </span>
                            <span className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-700">
                                Virtual appointments must be paid within 30 minutes of booking or they will be
                                automatically cancelled.
                            </span>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
