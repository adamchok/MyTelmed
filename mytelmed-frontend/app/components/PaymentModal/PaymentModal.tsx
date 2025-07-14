import React, { useState, useEffect } from "react";
import { Modal, Button, Typography, Spin, Alert, Card, Row, Col, message } from "antd";
import { CreditCard, Lock, AlertCircle, CheckCircle, X } from "lucide-react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Import API
import PaymentApi from "@/app/api/payment";
import { PaymentIntentResponseDto, ConfirmPaymentRequestDto } from "@/app/api/payment/props";
import { AppointmentDto } from "@/app/api/appointment/props";

const { Title, Text } = Typography;

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// Card element options
const cardElementOptions = {
    style: {
        base: {
            fontSize: "16px",
            color: "#424770",
            "::placeholder": {
                color: "#aab7c4",
            },
            iconColor: "#666EE8",
        },
        invalid: {
            color: "#9e2146",
        },
    },
    hidePostalCode: true,
};

interface PaymentFormProps {
    appointment: AppointmentDto;
    paymentIntent: PaymentIntentResponseDto;
    onPaymentSuccess: () => void;
    onPaymentError: (error: string) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

// Payment form component that uses Stripe Elements
const PaymentForm: React.FC<PaymentFormProps> = ({
    appointment,
    paymentIntent,
    onPaymentSuccess,
    onPaymentError,
    loading,
    setLoading,
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [cardComplete, setCardComplete] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);

    const handleCardChange = (event: any) => {
        setCardComplete(event.complete);
        setCardError(event.error ? event.error.message : null);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            onPaymentError("Stripe has not loaded yet. Please try again.");
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            onPaymentError("Card element not found. Please refresh the page.");
            return;
        }

        if (!cardComplete) {
            onPaymentError("Please complete your card information.");
            return;
        }

        try {
            setLoading(true);

            // Create payment method
            const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
                type: "card",
                card: cardElement,
                billing_details: {
                    name: appointment.patient.name,
                    email: appointment.patient.email,
                },
            });

            if (paymentMethodError) {
                onPaymentError(paymentMethodError.message || "Failed to create payment method");
                return;
            }

            // Confirm payment with backend
            const confirmRequest: ConfirmPaymentRequestDto = {
                paymentIntentId: paymentIntent.paymentIntentId,
                paymentMethodId: paymentMethod.id,
            };

            const response = await PaymentApi.confirmPayment(confirmRequest);

            if (response.data.isSuccess && response.data.data) {
                const confirmedPayment = response.data.data;

                if (confirmedPayment.status === "succeeded") {
                    onPaymentSuccess();
                } else if (confirmedPayment.status === "requires_action") {
                    // Handle 3D Secure authentication
                    const { error: confirmError } = await stripe.confirmCardPayment(confirmedPayment.clientSecret);

                    if (confirmError) {
                        onPaymentError(confirmError.message || "Payment authentication failed");
                    } else {
                        onPaymentSuccess();
                    }
                } else {
                    onPaymentError("Payment failed. Please try again.");
                }
            } else {
                onPaymentError(response.data.message || "Payment confirmation failed");
            }
        } catch (error: any) {
            console.error("Payment error:", error);
            onPaymentError(error.response?.data?.message || error.message || "Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Information */}
            <Card className="border-blue-200 bg-blue-50">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <div className="space-y-1">
                            <Text strong className="text-blue-800">
                                Appointment with
                            </Text>
                            <div className="text-blue-700">Dr. {appointment.doctor.name}</div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12}>
                        <div className="space-y-1 text-right">
                            <Text strong className="text-blue-800">
                                Amount
                            </Text>
                            <div className="text-2xl font-bold text-blue-700">RM {paymentIntent.amount.toFixed(2)}</div>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Card Information */}
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <Text strong className="text-gray-700">
                        Card Information
                    </Text>
                </div>

                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                    <CardElement options={cardElementOptions} onChange={handleCardChange} />
                </div>

                {cardError && (
                    <Alert
                        message={cardError}
                        type="error"
                        showIcon
                        icon={<AlertCircle className="w-4 h-4" />}
                        className="text-sm"
                    />
                )}
            </div>

            {/* Security Notice */}
            <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                <Lock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                    <Text strong>Secure Payment</Text>
                    <div className="text-xs text-gray-600 mt-1">
                        Your payment information is encrypted and secure. We use Stripe for payment processing.
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                disabled={!stripe || !cardComplete || loading}
                className="w-full bg-blue-600 border-blue-600 hover:bg-blue-700 text-white"
                icon={<CreditCard className="w-5 h-5" />}
            >
                {loading ? "Processing Payment..." : `Pay RM ${paymentIntent.amount.toFixed(2)}`}
            </Button>
        </form>
    );
};

