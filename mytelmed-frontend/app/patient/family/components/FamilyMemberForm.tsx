"use client";

import { useState } from "react";
import { Form, Input, Button, Select, Typography, Alert } from "antd";
import { User, Mail, Heart } from "lucide-react";
import { CreateFamilyMemberRequest } from "@/app/api/family/props";

const { Title, Text } = Typography;
const { Option } = Select;

interface FamilyMemberFormProps {
    onSubmit: (request: CreateFamilyMemberRequest) => void;
    onCancel: () => void;
}

const relationshipOptions = [
    { value: "spouse", label: "Spouse" },
    { value: "parent", label: "Parent" },
    { value: "child", label: "Child" },
    { value: "sibling", label: "Sibling" },
    { value: "grandparent", label: "Grandparent" },
    { value: "grandchild", label: "Grandchild" },
    { value: "relative", label: "Other Relative" },
    { value: "caregiver", label: "Caregiver" },
    { value: "friend", label: "Friend" },
    { value: "other", label: "Other" },
];

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({ onSubmit, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            const request: CreateFamilyMemberRequest = {
                nric: values.nric,
                name: values.name,
                email: values.email,
                relationship: values.relationship,
            };
            await onSubmit(request);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto">
            <div className="mb-6">
                <Title level={4} className="mb-2">
                    Add Family Member
                </Title>
                <Text className="text-gray-600">Invite a family member to access your health information</Text>
            </div>

            <Alert
                message="Important Information"
                description="The person you invite will receive an email invitation to create an account and access your health information based on the permissions you set."
                type="info"
                showIcon
                className="mb-6"
            />

            <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item
                    label={
                        <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span>Full Name</span>
                        </div>
                    }
                    name="name"
                    rules={[
                        { required: true, message: "Please enter the full name" },
                        { min: 2, message: "Name must be at least 2 characters" },
                    ]}
                >
                    <Input placeholder="Enter full name" size="large" />
                </Form.Item>

                <Form.Item
                    label={
                        <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span>Email Address</span>
                        </div>
                    }
                    name="email"
                    rules={[
                        { required: true, message: "Please enter the email address" },
                        { type: "email", message: "Please enter a valid email address" },
                    ]}
                >
                    <Input placeholder="Enter email address" size="large" />
                </Form.Item>

                <Form.Item
                    label={
                        <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span>NRIC Number</span>
                        </div>
                    }
                    name="nric"
                    rules={[
                        { required: true, message: "Please enter the NRIC number" },
                        {
                            pattern: /^[0-9]{12}$/,
                            message: "NRIC must be exactly 12 digits",
                        },
                    ]}
                    extra="Enter the 12-digit NRIC number without spaces or dashes"
                >
                    <Input placeholder="Enter NRIC number" size="large" maxLength={12} />
                </Form.Item>

                <Form.Item
                    label={
                        <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-gray-500" />
                            <span>Relationship</span>
                        </div>
                    }
                    name="relationship"
                    rules={[{ required: true, message: "Please select a relationship" }]}
                >
                    <Select placeholder="Select relationship" size="large">
                        {relationshipOptions.map((option) => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Alert
                    message="Next Steps"
                    description="After adding the family member, you can set their specific permissions by clicking the edit button on their card."
                    type="success"
                    showIcon
                    className="mb-6"
                />

                <Form.Item>
                    <div className="flex justify-end space-x-3">
                        <Button onClick={onCancel} size="large">
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading} size="large" className="shadow-lg">
                            Send Invitation
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
};

export default FamilyMemberForm;
