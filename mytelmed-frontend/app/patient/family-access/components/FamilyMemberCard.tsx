'use client';

import { Card, Avatar, Button, Tag, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { FamilyMemberCardProps } from '../props';

const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({ member, onEdit, onDelete }) => {
  const { name, email, phone, relationship, profileImage, dateAdded, permissions } = member;

  const getPermissionTag = (name: string, enabled: boolean) => {
    return (
      <Tooltip title={`${enabled ? 'Can' : 'Cannot'} ${name.toLowerCase()}`}>
        <Tag
          color={enabled ? 'success' : 'default'}
          icon={enabled ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {name}
        </Tag>
      </Tooltip>
    );
  };

  return (
    <Card
      className="w-full shadow-sm hover:shadow-md transition-shadow border border-gray-200"
      actions={[
        <Tooltip key="edit" title="Edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(member)}
            aria-label="Edit family member"
          />
        </Tooltip>,
        <Tooltip key="delete" title="Remove access">
          <Popconfirm
            title="Remove family member access"
            description="Are you sure you want to remove this person's access to your account?"
            okText="Yes, remove"
            cancelText="Cancel"
            onConfirm={() => onDelete(member.id)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label="Remove family member access"
            />
          </Popconfirm>
        </Tooltip>
      ]}
    >
      <div className="flex items-start gap-4">
        <Avatar
          size={64}
          src={profileImage}
          className="flex-shrink-0"
        >
          {!profileImage && name.charAt(0).toUpperCase()}
        </Avatar>
        <div className="flex-grow">
          <h3 className="text-lg font-bold mb-1 uppercase tracking-wide">{name}</h3>
          <p className="text-gray-500 text-sm mb-1 mt-1">{relationship.charAt(0).toUpperCase() + relationship.slice(1)}</p>
          <p className="text-gray-600 text-sm mb-1 mt-1">{email}</p>
          {phone && <p className="text-gray-600 text-sm mb-1 mt-1">{phone}</p>}
          <p className="text-gray-400 text-xs mb-3 mt-1">Added on {new Date(dateAdded).toLocaleDateString()}</p>
          <div className="flex flex-wrap gap-2">
            {getPermissionTag('Book Appointments', permissions.appointmentBooking)}
            {getPermissionTag('Manage Appointments', permissions.appointmentManagement)}
            {getPermissionTag('View Records', permissions.viewMedicalRecords)}
            {getPermissionTag('Manage Prescriptions', permissions.managePrescriptions)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FamilyMemberCard;
