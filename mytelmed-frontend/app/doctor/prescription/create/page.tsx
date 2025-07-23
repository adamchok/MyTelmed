"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Steps, Card, Typography, Button, Alert, Spin } from "antd";
import { ArrowLeft } from "lucide-react";
import { RootState } from "@/lib/store";
import { resetCreationState } from "@/lib/reducers/prescription-creation-reducer";
import AppointmentSelectionStep from "./components/AppointmentSelectionStep";
import MedicationManagementStep from "./components/MedicationManagementStep";
import PrescriptionConfirmationStep from "./components/PrescriptionConfirmationStep";
import PrescriptionSuccessStep from "./components/PrescriptionSuccessStep";
import PrescriptionDetailsStep from "./components/PrescriptionDetailsStep";

const { Title, Text } = Typography;

const steps = [
    {
        title: "Select Appointment",
        description: "Choose past appointment",
    },
    {
        title: "Prescription Details",
        description: "Add diagnosis & notes",
    },
    {
        title: "Add Medications",
        description: "Manage prescription items",
    },
    {
        title: "Review & Confirm",
        description: "Confirm prescription",
    },
    {
        title: "Success",
        description: "Prescription created",
    },
];

export default function CreatePrescriptionPage() {
    const router = useRouter();
    const dispatch = useDispatch();

    const { currentStep, loading, error } = useSelector((state: RootState) => state.rootReducer.prescriptionCreation);

    useEffect(() => {
        // Reset creation state when component mounts
        dispatch(resetCreationState());
    }, [dispatch]);

    useEffect(() => {
        // Auto scroll to top when step changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    const handleBackToPrescriptions = () => {
        dispatch(resetCreationState());
        router.push("/doctor/prescription");
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return <AppointmentSelectionStep />;
            case 1:
                return <PrescriptionDetailsStep />;
            case 2:
                return <MedicationManagementStep />;
            case 3:
                return <PrescriptionConfirmationStep />;
            case 4:
                return <PrescriptionSuccessStep />;
            default:
                return <AppointmentSelectionStep />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="text-center">
                    <Spin size="large" />
                    <Text className="block mt-4 text-gray-600 text-sm sm:text-base md:text-base lg:text-lg">
                        Loading prescription creation...
                    </Text>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto" style={{ backgroundColor: "white", minHeight: "100vh" }}>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
                <Button
                    type="text"
                    icon={<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                    onClick={handleBackToPrescriptions}
                    className="flex items-center text-gray-600 hover:text-green-600 text-sm sm:text-base md:text-base lg:text-lg"
                >
                    <span className="hidden md:inline">Back to Prescriptions</span>
                    <span className="md:hidden">Back</span>
                </Button>
            </div>

            {/* Header */}
            <div className="flex items-center justify-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                <div className="text-center">
                    <Title level={2} className="text-green-900 mb-2 text-xl sm:text-2xl md:text-2xl lg:text-3xl">
                        Create New Prescription
                    </Title>
                    <Text className="text-gray-600 text-sm sm:text-base md:text-base lg:text-lg">
                        Follow the steps below to create a prescription for your patient
                    </Text>
                </div>
                <div className="hidden md:block w-32"></div> {/* Spacer for centering on desktop */}
            </div>

            {/* Error Alert */}
            {error && (
                <Alert
                    message="Prescription Creation Error"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    className="mb-4 sm:mb-6 text-sm sm:text-base md:text-base lg:text-lg"
                />
            )}

            {/* Steps */}
            <Card className="mb-6 sm:mb-8 shadow-lg" style={{ backgroundColor: "white" }}>
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
                <Card className="mt-6 sm:mt-8 border-l-4 border-l-green-500" style={{ backgroundColor: "white" }}>
                    <Title
                        level={4}
                        className="text-green-700 mb-3 sm:mb-4 md:mb-4 lg:mb-5 text-base sm:text-lg md:text-lg lg:text-xl"
                    >
                        Important Information
                    </Title>
                    <div className="space-y-3 sm:space-y-4 md:space-y-4 lg:space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-1 sm:space-y-0 sm:space-x-3 md:space-x-3 lg:space-x-4">
                            <span className="font-semibold text-sm sm:text-base md:text-base lg:text-lg text-green-800 flex-shrink-0 min-w-[140px] md:min-w-[150px] lg:min-w-[160px]">
                                Prescription Validity:
                            </span>
                            <span className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-700">
                                Prescriptions are valid for 30 days from the date of issue unless otherwise specified.
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-1 sm:space-y-0 sm:space-x-3 md:space-x-3 lg:space-x-4">
                            <span className="font-semibold text-sm sm:text-base md:text-base lg:text-lg text-green-800 flex-shrink-0 min-w-[140px] md:min-w-[150px] lg:min-w-[160px]">
                                Patient Instructions:
                            </span>
                            <span className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-700">
                                Ensure all medication instructions are clear and specific for patient safety.
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-1 sm:space-y-0 sm:space-x-3 md:space-x-3 lg:space-x-4">
                            <span className="font-semibold text-sm sm:text-base md:text-base lg:text-lg text-green-800 flex-shrink-0 min-w-[140px] md:min-w-[150px] lg:min-w-[160px]">
                                Legal Responsibility:
                            </span>
                            <span className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-700">
                                As the prescribing physician, you are responsible for ensuring appropriate medication and dosage.
                            </span>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
