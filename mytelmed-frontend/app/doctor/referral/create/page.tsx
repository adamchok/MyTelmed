"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Card, Steps, Button, Typography } from "antd";
import { ArrowLeft, Home } from "lucide-react";
import { RootState } from "@/lib/store";
import { resetReferralCreation } from "@/lib/reducers/referral-creation-reducer";
import PatientSelectionStep from "./components/PatientSelectionStep";
import ReferralTypeStep from "./components/ReferralTypeStep";
import ClinicalDetailsStep from "./components/ClinicalDetailsStep";
import ReviewStep from "./components/ReviewStep";

const { Title } = Typography;
const { Step } = Steps;

export default function CreateReferralPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { currentStep } = useSelector((state: RootState) => state.rootReducer.referralCreation);

    // Reset state when component mounts
    useEffect(() => {
        dispatch(resetReferralCreation());
    }, [dispatch]);

    const steps = [
        {
            title: "Select Patient",
            description: "Choose from completed appointments",
            component: <PatientSelectionStep />,
        },
        {
            title: "Referral Type",
            description: "Internal or external referral",
            component: <ReferralTypeStep />,
        },
        {
            title: "Clinical Details",
            description: "Add medical information",
            component: <ClinicalDetailsStep />,
        },
        {
            title: "Review & Submit",
            description: "Confirm referral details",
            component: <ReviewStep />,
        },
    ];

    const handleBackToReferrals = () => {
        dispatch(resetReferralCreation());
        router.push("/doctor/referral");
    };

    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Title level={2} className="text-gray-800 mb-2 mt-0 text-lg sm:text-xl md:text-3xl">
                        Create New Referral
                    </Title>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                        Follow the steps to create a referral for your patient
                    </p>
                </div>
                <Button
                    icon={<ArrowLeft className="w-4 h-4" />}
                    onClick={handleBackToReferrals}
                    className="flex items-center gap-2"
                >
                    <Home className="w-4 h-4" />
                    Back to Referrals
                </Button>
            </div>

            {/* Progress Steps */}
            <Card className="shadow-lg">
                <Steps current={currentStep}>
                    {steps.map((step, index) => (
                        <Step
                            key={index + "-" + step.title}
                            title={<span className="text-xs sm:text-base">{step.title}</span>}
                            description={<span className="text-xs hidden sm:block">{step.description}</span>}
                        />
                    ))}
                </Steps>
            </Card>

            {/* Current Step Content */}
            <Card className="shadow-lg">{steps[currentStep]?.component}</Card>
        </div>
    );
}
