"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Steps, Card, Typography, Button, Alert, Spin } from "antd";
import { ArrowLeft, Package, MapPin, CreditCard, CheckCircle, Truck } from "lucide-react";
import { RootState } from "@/lib/store";
import {
    initializeDeliveryFlow,
    resetDeliveryFlow,
    DeliveryStep
} from "@/lib/reducers/delivery-flow-reducer";
import PrescriptionApi from "@/app/api/prescription";

// Import step components
import DeliveryMethodStep from "./components/DeliveryMethodStep";
import DeliverySuccessStep from "./components/DeliverySuccessStep";
import AddressSelectionStep from "./components/AddressSelectionStep";
import PaymentStep from "./components/PaymentStep";

const { Title, Text } = Typography;

const steps = [
    {
        title: "Delivery Method",
        icon: <Package className="w-5 h-5" />,
        description: "Choose pickup or delivery",
    },
    {
        title: "Address Selection",
        icon: <MapPin className="w-5 h-5" />,
        description: "Select delivery address",
    },
    {
        title: "Payment",
        icon: <CreditCard className="w-5 h-5" />,
        description: "Complete payment",
    },
    {
        title: "Success",
        icon: <CheckCircle className="w-5 h-5" />,
        description: "Delivery confirmed",
    },
];

export default function DeliveryFlowPage() {
    const router = useRouter();
    const params = useParams();
    const dispatch = useDispatch();
    const prescriptionId = params.id as string;

    // Redux state
    const {
        currentStep,
        prescription,
        selectedMethod,
        paymentRequired,
        loading,
        error
    } = useSelector((state: RootState) => state.rootReducer.deliveryFlow);

    // Local loading state for prescription fetch
    const [fetchingPrescription, setFetchingPrescription] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Initialize the flow when component mounts
    useEffect(() => {
        dispatch(resetDeliveryFlow());
        loadPrescription();
    }, [dispatch, prescriptionId]);

    const loadPrescription = async () => {
        try {
            setFetchingPrescription(true);
            setFetchError(null);

            const response = await PrescriptionApi.getPrescriptionById(prescriptionId);

            if (response.data.isSuccess && response.data.data) {
                dispatch(initializeDeliveryFlow(response.data.data));
            } else {
                throw new Error("Failed to fetch prescription details");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to load prescription";
            setFetchError(errorMessage);
        } finally {
            setFetchingPrescription(false);
        }
    };

    const handleBackToPrescription = () => {
        dispatch(resetDeliveryFlow());
        router.push(`/patient/prescription/${prescriptionId}`);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case DeliveryStep.METHOD_SELECTION:
                return <DeliveryMethodStep />;
            case DeliveryStep.ADDRESS_SELECTION:
                return <AddressSelectionStep />;
            case DeliveryStep.PAYMENT:
                return <PaymentStep />;
            case DeliveryStep.SUCCESS:
                return <DeliverySuccessStep />;
            default:
                return <DeliveryMethodStep />;
        }
    };

    // Determine which steps to show based on delivery method
    const getVisibleSteps = () => {
        if (!selectedMethod) {
            // Show all steps initially
            return steps;
        }

        if (selectedMethod === "PICKUP") {
            // For pickup, skip address and payment steps
            return [
                steps[0], // Method selection
                {
                    title: "Success",
                    icon: <CheckCircle className="w-5 h-5" />,
                    description: "Pickup confirmed",
                }
            ];
        }

        // For home delivery, show all steps
        return steps;
    };

    const getCurrentStepIndex = () => {
        if (!selectedMethod) {
            return currentStep;
        }

        if (selectedMethod === "PICKUP") {
            // Map delivery steps to pickup flow
            switch (currentStep) {
                case DeliveryStep.METHOD_SELECTION:
                    return 0;
                case DeliveryStep.SUCCESS:
                    return 1;
                default:
                    return 0;
            }
        }

        // For home delivery, use step as-is
        return currentStep;
    };

    useEffect(() => {
        // Auto scroll to top when step changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    // Show loading spinner while fetching prescription
    if (fetchingPrescription || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="text-center">
                    <Spin size="large" />
                    <Text className="block mt-4 text-gray-600 text-sm sm:text-base md:text-base lg:text-lg">
                        {fetchingPrescription ? "Loading prescription details..." : "Processing delivery..."}
                    </Text>
                </div>
            </div>
        );
    }

    // Show error if prescription fetch failed
    if (fetchError) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center space-x-2 sm:space-x-4 mb-6">
                    <Button
                        type="text"
                        icon={<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                        onClick={handleBackToPrescription}
                        className="flex items-center text-gray-600 hover:text-blue-600"
                    >
                        Back to Prescription
                    </Button>
                </div>

                <div className="flex justify-center">
                    <Alert
                        message="Error Loading Prescription"
                        description={fetchError}
                        type="error"
                        showIcon
                        className="max-w-md"
                        action={
                            <Button size="small" onClick={loadPrescription}>
                                Retry
                            </Button>
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            {/* Header with Back Button */}
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto mb-6">
                <Button
                    type="text"
                    icon={<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                    onClick={handleBackToPrescription}
                    className="flex items-center text-gray-600 hover:text-blue-600 text-sm sm:text-base"
                >
                    <span className="hidden md:inline">Back to Prescription</span>
                    <span className="md:hidden">Back</span>
                </Button>
            </div>

            {/* Page Title */}
            <div className="flex items-center justify-center mb-6 sm:mb-8">
                <div className="text-center">
                    <Title level={2} className="text-blue-900 mb-2 mt-0 text-xl sm:text-2xl md:text-2xl lg:text-3xl">
                        Choose Delivery Method
                    </Title>
                    <Text className="text-gray-600 text-sm sm:text-base md:text-base lg:text-lg">
                        {prescription && (
                            <>Prescription #{prescription.prescriptionNumber}</>
                        )}
                    </Text>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert
                    message="Delivery Flow Error"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    className="mb-4 sm:mb-6"
                />
            )}

            {/* Steps Indicator */}
            <Card className="mb-6">
                <Steps
                    current={getCurrentStepIndex()}
                    direction="horizontal"
                    size="small"
                    items={getVisibleSteps().map((step, index) => {
                        let status: "finish" | "process" | "wait" = "wait";
                        const currentIndex = getCurrentStepIndex();

                        if (index < currentIndex) {
                            status = "finish";
                        } else if (index === currentIndex) {
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

            {/* Important Notes */}
            {paymentRequired && currentStep === DeliveryStep.METHOD_SELECTION && (
                <Card className="mt-6 border-l-4 border-l-orange-500 bg-orange-50">
                    <div className="flex items-start space-x-3">
                        <Truck className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                        <div>
                            <Title level={4} className="text-orange-800 mb-2 mt-0">
                                Home Delivery Information
                            </Title>
                            <div className="space-y-2 text-orange-700">
                                <div className="flex flex-col sm:flex-row sm:items-start space-y-1 sm:space-y-0 sm:space-x-3">
                                    <span className="font-semibold text-sm sm:text-base min-w-[100px]">
                                        Delivery Fee:
                                    </span>
                                    <span className="text-sm sm:text-base">
                                        RM 10.00 standard delivery fee applies
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-start space-y-1 sm:space-y-0 sm:space-x-3">
                                    <span className="font-semibold text-sm sm:text-base min-w-[100px]">
                                        Delivery Time:
                                    </span>
                                    <span className="text-sm sm:text-base">
                                        1-3 business days within Malaysia
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-start space-y-1 sm:space-y-0 sm:space-x-3">
                                    <span className="font-semibold text-sm sm:text-base min-w-[100px]">
                                        Payment:
                                    </span>
                                    <span className="text-sm sm:text-base">
                                        Secure online payment required before delivery
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Step Content */}
            <div className="min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
                {renderStepContent()}
            </div>
        </div>
    );
}
