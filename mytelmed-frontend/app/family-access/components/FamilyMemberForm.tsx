'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Divider, Typography } from 'antd';
import { FamilyMember, Permission } from '@/app/props';
import { FamilyMemberFormProps } from '../props';
import PermissionCard from './PermissionCard';
import './index.css';


const { Title } = Typography;
const { Option } = Select;

const relationshipOptions = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'relative', label: 'Other Relative' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
];

const defaultPermissions = {
  appointmentBooking: false,
  appointmentManagement: false,
  viewMedicalRecords: false,
  managePrescriptions: false
};

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({
  initialValues,
  onSubmit,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [permissions, setPermissions] = useState<FamilyMember['permissions']>(
    initialValues?.permissions || defaultPermissions
  );

  // Reset form when initialValues changes (including when it becomes undefined)
  useEffect(() => {
    // Reset form fields
    form.resetFields();

    // Set initial values
    form.setFieldsValue({
      name: initialValues?.name || '',
      email: initialValues?.email || '',
      phone: initialValues?.phone || '',
      relationship: initialValues?.relationship || '',
    });

    // Reset permissions
    setPermissions(initialValues?.permissions || defaultPermissions);
  }, [form, initialValues]);

  const handlePermissionChange = (key: Permission, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (values: any) => {
    const member: FamilyMember = {
      id: initialValues?.id ?? Date.now().toString(),
      name: values.name,
      email: values.email,
      phone: values.phone,
      relationship: values.relationship,
      dateAdded: initialValues?.dateAdded ?? new Date().toISOString(),
      permissions: permissions
    };
    onSubmit(member);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Title className="mt-2" level={4}>{initialValues ? 'Edit Family Member' : 'Add New Family Member'}</Title>

      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please enter the name' }]}
      >
        <Input placeholder="Full name" />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Please enter the email address' },
          { type: 'email', message: 'Please enter a valid email address' }
        ]}
      >
        <Input placeholder="Email address" />
      </Form.Item>

      <Form.Item
        label="Phone Number"
        name="phone"
        rules={[
          { required: true, message: 'Please enter the phone number' },
          {
            pattern: /^\+60\s?1[0-9]-[0-9]{3,4}\s?[0-9]{4}$/,
            message: 'Please enter a valid Malaysian phone number format: +60 1X-XXX XXXX'
          }
        ]}
        extra="Malaysian format: +60 1X-XXX XXXX"
      >
        <Input
          placeholder="+60 1X-XXX XXXX"
          addonBefore="+60"
          className="malaysian-phone-input"
        />
      </Form.Item>

      <Form.Item
        label="Relationship"
        name="relationship"
        rules={[{ required: true, message: 'Please select a relationship' }]}
      >
        <Select placeholder="Select relationship">
          {relationshipOptions.map(option => (
            <Option key={option.value} value={option.value}>{option.label}</Option>
          ))}
        </Select>
      </Form.Item>

      <Divider className="mt-10 border-gray-300 font-medium" orientation="left">Access Permissions</Divider>
      <p className="text-gray-500 mb-4">
        Select which actions this person can perform on your behalf:
      </p>

      <div className="space-y-4 mb-6">
        <PermissionCard
          title="Appointment Booking"
          description="Allow this person to book medical appointments for you"
          permissionKey="appointmentBooking"
          value={permissions.appointmentBooking}
          onChange={handlePermissionChange}
        />

        <PermissionCard
          title="Appointment Management"
          description="Allow this person to reschedule or cancel your appointments"
          permissionKey="appointmentManagement"
          value={permissions.appointmentManagement}
          onChange={handlePermissionChange}
        />

        <PermissionCard
          title="Medical Records Access"
          description="Allow this person to view your medical reports and history"
          permissionKey="viewMedicalRecords"
          value={permissions.viewMedicalRecords}
          onChange={handlePermissionChange}
        />

        <PermissionCard
          title="Prescription Management"
          description="Allow this person to view and manage your medication prescriptions"
          permissionKey="managePrescriptions"
          value={permissions.managePrescriptions}
          onChange={handlePermissionChange}
        />
      </div>

      <Form.Item>
        <div className="flex justify-end gap-3">
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            {initialValues ? 'Update' : 'Add'} Family Member
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default FamilyMemberForm; 