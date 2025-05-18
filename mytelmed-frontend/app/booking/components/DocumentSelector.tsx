'use client';

import { useState } from 'react';
import { Checkbox, Upload, Button, Empty, Typography, Space, Tag, List, Tooltip, Modal } from 'antd';
import { UploadOutlined, FileOutlined, FilePdfOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { DocumentSelectorProps } from '../props';

const { Text, Title } = Typography;
const { Dragger } = Upload;

const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  medicalRecords,
  selectedRecords,
  onSelectRecord,
  onAddNewDocument,
  newDocuments,
  onRemoveNewDocument
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleRecordChange = (recordId: string, checked: boolean) => {
    onSelectRecord(recordId, checked);
  };

  const handlePreview = (file: File) => {
    // Create a URL for previewing the file
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    setPreviewTitle(file.name);
    setPreviewVisible(true);
  };

  const handleUpload = (file: File) => {
    onAddNewDocument(file);
    return false;
  };

  const handleRemove = (index: number) => {
    onRemoveNewDocument(index);
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType === 'pdf') {
      return <FilePdfOutlined className="text-red-500 text-lg" />;
    }
    return <FileOutlined className="text-blue-500 text-lg" />;
  };

  return (
    <div className="space-y-6">
      {/* Existing Medical Records Section */}
      <div>
        <Title level={5} className="mb-2">Your Medical Records</Title>
        {medicalRecords.length > 0 ? (
          <List
            dataSource={medicalRecords}
            renderItem={(record) => (
              <List.Item className="py-2 px-3 hover:bg-gray-50 rounded border mb-2">
                <div className="flex items-center w-full">
                  <Checkbox
                    checked={selectedRecords.includes(record.id)}
                    onChange={(e) => handleRecordChange(record.id, e.target.checked)}
                  />
                  <div className="ml-3 flex-grow">
                    <div className="flex items-center">
                      {getFileIcon(record.fileType)}
                      <Text className="ml-2 font-medium">{record.name}</Text>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span>{record.uploadDate}</span>
                      <span className="mx-1">•</span>
                      <span>{record.fileSize}</span>
                      <span className="mx-1">•</span>
                      <Tag color={record.type === 'medical_report' ? 'blue' : 'green'}>
                        {record.type === 'medical_report' ? 'Medical Report' : 'Prescription'}
                      </Tag>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No medical records found" />
        )}
      </div>

      {/* Upload New Documents Section */}
      <div>
        <Title level={5} className="mb-2">Upload New Documents</Title>
        <Dragger
          name="files"
          beforeUpload={handleUpload}
          multiple={true}
          showUploadList={false}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined className="text-blue-500" />
          </p>
          <p className="ant-upload-text">Click or drag files to upload</p>
          <p className="ant-upload-hint">
            Support for PDF, images, and document files
          </p>
        </Dragger>

        {/* New Documents List */}
        {newDocuments.length > 0 && (
          <div className="mt-4">
            <Text strong>New Documents:</Text>
            <List
              dataSource={newDocuments}
              renderItem={(file, index) => (
                <List.Item
                  className="py-2 px-3 hover:bg-gray-50 rounded border mb-2"
                  actions={[
                    <Tooltip title="Preview" key="preview">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(file)}
                      />
                    </Tooltip>,
                    <Tooltip title="Remove" key="remove">
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemove(index)}
                      />
                    </Tooltip>
                  ]}
                >
                  <div className="flex items-center">
                    <FileOutlined className="text-blue-500 text-lg" />
                    <Space direction="vertical" size={0} className="ml-2">
                      <Text className="font-medium">{file.name}</Text>
                      <Text type="secondary" className="text-xs">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </Text>
                    </Space>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <div className="flex justify-center">
          {previewUrl && (
            <iframe
              src={previewUrl}
              style={{ width: '100%', height: '70vh' }}
              frameBorder="0"
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DocumentSelector; 