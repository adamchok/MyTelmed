import { Modal, Form, Input, Button, Row, Col, Typography } from "antd";
import { MapPin, Building, Home, Navigation } from "lucide-react";
import { AddressDto, RequestAddressDto } from "@/app/api/address/props";
import TextArea from "antd/es/input/TextArea";
import { useEffect } from "react";

const { Text } = Typography;

interface AddressFormModalProps {
    visible: boolean;
    address?: AddressDto | null;
    loading: boolean;
    onCancel: () => void;
    onSubmit: (values: RequestAddressDto) => Promise<void>;
}

const AddressFormModal = ({ visible, address, loading, onCancel, onSubmit }: AddressFormModalProps) => {
    const [form] = Form.useForm();
    const isEditing = !!address;

    // Reset form when modal opens/closes or when editing address changes
    useEffect(() => {
        if (visible) {
            if (address) {
                // Set form values for editing
                form.setFieldsValue({
                    ...address,
                    postcode: address.postcode ? address.postcode.replace(/\D/g, "").slice(0, 5) : "",
                });
            } else {
                // Reset form for new address
                form.resetFields();
            }
        }
    }, [visible, address, form]);

    const handleSubmit = async (values: any) => {
        // Ensure postcode is properly cleaned before submission
        const cleanedValues = {
            ...values,
            postcode: values.postcode ? values.postcode.replace(/\D/g, "").slice(0, 5) : values.postcode,
        };

        // Debug log to check the values being sent
        console.log("Submitting address with values:", cleanedValues);

        await onSubmit(cleanedValues);
        form.resetFields();
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={
                <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                    <Text className="text-lg font-semibold">{isEditing ? "Edit Address" : "Add New Address"}</Text>
                </div>
            }
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={600}
            destroyOnHidden={true}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={
                    address
                        ? {
                              ...address,
                              postcode: address.postcode ? address.postcode.replace(/\D/g, "").slice(0, 5) : "",
                          }
                        : {}
                }
                className="mt-4"
            >
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Form.Item
                            label={
                                <span className="text-sm font-medium text-gray-700 flex items-center">
                                    <MapPin className="mr-2 text-blue-500" size={16} />
                                    Address
                                </span>
                            }
                            name="address"
                            rules={[
                                { required: true, message: "Please enter the address" },
                                { min: 5, message: "Address must be at least 5 characters" },
                                { max: 300, message: "Address cannot exceed 300 characters" },
                            ]}
                        >
                            <TextArea
                                placeholder="Enter your full address"
                                className="h-28 rounded-lg border-gray-200 hover:border-blue-400 focus:border-blue-500"
                                size="large"
                                maxLength={300}
                                showCount
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            label={
                                <span className="text-sm font-medium text-gray-700 flex items-center">
                                    <Building className="mr-2 text-blue-500" size={16} />
                                    City
                                </span>
                            }
                            name="city"
                            rules={[
                                { required: true, message: "Please enter the city" },
                                { min: 2, message: "City must be at least 2 characters" },
                            ]}
                        >
                            <Input
                                placeholder="Enter city"
                                className="h-10 rounded-lg border-gray-200 hover:border-blue-400 focus:border-blue-500"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            label={
                                <span className="text-sm font-medium text-gray-700 flex items-center">
                                    <Navigation className="mr-2 text-blue-500" size={16} />
                                    State
                                </span>
                            }
                            name="state"
                            rules={[
                                { required: true, message: "Please enter the state" },
                                { min: 2, message: "State must be at least 2 characters" },
                            ]}
                        >
                            <Input
                                placeholder="Enter state"
                                className="h-10 rounded-lg border-gray-200 hover:border-blue-400 focus:border-blue-500"
                                size="large"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            label={
                                <span className="text-sm font-medium text-gray-700 flex items-center">
                                    <Home className="mr-2 text-blue-500" size={16} />
                                    Postcode
                                </span>
                            }
                            name="postcode"
                            rules={[
                                { required: true, message: "Please enter the postcode" },
                                {
                                    validator: (_, value) => {
                                        if (!value) {
                                            return Promise.reject(new Error("Please enter the postcode"));
                                        }
                                        const cleanValue = value.replace(/\D/g, "");
                                        if (cleanValue.length !== 5) {
                                            return Promise.reject(new Error("Postcode must be exactly 5 digits"));
                                        }
                                        if (!/^\d{5}$/.test(cleanValue)) {
                                            return Promise.reject(new Error("Postcode must contain only digits"));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                            normalize={(value) => {
                                if (!value) return value;
                                // Remove all non-digit characters and limit to 5 digits
                                const cleanValue = value.replace(/\D/g, "").slice(0, 5);
                                return cleanValue;
                            }}
                        >
                            <Input
                                placeholder="Enter postcode (5 digits)"
                                className="h-10 rounded-lg border-gray-200 hover:border-blue-400 focus:border-blue-500"
                                size="large"
                                maxLength={5}
                                onKeyPress={(e) => {
                                    // Only allow digits
                                    if (!/\d/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <Button onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="bg-blue-500 hover:bg-blue-600"
                    >
                        {isEditing ? "Update Address" : "Add Address"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AddressFormModal;
