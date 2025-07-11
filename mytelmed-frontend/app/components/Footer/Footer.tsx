"use client";

import Image from "next/image";
import Link from "next/link";
import { Typography, Button, Row, Col, Divider } from "antd";
import { PhoneOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface FooterProps {
    showKnowledgeHubLink?: boolean;
}

const Footer: React.FC<FooterProps> = ({ showKnowledgeHubLink = false }) => {
    return (
        <footer className="bg-gray-900 text-white py-12 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Row gutter={[24, 48]} align="top">
                    <Col xs={24} sm={24} md={8}>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Image
                                    src="/assets/logos/mytelmed-logo.png"
                                    alt="MyTelmed Logo"
                                    width={48}
                                    height={48}
                                    className="rounded-lg transition-transform hover:scale-105 bg-white p-1"
                                />
                                <Title level={3} className="text-white mb-0">
                                    MyTelmed
                                </Title>
                            </div>
                            <Paragraph className="text-gray-300">
                                Empowering Malaysians with accessible, quality healthcare through innovative digital
                                solutions and a comprehensive network of trusted healthcare providers.
                            </Paragraph>
                            <div className="flex space-x-4">
                                <Link href="/privacy">
                                    <Button
                                        type="link"
                                        className="text-gray-300 hover:text-white p-0 transition-colors"
                                    >
                                        Privacy Policy
                                    </Button>
                                </Link>
                                <Link href="/terms">
                                    <Button
                                        type="link"
                                        className="text-gray-300 hover:text-white p-0 transition-colors"
                                    >
                                        Terms of Service
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Title level={4} className="text-white mb-4">
                            Services
                        </Title>
                        <div className="space-y-2">
                            {[
                                "Telemedicine Consultations",
                                "Digital Prescriptions",
                                "Medical Records Management",
                                "Family Healthcare Access",
                                "Medication Delivery",
                            ].map((service) => (
                                <div key={service}>
                                    <Button
                                        type="link"
                                        className="text-gray-300 hover:text-white p-0 transition-colors"
                                    >
                                        {service}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Title level={4} className="text-white mb-4">
                            Contact & Support
                        </Title>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors cursor-pointer">
                                <PhoneOutlined className="w-5 h-5" />
                                <span>1-800-999-0000</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-300">
                                <EnvironmentOutlined className="w-5 h-5" />
                                <span>Available at Selangor, Malaysia</span>
                            </div>
                            {showKnowledgeHubLink && (
                                <Link href="/knowledge">
                                    <Button
                                        type="primary"
                                        className="bg-blue-600 border-blue-600 mt-4 hover:bg-blue-700 transition-colors text-white"
                                    >
                                        Knowledge Hub
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </Col>
                </Row>

                <Divider className="border-gray-700 my-8" />

                <div className="flex flex-col md:flex-row justify-between items-center">
                    <Text className="text-gray-400">
                        &copy; {new Date().getFullYear()} MyTelmed. All rights reserved.
                    </Text>
                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <Text className="text-gray-400 text-sm">Powered by Malaysian innovation</Text>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
