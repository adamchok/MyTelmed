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
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <Button
                        type="text"
                        icon={<ArrowLeft className="w-5 h-5" />}
                        onClick={handleBackToAppointments}
                        className="flex items-center text-gray-600 hover:text-blue-600"
                    >
                        Back to Appointments
                    </Button>
                </div>
                <div className="text-center">
                    <Title level={2} className="text-blue-900 mb-2">
                        Book New Appointment
                    </Title>
                    <Text className="text-gray-600">Follow the steps below to book your appointment</Text>
                </div>
                <div className="w-32"></div> {/* Spacer for centering */}
            </div>

            {/* Error Alert */}
            {error && (
                <Alert message="Booking Error" description={error} type="error" showIcon closable className="mb-6" />
            )}

            {/* Steps */}
            <Card className="mb-8 shadow-lg">
                <Steps
                    current={currentStep}
                    items={steps.map((step, index) => {
                        let status: "finish" | "process" | "wait" = "wait";
                        if (index < currentStep) {
                            status = "finish";
                        } else if (index === currentStep) {
                            status = "process";
                        }
                        return {
                            title: step.title,
                            description: step.description,
                            icon: step.icon,
                            status,
                        };
                    })}
                    className="px-4 py-2"
                />
            </Card>

            {/* Step Content */}
            <div className="min-h-[600px]">{renderStepContent()}</div>

            {/* Important Notices */}
            {(currentStep === 3 || currentStep === 4) && (
                <Card className="mt-8 border-l-4 border-l-yellow-500">
                    <Title level={4} className="text-yellow-700 mb-4">
                        Important Information
                    </Title>
                    <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-start space-x-2">
                            <span className="font-semibold">Refund Policy:</span>
                            <span>
                                Appointments can be cancelled up to 24 hours before the scheduled time for a full
                                refund.
                            </span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="font-semibold">Telemedicine Risks:</span>
                            <span>
                                Virtual consultations have limitations and may not be suitable for all medical
                                conditions.
                            </span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <span className="font-semibold">Payment Grace Period:</span>
                            <span>
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