interface PaymentModalProps {
    visible: boolean;
    onClose: () => void;
    appointment: AppointmentDto;
    onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ visible, onClose, appointment, onPaymentSuccess }) => {
    const [paymentIntent, setPaymentIntent] = useState<PaymentIntentResponseDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Create payment intent when modal opens
    useEffect(() => {
        if (visible && appointment && !paymentIntent) {
            createPaymentIntent();
        }
    }, [visible, appointment]);

    // Reset state when modal closes
    useEffect(() => {
        if (!visible) {
            setPaymentIntent(null);
            setError(null);
            setSuccess(false);
            setLoading(false);
            setCreating(false);
        }
    }, [visible]);

    const createPaymentIntent = async () => {
        try {
            setCreating(true);
            setError(null);

            const response = await PaymentApi.createAppointmentPaymentIntent(appointment.id);

            if (response.data.isSuccess && response.data.data) {
                setPaymentIntent(response.data.data);
            } else {
                setError(response.data.message || "Failed to create payment session");
            }
        } catch (error: any) {
            console.error("Error creating payment intent:", error);
            setError(error.response?.data?.message || error.message || "Failed to create payment session");
        } finally {
            setCreating(false);
        }
    };

    const handlePaymentSuccess = () => {
        setSuccess(true);
        message.success("Payment completed successfully!");

        // Auto-close modal after 2 seconds and trigger success callback
        setTimeout(() => {
            onClose();
            onPaymentSuccess();
        }, 2000);
    };

    const handlePaymentError = (errorMessage: string) => {
        setError(errorMessage);
        message.error(errorMessage);
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>Complete Payment</span>
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={600}
            centered
            maskClosable={!loading}
            closable={!loading}
        >
            <div className="space-y-6">
                {/* Loading State */}
                {creating && (
                    <div className="text-center py-8">
                        <Spin size="large" />
                        <div className="mt-4 text-gray-600">Creating payment session...</div>
                    </div>
                )}

                {/* Error State */}
                {error && !creating && (
                    <div className="text-center py-8">
                        <Alert
                            message="Payment Error"
                            description={error}
                            type="error"
                            showIcon
                            icon={<AlertCircle className="w-5 h-5" />}
                            action={
                                <Button type="primary" size="small" onClick={createPaymentIntent}>
                                    Try Again
                                </Button>
                            }
                        />
                    </div>
                )}

                {/* Success State */}
                {success && (
                    <div className="text-center py-8">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <Title level={4} className="text-green-800 mb-2">
                                    Payment Successful!
                                </Title>
                                <Text className="text-gray-600">
                                    Your appointment payment has been processed successfully.
                                    <br />
                                    You will receive a confirmation email shortly.
                                </Text>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Form */}
                {paymentIntent && !success && !error && (
                    <Elements stripe={stripePromise}>
                        <PaymentForm
                            appointment={appointment}
                            paymentIntent={paymentIntent}
                            onPaymentSuccess={handlePaymentSuccess}
                            onPaymentError={handlePaymentError}
                            loading={loading}
                            setLoading={setLoading}
                        />
                    </Elements>
                )}

                {/* Cancel button for when not loading */}
                {!loading && !success && (
                    <div className="flex justify-end pt-4 border-t">
                        <Button onClick={handleClose} icon={<X className="w-4 h-4" />}>
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default PaymentModal;
