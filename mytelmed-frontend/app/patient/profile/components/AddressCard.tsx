import { Card, Button, Space, Typography } from "antd";
import { MapPin, Edit, Trash2, Home, Building } from "lucide-react";
import { AddressDto } from "@/app/api/address/props";

const { Text } = Typography;

interface AddressCardProps {
    address: AddressDto;
    onEdit: (address: AddressDto) => void;
    onDelete: (addressId: string) => void;
    isDeleting?: boolean;
}

const AddressCard = ({ address, onEdit, onDelete, isDeleting }: AddressCardProps) => {
    return (
        <Card
            className="shadow-md h-full w-full border-gray-200 hover:shadow-lg transition-shadow duration-200"
            styles={{
                body: {
                    padding: "16px",
                },
            }}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center mb-2">
                        <Home className="w-4 h-4 text-blue-500 mr-2" />
                        <Text strong className="text-sm sm:text-base text-gray-800">
                            {address.addressName}
                        </Text>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-start">
                            <MapPin className="w-3 h-3 text-gray-500 mr-2 mt-0.5" />
                            <div className="flex-1">
                                <Text className="text-xs sm:text-sm text-gray-600 block">
                                    {address.address1}
                                </Text>
                                {address.address2 && (
                                    <Text className="text-xs sm:text-sm text-gray-600 block">
                                        {address.address2}
                                    </Text>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Building className="w-3 h-3 text-gray-500 mr-2" />
                            <Text className="text-xs sm:text-sm text-gray-600">
                                {address.city}, {address.state}
                            </Text>
                        </div>
                        <div className="flex items-center">
                            <MapPin className="w-3 h-3 text-gray-500 mr-2" />
                            <Text className="text-xs sm:text-sm text-gray-600">{address.postcode}</Text>
                        </div>
                    </div>
                </div>

                <Space direction="vertical" size="small">
                    <Button
                        type="text"
                        icon={<Edit className="w-4 h-4" />}
                        size="small"
                        onClick={() => onEdit(address)}
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    />
                    <Button
                        type="text"
                        icon={<Trash2 className="w-4 h-4" />}
                        size="small"
                        danger
                        loading={isDeleting}
                        onClick={() => onDelete(address.id)}
                        className="hover:bg-red-50"
                    />
                </Space>
            </div>
        </Card>
    );
};

export default AddressCard;
