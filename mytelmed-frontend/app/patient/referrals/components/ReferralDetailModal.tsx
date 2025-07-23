"use client";

import { Modal, Typography, Descriptions, Tag, Button, Divider, Avatar, Badge, Alert } from "antd";
import {
    Calendar,
    Clock,
    User,
    Building2,
    FileText,
    AlertCircle,
    CheckCircle,
    XCircle,
    Star,
    ExternalLink,
    ArrowRight,
    Phone,
    Mail,
    MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ReferralDetailModalProps } from "../props";
import { ReferralStatus, ReferralPriority, ReferralType } from "@/app/api/referral/props";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const ReferralDetailModal: React.FC<ReferralDetailModalProps> = ({ referral, isVisible, onClose }) => {
    const router = useRouter();

    if (!referral) return null;

    const getStatusColor = (status: ReferralStatus) => {
        switch (status) {
            case ReferralStatus.ACCEPTED:
                return "green";
            case ReferralStatus.PENDING:
                return "orange";
            case ReferralStatus.REJECTED:
                return "red";
            case ReferralStatus.SCHEDULED:
                return "blue";
            case ReferralStatus.COMPLETED:
                return "purple";
            case ReferralStatus.EXPIRED:
                return "default";
            case ReferralStatus.CANCELLED:
                return "default";
            default:
                return "blue";
        }
    };

    const getStatusIcon = (status: ReferralStatus) => {
        switch (status) {
            case ReferralStatus.ACCEPTED:
                return <CheckCircle className="w-3 h-3" />;
            case ReferralStatus.PENDING:
                return <Clock className="w-3 h-3" />;
            case ReferralStatus.REJECTED:
                return <XCircle className="w-3 h-3" />;
            case ReferralStatus.SCHEDULED:
                return <Calendar className="w-3 h-3" />;
            case ReferralStatus.COMPLETED:
                return <CheckCircle className="w-3 h-3" />;
            case ReferralStatus.EXPIRED:
                return <AlertCircle className="w-3 h-3" />;
            case ReferralStatus.CANCELLED:
                return <XCircle className="w-3 h-3" />;
            default:
                return <FileText className="w-3 h-3" />;
        }
    };

    const getPriorityColor = (priority: ReferralPriority) => {
        switch (priority) {
            case ReferralPriority.EMERGENCY:
                return "red";
            case ReferralPriority.URGENT:
                return "orange";
            case ReferralPriority.ROUTINE:
                return "blue";
            default:
                return "default";
        }
    };

    const getPriorityIcon = (priority: ReferralPriority) => {
        switch (priority) {
            case ReferralPriority.EMERGENCY:
                return <AlertCircle className="w-3 h-3" />;
            case ReferralPriority.URGENT:
                return <Clock className="w-3 h-3" />;
            case ReferralPriority.ROUTINE:
                return <Star className="w-3 h-3" />;
            default:
                return <Star className="w-3 h-3" />;
        }
    };

    // Format dates for better display
    const formatDate = (dateString: string) => {
        return dayjs(dateString).format("MMMM DD, YYYY");
    };

    // Calculate days remaining for active referrals
    const calculateDaysRemaining = () => {
        if (
            referral.status === ReferralStatus.EXPIRED ||
            referral.status === ReferralStatus.CANCELLED ||
            referral.status === ReferralStatus.COMPLETED ||
            referral.status === ReferralStatus.REJECTED
        ) {
            return null;
        }

        const today = dayjs();
        const expiry = dayjs(referral.expiryDate);
        const diffDays = expiry.diff(today, "day");

        return diffDays > 0 ? diffDays : 0;
    };

    const daysRemaining = calculateDaysRemaining();

    // Get referring doctor info
    const getReferringDoctorInfo = () => {
        return {
            name: referral.referringDoctor.name,
            facility: referral.referringDoctor.facility?.name || "Medical Center",
            specialty: referral.referringDoctor.specialityList?.join(", ") || "General Practice",
            contact: referral.referringDoctor.phone,
            email: referral.referringDoctor.email,
            address: referral.referringDoctor.facility?.address,
            profileImageUrl: referral.referringDoctor.profileImageUrl,
        };
    };

    // Get referred doctor info
    const getReferredDoctorInfo = () => {
        if (!referral.referredDoctor) return null;

        return {
            name: referral.referredDoctor.name,
            facility: referral.referredDoctor.facility?.name || "Medical Center",
            specialty: referral.referredDoctor.specialityList?.join(", ") || "General Practice",
            contact: referral.referredDoctor.phone,
            email: referral.referredDoctor.email,
            address: referral.referredDoctor.facility?.address,
            profileImageUrl: referral.referredDoctor.profileImageUrl,
        };
    };

    // Get external doctor info
    const getExternalDoctorInfo = () => {
        if (referral.referralType !== ReferralType.EXTERNAL) return null;

        return {
            name: referral.externalDoctorName || "External Doctor",
            facility: referral.externalFacilityName || "External Facility",
            specialty: referral.externalDoctorSpeciality || "Specialty",
            contact: referral.externalContactNumber,
            email: referral.externalEmail,
            address: referral.externalFacilityAddress,
        };
    };

    const referringDoctorInfo = getReferringDoctorInfo();
    const referredDoctorInfo = getReferredDoctorInfo();
    const externalDoctorInfo = getExternalDoctorInfo();

    // Handle navigation
    const handleViewAppointment = () => {
        if (referral.scheduledAppointment) {
            router.push(`/patient/appointments/${referral.scheduledAppointment.id}`);
        }
    };

    return (
        <Modal
            open={isVisible}
            title={
                <div className="flex items-center gap-3">
                    <FileText className="text-blue-500 text-xl" />
                    <Title level={4} className="m-0">
                        Referral Details
                    </Title>
                </div>
            }
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="close" onClick={onClose}>
                    Close
                </Button>,
                referral.status === ReferralStatus.SCHEDULED && referral.scheduledAppointment && (
                    <Button
                        key="appointment"
                        type="primary"
                        icon={<ExternalLink className="w-3 h-3" />}
                        onClick={handleViewAppointment}
                    >
                        View Appointment
                    </Button>
                ),
            ]}
            centered
        >
            <div className="py-2">
                {/* Header with Status and Priority */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-3">
                    <div className="flex items-center gap-2">
                        <Title level={5} className="m-0 text-blue-800">
                            {referral.reasonForReferral}
                        </Title>
                        <Badge
                            count={referral.referralType === ReferralType.EXTERNAL ? "EXT" : "INT"}
                            style={{
                                backgroundColor:
                                    referral.referralType === ReferralType.EXTERNAL ? "#722ed1" : "#1890ff",
                                fontSize: "12px",
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Tag
                            color={getStatusColor(referral.status)}
                            icon={getStatusIcon(referral.status)}
                            className="text-sm font-medium px-3 py-1"
                        >
                            {referral.status.charAt(0).toUpperCase() + referral.status.slice(1).toLowerCase()}
                        </Tag>
                        <Tag
                            color={getPriorityColor(referral.priority)}
                            icon={getPriorityIcon(referral.priority)}
                            className="text-sm font-medium px-3 py-1"
                        >
                            {referral.priority.charAt(0).toUpperCase() + referral.priority.slice(1).toLowerCase()}
                        </Tag>
                    </div>
                </div>

                {/* Days Remaining Alert */}
                {daysRemaining !== null && (
                    <Alert
                        message={`${daysRemaining} days remaining until expiry`}
                        type={daysRemaining < 7 ? "warning" : "info"}
                        showIcon
                        className="mb-4"
                    />
                )}

                <Divider className="my-4" />

                {/* Basic Information */}
                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small">
                    <Descriptions.Item label="Referral Number" span={2}>
                        <Text strong className="text-blue-600">
                            {referral.referralNumber}
                        </Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Referring Doctor" span={2}>
                        <div className="flex items-center gap-2">
                            <Avatar
                                src={referral.referringDoctor.profileImageUrl}
                                size={48}
                                icon={<User className="w-5 h-5" />}
                                className="bg-blue-100 text-blue-600"
                            />
                            <div>
                                <Text strong>Dr. {referringDoctorInfo.name}</Text>
                                <br />
                                <Text type="secondary" className="text-sm">
                                    {referringDoctorInfo.specialty}
                                </Text>
                            </div>
                        </div>
                    </Descriptions.Item>

                    <Descriptions.Item label="Facility" span={2}>
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <Text>{referringDoctorInfo.facility}</Text>
                        </div>
                    </Descriptions.Item>

                    {referringDoctorInfo.contact && (
                        <Descriptions.Item label="Contact">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <Text>{referringDoctorInfo.contact}</Text>
                            </div>
                        </Descriptions.Item>
                    )}

                    {referringDoctorInfo.email && (
                        <Descriptions.Item label="Email">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <Text>{referringDoctorInfo.email}</Text>
                            </div>
                        </Descriptions.Item>
                    )}

                    {referringDoctorInfo.address && (
                        <Descriptions.Item label="Address" span={2}>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <Text>{referringDoctorInfo.address}</Text>
                            </div>
                        </Descriptions.Item>
                    )}

                    <Descriptions.Item label="Issued Date">{formatDate(referral.createdAt)}</Descriptions.Item>

                    <Descriptions.Item label="Expiry Date">{formatDate(referral.expiryDate)}</Descriptions.Item>
                </Descriptions>

                {/* Referred Doctor Information (if available) */}
                {referredDoctorInfo && (
                    <>
                        <Divider className="my-4" />
                        <Title level={5} className="mb-3 flex items-center gap-2">
                            <ArrowRight className="w-5 h-5 text-green-500" />
                            Referred To Doctor
                        </Title>
                        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small">
                            <Descriptions.Item label="Doctor" span={2}>
                                <div className="flex items-center gap-2">
                                    <Avatar
                                        size={48}
                                        src={referredDoctorInfo?.profileImageUrl}
                                        icon={<User className="w-5 h-5" />}
                                        className="bg-green-100 text-green-600"
                                    />
                                    <div>
                                        <Text strong>Dr. {referredDoctorInfo.name}</Text>
                                        <br />
                                        <Text type="secondary" className="text-sm">
                                            {referredDoctorInfo.specialty}
                                        </Text>
                                    </div>
                                </div>
                            </Descriptions.Item>

                            <Descriptions.Item label="Facility" span={2}>
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-gray-500" />
                                    <Text>{referredDoctorInfo.facility}</Text>
                                </div>
                            </Descriptions.Item>

                            {referredDoctorInfo.contact && (
                                <Descriptions.Item label="Contact">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <Text>{referredDoctorInfo.contact}</Text>
                                    </div>
                                </Descriptions.Item>
                            )}

                            {referredDoctorInfo.email && (
                                <Descriptions.Item label="Email">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <Text>{referredDoctorInfo.email}</Text>
                                    </div>
                                </Descriptions.Item>
                            )}

                            {referredDoctorInfo.address && (
                                <Descriptions.Item label="Address" span={2}>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <Text>{referredDoctorInfo.address}</Text>
                                    </div>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </>
                )}

                {/* External Doctor Information (if external referral) */}
                {externalDoctorInfo && (
                    <>
                        <Divider className="my-4" />
                        <Title level={5} className="mb-3 flex items-center gap-2">
                            <ExternalLink className="w-5 h-5 text-purple-500" />
                            External Doctor
                        </Title>
                        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small">
                            <Descriptions.Item label="Doctor" span={2}>
                                <div className="flex items-center gap-2">
                                    <Avatar
                                        size={48}
                                        icon={<User className="w-5 h-5" />}
                                        className="bg-purple-100 text-purple-600"
                                    />
                                    <div>
                                        <Text strong>Dr. {externalDoctorInfo.name}</Text>
                                        <br />
                                        <Text type="secondary" className="text-sm">
                                            {externalDoctorInfo.specialty}
                                        </Text>
                                    </div>
                                </div>
                            </Descriptions.Item>

                            <Descriptions.Item label="Facility" span={2}>
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-gray-500" />
                                    <Text>{externalDoctorInfo.facility}</Text>
                                </div>
                            </Descriptions.Item>

                            {externalDoctorInfo.contact && (
                                <Descriptions.Item label="Contact">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <Text>{externalDoctorInfo.contact}</Text>
                                    </div>
                                </Descriptions.Item>
                            )}

                            {externalDoctorInfo.email && (
                                <Descriptions.Item label="Email">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <Text>{externalDoctorInfo.email}</Text>
                                    </div>
                                </Descriptions.Item>
                            )}

                            {externalDoctorInfo.address && (
                                <Descriptions.Item label="Address" span={2}>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <Text>{externalDoctorInfo.address}</Text>
                                    </div>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </>
                )}

                {/* Clinical Information */}
                <Divider className="my-4" />
                <Title level={5} className="mb-3">
                    Clinical Information
                </Title>

                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Reason for Referral">
                        <Paragraph className="mb-0">{referral.reasonForReferral}</Paragraph>
                    </Descriptions.Item>

                    {referral.clinicalSummary && (
                        <Descriptions.Item label="Clinical Summary">
                            <Paragraph className="mb-0">{referral.clinicalSummary}</Paragraph>
                        </Descriptions.Item>
                    )}

                    {referral.investigationsDone && (
                        <Descriptions.Item label="Investigations Done">
                            <Paragraph className="mb-0">{referral.investigationsDone}</Paragraph>
                        </Descriptions.Item>
                    )}

                    {referral.currentMedications && (
                        <Descriptions.Item label="Current Medications">
                            <Paragraph className="mb-0">{referral.currentMedications}</Paragraph>
                        </Descriptions.Item>
                    )}

                    {referral.allergies && (
                        <Descriptions.Item label="Allergies">
                            <Paragraph className="mb-0">{referral.allergies}</Paragraph>
                        </Descriptions.Item>
                    )}

                    {referral.vitalSigns && (
                        <Descriptions.Item label="Vital Signs">
                            <Paragraph className="mb-0">{referral.vitalSigns}</Paragraph>
                        </Descriptions.Item>
                    )}
                </Descriptions>

                {/* Status Information */}
                {referral.status === ReferralStatus.REJECTED && referral.rejectionReason && (
                    <>
                        <Divider className="my-4" />
                        <Alert
                            message="Rejection Information"
                            description={referral.rejectionReason}
                            type="error"
                            showIcon
                        />
                    </>
                )}

                {referral.status === ReferralStatus.COMPLETED && (
                    <>
                        <Divider className="my-4" />
                        <Alert
                            message="Referral Completed"
                            description="This referral has been completed and can no longer be used."
                            type="success"
                            showIcon
                        />
                    </>
                )}

                {referral.status === ReferralStatus.EXPIRED && (
                    <>
                        <Divider className="my-4" />
                        <Alert
                            message="Referral Expired"
                            description="This referral has expired and can no longer be used. Please contact your doctor for a new referral if needed."
                            type="warning"
                            showIcon
                        />
                    </>
                )}

                {referral.status === ReferralStatus.CANCELLED && (
                    <>
                        <Divider className="my-4" />
                        <Alert
                            message="Referral Cancelled"
                            description="This referral has been cancelled and can no longer be used."
                            type="info"
                            showIcon
                        />
                    </>
                )}

                {/* Notes */}
                {referral.notes && (
                    <>
                        <Divider className="my-4" />
                        <div>
                            <Text strong>Additional Notes:</Text>
                            <div className="bg-gray-50 p-3 rounded mt-2">
                                <Text>{referral.notes}</Text>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default ReferralDetailModal;
