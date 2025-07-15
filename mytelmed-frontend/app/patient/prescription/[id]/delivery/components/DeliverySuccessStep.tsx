"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Typography, Result, Row, Col, Timeline, Tag } from "antd";
import { CheckCircle, Eye, Home, Package, Truck, Clock, Phone } from "lucide-react";
import { RootState } from "@/lib/store";
import { resetDeliveryFlow } from "@/lib/reducers/delivery-flow-reducer";

const { Title, Text } = Typography;

export default function DeliverySuccessStep() {
    const router = useRouter();
    const dispatch = useDispatch();

    const {
        prescription,
        selectedMethod,
        selectedAddress,
        delivery,
    } = useSelector((state: RootState) => state.rootReducer.deliveryFlow);

    const handleViewPrescription = () => {
        if (prescription) {
            dispatch(resetDeliveryFlow());
            router.push(`/patient/prescription/${prescription.id}`);
        }
    };

    const handleBackToDashboard = () => {
        dispatch(resetDeliveryFlow());
        router.push("/patient/dashboard");
    };

    const handleViewPrescriptions = () => {
        dispatch(resetDeliveryFlow());
        router.push("/patient/prescription");
    };

    const getDeliveryMethodInfo = () => {
        if (selectedMethod === "PICKUP") {
            return {
                icon: <Package className="w-6 h-6 text-blue-600" />,
                title: "Pickup Confirmed",
                description: "Your medication will be ready for pickup at the pharmacy"
            };
        } else {
            return {
                icon: <Truck className="w-6 h-6 text-green-600" />,
                title: "Delivery Confirmed",
                description: "Your medication will be delivered to your address"
            };
        }
    };

    const getNextSteps = () => {
        if (selectedMethod === "PICKUP") {
            return [
                "The pharmacy will prepare your medication",
                "You'll receive a notification when it's ready for pickup",
                "Visit the pharmacy during operating hours to collect your medication",
                "Bring your ID and prescription number for verification"
            ];
        } else {
            return [
                "The pharmacy will prepare your medication",
                "Your delivery will be processed and dispatched",
                "You'll receive tracking information via email and SMS",
                "Expect delivery within 1-3 business days"
            ];
        }
    };

    const deliveryInfo = getDeliveryMethodInfo();

    return (
        <div className="space-y-6">
            {/* Success Result */}
            <Result
                icon={
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                }
                title={
                    <Title level={2} className="text-green-800 mb-4">
                        {deliveryInfo.title}
                    </Title>
                }
                subTitle={
                    <Text className="text-gray-600 text-lg">
                        {deliveryInfo.description}
                    </Text>
                }
            />

            {/* Delivery Details */}
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card title="Delivery Details" className="h-full">
                        <div className="space-y-4">
                            {/* Prescription Info */}
                            <div>
                                <Text strong className="text-gray-700">Prescription:</Text>
                                <div className="mt-1">
                                    <Text className="text-gray-600">#{prescription?.prescriptionNumber}</Text>
                                </div>
                            </div>

                            {/* Delivery Method */}
                            <div>
                                <Text strong className="text-gray-700">Method:</Text>
                                <div className="mt-1 flex items-center space-x-2">
                                    {deliveryInfo.icon}
                                    <Text className="text-gray-600">
                                        {selectedMethod === "PICKUP" ? "Pickup at Pharmacy" : "Home Delivery"}
                                    </Text>
                                </div>
                            </div>

                            {/* Address (for home delivery) */}
                            {selectedMethod === "HOME_DELIVERY" && selectedAddress && (
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

                            {/* Payment Status */}
                            {selectedMethod === "HOME_DELIVERY" && (
                                <div>
                                    <Text strong className="text-gray-700">Payment Status:</Text>
                                    <div className="mt-1">
                                        <Tag color="green" className="px-3 py-1">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Paid - RM 10.00
                                        </Tag>
                                    </div>
                                </div>
                            )}

                            {/* Delivery ID */}
                            {delivery && (
                                <div>
                                    <Text strong className="text-gray-700">Delivery ID:</Text>
                                    <div className="mt-1">
                                        <Text className="text-gray-600 font-mono">{delivery.id}</Text>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="Next Steps" className="h-full">
                        <Timeline
                            items={getNextSteps().map((step, index) => ({
                                color: index === 0 ? "green" : "gray",
                                children: (
                                    <div>
                                        <Text className={index === 0 ? "text-green-700 font-medium" : "text-gray-700"}>
                                            {step}
                                        </Text>
                                    </div>
                                )
                            }))}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Important Information */}
            <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                        <Title level={4} className="text-blue-800 mb-2 mt-0">
                            What Happens Next?
                        </Title>
                        <div className="space-y-2 text-blue-700">
                            {selectedMethod === "PICKUP" ? (
                                <>
                                    <div>• The pharmacy will begin preparing your medication</div>
                                    <div>• You&apos;ll receive a notification when it&apos;s ready (usually within 24 hours)</div>
                                    <div>• Visit the pharmacy during operating hours to collect</div>
                                    <div>• Bring your IC and mention your prescription number</div>
                                </>
                            ) : (
                                <>
                                    <div>• The pharmacy will prepare your medication for delivery</div>
                                    <div>• You&apos;ll receive tracking information via email and SMS</div>
                                    <div>• Delivery will be attempted within 1-3 business days</div>
                                    <div>• Make sure someone is available to receive the delivery</div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Contact Information */}
            <Card className="border-l-4 border-l-green-500 bg-green-50">
                <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                        <Title level={4} className="text-green-800 mb-2 mt-0">
                            Need Help?
                        </Title>
                        <div className="space-y-2 text-green-700">
                            <div>• Contact the pharmacy directly if you have questions about your medication</div>
                            <div>• Call customer service at 1-800-MEDCARE for delivery inquiries</div>
                            <div>• Check your prescription details anytime in your patient portal</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Action Buttons */}
            <Card>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        type="primary"
                        size="large"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={handleViewPrescription}
                        className="bg-green-600 border-green-600 hover:bg-green-700"
                    >
                        View Prescription Details
                    </Button>
                    <Button
                        size="large"
                        icon={<Package className="w-4 h-4" />}
                        onClick={handleViewPrescriptions}
                        className="border-green-600 text-green-600 hover:border-green-700 hover:text-green-700"
                    >
                        View All Prescriptions
                    </Button>
                    <Button
                        size="large"
                        icon={<Home className="w-4 h-4" />}
                        onClick={handleBackToDashboard}
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </Card>
        </div>
    );
} 