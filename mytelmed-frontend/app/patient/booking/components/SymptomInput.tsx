'use client';

import { useState } from 'react';
import { Form, Input, Button, Select, List, Tag, Space, Tooltip } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { SymptomInputProps } from '../props';
import { PatientSymptom } from '@/app/props';

const { Option } = Select;

const SymptomInput: React.FC<SymptomInputProps> = ({
  symptoms,
  onAddSymptom,
  onRemoveSymptom
}) => {
  const [form] = Form.useForm();
  const [symptomDescription, setSymptomDescription] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [symptomDuration, setSymptomDuration] = useState('');

  const handleAddSymptom = () => {
    if (!symptomDescription.trim() || !symptomDuration.trim()) return;

    const newSymptom: Omit<PatientSymptom, 'id'> = {
      description: symptomDescription.trim(),
      severity: symptomSeverity,
      duration: symptomDuration.trim()
    };

    onAddSymptom(newSymptom as PatientSymptom);

    // Reset fields
    setSymptomDescription('');
    setSymptomSeverity('mild');
    setSymptomDuration('');
    form.resetFields();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'green';
      case 'moderate':
        return 'orange';
      case 'severe':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <div className="mt-2">
      <Form form={form} layout="vertical" className="mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <Form.Item
            name="description"
            className="flex-1 mb-0"
            rules={[{ required: true, message: 'Please enter symptom description' }]}
          >
            <Input
              placeholder="Enter symptom description"
              value={symptomDescription}
              onChange={(e) => setSymptomDescription(e.target.value)}
            />
          </Form.Item>

          <Form.Item name="severity" className="w-full md:w-40 mb-0">
            <Select
              placeholder="Severity"
              value={symptomSeverity}
              onChange={(value) => setSymptomSeverity(value)}
            >
              <Option value="mild">Mild</Option>
              <Option value="moderate">Moderate</Option>
              <Option value="severe">Severe</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="duration"
            className="w-full md:w-48 mb-0"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <Input
              placeholder="Duration (e.g., 3 days)"
              value={symptomDuration}
              onChange={(e) => setSymptomDuration(e.target.value)}
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddSymptom}
              disabled={!symptomDescription.trim() || !symptomDuration.trim()}
            >
              Add
            </Button>
          </Form.Item>
        </div>
      </Form>

      {symptoms.length > 0 ? (
        <List
          size="small"
          bordered
          dataSource={symptoms}
          renderItem={(symptom) => (
            <List.Item
              actions={[
                <Tooltip title="Remove" key="remove">
                  <Button
                    type="text"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => onRemoveSymptom(symptom.id)}
                    size="small"
                  />
                </Tooltip>
              ]}
            >
              <Space direction="vertical" size={0}>
                <div className="font-medium">{symptom.description}</div>
                <Space size="small">
                  <Tag color={getSeverityColor(symptom.severity)}>
                    {symptom.severity.charAt(0).toUpperCase() + symptom.severity.slice(1)}
                  </Tag>
                  <span className="text-gray-500 text-sm">{symptom.duration}</span>
                </Space>
              </Space>
            </List.Item>
          )}
        />
      ) : (
        <div className="text-gray-500 text-sm italic">No symptoms added</div>
      )}
    </div>
  );
};

export default SymptomInput; 