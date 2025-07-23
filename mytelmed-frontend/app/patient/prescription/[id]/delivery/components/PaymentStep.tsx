"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Typography, Alert, Spin, message, Row, Col } from "antd";
import { CreditCard, ArrowLeft, Shield, Clock, MapPin } from "lucide-react";
import { RootState } from "@/lib/store";
import {
    setCreatingDelivery,
    setDelivery,
    setPaymentCompleted,
    setFlowCompleted,
    previousStep
} from "@/lib/reducers/delivery-flow-reducer";
import DeliveryApi from "@/app/api/delivery";
import PaymentModal from "@/app/components/PaymentModal/PaymentModal";

const { Title, Text } = Typography;

export default function PaymentStep() {
    const dispatch = useDispatch();
    const {
        prescription,
        selectedAddress,
        deliveryInstructions,
        paymentCompleted,
        creatingDelivery,
        processingPayment,
        delivery,
        error
    } = useSelector((state: RootState) => state.rootReducer.deliveryFlow);

    // Local state for payment modal
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [deliveryCreated, setDeliveryCreated] = useState(false);

    // Use ref to prevent duplicate API calls during React re-renders
    const deliveryCreationInProgress = useRef(false);

    // Create delivery when component mounts
    useEffect(() => {
        const shouldCreateDelivery = !deliveryCreated &&
            !delivery &&
            prescription?.id &&
            selectedAddress?.id &&
            !deliveryCreationInProgress.current;

        if (shouldCreateDelivery) {
            console.log("[PaymentStep] Creating home delivery for prescription:", prescription?.id);
            createHomeDelivery();
        }
    }, [deliveryCreated, delivery, prescription?.id, selectedAddress?.id]);

    // Reset delivery creation flag when component unmounts or delivery is created
    useEffect(() => {
        return () => {
            deliveryCreationInProgress.current = false;
        };
    }, []);

    // Reset flag when delivery is successfully created
    useEffect(() => {
        if (delivery) {
            deliveryCreationInProgress.current = false;
        }
    }, [delivery]);

    const createHomeDelivery = async () => {
        if (!prescription || !selectedAddress || deliveryCreationInProgress.current) {
            console.log("[PaymentStep] Skipping delivery creation - already in progress or missing data");
            return;
        }

        console.log("[PaymentStep] Starting delivery creation API call");
        // Prevent duplicate calls
        deliveryCreationInProgress.current = true;

        try {
            dispatch(setCreatingDelivery(true));

            const response = await DeliveryApi.chooseHomeDelivery({
                prescriptionId: prescription.id,
                addressId: selectedAddress.id,
                deliveryInstructions: deliveryInstructions || undefined
            });

            if (response.data.isSuccess && response.data.data) {
                dispatch(setDelivery(response.data.data));
                setDeliveryCreated(true);

                message.success("Delivery details saved successfully!");
            } else {
                throw new Error("Failed to create delivery");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to create delivery";
            message.error(errorMessage);
            // Reset flag on error so user can retry if needed
            deliveryCreationInProgress.current = false;
        } finally {
            dispatch(setCreatingDelivery(false));
        }
    };

    const handlePayNow = () => {
        if (!prescription) {
            message.error("Prescription data not found");
            return;
        }
        setPaymentModalVisible(true);
    };

    const handlePaymentSuccess = () => {
        dispatch(setPaymentCompleted(true));
        dispatch(setFlowCompleted(true));
        setPaymentModalVisible(false);
        message.success("Payment completed successfully! Your medication delivery is confirmed.");
    };

    const handlePrevious = () => {
        dispatch(previousStep());
    };

    if (creatingDelivery) {
        return (
            <div className="text-center py-12">
                <Spin size="large" />
                <Text className="block mt-4 text-gray-600">
                    Setting up your delivery...
                </Text>
            </div>
        );
    }

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
                        Complete Payment
                    </Title>
                    <Text className="text-gray-600">
                        Pay the delivery fee to confirm your medication delivery.
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

            {/* Payment Summary */}
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card title="Delivery Summary" className="h-full">
                        <div className="space-y-4">
                            {/* Prescription Info */}
                            <div>
                                <Text strong className="text-gray-700">Prescription:</Text>
                                <div className="mt-1">
                                    <Text className="text-gray-600">#{prescription.prescriptionNumber}</Text>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            {selectedAddress && (
                                <div>
                                    <Text strong className="text-gray-700">Delivery Address:</Text>
                                    <div className="mt-1 space-y-1">
                                        <div className="text-gray-600">{selectedAddress.address1 + ", " + selectedAddress.address2}</div>
                                        <div className="text-gray-600">
                                            {selectedAddress.postcode} {selectedAddress.city}
                                        </div>
                                        <div className="text-gray-600">
                                            {selectedAddress.state}, Malaysia
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Delivery Instructions */}
                            {deliveryInstructions && (
                                <div>
                                    <Text strong className="text-gray-700">Delivery Instructions:</Text>
                                    <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-600">
                                        {deliveryInstructions}
                                    </div>
                                </div>
                            )}

                            {/* Delivery Timeline */}
                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <Text strong className="text-gray-700">Estimated Delivery:</Text>
                                </div>
                                <div className="mt-1">
                                    <Text className="text-gray-600">1-3 business days after payment</Text>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="Payment Details" className="h-full">
                        <div className="space-y-6">
                            {/* Fee Breakdown */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Text className="text-gray-700">Delivery Fee:</Text>
                                    <Text className="text-lg font-semibold">RM 10.00</Text>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between items-center">
                                        <Text strong className="text-gray-800">Total Amount:</Text>
                                        <Text className="text-2xl font-bold text-green-600">RM 10.00</Text>
                                    </div>
                                </div>
                            </div>

                            {/* Security Notice */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-start space-x-3">
                                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <Text strong className="text-blue-800">Secure Payment</Text>
                                        <div className="text-sm text-blue-700 mt-1">
                                            Your payment is processed securely through Stripe.
                                            We use industry-standard encryption to protect your card information.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Status */}
                            {paymentCompleted ? (
                                <Alert
                                    message="Payment Completed"
                                    description="Your delivery fee has been paid successfully. Your medication will be delivered within 1-3 business days."
                                    type="success"
                                    showIcon
                                />
                            ) : (
                                <div className="text-center">
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<CreditCard className="w-5 h-5" />}
                                        onClick={handlePayNow}
                                        loading={processingPayment}
                                        className="w-full bg-green-600 border-green-600 hover:bg-green-700"
                                    >
                                        Pay RM 10.00 Now
                                    </Button>
                                    <Text className="block mt-3 text-gray-500 text-sm">
                                        Click to complete your secure payment
                                    </Text>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Important Notes */}
            <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
                <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                        <Title level={4} className="text-yellow-800 mb-2 mt-0">
                            Delivery Information
                        </Title>
                        <div className="space-y-2 text-yellow-700">
                            <div>• Payment must be completed to confirm your delivery</div>
                            <div>• You&apos;ll receive tracking information via email and Push Notification</div>
                            <div>• Delivery is available Monday to Friday, 9 AM to 6 PM</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Navigation */}
            <Card>
                <div className="flex justify-between">
                    <Button
                        onClick={handlePrevious}
                        icon={<ArrowLeft className="w-4 h-4" />}
                        disabled={paymentCompleted}
                        className="border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700"
                    >
                        Previous
                    </Button>

                    {paymentCompleted && (
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => dispatch(setFlowCompleted(true))}
                            className="bg-green-600 border-green-600 hover:bg-green-700"
                        >
                            Continue to Confirmation
                        </Button>
                    )}
                </div>
            </Card>

            {/* Payment Modal */}
            {prescription && (
                <PaymentModal
                    visible={paymentModalVisible}
                    onClose={() => setPaymentModalVisible(false)}
                    context={{ type: "prescription", data: prescription }}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}
