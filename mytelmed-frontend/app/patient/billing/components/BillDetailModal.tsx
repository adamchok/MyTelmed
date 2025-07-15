"use client";

import { Modal, Typography, Row, Col, Tag, Button, Space, Descriptions } from "antd";
import {
    Receipt,
    Calendar,
    DollarSign,
    FileText,
    User,
    CreditCard,
    Stethoscope,
    Pill,
    ExternalLink
} from "lucide-react";
import dayjs from "dayjs";
import { BillDetailModalProps } from "../props";
import { BillType, BillingStatus, PaymentMode } from "@/app/api/payment/props";

const { Title, Text } = Typography;

const BillDetailModal: React.FC<BillDetailModalProps> = ({ bill, visible, onClose }) => {
    if (!bill) return null;

    // Get status configuration
    const getStatusConfig = (status: BillingStatus) => {
        switch (status) {
            case "PAID":
                return { color: "green", text: "Paid", bgColor: "bg-green-50", textColor: "text-green-700" };
            case "UNPAID":
                return { color: "orange", text: "Unpaid", bgColor: "bg-orange-50", textColor: "text-orange-700" };
            case "CANCELLED":
                return { color: "red", text: "Cancelled", bgColor: "bg-red-50", textColor: "text-red-700" };
            default:
                return { color: "default", text: status, bgColor: "bg-gray-50", textColor: "text-gray-700" };
        }
    };

    // Get bill type configuration
    const getBillTypeConfig = (type: BillType) => {
        switch (type) {
            case "CONSULTATION":
                return {
                    color: "blue",
                    text: "Virtual Consultation",
                    icon: <Stethoscope className="w-5 h-5" />,
                    description: "Fee for virtual consultation with healthcare provider"
                };
            case "MEDICATION":
                return {
                    color: "purple",
                    text: "Medication Delivery",
                    icon: <Pill className="w-5 h-5" />,
                    description: "Fee for medication delivery service"
                };
            default:
                return {
                    color: "default",
                    text: type,
                    icon: <FileText className="w-5 h-5" />,
                    description: "General healthcare service fee"
                };
        }
    };

    // Get payment mode information
    const getPaymentModeConfig = (mode?: PaymentMode) => {
        if (!mode) return null;

        switch (mode) {
            case "CARD":
                return {
                    color: "blue",
                    text: "Card Payment",
                    icon: <CreditCard className="w-4 h-4" />,
                    description: "Payment processed via credit/debit card"
                };
            default:
                return {
                    color: "default",
                    text: mode,
                    icon: <DollarSign className="w-4 h-4" />,
                    description: "Payment processed"
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

    // Handle receipt download/view
    const handleViewReceipt = () => {
        if (bill.receiptUrl) {
            window.open(bill.receiptUrl, '_blank');
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <span className="text-lg font-semibold">Bill Details</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={
                <div className="flex justify-between items-center">
                    <Space>
                        {bill.billingStatus === "PAID" && bill.receiptUrl && (
                            <Button
                                type="primary"
                                icon={<Receipt className="w-4 h-4" />}
                                onClick={handleViewReceipt}
                                className="bg-green-500 hover:bg-green-600 border-green-500"
                            >
                                View Receipt
                            </Button>
                        )}
                    </Space>
                    <Button onClick={onClose}>
                        Close
                    </Button>
                </div>
            }
            width={700}
            className="billing-detail-modal"
            centered
        >
            <div className="space-y-6">
                {/* Header Section */}
                <div className={`p-4 rounded-lg ${statusConfig.bgColor}`}>
                    <Row gutter={[24, 16]} align="middle">
                        <Col span={18}>
                            <div className="flex items-center space-x-3">
                                {typeConfig.icon}
                                <div>
                                    <Title level={4} className="mb-0 mt-0">
                                        {bill.billNumber}
                                    </Title>
                                    <Text className="text-gray-600">
                                        {typeConfig.description}
                                    </Text>
                                </div>
                            </div>
                        </Col>
                        <Col span={6} className="text-right">
                            <Tag
                                color={statusConfig.color}
                                className={`text-lg px-3 py-1 font-medium ${statusConfig.textColor}`}
                            >
                                {statusConfig.text}
                            </Tag>
                        </Col>
                    </Row>
                </div>

                {/* Amount Section */}
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <Text className="text-gray-600 block mb-2">Total Amount</Text>
                    <Title level={1} className="mb-0 text-green-600 mt-0">
                        {formatAmount(bill.amount)}
                    </Title>
                </div>

                {/* Bill Information */}
                <div>
                    <Title level={5} className="mb-4 text-gray-800">
                        Bill Information
                    </Title>
                    <Descriptions bordered column={2} size="middle">
                        <Descriptions.Item label="Bill Number" span={2}>
                            <Text strong>{bill.billNumber}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Bill Type">
                            <div className="flex items-center space-x-2">
                                {typeConfig.icon}
                                <Tag color={typeConfig.color}>{typeConfig.text}</Tag>
                            </div>
                        </Descriptions.Item>

                        <Descriptions.Item label="Status">
                            <Tag color={statusConfig.color} className="font-medium">
                                {statusConfig.text}
                            </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Amount">
                            <Text strong className="text-green-600 text-lg">
                                {formatAmount(bill.amount)}
                            </Text>
                        </Descriptions.Item>

                        {paymentConfig && (
                            <Descriptions.Item label="Payment Method">
                                <div className="flex items-center space-x-2">
                                    {paymentConfig.icon}
                                    <Tag color={paymentConfig.color}>{paymentConfig.text}</Tag>
                                </div>
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Description" span={2}>
                            {bill.description}
                        </Descriptions.Item>
                    </Descriptions>
                </div>

                {/* Patient Information */}
                <div>
                    <Title level={5} className="mb-4 text-gray-800">
                        Patient Information
                    </Title>
                    <Descriptions bordered column={1} size="middle">
                        <Descriptions.Item label={
                            <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>Patient Name</span>
                            </div>
                        }>
                            <Text strong>{bill.patientName}</Text>
                        </Descriptions.Item>
                    </Descriptions>
                </div>

                {/* Date Information */}
                <div>
                    <Title level={5} className="mb-4 text-gray-800">
                        Date Information
                    </Title>
                    <Descriptions bordered column={2} size="middle">
                        <Descriptions.Item label={
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>Billed Date</span>
                            </div>
                        }>
                            {dayjs(Number(bill.billedAt) * 1000).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>

                        {bill.paidAt && (
                            <Descriptions.Item label={
                                <div className="flex items-center space-x-2">
                                    <Receipt className="w-4 h-4 text-green-500" />
                                    <span>Paid Date</span>
                                </div>
                            }>
                                {dayjs(Number(bill.paidAt) * 1000).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        )}

                        {bill.cancelledAt && (
                            <Descriptions.Item label="Cancelled Date">
                                {dayjs(Number(bill.cancelledAt) * 1000).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Created Date">
                            {dayjs(Number(bill.createdAt) * 1000).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>

                        <Descriptions.Item label="Last Updated">
                            {dayjs(Number(bill.updatedAt) * 1000).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                    </Descriptions>
                </div>

                {/* Receipt Section - only show if paid */}
                {bill.billingStatus === "PAID" && (
                    <div>
                        <Title level={5} className="mb-4 text-gray-800">
                            Receipt & Documentation
                        </Title>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <Row gutter={[16, 16]} align="middle">
                                <Col span={18}>
                                    <div className="flex items-center space-x-3">
                                        <Receipt className="w-5 h-5 text-green-600" />
                                        <div>
                                            <Text strong className="text-green-700 block">
                                                Payment Receipt Available
                                            </Text>
                                            <Text className="text-green-600 text-sm">
                                                Your payment receipt is ready for download or viewing
                                            </Text>
                                        </div>
                                    </div>
                                </Col>
                                <Col span={6} className="text-right">
                                    {bill.receiptUrl ? (
                                        <Button
                                            type="primary"
                                            icon={<ExternalLink className="w-4 h-4" />}
                                            onClick={handleViewReceipt}
                                            className="bg-green-500 hover:bg-green-600 border-green-500"
                                        >
                                            View Receipt
                                        </Button>
                                    ) : (
                                        <Text className="text-gray-500 text-sm">
                                            Receipt processing...
                                        </Text>
                                    )}
                                </Col>
                            </Row>
                        </div>
                    </div>
                )}

                {/* Help Section */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <Title level={5} className="text-blue-700 mb-2 mt-0">
                        Need Help?
                    </Title>
                    <Text className="text-blue-600">
                        If you have any questions about this bill or need assistance, please contact our billing support team
                        or visit your nearest participating healthcare facility.
                    </Text>
                </div>
            </div>
        </Modal>
    );
};

export default BillDetailModal; 