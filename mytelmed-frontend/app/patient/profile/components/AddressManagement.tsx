import { Card, Button, Empty, Row, Col, Typography, Spin, Alert } from "antd";
import { MapPin, Plus, AlertCircle } from "lucide-react";
import { AddressDto } from "@/app/api/address/props";
import AddressCard from "./AddressCard";
import AddressFormModal from "./AddressFormModal";

const { Title, Text } = Typography;

interface AddressManagementProps {
    addresses: AddressDto[];
    loading: boolean;
    error: string | null;
    modalVisible: boolean;
    editingAddress: AddressDto | null;
    submitting: boolean;
    deletingAddressId: string | null;
    onAddAddress: () => void;
    onEditAddress: (address: AddressDto) => void;
    onDeleteAddress: (addressId: string) => Promise<void>;
    onSubmitAddress: (values: any) => Promise<void>;
    onCancelModal: () => void;
    onClearError: () => void;
}

const AddressManagement = ({
    addresses,
    loading,
    error,
    modalVisible,
    editingAddress,
    submitting,
    deletingAddressId,
    onAddAddress,
    onEditAddress,
    onDeleteAddress,
    onSubmitAddress,
    onCancelModal,
    onClearError,
}: AddressManagementProps) => {
    return (
        <div className="mt-8">
            <Card className="shadow-lg border-0 bg-white" styles={{ body: { padding: "24px" } }}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div className="flex items-center mb-4 sm:mb-0">
                        <MapPin className="w-6 h-6 text-blue-500 mr-3" />
                        <div>
                            <Title level={4} className="m-0 text-gray-800 text-lg sm:text-xl">
                                Address Management
                            </Title>
                            <Text className="text-gray-600 text-xs sm:text-sm">
                                Manage your delivery and billing addresses
                            </Text>
                        </div>
                    </div>
                    <Button
                        type="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={onAddAddress}
                        size="middle"
                        className="bg-blue-500 hover:bg-blue-600"
                    >
                        Add Address
                    </Button>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert
                        message="Error"
                        description={error}
                        type="error"
                        showIcon
                        className="mb-6"
                        closable
                        onClose={onClearError}
                        icon={<AlertCircle className="w-4 h-4" />}
                    />
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <Spin size="large" />
                    </div>
                )}

                {/* Address List */}
                {!loading && addresses.length === 0 && (
                    <Empty
                        description={
                            <div className="text-center">
                                <Text className="text-gray-500">No addresses found</Text>
                                <br />
                                <Text className="text-gray-400 text-sm">Add your first address to get started</Text>
                            </div>
                        }
                        className="py-12"
                    />
                )}

                {!loading && addresses.length > 0 && (
                    <Row gutter={[16, 16]}>
                        {addresses.map((address, index) => (
                            <Col xs={24} md={12} lg={8} key={address.id}>
                                <AddressCard
                                    address={address}
                                    isDefault={index === 0} // First address is default
                                    onEdit={onEditAddress}
                                    onDelete={onDeleteAddress}
                                    isDeleting={deletingAddressId === address.id}
                                />
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Address Form Modal */}
                <AddressFormModal
                    visible={modalVisible}
                    address={editingAddress}
                    loading={submitting}
                    onCancel={onCancelModal}
                    onSubmit={onSubmitAddress}
                />
            </Card>
        </div>
    );
};

export default AddressManagement;
