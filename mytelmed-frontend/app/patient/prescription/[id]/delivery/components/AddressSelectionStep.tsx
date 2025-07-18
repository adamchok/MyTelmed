"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Button, Typography, Radio, Alert, message, Spin, Form, Input, Modal } from "antd";
import { MapPin, Plus, ArrowRight, ArrowLeft, Home } from "lucide-react";
import { RootState } from "@/lib/store";
import {
    setAvailableAddresses,
    setSelectedAddress,
    setDeliveryInstructions,
    nextStep,
    previousStep
} from "@/lib/reducers/delivery-flow-reducer";
import AddressApi from "@/app/api/address";
import { AddressDto, RequestAddressDto } from "@/app/api/address/props";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function AddressSelectionStep() {
    const dispatch = useDispatch();
    const {
        selectedAddress,
        availableAddresses,
        deliveryInstructions,
        error
    } = useSelector((state: RootState) => state.rootReducer.deliveryFlow);

    // Local state for address management
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [creatingAddress, setCreatingAddress] = useState(false);
    const [form] = Form.useForm();

    // Load addresses on component mount
    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            setLoadingAddresses(true);
            const response = await AddressApi.getAddressesByPatientAccount();

            if (response.data.isSuccess && response.data.data) {
                dispatch(setAvailableAddresses(response.data.data));
            } else {
                throw new Error("Failed to fetch addresses");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to load addresses";
            message.error(errorMessage);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const handleAddressSelect = (address: AddressDto) => {
        dispatch(setSelectedAddress(address));
    };

    const handleInstructionsChange = (value: string) => {
        dispatch(setDeliveryInstructions(value));
    };

    const handleAddNewAddress = () => {
        setShowAddressModal(true);
        form.resetFields();
    };

    const handleCreateAddress = async (values: any) => {
        try {
            setCreatingAddress(true);

            const createRequest: RequestAddressDto = {
                addressName: values.addressName,
                address1: values.address1,
                address2: values.address2 || undefined,
                city: values.city,
                state: values.state,
                postcode: values.postcode,
            };

            const response = await AddressApi.createAddressByAccount(createRequest);

            if (response.data.isSuccess) {
                message.success("Address added successfully!");
                setShowAddressModal(false);
                form.resetFields();

                // Reload addresses to get the newly created address
                await loadAddresses();
            } else {
                throw new Error("Failed to create address");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to create address";
            message.error(errorMessage);
        } finally {
            setCreatingAddress(false);
        }
    };

    const handleNext = () => {
        if (!selectedAddress) {
            message.warning("Please select a delivery address");
            return;
        }
        dispatch(nextStep());
    };

    const handlePrevious = () => {
        dispatch(previousStep());
    };

    const AddressCard = ({ address }: { address: AddressDto }) => (
        <Card
            className={`cursor-pointer transition-all duration-200 h-full ${selectedAddress?.id === address.id
                ? 'border-blue-500 shadow-lg bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
            onClick={() => handleAddressSelect(address)}
        >
            <div className="space-y-3">
                {/* Address Name */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Home className={`w-4 h-4 ${selectedAddress?.id === address.id ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                        <Text className={`font-medium ${selectedAddress?.id === address.id ? 'text-blue-800' : 'text-gray-800'
                            }`}>
                            {address.addressName}
                        </Text>
                    </div>
                </div>

                {/* Address Details */}
                <div className="space-y-1">
                    <div className="text-gray-700">{address.address1}</div>
                    {address.address2 && (
                        <div className="text-gray-700">{address.address2}</div>
                    )}
                    <div className="text-gray-700">
                        {address.postcode} {address.city}
                    </div>
                    <div className="text-gray-700">{address.state}</div>
                </div>

                {/* Selection Indicator */}
                <div className="pt-2 border-t border-gray-100">
                    <Radio
                        checked={selectedAddress?.id === address.id}
                        onChange={() => handleAddressSelect(address)}
                    >
                        <span className={selectedAddress?.id === address.id ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                            Deliver to this address
                        </span>
                    </Radio>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Step Description */}
            <Card className="bg-gray-50">
                <div className="text-center">
                    <Title level={3} className="text-gray-800 mb-2">
                        Select Delivery Address
                    </Title>
                    <Text className="text-gray-600">
                        Choose where you&apos;d like your medication to be delivered.
                    </Text>
                </div>
            </Card>

            {/* Error Display */}
            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    closable
                />
            )}

            {/* Loading State */}
            {loadingAddresses ? (
                <div className="text-center py-8">
                    <Spin size="large" />
                    <Text className="block mt-4 text-gray-600">Loading your addresses...</Text>
                </div>
            ) : (
                <>
                    {/* Addresses Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Title level={4} className="text-gray-800 mb-0">
                                Your Addresses
                            </Title>
                            <Button
                                type="dashed"
                                icon={<Plus className="w-4 h-4" />}
                                onClick={handleAddNewAddress}
                                className="border-blue-500 text-blue-600 hover:border-blue-600 hover:text-blue-700"
                            >
                                Add New Address
                            </Button>
                        </div>

                        {availableAddresses.length === 0 ? (
                            <Card className="text-center py-8">
                                <div className="space-y-4">
                                    <MapPin className="w-12 h-12 text-gray-400 mx-auto" />
                                    <div>
                                        <Title level={4} className="text-gray-600">
                                            No addresses found
                                        </Title>
                                        <Text className="text-gray-500">
                                            Please add a delivery address to continue.
                                        </Text>
                                    </div>
                                    <Button
                                        type="primary"
                                        icon={<Plus className="w-4 h-4" />}
                                        onClick={handleAddNewAddress}
                                        className="bg-blue-600 border-blue-600 hover:bg-blue-700"
                                    >
                                        Add Your First Address
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <Row gutter={[16, 16]}>
                                {availableAddresses.map((address) => (
                                    <Col xs={24} md={12} lg={8} key={address.id}>
                                        <AddressCard address={address} />
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </div>

                    {/* Delivery Instructions */}
                    <Card title="Delivery Instructions (Optional)">
                        <TextArea
                            value={deliveryInstructions}
                            onChange={(e) => handleInstructionsChange(e.target.value)}
                            placeholder="Add any special instructions for the delivery (e.g., gate code, preferred delivery time, etc.)"
                            rows={3}
                            maxLength={500}
                            showCount
                        />
                        <div className="mt-2">
                            <Text className="text-gray-500 text-sm">
                                These instructions will help our delivery partner find your location and deliver at your convenience.
                            </Text>
                        </div>
                    </Card>
                </>
            )}

            {/* Navigation */}
            <Card>
                <div className="flex justify-between">
                    <Button
                        onClick={handlePrevious}
                        icon={<ArrowLeft className="w-4 h-4" />}
                        className="border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700"
                        size="middle"
                    >
                        Previous
                    </Button>
                    <Button
                        type="primary"
                        size="middle"
                        onClick={handleNext}
                        disabled={!selectedAddress || loadingAddresses}
                        icon={<ArrowRight className="w-4 h-4" />}
                        className="bg-blue-600 border-blue-600 hover:bg-blue-700"
                    >
                        Continue to Payment
                    </Button>
                </div>
            </Card>

            {/* Add Address Modal */}
            <Modal
                title="Add New Address"
                open={showAddressModal}
                onCancel={() => {
                    setShowAddressModal(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateAddress}
                    className="space-y-4"
                >
                    <Form.Item
                        label="Address Name"
                        name="addressName"
                        rules={[
                            { required: true, message: "Please enter an address name" },
                            { min: 2, message: "Address name must be at least 2 characters" },
                            { max: 100, message: "Address name cannot exceed 100 characters" }
                        ]}
                    >
                        <Input placeholder="e.g., Home, Office, Parents' House" />
                    </Form.Item>

                    <Form.Item
                        label="Address Line 1"
                        name="address1"
                        rules={[
                            { required: true, message: "Please enter address line 1" },
                            { min: 5, message: "Address line 1 must be at least 5 characters" },
                            { max: 300, message: "Address line 1 cannot exceed 300 characters" }
                        ]}
                    >
                        <Input placeholder="Street address, building number" />
                    </Form.Item>

                    <Form.Item
                        label="Address Line 2 (Optional)"
                        name="address2"
                        rules={[
                            { max: 300, message: "Address line 2 cannot exceed 300 characters" }
                        ]}
                    >
                        <Input placeholder="Apartment, suite, unit, floor, etc." />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="City"
                                name="city"
                                rules={[
                                    { required: true, message: "Please enter city" },
                                    { min: 2, message: "City must be at least 2 characters" }
                                ]}
                            >
                                <Input placeholder="City" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Postcode"
                                name="postcode"
                                rules={[
                                    { required: true, message: "Please enter postcode" },
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
                                    maxLength={5}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="State"
                        name="state"
                        rules={[
                            { required: true, message: "Please enter state" },
                            { min: 2, message: "State must be at least 2 characters" }
                        ]}
                    >
                        <Input placeholder="State" />
                    </Form.Item>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            onClick={() => {
                                setShowAddressModal(false);
                                form.resetFields();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={creatingAddress}
                            className="bg-blue-600 border-blue-600 hover:bg-blue-700"
                        >
                            Add Address
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
} 