"use client";

import React from "react";
import { Card, Button, Space } from "antd";
import {
    Clock,
    Package,
    FileText,
    BarChart3,
    TrendingUp,
    Truck,
    AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
    stats: {
        pendingProcessing: number;
        totalDeliveries: number;
        readyForPickup: number;
        urgentCount?: number;
    };
}

export default function QuickActions({ stats }: QuickActionsProps) {
    const router = useRouter();

    const actions = [
        {
            key: 'process-pending',
            title: `Process Pending (${stats.pendingProcessing})`,
            icon: <Clock />,
            color: 'bg-orange-500 hover:bg-orange-600 border-orange-500',
            action: () => router.push('/pharmacist/prescription?status=READY_FOR_PROCESSING'),
            urgent: stats.pendingProcessing > 0
        },
        {
            key: 'ready-pickup',
            title: `Ready for Pickup (${stats.readyForPickup})`,
            icon: <Package />,
            color: 'bg-green-500 hover:bg-green-600 border-green-500',
            action: () => router.push('/pharmacist/prescription?delivery=READY_FOR_PICKUP'),
            urgent: false
        },
        {
            key: 'manage-deliveries',
            title: `Manage Deliveries (${stats.totalDeliveries})`,
            icon: <Truck />,
            color: 'bg-blue-500 hover:bg-blue-600 border-blue-500',
            action: () => router.push('/pharmacist/prescription?tab=deliveries'),
            urgent: false
        },
        {
            key: 'all-prescriptions',
            title: 'View All Prescriptions',
            icon: <FileText />,
            color: 'bg-purple-500 hover:bg-purple-600 border-purple-500',
            action: () => router.push('/pharmacist/prescription'),
            urgent: false
        }
    ];

    return (
        <Card
            title={
                <span className="flex items-center">
                    <TrendingUp className="mr-2 text-purple-600" />
                    Quick Actions
                </span>
            }
            className="shadow-lg h-full"
        >
            <Space direction="vertical" className="w-full" size="middle">
                {actions.map(action => (
                    <Button
                        key={action.key}
                        type={action.urgent ? "primary" : "default"}
                        block
                        icon={action.icon}
                        onClick={action.action}
                        className={action.urgent ? action.color : ''}
                        size="large"
                    >
                        <div className="flex items-center justify-between w-full">
                            <span>{action.title}</span>
                            {action.urgent && (
                                <AlertCircle className="w-4 h-4 ml-2" />
                            )}
                        </div>
                    </Button>
                ))}

                <div className="border-t pt-4 mt-4">
                    <Button
                        block
                        icon={<BarChart3 />}
                        onClick={() => router.push('/pharmacist/analytics')}
                        type="dashed"
                    >
                        View Analytics
                    </Button>
                </div>
            </Space>
        </Card>
    );
}
