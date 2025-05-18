'use client';

import { useState, useEffect } from 'react';
import { Modal, Typography, Checkbox, List, Button, Empty, Avatar, Divider, Tooltip, Tag } from 'antd';
import { ShareAltOutlined, UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ShareRecordModalProps } from '../props';
import { FamilyMember } from '@/app/props';

const { Title, Text } = Typography;

const ShareRecordModal: React.FC<ShareRecordModalProps> = ({
  record,
  familyMembers,
  isVisible,
  onClose,
  onShare
}) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([...record.sharedWith]);

  // Update selected members when record changes
  useEffect(() => {
    setSelectedMembers([...record.sharedWith]);
  }, [record]);

  const handleMemberToggle = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, memberId]);
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    }
  };

  const handleSave = () => {
    onShare(record.id, selectedMembers);
  };

  // Check if a family member has the required permissions to view medical records
  const canViewMedicalRecords = (member: FamilyMember) => {
    return member.permissions.viewMedicalRecords;
  };

  return (
    <Modal
      title={<Title level={4} className="my-0">Share Medical Record</Title>}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSave}
          icon={<ShareAltOutlined />}
        >
          Share
        </Button>
      ]}
      width={600}
      centered
    >
      <div className="mb-4">
        <Text>Select family members to share &quot;{record.name}&quot; with. They will be able to view this document based on the permissions you&apos;ve set.</Text>
      </div>

      <Divider />

      {familyMembers.length === 0 ? (
        <Empty
          description="No family members available to share with. Add family members from the Family Access page."
          className="my-8"
        />
      ) : (
        <List
          dataSource={familyMembers}
          renderItem={(member: FamilyMember) => {
            const hasPermission = canViewMedicalRecords(member);

            return (
              <List.Item>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Avatar
                      src={member.profileImage}
                      icon={!member.profileImage && <UserOutlined />}
                      className="mr-3"
                    />
                    <div>
                      <Text strong>{member.name}</Text>
                      <div className="text-xs text-gray-500">{member.relationship}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!hasPermission && (
                      <Tooltip title="This person doesn&apos;t have permission to view medical records. You can update this in Family Access.">
                        <Tag color="warning" icon={<InfoCircleOutlined />}>No Access</Tag>
                      </Tooltip>
                    )}
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onChange={(e) => handleMemberToggle(member.id, e.target.checked)}
                      disabled={!hasPermission}
                    />
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      )}

      <Divider />

      <div className="text-sm text-gray-500">
        <p>Note: Family members need to have &quot;View Medical Records&quot; permission in Family Access to be able to view records you share with them.</p>
      </div>
    </Modal>
  );
};

export default ShareRecordModal; 