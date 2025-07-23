"use client";

import { useState, useEffect } from "react";
import { Typography, Row, Col, Card, Button, List, Tag, Empty, Alert, Modal, message, Tabs, Badge } from "antd";
import { Users, UserPlus, Mail, Shield, Check, X } from "lucide-react";
import { FamilyMemberApi, FamilyMemberPermissionApi } from "@/app/api/family";
import { FamilyMember, CreateFamilyMemberRequest, UpdateFamilyPermissionsRequest } from "@/app/api/family/props";
import FamilyMemberForm from "./components/FamilyMemberForm";
import FamilyMemberCard from "./components/FamilyMemberCard";
import PermissionsModal from "./components/PermissionsModal";

const { Title, Text } = Typography;

interface FamilyData {
    familyMembers: FamilyMember[];
    pendingInvitations: FamilyMember[];
    accessiblePatients: FamilyMember[];
    stats: {
        totalMembers: number;
        pendingInvitations: number;
        accessiblePatients: number;
    };
}

const FamilyAccessPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [familyData, setFamilyData] = useState<FamilyData>({
        familyMembers: [],
        pendingInvitations: [],
        accessiblePatients: [],
        stats: {
            totalMembers: 0,
            pendingInvitations: 0,
            accessiblePatients: 0,
        },
    });

    // Modal states
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isPermissionsModalVisible, setIsPermissionsModalVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
    const [activeTab, setActiveTab] = useState("members");

    // Fetch all family-related data
    const fetchFamilyData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch family members
            const membersResponse = await FamilyMemberApi.getFamilyMembersByPatientAccount();
            const familyMembers = membersResponse.data.data || [];

            // Fetch pending invitations
            const invitationsResponse = await FamilyMemberApi.getPendingInvitations();
            const pendingInvitations = invitationsResponse.data.data || [];

            // Fetch accessible patients (where current user is a family member)
            const patientsResponse = await FamilyMemberApi.getPatientsByMemberAccount();
            const accessiblePatients = patientsResponse.data.data?.filter((fam: FamilyMember) => !fam.pending) || [];

            setFamilyData({
                familyMembers,
                pendingInvitations,
                accessiblePatients,
                stats: {
                    totalMembers: familyMembers.length,
                    pendingInvitations: pendingInvitations.length,
                    accessiblePatients: accessiblePatients.length,
                },
            });
        } catch (err: any) {
            console.error("Failed to fetch family data:", err);
            setError(err.response?.data?.message || "Failed to load family data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFamilyData();
    }, []);

    // Handle invite family member
    const handleInviteFamilyMember = async (request: CreateFamilyMemberRequest) => {
        try {
            const response = await FamilyMemberApi.inviteFamilyMember(request);
            const responseData = response.data;

            if (responseData.isSuccess) {
                message.success("Family member invited successfully");
                setIsAddModalVisible(false);
                fetchFamilyData();
            } else {
                message.error(responseData.message);
            }
        } catch (err: any) {
            message.error(err.response?.data?.message || "Failed to invite family member");
        }
    };

    // Handle delete family member
    const handleDeleteFamilyMember = async (memberId: string) => {
        try {
            const response = await FamilyMemberApi.deleteFamilyMember(memberId);
            const responseData = response.data;

            if (responseData.isSuccess) {
                message.success("Family member removed successfully");
                fetchFamilyData();
            } else {
                message.error(responseData.message);
            }
        } catch (err: any) {
            message.error(err.response?.data?.message || "Failed to remove family member");
        }
    };

    // Handle update permissions
    const handleUpdatePermissions = async (memberId: string, permissions: UpdateFamilyPermissionsRequest) => {
        try {
            const response = await FamilyMemberPermissionApi.updatePermissions(memberId, permissions);
            const responseData = response.data;

            if (responseData.isSuccess) {
                message.success("Permissions updated successfully");
                setIsPermissionsModalVisible(false);
                setSelectedMember(null);
                fetchFamilyData();
            } else {
                message.error(responseData.message);
            }
        } catch (err: any) {
            message.error(err.response?.data?.message || "Failed to update permissions");
        }
    };

    // Handle confirm invitation
    const handleConfirmInvitation = async (memberId: string) => {
        try {
            const response = await FamilyMemberApi.confirmFamilyMember(memberId);
            const responseData = response.data;

            if (responseData.isSuccess) {
                message.success("Invitation confirmed successfully");
                fetchFamilyData();
            } else {
                message.error(responseData.message);
            }
        } catch (err: any) {
            message.error(err.response?.data?.message || "Failed to confirm invitation");
        }
    };

    // Handle decline invitation
    const handleDeclineInvitation = async (memberId: string) => {
        try {
            const response = await FamilyMemberApi.declineFamilyMember(memberId);
            const responseData = response.data;

            if (responseData.isSuccess) {
                message.success("Invitation declined");
                fetchFamilyData();
            } else {
                message.error(responseData.message);
            }
        } catch (err: any) {
            message.error(err.response?.data?.message || "Failed to decline invitation");
        }
    };

    // Get permission summary
    const getPermissionSummary = (member: FamilyMember): string[] => {
        const permissions = [];
        if (member.canViewMedicalRecords) permissions.push("View Medical Records");
        if (member.canViewAppointments) permissions.push("View Appointments");
        if (member.canManageAppointments) permissions.push("Manage Appointments");
        if (member.canViewPrescriptions) permissions.push("View Prescriptions");
        if (member.canManagePrescriptions) permissions.push("Manage Prescriptions");
        if (member.canViewBilling) permissions.push("View Billing");
        if (member.canManageBilling) permissions.push("Manage Billing");
        return permissions;
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchFamilyData();
    };

    if (error) {
        return (
            <div className="container mx-auto px-4 py-6">
                <Alert
                    message="Error Loading Family Data"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" danger onClick={handleRefresh}>
                            Retry
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Title level={2} className="text-gray-800 mb-2 mt-0 text-xl md:text-3xl">
                    Family Access Management
                </Title>
                <Text className="text-gray-600 text-sm md:text-base">
                    Manage family members and their access to your health information
                </Text>
            </div>

            {/* Quick Stats */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={8}>
                    <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-blue-500 mr-4" />
                            <div>
                                <Text className="text-gray-500 text-sm">Total Family Members</Text>
                                <div className="text-2xl font-bold text-gray-800">{familyData.stats.totalMembers}</div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                        <div className="flex items-center">
                            <Mail className="w-8 h-8 text-orange-500 mr-4" />
                            <div>
                                <Text className="text-gray-500 text-sm">Pending Invitations</Text>
                                <div className="text-2xl font-bold text-gray-800">
                                    {familyData.stats.pendingInvitations}
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                        <div className="flex items-center">
                            <Shield className="w-8 h-8 text-green-500 mr-4" />
                            <div>
                                <Text className="text-gray-500 text-sm">Patient Access</Text>
                                <div className="text-2xl font-bold text-gray-800">
                                    {familyData.stats.accessiblePatients}
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Add Family Member Button */}
            <div className="mb-6 flex justify-center md:justify-end">
                <Button
                    type="primary"
                    icon={<UserPlus className="w-4 h-4" />}
                    onClick={() => setIsAddModalVisible(true)}
                    size="large"
                    className="shadow-lg w-full md:w-auto"
                >
                    Add Family Member
                </Button>
            </div>

            {/* Main Content */}
            <Card className="shadow-lg border-0 bg-white" loading={loading}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    size="large"
                    items={[
                        {
                            key: "members",
                            label: (
                                <span className="flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    Family Members
                                </span>
                            ),
                            children: (
                                <div>
                                    <div className="mb-4">
                                        <Text className="text-gray-600">
                                            Manage family members who can access your health information
                                        </Text>
                                    </div>

                                    {familyData.familyMembers.length > 0 ? (
                                        <Row gutter={[16, 16]}>
                                            {familyData.familyMembers.map((member) => (
                                                <Col xs={24} md={12} lg={8} key={member.id}>
                                                    <FamilyMemberCard
                                                        member={member}
                                                        onEdit={() => {
                                                            setSelectedMember(member);
                                                            setIsPermissionsModalVisible(true);
                                                        }}
                                                        onDelete={() => handleDeleteFamilyMember(member.id)}
                                                        getPermissionSummary={getPermissionSummary}
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    ) : (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="No family members added yet"
                                        />
                                    )}
                                </div>
                            ),
                        },
                        {
                            key: "invitations",
                            label: (
                                <span className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Pending Invitations
                                    {familyData.stats.pendingInvitations > 0 && (
                                        <Badge count={familyData.stats.pendingInvitations} className="ml-2" />
                                    )}
                                </span>
                            ),
                            children: (
                                <div>
                                    <div className="mb-4">
                                        <Text className="text-gray-600">
                                            Invitations to access other patients&apos; health information
                                        </Text>
                                    </div>

                                    {familyData.pendingInvitations.length > 0 ? (
                                        <div className="space-y-4">
                                            {familyData.pendingInvitations.map((invitation) => (
                                                <Card
                                                    key={invitation.id}
                                                    className="shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                                                <Text strong className="text-sm sm:text-base text-gray-800 truncate" title={invitation.patient?.name || "Unknown Patient"}>
                                                                    {invitation.patient?.name || "Unknown Patient"}
                                                                </Text>
                                                                <Tag color="orange" className="text-xs self-start sm:self-center">
                                                                    Pending
                                                                </Tag>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Text className="text-gray-600 text-xs sm:text-sm block">
                                                                    Invited as: {invitation.relationship}
                                                                </Text>
                                                                <Text className="text-gray-500 text-xs block truncate" title={invitation.patient?.email}>
                                                                    {invitation.patient?.email}
                                                                </Text>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row sm:flex-col lg:flex-row gap-2">
                                                            <Button
                                                                type="primary"
                                                                icon={<Check className="w-3 h-3 sm:w-4 sm:h-4" />}
                                                                onClick={() => handleConfirmInvitation(invitation.id)}
                                                                className="flex-1 sm:flex-none text-sm"
                                                                size="middle"
                                                            >
                                                                Accept
                                                            </Button>
                                                            <Button
                                                                danger
                                                                icon={<X className="w-3 h-3 sm:w-4 sm:h-4" />}
                                                                onClick={() => handleDeclineInvitation(invitation.id)}
                                                                className="flex-1 sm:flex-none text-sm"
                                                                size="middle"
                                                            >
                                                                Decline
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="No pending invitations"
                                        />
                                    )}
                                </div>
                            ),
                        },
                        {
                            key: "access",
                            label: (
                                <span className="flex items-center">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Patient Access
                                </span>
                            ),
                            children: (
                                <div>
                                    <div className="mb-4">
                                        <Text className="text-gray-600">
                                            Patients whose health information you can access
                                        </Text>
                                    </div>

                                    {familyData.accessiblePatients.length > 0 ? (
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={familyData.accessiblePatients}
                                            renderItem={(patient) => (
                                                <List.Item
                                                    className="border-b border-gray-100 last:border-b-0"
                                                >
                                                    <List.Item.Meta
                                                        title={
                                                            <div className="flex items-center">
                                                                <Text strong className="text-gray-800">
                                                                    {patient.patient?.name || "Unknown Patient"}
                                                                </Text>
                                                                <Tag color="green" className="ml-2">
                                                                    {patient.relationship}
                                                                </Tag>
                                                            </div>
                                                        }
                                                        description={
                                                            <div>
                                                                <Text className="text-gray-600">
                                                                    Permissions:{" "}
                                                                    {getPermissionSummary(patient).join(", ") || "None"}
                                                                </Text>
                                                                <br />
                                                                <Text className="text-gray-500 text-sm">
                                                                    {patient.patient?.email}
                                                                </Text>
                                                            </div>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    ) : (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="No patient access granted"
                                        />
                                    )}
                                </div>
                            ),
                        },
                    ]}
                />
            </Card>

            {/* Add Family Member Modal */}
            <Modal
                title="Add Family Member"
                open={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
                footer={null}
                width={600}
                destroyOnHidden={true}
                centered
            >
                <FamilyMemberForm onSubmit={handleInviteFamilyMember} onCancel={() => setIsAddModalVisible(false)} />
            </Modal>

            {/* Permissions Modal */}
            <Modal
                title="Manage Permissions"
                open={isPermissionsModalVisible}
                onCancel={() => {
                    setIsPermissionsModalVisible(false);
                    setSelectedMember(null);
                }}
                footer={null}
                width={600}
                destroyOnHidden={true}
                centered
            >
                {selectedMember && (
                    <PermissionsModal
                        member={selectedMember}
                        onSubmit={(permissions) => handleUpdatePermissions(selectedMember.id, permissions)}
                        onCancel={() => {
                            setIsPermissionsModalVisible(false);
                            setSelectedMember(null);
                        }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default FamilyAccessPage;
