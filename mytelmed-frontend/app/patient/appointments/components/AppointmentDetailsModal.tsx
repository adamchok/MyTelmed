'use client';

import { useState, useEffect } from 'react';
import { Modal, Typography, Tabs, Form, Input, Button, Upload, Space, List, Tag, Divider } from 'antd';
import { PlusOutlined, FileOutlined, DeleteOutlined, UploadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import Link from 'next/link';
import { AppointmentDetailsModalProps } from '../props';
import { PatientSymptom, AppointmentDocument, AppointmentStatus } from '@/app/props';
import { formatDate, formatTime } from '@/app/utils/DateUtils';

const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  isVisible,
  onClose,
  onUpdateDetails,
  onAddDocument,
  onRemoveDocument
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('details');
  const [symptoms, setSymptoms] = useState<PatientSymptom[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState<PatientSymptom['severity']>('moderate');
  const [symptomDuration, setSymptomDuration] = useState('');

  // Helper function to get status color
  const getStatusColor = (status: AppointmentStatus): string => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'no_show': return 'orange';
      default: return 'blue';
    }
  };

  // Reset form and states when modal opens with a new appointment
  useEffect(() => {
    if (isVisible && appointment) {
      form.resetFields();
      setSymptoms(appointment.symptoms);
    }
  }, [isVisible, appointment, form]);

  if (!appointment) return null;

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onUpdateDetails(appointment.id, {
        symptoms,
        reason: values.reason,
        notes: values.notes
      });
      onClose();
    });
  };

  const addSymptom = () => {
    if (symptomInput.trim()) {
      const newSymptom: PatientSymptom = {
        id: uuidv4(),
        description: symptomInput.trim(),
        severity: symptomSeverity,
        duration: symptomDuration.trim() || 'Not specified'
      };

      setSymptoms([...symptoms, newSymptom]);
      setSymptomInput('');
      setSymptomDuration('');
      setSymptomSeverity('moderate');
    }
  };

  const removeSymptom = (symptomId: string) => {
    setSymptoms(symptoms.filter(s => s.id !== symptomId));
  };

  const handleFileUpload = (info: any) => {
    if (info.file.status === 'done') {
      // In a real app, we'd get the file details from the server response
      // Here we're just creating dummy data
      const newDocument: AppointmentDocument = {
        id: uuidv4(),
        name: info.file.name,
        type: 'medical_record', // Default type, could be customized in a real app
        uploadDate: dayjs().format('YYYY-MM-DD'),
        fileSize: `${(info.file.size / (1024 * 1024)).toFixed(2)} MB`,
        fileUrl: '/sample-file-url.pdf' // Dummy URL
      };

      onAddDocument(appointment.id, newDocument);
    }
  };

  return (
    <Modal
      title={<Title className="mt-2" level={4}>Appointment Details</Title>}
      open={isVisible}
      onCancel={onClose}
      centered
      footer={null}
      width={800}
    >
      <div className="mb-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <Text strong className="text-lg">
              {appointment.doctorName}
            </Text>
            <div>
              <Text type="secondary">{appointment.doctorSpecialty}</Text>
            </div>
            <div>
              <Link
                href={`/browse/facilities?search=${encodeURIComponent(appointment.facilityName)}`}
                className="text-blue-500 hover:text-blue-700 hover:underline"
              >
                {appointment.facilityName}
              </Link>
            </div>
            {appointment.mode === 'physical' && (
              <div className="mt-1">
                <Text className="text-gray-600 text-sm flex">
                  <EnvironmentOutlined className="mr-1 mt-1" /> {appointment.facilityAddress}
                </Text>
              </div>
            )}
          </div>
          <div className="mt-2 md:mt-0 md:text-right">
            <div>
              <Text strong>
                {formatDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentTime)}
              </Text>
            </div>
            <div>
              <Text>
                {appointment.mode === 'video' ? 'Video Consultation' : 'In-person Visit'} ({appointment.duration} min)
              </Text>
            </div>
            <div>
              <Tag color={getStatusColor(appointment.status)}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Tag>
            </div>
          </div>
        </div>
      </div>

      <Divider />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Appointment Details" key="details">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              reason: appointment.reason,
              notes: appointment.notes
            }}
          >
            <div className="mb-4">
              <Text strong>Patient:</Text> {appointment.patientName}
            </div>

            <Form.Item
              label="Reason for Visit"
              name="reason"
              rules={[{ required: true, message: 'Please provide a reason for the visit' }]}
            >
              <Input disabled={appointment.status !== 'scheduled'} />
            </Form.Item>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <Text strong>Symptoms</Text>
                {appointment.status === 'scheduled' && (
                  <Text type="secondary" className="text-xs">Add symptoms to help your doctor prepare</Text>
                )}
              </div>

              {appointment.status === 'scheduled' && (
                <Space className="mb-3 w-full" direction="vertical">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter symptom"
                      value={symptomInput}
                      onChange={e => setSymptomInput(e.target.value)}
                      onPressEnter={addSymptom}
                    />
                    <Button onClick={addSymptom} type="primary" icon={<PlusOutlined />}>
                      Add
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="border rounded p-1 flex-grow"
                      value={symptomSeverity}
                      onChange={e => setSymptomSeverity(e.target.value as PatientSymptom['severity'])}
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                    <Input
                      placeholder="Duration (e.g., 3 days)"
                      value={symptomDuration}
                      onChange={e => setSymptomDuration(e.target.value)}
                    />
                  </div>
                </Space>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {symptoms.length === 0 ? (
                  <Text type="secondary" italic>No symptoms recorded</Text>
                ) : (
                  symptoms.map(symptom => (
                    <Tag
                      key={symptom.id}
                      color={
                        symptom.severity === 'severe' ? 'red' :
                          symptom.severity === 'moderate' ? 'orange' : 'green'
                      }
                      closable={appointment.status === 'scheduled'}
                      onClose={() => removeSymptom(symptom.id)}
                    >
                      {symptom.description} ({symptom.duration})
                    </Tag>
                  ))
                )}
              </div>
            </div>

            <Form.Item
              label="Additional Notes"
              name="notes"
            >
              <TextArea
                rows={4}
                placeholder="Any additional information for the doctor..."
                disabled={appointment.status !== 'scheduled'}
              />
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab="Documents" key="documents">
          <div className="mb-4">
            <Text>Upload or manage your medical documents for this appointment.</Text>
          </div>

          {appointment.status === 'scheduled' && (
            <Upload
              name="file"
              action="/api/mock-upload" // This would be your actual upload endpoint
              onChange={handleFileUpload}
              showUploadList={false}
              // In a real app, multiple file types would be supported
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            >
              <Button icon={<UploadOutlined />} className="mb-4">
                Upload Document
              </Button>
            </Upload>
          )}

          <List
            dataSource={appointment.documents}
            locale={{ emptyText: "No documents uploaded" }}
            renderItem={doc => (
              <List.Item
                actions={appointment.status === 'scheduled' ? [
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onRemoveDocument(appointment.id, doc.id)}
                  />
                ] : []}
              >
                <List.Item.Meta
                  avatar={<FileOutlined style={{ fontSize: 24 }} />}
                  title={doc.name}
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">
                        Type: {doc.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Text>
                      <Text type="secondary">
                        Uploaded: {formatDate(doc.uploadDate)} • Size: {doc.fileSize}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>

      {appointment.status === 'scheduled' && (
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      )}

      {appointment.status !== 'scheduled' && (
        <div className="flex justify-end mt-6">
          <Button type="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default AppointmentDetailsModal; 