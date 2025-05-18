'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Typography, Button, Select, Upload, message } from 'antd';
import { MedicalRecord } from '../props';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

interface EditRecordModalProps {
  record: MedicalRecord;
  isVisible: boolean;
  onClose: () => void;
  onUpdate: (recordId: string, updates: Partial<MedicalRecord>) => void;
}

const EditRecordModal: React.FC<EditRecordModalProps> = ({
  record,
  isVisible,
  onClose,
  onUpdate
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [additionalFiles, setAdditionalFiles] = useState<UploadFile[]>([]);

  // Reset form when record changes or modal opens
  useEffect(() => {
    if (isVisible) {
      form.setFieldsValue({
        name: record.name,
        description: record.description || '',
        type: record.type
      });

      // Create a mock upload file entry for the existing file
      setFileList([
        {
          uid: '-1',
          name: record.name,
          status: 'done',
          url: record.fileUrl,
          size: parseInt(record.fileSize.replace(' MB', '')) * 1024 * 1024,
          type: `application/${record.fileType}`
        }
      ]);

      // Reset additional files
      setAdditionalFiles([]);
    }
  }, [form, record, isVisible]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      setIsLoading(true);

      // Create updates object with form values
      const updates: Partial<MedicalRecord> = {
        name: values.name,
        description: values.description,
        type: values.type
      };

      // Handle file replacement if a new main file was uploaded
      if (fileList.length > 0 && fileList[0].uid !== '-1') {
        const mainFile = fileList[0];
        updates.name = mainFile.name;
        updates.fileSize = `${(mainFile.size! / (1024 * 1024)).toFixed(2)} MB`;
        updates.fileType = mainFile.name.split('.').pop() || 'pdf';
        // In a real app, you'd upload the file and get a URL back
        updates.fileUrl = URL.createObjectURL(mainFile.originFileObj as Blob);
      }

      // In a real app, you would handle additional files here
      // This is just simulation logic
      if (additionalFiles.length > 0) {
        message.success(`${additionalFiles.length} additional files would be uploaded with this record`);
      }

      onUpdate(record.id, updates);
      setIsLoading(false);
      onClose();
    });
  };

  // Props for the main file uploader (replacing the existing file)
  const mainFileProps: UploadProps = {
    onRemove: () => {
      // Restore original file when user removes the new file
      setFileList([
        {
          uid: '-1',
          name: record.name,
          status: 'done',
          url: record.fileUrl,
          size: parseInt(record.fileSize.replace(' MB', '')) * 1024 * 1024,
          type: `application/${record.fileType}`
        }
      ]);
    },
    beforeUpload: (file) => {
      // Replace current file with new one
      setFileList([
        {
          uid: file.uid,
          name: file.name,
          status: 'done',
          size: file.size,
          type: file.type,
          originFileObj: file
        }
      ]);
      return false;
    },
    fileList: fileList,
    maxCount: 1
  };

  // Props for additional files uploader
  const additionalFilesProps: UploadProps = {
    onRemove: (file) => {
      setAdditionalFiles(additionalFiles.filter(item => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      setAdditionalFiles([...additionalFiles, file as UploadFile]);
      return false;
    },
    fileList: additionalFiles,
    multiple: true
  };

  return (
    <Modal
      title={<Title level={4} className="my-0">Edit Record</Title>}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={isLoading}
        >
          Save Changes
        </Button>
      ]}
      centered
      width={600}
    >
      <div className="mt-4">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: record.name,
            description: record.description || '',
            type: record.type
          }}
        >
          <Form.Item
            name="name"
            label="Record Name"
            rules={[{ required: true, message: 'Please enter a name for this record' }]}
          >
            <Input placeholder="Enter record name" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Record Type"
            rules={[{ required: true, message: 'Please select a record type' }]}
          >
            <Select>
              <Option value="medical_report">Medical Report</Option>
              <Option value="prescription">Prescription</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={3}
              placeholder="Enter a description for this document (optional)"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Replace Main File"
            className="mb-4"
          >
            <Upload {...mainFileProps} listType="text">
              <Button icon={<UploadOutlined />}>Replace File</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Add Additional Files"
          >
            <Dragger {...additionalFilesProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag files to add to this record</p>
              <p className="ant-upload-hint">
                Support for multiple file uploads
              </p>
            </Dragger>
          </Form.Item>

          <div className="mt-2 text-sm text-gray-500">
            <Text type="secondary">
              Note: Upload date will be updated automatically when you replace the file.
            </Text>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default EditRecordModal; 