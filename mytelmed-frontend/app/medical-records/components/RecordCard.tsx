'use client';

import { useState } from 'react';
import { Card, Typography, Button, Tag, Space, Tooltip, Popconfirm } from 'antd';
import {
  FilePdfOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  ShareAltOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { RecordCardProps } from '../props';
import EditRecordModal from './EditRecordModal';

const { Text, Title } = Typography;

const RecordCard: React.FC<RecordCardProps> = ({
  record,
  onDelete,
  onUpdate,
  onUpdatePermissions,
  onShare,
  editable
}) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const {
    id,
    name,
    type,
    category,
    uploadDate,
    fileSize,
    description,
    permissions,
    sharedWith
  } = record;

  // Format the uploadDate to a more readable format
  const formattedDate = new Date(uploadDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Functions to handle record updates
  const handleUpdatePermissions = () => {
    onUpdatePermissions(id);
  };

  const handleShare = () => {
    onShare(id);
  };

  const handleDelete = () => {
    onDelete(id);
  };

  const handleEdit = () => {
    setIsEditModalVisible(true);
  };

  const handleUpdateRecord = (recordId: string, updates: Partial<typeof record>) => {
    onUpdate(recordId, updates);
  };

  return (
    <>
      <Card
        className="w-full shadow-sm transition-all hover:shadow"
        data-testid={`record-card-${id}`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center gap-3 mb-2 md:mb-0 w-full md:w-auto">
            <div className="text-4xl text-blue-500">
              <FilePdfOutlined />
            </div>
            <div>
              <Title level={5} className="m-0 mb-3 text-base">
                {name}
              </Title>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <Text>{formattedDate}</Text>
                <span>•</span>
                <Text>{fileSize}</Text>
                <span>•</span>
                <Tag color={type === 'medical_report' ? 'blue' : 'green'}>
                  {type === 'medical_report' ? 'Medical Report' : 'Prescription'}
                </Tag>
                <Tag color={category === 'system' ? 'orange' : 'purple'}>
                  {category === 'system' ? 'System' : 'Self-Uploaded'}
                </Tag>
              </div>
              {description && (
                <Text className="block mt-2 text-sm text-gray-600">{description}</Text>
              )}
              {sharedWith.length > 0 && (
                <div className="mt-2">
                  <Text className="text-xs text-gray-500">
                    Shared with: {sharedWith.length} {sharedWith.length === 1 ? 'person' : 'people'}
                  </Text>
                </div>
              )}
            </div>
          </div>

          <Space className="mt-3 md:mt-0">
            <Tooltip title="Download">
              <Button
                icon={<DownloadOutlined />}
                size="small"
                disabled={!permissions.download}
              />
            </Tooltip>

            <Tooltip title="Manage Permissions">
              <Button
                icon={<SettingOutlined />}
                size="small"
                onClick={handleUpdatePermissions}
              />
            </Tooltip>

            <Tooltip title="Share">
              <Button
                icon={<ShareAltOutlined />}
                size="small"
                disabled={!permissions.share}
                onClick={handleShare}
              />
            </Tooltip>

            {editable && (
              <>
                <Tooltip title="Edit">
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    disabled={!permissions.edit}
                    onClick={handleEdit}
                  />
                </Tooltip>

                <Tooltip title="Delete">
                  <Popconfirm
                    title="Delete this record?"
                    description="This action cannot be undone."
                    onConfirm={handleDelete}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      icon={<DeleteOutlined />}
                      size="small"
                      danger
                    />
                  </Popconfirm>
                </Tooltip>
              </>
            )}
          </Space>
        </div>
      </Card>

      <EditRecordModal
        record={record}
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onUpdate={handleUpdateRecord}
      />
    </>
  );
};

export default RecordCard;
