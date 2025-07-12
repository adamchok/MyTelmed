"use client";

import { Card, Button, Tag, Tooltip, Popconfirm, Avatar } from "antd";
import { Edit, Trash2, User, Shield, AlertCircle } from "lucide-react";
import { FamilyMember } from "@/app/api/family/props";

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
            <div className="flex items-start space-x-4">
                <Avatar size={48} className="bg-blue-500 flex-shrink-0">
                    <User className="w-6 h-6" />
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">{name}</h3>
                        {pending && (
                            <Tag color="orange" icon={<AlertCircle className="w-3 h-3" />}>
                                Pending
                            </Tag>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm mb-1 capitalize">{relationship}</p>
                    <p className="text-gray-500 text-sm mb-3 truncate">{email}</p>

                    {/* Permissions */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-1">
                            <Shield className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-500">Permissions:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {permissions.length > 0 ? (
                                permissions.map((permission, index) => (
                                    <Tag key={index} color="blue" className="text-xs">
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
            </div>
        </Card>
    );
};

export default FamilyMemberCard;
