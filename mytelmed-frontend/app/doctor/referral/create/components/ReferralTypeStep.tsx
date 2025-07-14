"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Radio, Space, Button, Card, Avatar, Row, Col, Input, DatePicker, Form, message } from "antd";
import { CheckCircle, Building, User, ArrowRight, ArrowLeft, AlertTriangle, Clock } from "lucide-react";
import dayjs from "dayjs";
import { RootState } from "@/lib/store";
import {
    setReferralType,
    setSelectedDoctor,
    updateFormData,
    nextStep,
    previousStep,
} from "@/lib/reducers/referral-creation-reducer";
import { ReferralType, ReferralPriority } from "@/app/api/referral/props";
import { Doctor } from "@/app/api/doctor/props";
import DoctorSelectionModal from "../../components/DoctorSelectionModal";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ReferralTypeStep() {
    const dispatch = useDispatch();
    const { referralType, selectedDoctor, formData } = useSelector(
        (state: RootState) => state.rootReducer.referralCreation
    );

    const [form] = Form.useForm();
    const [doctorSelectionModalVisible, setDoctorSelectionModalVisible] = useState(false);

    const handleReferralTypeChange = (e: any) => {
        const newType = e.target.value;
        dispatch(setReferralType(newType));
        if (newType === ReferralType.EXTERNAL) {
            dispatch(setSelectedDoctor(null));
        }
    };

    const handleDoctorSelect = (doctor: Doctor) => {
        dispatch(setSelectedDoctor(doctor));
        form.setFieldsValue({ referredDoctorId: doctor.id });
        setDoctorSelectionModalVisible(false);
    };

    const handleNext = async () => {
        try {
            const values = await form.validateFields();

            // Update form data in Redux
            dispatch(
                updateFormData({
                    priority: values.priority,
                    expiryDate: values.expiryDate ? dayjs(values.expiryDate).format("DD-MM-YYYY") : undefined,
                    externalDoctorName: values.externalDoctorName,
                    externalDoctorSpeciality: values.externalDoctorSpeciality,
                    externalFacilityName: values.externalFacilityName,
                    externalFacilityAddress: values.externalFacilityAddress,
                    externalContactNumber: values.externalContactNumber,
                    externalEmail: values.externalEmail,
                })
            );

            dispatch(nextStep());
        } catch {
            message.error("Please complete all required fields");
        }
    };

    const handlePrevious = () => {
        dispatch(previousStep());
    };

    const getPriorityTextColor = (priority: ReferralPriority) => {
        switch (priority) {
            case ReferralPriority.EMERGENCY:
                return "#ef4444";
            case ReferralPriority.URGENT:
                return "#f97316";
            case ReferralPriority.ROUTINE:
                return "#22c55e";
            default:
                return "#000000";
        }
    };

    const getPriorityIcon = (priority: ReferralPriority) => {
        switch (priority) {
            case ReferralPriority.EMERGENCY:
                return <AlertTriangle className="w-4 h-4" />;
            case ReferralPriority.URGENT:
                return <Clock className="w-4 h-4" />;
            case ReferralPriority.ROUTINE:
                return <CheckCircle className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <Title level={4}>Referral Type & Recipient</Title>
            <Form form={form} layout="vertical" initialValues={formData}>
                <Form.Item label="Referral Type" required>
                    <Radio.Group value={referralType} onChange={handleReferralTypeChange} className="w-full">
                        <Space direction="vertical" className="w-full">
                            <Radio value={ReferralType.INTERNAL}>
                                <Space>
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>Internal Referral - To doctor within the system</span>
                                </Space>
                            </Radio>
                            <Radio value={ReferralType.EXTERNAL}>
                                <Space>
                                    <Building className="w-4 h-4 text-blue-600" />
                                    <span>External Referral - To doctor outside the system</span>
                                </Space>
                            </Radio>
                        </Space>
                    </Radio.Group>
                </Form.Item>

                {referralType === ReferralType.INTERNAL ? (
                    <Form.Item
                        name="referredDoctorId"
                        label="Select Doctor"
                        rules={[{ required: true, message: "Please select a doctor" }]}
                    >
                        <div className="space-y-3">
                            {selectedDoctor ? (
                                <Card size="small" className="border-green-200 bg-green-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Avatar
                                                src={selectedDoctor.profileImageUrl}
                                                icon={<User className="w-4 h-4" />}
                                                size={40}
                                            />
                                            <div>
                                                <Text strong>{selectedDoctor.name}</Text>
                                                <div className="text-xs text-gray-600">
                                                    {selectedDoctor.specialityList?.join(", ") || "General"}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {selectedDoctor.facility.name}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            type="link"
                                            onClick={() => setDoctorSelectionModalVisible(true)}
                                            className="text-green-700"
                                        >
                                            Change
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <Button
                                    type="dashed"
                                    size="large"
                                    onClick={() => setDoctorSelectionModalVisible(true)}
                                    className="w-full h-16 border-green-300 text-green-700 hover:border-green-500"
                                >
                                    <div className="flex flex-col items-center space-y-1">
                                        <User className="w-5 h-5" />
                                        <span>Select Doctor</span>
                                    </div>
                                </Button>
                            )}
                        </div>
                    </Form.Item>
                ) : (
                    <div className="space-y-4">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="externalDoctorName"
                                    label="Doctor Name"
                                    rules={[{ required: true, message: "Please enter doctor name" }]}
                                >
                                    <Input placeholder="Enter doctor name" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="externalDoctorSpeciality"
                                    label="Speciality"
                                    rules={[{ required: true, message: "Please enter speciality" }]}
                                >
                                    <Input placeholder="Enter speciality" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="externalFacilityName"
                            label="Facility Name"
                            rules={[{ required: true, message: "Please enter facility name" }]}
                        >
                            <Input placeholder="Enter facility/hospital name" />
                        </Form.Item>

                        <Form.Item
                            name="externalFacilityAddress"
                            label="Facility Address"
                            rules={[{ required: true, message: "Please enter facility address" }]}
                        >
                            <TextArea rows={2} placeholder="Enter facility address" />
                        </Form.Item>

                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                                <Form.Item name="externalContactNumber" label="Contact Number">
                                    <Input placeholder="Enter contact number" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="externalEmail"
                                    label="Email"
                                    rules={[{ type: "email", message: "Please enter valid email" }]}
                                >
                                    <Input placeholder="Enter email" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                )}

                <Form.Item
                    name="priority"
                    label="Priority Level"
                    rules={[{ required: true, message: "Please select priority" }]}
                >
                    <Radio.Group>
                        <Space direction="vertical">
                            {Object.values(ReferralPriority).map((priority) => (
                                <Radio key={priority} value={priority}>
                                    <Space>
                                        {getPriorityIcon(priority)}
                                        <span style={{ color: getPriorityTextColor(priority) }}>{priority}</span>
                                    </Space>
                                </Radio>
                            ))}
                        </Space>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    name="expiryDate"
                    label="Expiry Date"
                    rules={[{ required: true, message: "Please select expiry date" }]}
                >
                    <DatePicker
                        className="w-full"
                        format="DD-MM-YYYY"
                        disabledDate={(current) => current && current <= dayjs().endOf("day")}
                        placeholder="Select expiry date"
                    />
                </Form.Item>
            </Form>
            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
                <Button onClick={handlePrevious} icon={<ArrowLeft className="w-4 h-4" />}>
                    Previous
                </Button>
                <Button
                    type="primary"
                    onClick={handleNext}
                    icon={<ArrowRight className="w-4 h-4" />}
                    className="bg-green-700 hover:bg-green-800 border-green-700"
                >
                    Next: Clinical Details
                </Button>
            </div>
            {/* Doctor Selection Modal */}
            <DoctorSelectionModal
                visible={doctorSelectionModalVisible}
                onCancel={() => setDoctorSelectionModalVisible(false)}
                onSelect={handleDoctorSelect}
                selectedDoctorId={selectedDoctor?.id}
            />
        </div>
    );
}
