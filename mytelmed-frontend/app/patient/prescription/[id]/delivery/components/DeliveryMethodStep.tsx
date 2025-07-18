"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Button, Typography, Radio, Alert, message } from "antd";
import { Package, Truck, Clock, ArrowRight } from "lucide-react";
import { RootState } from "@/lib/store";
import {
    setDeliveryMethod,
    nextStep,
    setCreatingDelivery,
    setDelivery,
    setFlowCompleted,
    DeliveryMethodOption
} from "@/lib/reducers/delivery-flow-reducer";
import DeliveryApi from "@/app/api/delivery";
import PrescriptionApi from "@/app/api/prescription";

const { Title, Text } = Typography;

export default function DeliveryMethodStep() {
    const dispatch = useDispatch();
    const {
        prescription,
        selectedMethod,
        creatingDelivery,
        error
    } = useSelector((state: RootState) => state.rootReducer.deliveryFlow);

    const handleMethodChange = (value: DeliveryMethodOption) => {
        dispatch(setDeliveryMethod(value));
    };

    const handleNext = async () => {
        if (!selectedMethod) {
            message.warning("Please select a delivery method");
            return;
        }

        if (!prescription) {
            message.error("Prescription data not found");
            return;
        }

        try {
            dispatch(setCreatingDelivery(true));

            if (selectedMethod === DeliveryMethodOption.PICKUP) {
                // For pickup, create delivery directly and go to success
                const response = await DeliveryApi.choosePickup({
                    prescriptionId: prescription.id
                });

                if (response.data.isSuccess && response.data.data) {
                    // Mark prescription as ready for processing
                    await PrescriptionApi.markAsReadyForProcessing(prescription.id);

                    dispatch(setDelivery(response.data.data));
                    dispatch(setFlowCompleted(true));
                    message.success("Pickup option selected successfully!");
                } else {
                    throw new Error("Failed to select pickup option");
                }
            } else {
                // For home delivery, proceed to address selection
                dispatch(nextStep());
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to process delivery option";
            message.error(errorMessage);
        } finally {
            dispatch(setCreatingDelivery(false));
        }
    };

    const DeliveryOptionCard = ({
        option,
        icon,
        title,
        description,
        features,
        highlight
    }: {
        option: DeliveryMethodOption;
        icon: React.ReactNode;
        title: string;
        description: string;
        features: string[];
        highlight?: string;
    }) => (
        <Card
            className={`cursor-pointer transition-all duration-200 h-full ${selectedMethod === option
                ? 'border-blue-500 shadow-lg bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
            onClick={() => handleMethodChange(option)}
        >
            <div className="text-center space-y-4">
                {/* Icon */}
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${selectedMethod === option ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                    {React.cloneElement(icon as React.ReactElement, {
                        className: `w-8 h-8 ${selectedMethod === option ? 'text-blue-600' : 'text-gray-600'}`
                    })}
                </div>

                {/* Title */}
                <Title level={4} className={`mb-2 ${selectedMethod === option ? 'text-blue-800' : 'text-gray-800'
                    }`}>
                    {title}
                </Title>

                {/* Description */}
                <Text className="text-gray-600 block mb-4">
                    {description}
                </Text>

                {/* Features */}
                <div className="space-y-2">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                            <div className={`w-2 h-2 rounded-full ${selectedMethod === option ? 'bg-blue-500' : 'bg-gray-400'
                                }`} />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>

                {/* Highlight */}
                {highlight && (
                    <div className={`mt-4 p-2 rounded-lg text-sm font-medium ${selectedMethod === option
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {highlight}
                    </div>
                )}

                {/* Selection Indicator */}
                <div className="mt-4">
                    <Radio
                        checked={selectedMethod === option}
                        onChange={() => handleMethodChange(option)}
                    >
                        <span className={selectedMethod === option ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                            Select this option
                        </span>
                    </Radio>
                </div>
            </div>
        </Card>
    );

    if (!prescription) {
        return (
            <div className="text-center py-8">
                <Alert
                    message="Prescription data not found"
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Step Description */}
            <Card className="bg-gray-50">
                <div className="text-center">
                    <Title level={3} className="text-gray-800 mb-2">
                        How would you like to receive your medication?
                    </Title>
                    <Text className="text-gray-600">
                        Choose between picking up at the pharmacy or having it delivered to your address.
                    </Text>
                </div>
            </Card>

            {/* Error Display */}
            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    closable
                />
            )}

            {/* Delivery Options */}
            <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <DeliveryOptionCard
                        option={DeliveryMethodOption.PICKUP}
                        icon={<Package />}
                        title="Pickup at Pharmacy"
                        description="Collect your medication directly from the pharmacy"
                        features={[
                            "No delivery fee",
                            "Available during pharmacy hours",
                            "Immediate collection after preparation",
                            "Speak directly with pharmacist"
                        ]}
                        highlight="Free Option"
                    />
                </Col>
                <Col xs={24} md={12}>
                    <DeliveryOptionCard
                        option={DeliveryMethodOption.HOME_DELIVERY}
                        icon={<Truck />}
                        title="Home Delivery"
                        description="Have your medication delivered to your doorstep"
                        features={[
                            "Convenient door-to-door service",
                            "1-3 business days delivery",
                            "Tracking information provided",
                            "Contactless delivery available"
                        ]}
                        highlight="RM 10.00 delivery fee"
                    />
                </Col>
            </Row>

            {/* Additional Information */}
            <Card className="border-l-4 border-l-blue-500">
                <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                        <Title level={4} className="text-blue-800 mb-2">
                            Processing Time
                        </Title>
                        <Text className="text-blue-700">
                            Your prescription will be prepared by the pharmacy once you confirm your delivery method.
                            You&apos;ll receive notifications about the status and when it&apos;s ready for collection or delivery.
                        </Text>
                    </div>
                </div>
            </Card>

            {/* Navigation */}
            <Card>
                <div className="flex justify-end">
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleNext}
                        loading={creatingDelivery}
                        disabled={!selectedMethod}
                        icon={<ArrowRight className="w-4 h-4" />}
                        className="bg-blue-600 border-blue-600 hover:bg-blue-700"
                    >
                        {selectedMethod === DeliveryMethodOption.PICKUP
                            ? (creatingDelivery ? "Confirming Pickup..." : "Confirm Pickup")
                            : "Continue to Address Selection"
                        }
                    </Button>
                </div>
            </Card>
        </div>
    );
} 