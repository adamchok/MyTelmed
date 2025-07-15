"use client";

import React from "react";
import { Card, Progress, Row, Col, Typography } from "antd";
import {
    BarChart3,
    Target,
    Clock,
    CheckCircle
} from "lucide-react";

const { Text } = Typography;

interface PerformanceMetricsProps {
    stats: {
        totalPrescriptions: number;
        pendingProcessing: number;
        completedToday: number;
        totalDeliveries: number;
        outForDelivery: number;
        readyForPickup: number;
    };
}

export default function PerformanceMetrics({ stats }: PerformanceMetricsProps) {
    // Calculate performance metrics
    const processingRate = stats.totalPrescriptions > 0
        ? Math.round(((stats.totalPrescriptions - stats.pendingProcessing) / stats.totalPrescriptions) * 100)
        : 0;

    const deliveryCompletionRate = stats.totalDeliveries > 0
        ? Math.round(((stats.totalDeliveries - stats.outForDelivery) / stats.totalDeliveries) * 100)
        : 0;

    const todayCompletionRate = stats.totalPrescriptions > 0
        ? Math.round((stats.completedToday / stats.totalPrescriptions) * 100)
        : 0;

    const metrics = [
        {
            title: "Processing Efficiency",
            value: processingRate,
            color: processingRate >= 80 ? "#52c41a" : processingRate >= 60 ? "#fa8c16" : "#ff4d4f",
            icon: <Clock className="w-5 h-5" />,
            description: `${stats.totalPrescriptions - stats.pendingProcessing} of ${stats.totalPrescriptions} processed`
        },
        {
            title: "Delivery Success Rate",
            value: deliveryCompletionRate,
            color: deliveryCompletionRate >= 90 ? "#52c41a" : deliveryCompletionRate >= 70 ? "#fa8c16" : "#ff4d4f",
            icon: <CheckCircle className="w-5 h-5" />,
            description: `${stats.totalDeliveries - stats.outForDelivery} of ${stats.totalDeliveries} completed`
        },
        {
            title: "Daily Completion",
            value: todayCompletionRate,
            color: todayCompletionRate >= 75 ? "#52c41a" : todayCompletionRate >= 50 ? "#fa8c16" : "#ff4d4f",
            icon: <Target className="w-5 h-5" />,
            description: `${stats.completedToday} prescriptions completed today`
        }
    ];

    return (
        <Card
            title={
                <span className="flex items-center">
                    <BarChart3 className="mr-2 text-purple-600" />
                    Performance Metrics
                </span>
            }
            className="shadow-lg"
        >
            <div className="space-y-6">
                {metrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span style={{ color: metric.color }}>
                                    {metric.icon}
                                </span>
                                <Text strong className="text-gray-700">
                                    {metric.title}
                                </Text>
                            </div>
                            <Text strong style={{ color: metric.color, fontSize: '16px' }}>
                                {metric.value}%
                            </Text>
                        </div>
                        <Progress
                            percent={metric.value}
                            strokeColor={metric.color}
                            showInfo={false}
                            strokeWidth={10}
                        />
                        <Text type="secondary" className="text-sm">
                            {metric.description}
                        </Text>
                    </div>
                ))}

                {/* Performance Summary */}
                <div className="border-t pt-4 mt-6">
                    <Row gutter={16}>
                        <Col span={8}>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {Math.round((processingRate + deliveryCompletionRate + todayCompletionRate) / 3)}%
                                </div>
                                <Text type="secondary" className="text-xs">
                                    Overall Score
                                </Text>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {stats.completedToday}
                                </div>
                                <Text type="secondary" className="text-xs">
                                    Today&apos;s Output
                                </Text>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {stats.pendingProcessing}
                                </div>
                                <Text type="secondary" className="text-xs">
                                    In Queue
                                </Text>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </Card>
    );
}
