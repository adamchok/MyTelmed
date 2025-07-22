"use client";

import { Card, Tag, Button, Typography, Space, Tooltip, Row, Col } from "antd";
import {
    Receipt,
    FileText,
    Calendar,
    DollarSign,
    CreditCard,
    Stethoscope,
    Pill
} from "lucide-react";
import dayjs from "dayjs";
import { BillCardProps } from "../props";
import { BillType, BillingStatus, PaymentMode } from "@/app/api/payment/props";

const { Text, Title } = Typography;

const BillCard: React.FC<BillCardProps> = ({ bill, showPatientInfo }) => {
    // Get status color and icon
    const getStatusConfig = (status: BillingStatus) => {
        switch (status) {
            case "PAID":
                return { color: "green", text: "Paid", icon: "✓" };
            case "UNPAID":
                return { color: "orange", text: "Unpaid", icon: "⏳" };
            case "CANCELLED":
                return { color: "red", text: "Cancelled", icon: "✗" };
            default:
                return { color: "default", text: status, icon: "?" };
        }
    };

    // Get bill type config
    const getBillTypeConfig = (type: BillType) => {
        switch (type) {
            case "CONSULTATION":
                return {
                    color: "blue",
                    text: "Consultation",
                    icon: <Stethoscope className="w-4 h-4" />
                };
            case "MEDICATION":
                return {
                    color: "purple",
                    text: "Medication",
                    icon: <Pill className="w-4 h-4" />
                };
            default:
                return {
                    color: "default",
                    text: type,
                    icon: <FileText className="w-4 h-4" />
                };
        }
    };

    // Get payment mode config
    const getPaymentModeConfig = (mode?: PaymentMode) => {
        if (!mode) return null;

        if (mode === "CARD") {
            return {
                color: "blue",
                text: "Card Payment",
                icon: <CreditCard className="w-4 h-4" />
            };
        } else {
            return {
                color: "default",
                text: mode,
                icon: <DollarSign className="w-4 h-4" />
            };
        }
    };

    const statusConfig = getStatusConfig(bill.billingStatus);
    const typeConfig = getBillTypeConfig(bill.billType);
    const paymentConfig = getPaymentModeConfig(bill.paymentMode);

    // Format amount in MYR
    const formatAmount = (amount: number) => {
        return `RM ${amount.toFixed(2)}`;
    };

    // Handle receipt download
    const handleViewReceipt = () => {
        if (bill.receiptUrl) {
            window.open(bill.receiptUrl, '_blank');
        }
    };

    return (
        <Card
            className="shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 p-4 sm:p-6 md:p-8"
            styles={{ body: { padding: 0 } }}
        >
            {/* Header */}
            <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center space-x-2 min-w-0">
                            <Title level={5} className="mb-0 text-gray-800 truncate scroll-mt-0" style={{ lineHeight: 1.2 }}>
                                {bill.billNumber}
                            </Title>
                        </div>
                        <div className="flex flex-row gap-1">
                            <Tag
                                color={typeConfig.color}
                                className="text-xs mt-1"
                            >
                                {typeConfig.text}
                            </Tag>
                            <Tag
                                color={statusConfig.color}
                                className="text-xs mt-1"
                            >
                                {statusConfig.icon} {statusConfig.text}
                            </Tag>
                        </div>
                    </div>
                </div>
            </div>

            {/* Amount */}
            <div className="mb-4">
                <Text className="text-gray-600 text-sm block mb-1">Amount</Text>
                <Title level={3} className="mb-0 text-green-600 truncate mt-0">
                    {formatAmount(bill.amount)}
                </Title>
            </div>

            {/* Description */}
            <div className="mb-4">
                <Text className="text-gray-600 text-sm block mb-1">Description</Text>
                <Text className="text-gray-800 break-words">
                    {bill.description}
                </Text>
            </div>

            {/* Patient Info (if viewing multiple patients) */}
            {showPatientInfo && (
                <div className="mb-4">
                    <Text className="text-gray-600 text-sm block mb-1">Patient</Text>
                    <Text className="text-gray-800 font-medium break-words">
                        {bill.patientName}
                    </Text>
                </div>
            )}

            {/* Date Information */}
            <Row gutter={[8, 8]} className="mb-4 flex flex-col sm:flex-row">
                <Col span={12} className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                            <Text className="text-gray-600 text-xs block">Billed Date</Text>
                            <Text className="text-gray-800 text-sm">
                                {dayjs(Number(bill.billedAt) * 1000).format('DD/MM/YYYY')}
                            </Text>
                        </div>
                    </div>
                </Col>
                {bill.paidAt && (
                    <Col span={12} className="flex-1 min-w-0 mt-2 sm:mt-0">
                        <div className="flex items-center space-x-2">
                            <Receipt className="w-4 h-4 text-green-500" />
                            <div>
                                <Text className="text-gray-600 text-xs block">Paid Date</Text>
                                <Text className="text-gray-800 text-sm">
                                    {dayjs(Number(bill.paidAt) * 1000).format('DD/MM/YYYY')}
                                </Text>
                            </div>
                        </div>
                    </Col>
                )}
            </Row>

            {/* Payment Method (if paid) */}
            {paymentConfig && (
                <div className="mb-4">
                    <Text className="text-gray-600 text-sm block mb-2">Payment Method</Text>
                    <div className="flex items-center space-x-2">
                        {paymentConfig.icon}
                        <Tag color={paymentConfig.color} className="text-sm">
                            {paymentConfig.text}
                        </Tag>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-100 gap-2">
                <Space className="w-full sm:w-auto">
                    <Text className="text-gray-500 text-xs">
                        Created {dayjs(Number(bill.createdAt) * 1000).format('DD/MM/YYYY HH:mm')}
                    </Text>
                </Space>
                <Space className="w-full sm:w-auto flex flex-row gap-2 justify-end">
                    {/* Receipt Button - only show if paid and receipt URL exists */}
                    {bill.billingStatus === "PAID" && bill.receiptUrl && (
                        <Tooltip title="View Receipt">
                            <Button
                                type="primary"
                                size="small"
                                icon={<Receipt className="w-4 h-4" />}
                                onClick={handleViewReceipt}
                                className="bg-green-500 hover:bg-green-600 border-green-500"
                            >
                                Receipt
                            </Button>
                        </Tooltip>
                    )}
                </Space>
            </div>
        </Card>
    );
};

export default BillCard;
