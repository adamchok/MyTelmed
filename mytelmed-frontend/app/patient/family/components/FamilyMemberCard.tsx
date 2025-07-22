"use client";

import { Card, Button, Tag, Tooltip, Popconfirm, Avatar, Typography } from "antd";
import { Edit, Trash2, User, Shield } from "lucide-react";
import { FamilyMember } from "@/app/api/family/props";

const { Title } = Typography;

interface FamilyMemberCardProps {
    member: FamilyMember;
    onEdit: (member: FamilyMember) => void;
    onDelete: (memberId: string) => void;
    getPermissionSummary: (member: FamilyMember) => string[];
}

const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({ member, onEdit, onDelete, getPermissionSummary }) => {
    const { name, email, relationship, pending } = member;
    const permissions = getPermissionSummary(member);

    return (
        <Card
            className="shadow-lg hover:shadow-xl transition-shadow border-0 bg-white"
            actions={[
                <Tooltip key="edit" title="Edit Permissions">
                    <Button
                        type="text"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => onEdit(member)}
                        className="text-blue-500 hover:text-blue-700"
                    />
                </Tooltip>,
                <Tooltip key="delete" title="Remove Access">
                    <Popconfirm
                        title="Remove Family Member"
                        description="Are you sure you want to remove this family member's access?"
                        onConfirm={() => onDelete(member.id)}
                        okText="Yes, Remove"
                        cancelText="Cancel"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<Trash2 className="w-4 h-4" />}
                            className="text-red-500 hover:text-red-700"
                        />
                    </Popconfirm>
                </Tooltip>,
            ]}
        >
            <div className="w-full">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-3">
                    <Avatar icon={<User className="w-6 h-6" />} size={48} className="bg-blue-500" />
                    <div className="flex items-center gap-2">
                        <Title level={4} className="text-lg font-semibold text-gray-800 truncate my-0">{name}</Title>
                        {pending && (
                            <Tag color="orange">
                                Pending
                            </Tag>
                        )}
                    </div>
                </div>
                <div className="space-y-1 mb-3">
                    <p className="text-gray-600 text-sm capitalize">{relationship}</p>
                    <p className="text-gray-500 text-sm truncate">{email}</p>
                </div>

                {/* Permissions */}
                <div className="space-y-2">
                    <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Permissions:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {permissions.length > 0 ? (
                            permissions.map((permission, index) => (
                                <Tag key={permission + "-" + index} color="blue" className="text-xs p-1">
                                    {permission}
                                </Tag>
                            ))
                        ) : (
                            <Tag color="default" className="text-xs">
                                No permissions
                            </Tag>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default FamilyMemberCard;
