"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Typography, Button, Card, Avatar, Divider, message } from "antd";
import { ArrowLeft, User } from "lucide-react";
import { RootState } from "@/lib/store";
import { previousStep, setIsSubmitting, resetReferralCreation } from "@/lib/reducers/referral-creation-reducer";
import { ReferralType } from "@/app/api/referral/props";
import { CreateReferralRequestDto } from "@/app/api/referral/props";
import ReferralApi from "@/app/api/referral";

const { Title, Text, Paragraph } = Typography;

export default function ReviewStep() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { selectedAppointment, referralType, selectedDoctor, formData, isSubmitting } = useSelector(
        (state: RootState) => state.rootReducer.referralCreation
    );

    const handlePrevious = () => {
        dispatch(previousStep());
    };

    const handleSubmit = async () => {
        if (!selectedAppointment || !formData.priority || !formData.expiryDate) {
            message.error("Missing required information");
            return;
        }

        try {
            dispatch(setIsSubmitting(true));

            const requestData: CreateReferralRequestDto = {
                patientId: selectedAppointment.patient.id,
                referralType: referralType,
                priority: formData.priority,
                clinicalSummary: formData.clinicalSummary || "",
                reasonForReferral: formData.reasonForReferral || "",
                investigationsDone: formData.investigationsDone,
                currentMedications: formData.currentMedications,
                allergies: formData.allergies,
                vitalSigns: formData.vitalSigns,
                expiryDate: formData.expiryDate,
                notes: formData.notes,
            };

            if (referralType === ReferralType.INTERNAL && selectedDoctor) {
                requestData.referredDoctorId = selectedDoctor.id;
            } else if (referralType === ReferralType.EXTERNAL) {
                requestData.externalDoctorName = formData.externalDoctorName;
                requestData.externalDoctorSpeciality = formData.externalDoctorSpeciality;
                requestData.externalFacilityName = formData.externalFacilityName;
                requestData.externalFacilityAddress = formData.externalFacilityAddress;
                requestData.externalContactNumber = formData.externalContactNumber;
                requestData.externalEmail = formData.externalEmail;
            }

            await ReferralApi.createReferral(requestData);

            message.success("Referral created successfully");
            dispatch(resetReferralCreation());
            router.push("/doctor/referral");
        } catch {
            message.error("Failed to create referral");
        } finally {
            dispatch(setIsSubmitting(false));
        }
    };

    return (
        <div className="space-y-6">
            <Title level={4}>Review Referral Details</Title>

            {/* Patient Information */}
            {selectedAppointment && (
                <Card title="Patient Information" size="small">
                    <div className="flex items-center space-x-4">
                        <Avatar
                            src={selectedAppointment.patient.profileImageUrl}
                            icon={<User className="w-4 h-4" />}
                            size={48}
                        />
                        <div>
                            <Text strong className="block">
                                {selectedAppointment.patient.name}
                            </Text>
                            <Text type="secondary">{selectedAppointment.patient.email}</Text>
                            <Text type="secondary" className="block">
                                {selectedAppointment.patient.phone}
                            </Text>
                        </div>
                    </div>
                </Card>
            )}

            {/* Referral Summary */}
            <Card title="Referral Summary" size="small">
                <div className="space-y-2">
                    <div>
                        <Text strong>Type:</Text> {referralType}
                    </div>
                    <div>
                        <Text strong>Priority:</Text> {formData.priority}
                    </div>
                    <div>
                        <Text strong>Expiry Date:</Text> {formData.expiryDate}
                    </div>
                    {referralType === ReferralType.INTERNAL ? (
                        <div>
                            <Text strong>Referred To:</Text> {selectedDoctor?.name || "No doctor selected"}
                        </div>
                    ) : (
                        <div>
                            <Text strong>External Doctor:</Text> {formData.externalDoctorName} -{" "}
                            {formData.externalDoctorSpeciality}
                        </div>
                    )}
                </div>
            </Card>

            {/* Clinical Information */}
            <Card title="Clinical Information" size="small">
                <div className="space-y-3">
                    <div>
                        <Text strong className="block">
                            Reason for Referral:
                        </Text>
                        <Paragraph>{formData.reasonForReferral}</Paragraph>
                    </div>
                    <Divider className="my-2" />
                    <div>
                        <Text strong className="block">
                            Clinical Summary:
                        </Text>
                        <Paragraph>{formData.clinicalSummary}</Paragraph>
                    </div>
                    {formData.investigationsDone && (
                        <>
                            <Divider className="my-2" />
                            <div>
                                <Text strong className="block">
                                    Investigations Done:
                                </Text>
                                <Paragraph>{formData.investigationsDone}</Paragraph>
                            </div>
                        </>
                    )}
                    {formData.currentMedications && (
                        <>
                            <Divider className="my-2" />
                            <div>
                                <Text strong className="block">
                                    Current Medications:
                                </Text>
                                <Paragraph>{formData.currentMedications}</Paragraph>
                            </div>
                        </>
                    )}
                    {formData.allergies && (
                        <>
                            <Divider className="my-2" />
                            <div>
                                <Text strong className="block">
                                    Allergies:
                                </Text>
                                <Paragraph>{formData.allergies}</Paragraph>
                            </div>
                        </>
                    )}
                    {formData.vitalSigns && (
                        <>
                            <Divider className="my-2" />
                            <div>
                                <Text strong className="block">
                                    Vital Signs:
                                </Text>
                                <Paragraph>{formData.vitalSigns}</Paragraph>
                            </div>
                        </>
                    )}
                    {formData.notes && (
                        <>
                            <Divider className="my-2" />
                            <div>
                                <Text strong className="block">
                                    Additional Notes:
                                </Text>
                                <Paragraph>{formData.notes}</Paragraph>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
                <Button onClick={handlePrevious} icon={<ArrowLeft className="w-4 h-4" />}>
                    Previous
                </Button>
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    size="large"
                    className="bg-green-700 hover:bg-green-800 border-green-700"
                >
                    Create Referral
                </Button>
            </div>
        </div>
    );
}
