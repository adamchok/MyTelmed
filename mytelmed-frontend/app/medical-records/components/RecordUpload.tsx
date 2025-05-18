'use client';

import { useState, useEffect } from 'react';
import { Upload, message, Input, Modal, Form, Radio } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { RecordUploadProps, MedicalRecordType } from '../props';

const { TextArea } = Input;
const { Dragger } = Upload;

const RecordUpload: React.FC<RecordUploadProps> = ({ onUpload, recordType: initialRecordType, isVisible, onVisibleChange }) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [description, setDescription] = useState('');
  const [recordType, setRecordType] = useState<MedicalRecordType>(initialRecordType);
  const [form] = Form.useForm();

  // Reset form when modal opens with the initial record type
  useEffect(() => {
    if (isVisible) {
      setRecordType(initialRecordType);
    }
  }, [isVisible, initialRecordType]);

  const resetForm = () => {
    setFileList([]);
    setDescription('');
    setRecordType(initialRecordType);
    form.resetFields();
  };

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.error('Please select a file to upload');
      return;
    }

    const file = fileList[0].originFileObj;
    onUpload(file, recordType, description);
    message.success(`${file.name} file uploaded successfully`);

    // Reset the form
    resetForm();

    // Close the modal
    onVisibleChange(false);
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file: File) => {
      // Validate file type - restrict to PDF files
      const isPDF = file.type === 'application/pdf';
      if (!isPDF) {
        message.error('You can only upload PDF files!');
        return Upload.LIST_IGNORE;
      }

      // Validate file size (limit to 10MB)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
        return Upload.LIST_IGNORE;
      }

      // Add file to the fileList state
      setFileList([
        {
          uid: '-1',
          name: file.name,
          status: 'ready',
          size: file.size,
          type: file.type,
          originFileObj: file,
        },
      ]);

      // Prevent automatic upload
      return false;
    },
    fileList,
  };

  return (
    <Modal
      title="Upload Medical Record"
      open={isVisible}
      onOk={handleUpload}
      onCancel={() => {
        onVisibleChange(false);
        resetForm();
      }}
      okText="Upload"
      okButtonProps={{ disabled: fileList.length === 0 }}
      centered
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          label="Record Type"
          name="recordType"
          initialValue={recordType}
        >
          <Radio.Group
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="w-full flex gap-4 mb-4"
          >
            <Radio.Button
              value="medical_report"
              className="flex-1 text-center"
            >
              Medical Report
            </Radio.Button>
            <Radio.Button
              value="prescription"
              className="flex-1 text-center"
            >
              Prescription
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="File"
          name="file"
          rules={[{ required: true, message: 'Please upload a file' }]}
        >
          <Dragger {...uploadProps} maxCount={1}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Only PDF files are supported. Maximum size: 10MB.
            </p>
          </Dragger>
        </Form.Item>

        <Form.Item
          label="Description (Optional)"
          name="description"
        >
          <TextArea
            rows={4}
            placeholder="Enter a description for this document"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>

      {recordType === 'medical_report' ? (
        <div className="text-sm text-gray-500 mt-4">
          <p>Medical reports can include:</p>
          <ul className="list-disc pl-5">
            <li>Lab test results</li>
            <li>Imaging reports (X-ray, MRI, CT scan)</li>
            <li>Discharge summaries</li>
            <li>Specialist consultation notes</li>
          </ul>
        </div>
      ) : (
        <div className="text-sm text-gray-500 mt-4">
          <p>Prescriptions should include:</p>
          <ul className="list-disc pl-5">
            <li>Doctor&apos;s name and contact information</li>
            <li>Patient&apos;s name</li>
            <li>Medication details (name, dosage, frequency)</li>
            <li>Date of prescription</li>
          </ul>
        </div>
      )}
    </Modal>
  );
};

export default RecordUpload; 