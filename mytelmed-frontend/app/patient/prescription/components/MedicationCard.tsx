import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { Pill } from 'lucide-react';

const { Text } = Typography;

interface MedicationCardProps {
    medication: {
        id: string;
        medicationName: string;
        genericName?: string;
        strength: string;
        dosageForm: string;
        quantity: number;
        frequency: string;
        duration: string;
        instructions: string;
        notes?: string;
    };
    className?: string;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, className = "" }) => {
    return (
        <Card
            className={`mb-3 sm:mb-4 ${className}`}
            size="small"
            hoverable
        >
            <div className="space-y-3">
                {/* Header - Medication Name and Quantity */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                        <div className="flex items-start space-x-2">
                            <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <Text strong className="text-sm sm:text-base block">
                                    {medication.medicationName}
                                </Text>
                                {medication.genericName && (
                                    <Text className="text-xs sm:text-sm text-gray-500 block">
                                        Generic: {medication.genericName}
                                    </Text>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:flex-col sm:space-x-0 sm:space-y-1 sm:items-end">
                        <Tag color="blue" className="px-2 py-1 text-xs">
                            Qty: {medication.quantity}
                        </Tag>
                    </div>
                </div>

                {/* Dosage Information */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div>
                            <Text className="text-xs sm:text-sm text-gray-600">
                                <strong>Strength:</strong> {medication.strength}
                            </Text>
                        </div>
                        <div>
                            <Text className="text-xs sm:text-sm text-gray-600">
                                <strong>Form:</strong> {medication.dosageForm}
                            </Text>
                        </div>
                        <div>
                            <Text className="text-xs sm:text-sm text-gray-600">
                                <strong>Frequency:</strong> {medication.frequency}
                            </Text>
                        </div>
                        <div>
                            <Text className="text-xs sm:text-sm text-gray-600">
                                <strong>Duration:</strong> {medication.duration}
                            </Text>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div>
                    <Text className="text-xs sm:text-sm text-gray-700">
                        <strong>Instructions:</strong> {medication.instructions}
                    </Text>
                </div>

                {/* Notes (if available) */}
                {medication.notes && (
                    <div className="bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                        <Text className="text-xs sm:text-sm text-yellow-800">
                            <strong>Notes:</strong> {medication.notes}
                        </Text>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default MedicationCard; 