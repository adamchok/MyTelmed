"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Button, Form, Input, Row, Col, message } from "antd";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { RootState } from "@/lib/store";
import { updateFormData, nextStep, previousStep } from "@/lib/reducers/referral-creation-reducer";

const { Title } = Typography;
const { TextArea } = Input;

export default function ClinicalDetailsStep() {
    const dispatch = useDispatch();
    const { formData } = useSelector((state: RootState) => state.rootReducer.referralCreation);

    const [form] = Form.useForm();

    const handleNext = async () => {
        try {
            const values = await form.validateFields();

            // Update form data in Redux
            dispatch(
                updateFormData({
                    reasonForReferral: values.reasonForReferral,
                    clinicalSummary: values.clinicalSummary,
                    investigationsDone: values.investigationsDone,
                    currentMedications: values.currentMedications,
                    allergies: values.allergies,
                    vitalSigns: values.vitalSigns,
                    notes: values.notes,
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

    return (
        <div className="space-y-6">
            <Title level={4}>Clinical Information</Title>

            <Form form={form} layout="vertical" initialValues={formData}>
                <Form.Item
                    name="reasonForReferral"
                    label="Reason for Referral"
                    rules={[{ required: true, message: "Please enter reason for referral" }]}
                >
                    <TextArea
                        rows={3}
                        placeholder="Explain why this referral is needed..."
                        maxLength={1000}
                        showCount
                    />
                </Form.Item>

                <Form.Item
                    name="clinicalSummary"
                    label="Clinical Summary"
                    rules={[{ required: true, message: "Please enter clinical summary" }]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Provide a summary of the patient's condition..."
                        maxLength={2000}
                        showCount
                    />
                </Form.Item>

                <Form.Item name="investigationsDone" label="Investigations Done">
                    <TextArea
                        rows={3}
                        placeholder="List any tests, scans, or investigations performed..."
                        maxLength={1000}
                        showCount
                    />
                </Form.Item>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Form.Item name="currentMedications" label="Current Medications">
                            <TextArea rows={3} placeholder="List current medications..." maxLength={500} showCount />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name="allergies" label="Known Allergies">
                            <TextArea rows={3} placeholder="List any known allergies..." maxLength={500} showCount />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="vitalSigns" label="Vital Signs">
                    <TextArea rows={2} placeholder="BP, HR, Temp, etc..." maxLength={300} showCount />
                </Form.Item>

                <Form.Item name="notes" label="Additional Notes">
                    <TextArea
                        rows={3}
                        placeholder="Any additional notes or instructions..."
                        maxLength={1000}
                        showCount
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
                    Next: Review
                </Button>
            </div>
        </div>
    );
}
