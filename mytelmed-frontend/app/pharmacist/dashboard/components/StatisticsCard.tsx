"use client";

import React from "react";
import { Card, Statistic } from "antd";
import { LucideIcon } from "lucide-react";

interface StatisticsCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    color?: string;
    prefix?: React.ReactNode;
    suffix?: string;
    loading?: boolean;
    onClick?: () => void;
}

export default function StatisticsCard({
    title,
    value,
    icon: Icon,
    color = "#1890ff",
    prefix,
    suffix,
    loading = false,
    onClick
}: StatisticsCardProps) {
    return (
        <Card
            className={`shadow-lg border-0 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-xl hover:scale-105' : ''}`}
            loading={loading}
            onClick={onClick}
        >
            <Statistic
                title={
                    <div className="flex items-center space-x-2">
                        <Icon className="w-5 h-5" style={{ color }} />
                        <span className="text-gray-700 font-medium">{title}</span>
                    </div>
                }
                value={value}
                prefix={prefix}
                suffix={suffix}
                valueStyle={{
                    color,
                    fontSize: '28px',
                    fontWeight: 'bold'
                }}
            />
        </Card>
    );
}
