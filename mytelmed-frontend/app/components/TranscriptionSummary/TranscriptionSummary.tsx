"use client";

import React, { useState } from "react";
import { Card, Typography, List, Spin, Alert, Collapse, Divider } from "antd";
import {
    AudioOutlined,
    BulbOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import { TranscriptionSummaryDto } from "@/app/api/transcription/props";

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface TranscriptionSummaryProps {
    transcriptionSummary?: TranscriptionSummaryDto | null;
    userType: "patient" | "doctor";
    loading?: boolean;
    appointmentId: string;
}

export default function TranscriptionSummary({
    transcriptionSummary,
    userType,
    loading = false
}: Readonly<TranscriptionSummaryProps>) {
    const [expandedPanels, setExpandedPanels] = useState<string[]>(['summary']);

    if (loading) {
        return (
            <Card
                title={
                    <div className="flex items-center">
                        <AudioOutlined className="mr-2 text-blue-600" />
                        AI Transcription Summary
                    </div>
                }
                className="mb-6"
            >
                <div className="text-center py-8">
                    <Spin size="large" />
                    <div className="mt-4 text-gray-600">Processing transcription summary...</div>
                </div>
            </Card>
        );
    }

    if (!transcriptionSummary) {
        return (
            <Card
                title={
                    <div className="flex items-center">
                        <AudioOutlined className="mr-2 text-gray-400" />
                        AI Transcription Summary
                    </div>
                }
                className="mb-6"
            >
                <Alert
                    message="No transcription summary available"
                    description="Transcription summaries are generated automatically after virtual appointments end."
                    type="info"
                    className="text-center"
                />
            </Card>
        );
    }

    const renderSummaryContent = () => {
        if (transcriptionSummary.processingStatus.toLowerCase() === 'failed') {
            return (
                <Alert
                    message="Summary Generation Failed"
                    description={transcriptionSummary.errorMessage || "Failed to generate transcription summary"}
                    type="error"
                    showIcon
                />
            );
        }

        if (transcriptionSummary.processingStatus.toLowerCase() !== 'completed') {
            return (
                <Alert
                    message="Summary In Progress"
                    description="Your transcription summary is being processed. Please check back in a few minutes."
                    type="info"
                    showIcon
                />
            );
        }

        const userSummary = userType === 'patient'
            ? transcriptionSummary.patientSummary
            : transcriptionSummary.doctorSummary;

        return (
            <Collapse
                activeKey={expandedPanels}
                onChange={(keys) => setExpandedPanels(keys)}
                className="bg-transparent border-0"
            >
                <Panel
                    header={
                        <div className="flex items-center">
                            <BulbOutlined className="mr-2 text-green-600" />
                            <Text strong>Summary for {userType === 'patient' ? 'Patient' : 'Healthcare Provider'}</Text>
                        </div>
                    }
                    key="summary"
                    className="mb-4"
                >
                    {userSummary ? (
                        <Paragraph className="text-gray-700 leading-relaxed bg-green-50 p-4 rounded border border-green-200">
                            {userSummary}
                        </Paragraph>
                    ) : (
                        <Text type="secondary">No summary available for {userType}</Text>
                    )}
                </Panel>

                {transcriptionSummary.keyPoints && transcriptionSummary.keyPoints.length > 0 && (
                    <Panel
                        header={
                            <div className="flex items-center">
                                <CheckCircleOutlined className="mr-2 text-blue-600" />
                                <Text strong>Key Points Discussed</Text>
                            </div>
                        }
                        key="keypoints"
                        className="mb-4"
                    >
                        <List
                            dataSource={transcriptionSummary.keyPoints}
                            renderItem={(point, index) => (
                                <List.Item className="border-0 py-2">
                                    <div className="flex items-start">
                                        <Text className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-3 mt-1">
                                            {index + 1}
                                        </Text>
                                        <Text className="text-gray-700">{point}</Text>
                                    </div>
                                </List.Item>
                            )}
                            className="bg-blue-50 p-4 rounded border border-blue-200"
                        />
                    </Panel>
                )}

                {transcriptionSummary.actionItems && transcriptionSummary.actionItems.length > 0 && (
                    <Panel
                        header={
                            <div className="flex items-center">
                                <ExclamationCircleOutlined className="mr-2 text-orange-600" />
                                <Text strong>Action Items & Recommendations</Text>
                            </div>
                        }
                        key="actions"
                        className="mb-4"
                    >
                        <List
                            dataSource={transcriptionSummary.actionItems}
                            renderItem={(action, index) => (
                                <List.Item className="border-0 py-2">
                                    <div className="flex items-start">
                                        <Text className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium mr-3 mt-1">
                                            {index + 1}
                                        </Text>
                                        <Text className="text-gray-700">{action}</Text>
                                    </div>
                                </List.Item>
                            )}
                            className="bg-orange-50 p-4 rounded border border-orange-200"
                        />
                    </Panel>
                )}
            </Collapse>
        );
    };

    return (
        <Card
            title={
                <div className="flex flex-col gap-1 justify-normal my-2">
                    <div className="flex items-center">
                        <AudioOutlined className="mr-2 text-blue-600" />
                        AI Transcription Summary
                    </div>
                </div>
            }
            className="mb-6"
        >
            {renderSummaryContent()}

            {transcriptionSummary.processingStatus.toLowerCase() === 'completed' && (
                <>
                    <Divider />
                    <div className="text-center">
                        <Text type="secondary" className="text-xs">
                            Summary generated on {new Date(transcriptionSummary.createdAt).toLocaleString()}
                        </Text>
                    </div>
                </>
            )}
        </Card>
    );
}
