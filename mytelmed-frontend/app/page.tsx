"use client";

import Link from "next/link";
import Image from "next/image";
import { Button, Card, Row, Col, Typography } from "antd";
import {
    Video,
    Pill,
    FileText,
    User,
    Users,
    Shield,
    MapPin,
    Heart,
    Clock,
    Globe,
    CheckCircle,
    ChevronRight,
    Star,
    Stethoscope,
    Activity,
    Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import Footer from "./components/Footer/Footer";
import "./index.css";

const { Title, Paragraph, Text } = Typography;

export default function LandingPage() {
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setIsVisible(true);

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const features = [
        {
            icon: <Video className="text-4xl text-blue-600 w-12 h-12" />,
            title: "Telemedicine Consultations",
            description:
                "Connect with qualified doctors through secure video calls or schedule in-person visits at healthcare facilities across Malaysia.",
            animation: "fade-in-up",
            color: "blue",
        },
        {
            icon: <Pill className="text-4xl text-green-600 w-12 h-12" />,
            title: "Digital Prescriptions",
            description:
                "Receive electronic prescriptions instantly with options for home delivery or pharmacy pickup from registered healthcare providers.",
            animation: "fade-in-up",
            color: "green",
        },
        {
            icon: <FileText className="text-4xl text-purple-600 w-12 h-12" />,
            title: "Medical Records",
            description:
                "Securely store and manage all your medical documents, lab results, and prescriptions in one centralized digital platform.",
            animation: "fade-in-up",
            color: "purple",
        },
        {
            icon: <Users className="text-4xl text-orange-600 w-12 h-12" />,
            title: "Family Healthcare",
            description:
                "Manage healthcare for your entire family with secure access controls and permission-based sharing of medical information.",
            animation: "fade-in-up",
            color: "orange",
        },
        {
            icon: <Shield className="text-4xl text-red-600 w-12 h-12" />,
            title: "Secure & Compliant",
            description:
                "Bank-level encryption and compliance with Malaysian healthcare regulations ensure your medical data remains private and secure.",
            animation: "fade-in-up",
            color: "red",
        },
        {
            icon: <Globe className="text-4xl text-cyan-600 w-12 h-12" />,
            title: "Nationwide Network",
            description:
                "Access to a comprehensive network of public healthcare facilities, doctors, and specialists across all Malaysian states.",
            animation: "fade-in-up",
            color: "cyan",
        },
    ];

    const stats = [
        {
            number: "500+",
            label: "Healthcare Facilities",
            icon: <MapPin className="w-8 h-8" />,
        },
        {
            number: "2,000+",
            label: "Qualified Doctors",
            icon: <User className="w-8 h-8" />,
        },
        {
            number: "100,000+",
            label: "Patients Served",
            icon: <Heart className="w-8 h-8" />,
        },
        {
            number: "24/7",
            label: "Support Available",
            icon: <Clock className="w-8 h-8" />,
        },
    ];

    const testimonials = [
        {
            name: "Dr. Sarah Ahmad",
            role: "Hospital Kuala Lumpur",
            content: "MyTelmed has revolutionized how we deliver healthcare services to patients across Malaysia.",
            rating: 5,
        },
        {
            name: "Ahmad Razak",
            role: "Patient from Selangor",
            content: "Excellent platform! I can consult with doctors from home and get my medications delivered.",
            rating: 5,
        },
        {
            name: "Dr. Priya Nair",
            role: "Klinik Kesihatan Petaling Jaya",
            content: "The digital prescription system saves time and improves patient care quality significantly.",
            rating: 5,
        },
    ];

    const heroFeatures = [
        {
            icon: <Video className="w-8 h-8" />,
            title: "Video Consultations",
            description: "Connect with doctors instantly",
        },
        {
            icon: <Calendar className="w-8 h-8" />,
            title: "Easy Scheduling",
            description: "Book appointments 24/7",
        },
        {
            icon: <FileText className="w-8 h-8" />,
            title: "Digital Records",
            description: "Secure medical history",
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Fully Secure",
            description: "Bank-level encryption",
        },
    ];

    return (
        <div className="bg-gradient-to-b from-blue-50 to-white relative">
            {/* Enhanced Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute w-96 h-96 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-float blur-3xl"
                    style={{
                        top: "10%",
                        left: "5%",
                        transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
                    }}
                />
                <div
                    className="absolute w-64 h-64 bg-gradient-to-br from-green-200 to-blue-200 rounded-full opacity-20 animate-float delay-200 blur-2xl"
                    style={{
                        top: "60%",
                        right: "10%",
                        transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
                    }}
                />
                <div
                    className="absolute w-48 h-48 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 animate-float delay-400 blur-2xl"
                    style={{
                        bottom: "20%",
                        left: "20%",
                        transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
                    }}
                />
            </div>

            {/* Redesigned Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center bg-blue-800">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 20% 20%, white 1px, transparent 1px),
                              radial-gradient(circle at 80% 80%, white 1px, transparent 1px),
                              radial-gradient(circle at 40% 60%, white 0.5px, transparent 0.5px)`,
                            backgroundSize: "50px 50px, 80px 80px, 30px 30px",
                            animation: "float 30s ease-in-out infinite",
                        }}
                    />
                </div>

                {/* Remove gradient overlays for a solid blue look */}
                <div className="absolute inset-0 bg-blue-900/20" />
                <div className="absolute inset-0 bg-black/10" />

                <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[70vh]">
                        {/* Left Content - Enhanced */}
                        <div className={`lg:col-span-7 space-y-8 ${isVisible ? "animate-fade-in-left" : "opacity-0"}`}>
                            {/* Logo and Branding */}
                            <div className="flex flex-col gap-2 sm:flex-row items-center sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8 text-center sm:text-left">
                                <div className="relative flex items-center justify-center sm:mt-2">
                                    <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-30"></div>
                                    <div className="relative bg-white rounded-2xl p-3 shadow-2xl">
                                        <Image
                                            src="/assets/logos/mytelmed-logo.png"
                                            alt="MyTelmed Logo"
                                            width={64}
                                            height={64}
                                            className="transition-transform hover:scale-105"
                                        />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse shadow-lg flex items-center justify-center">
                                        <Activity className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center sm:items-start justify-center">
                                    <Title
                                        level={1}
                                        className="text-white mb-0 text-5xl lg:text-6xl font-bold tracking-tight"
                                    >
                                        MyTelmed
                                    </Title>
                                    <Text className="text-blue-100 text-lg font-medium">
                                        Malaysian Healthcare Platform
                                    </Text>
                                </div>
                            </div>

                            {/* Main Headline */}
                            <div className="space-y-6 text-center sm:text-left">
                                <Title
                                    level={1}
                                    className="text-white text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
                                >
                                    Convenient Healthcare Made Simple
                                    <span className="block text-3xl lg:text-4xl xl:text-5xl text-blue-100 font-light">
                                        for Malaysians
                                    </span>
                                </Title>

                                <Paragraph className="text-blue-100 text-xl lg:text-2xl leading-relaxed max-w-2xl font-light">
                                    Connect with qualified doctors, manage your health records, and access
                                    <span className="font-semibold text-white"> healthcare services</span> from the
                                    comfort of your home.
                                </Paragraph>
                            </div>

                            {/* Call to Action */}
                            <div className="pt-8">
                                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
                                    <Link href="/register/user-info">
                                        <Button
                                            type="primary"
                                            size="large"
                                            className="bg-white text-blue-600 border-0 hover:bg-blue-50 hover:text-blue-700 font-semibold px-8 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                            icon={<ChevronRight className="w-5 h-5 ml-1" />}
                                        >
                                            Get Started Free
                                        </Button>
                                    </Link>
                                    <div className="flex items-center space-x-2 text-blue-100">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-sm">No credit card required</span>
                                    </div>
                                </div>
                                <div className="mt-4 text-center sm:text-left">
                                    <Text className="text-blue-200 text-sm">
                                        Join thousands of Malaysians already using MyTelmed for better healthcare
                                    </Text>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Modern Card Design */}
                        <div className={`lg:col-span-5 ${isVisible ? "animate-fade-in-right" : "opacity-0"}`}>
                            <div className="relative">
                                {/* Main Feature Card */}
                                <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                                    {/* Glowing border effect */}
                                    <div
                                        className="absolute inset-0 rounded-3xl pointer-events-none border-4 border-blue-500"
                                        style={{ boxShadow: "0 0 48px 16px rgba(59,130,246,0.85)", zIndex: 1 }}
                                    />
                                    {/* Header */}
                                    <div className="text-center mb-8 relative z-10">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                                            <Stethoscope className="w-8 h-8 text-white" />
                                        </div>
                                        <Title level={3} className="text-gray-800 mb-2">
                                            Complete Healthcare Solution
                                        </Title>
                                        <Text className="text-gray-600">Everything you need in one platform</Text>
                                    </div>

                                    {/* Feature Grid */}
                                    <div className="grid grid-cols-2 gap-4 relative z-10">
                                        {heroFeatures.map((feature, index) => (
                                            <div
                                                key={index}
                                                className="group p-4 rounded-2xl bg-gray-50 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:shadow-lg cursor-pointer"
                                            >
                                                <div className="flex flex-col items-center text-center space-y-3">
                                                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110">
                                                        <div className="text-blue-600 group-hover:text-purple-600 transition-colors duration-300">
                                                            {feature.icon}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Text className="font-semibold text-gray-800 block text-sm">
                                                            {feature.title}
                                                        </Text>
                                                        <Text className="text-gray-500 text-xs">
                                                            {feature.description}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Bottom CTA */}
                                    <div className="mt-8 p-6 bg-blue-700 rounded-2xl text-center relative z-10">
                                        <Text className="text-white font-semibold block mb-2">
                                            Join 100,000+ Malaysians
                                        </Text>
                                        <Text className="text-blue-100 text-sm">
                                            Already using MyTelmed for their healthcare needs
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Row gutter={[24, 32]} justify="center" align="middle">
                        {stats.map((stat, index) => (
                            <Col xs={12} sm={6} md={6} key={index}>
                                <div
                                    className={`text-center group ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="text-blue-600 text-4xl mb-2 transition-transform group-hover:scale-110 flex justify-center">
                                        {stat.icon}
                                    </div>
                                    <Title
                                        level={2}
                                        className="text-3xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors"
                                    >
                                        {stat.number}
                                    </Title>
                                    <Text className="text-gray-600 font-medium">{stat.label}</Text>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <Title level={2} className="text-4xl font-bold text-gray-800 mb-4">
                            Comprehensive Healthcare Solutions
                        </Title>
                        <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto">
                            MyTelmed provides end-to-end healthcare services designed specifically for the Malaysian
                            public healthcare system, ensuring quality care is accessible to all Malaysians.
                        </Paragraph>
                    </div>

                    <Row gutter={[24, 32]} align="stretch">
                        {features.map((feature, index) => (
                            <Col xs={24} sm={12} lg={8} key={index}>
                                <Card
                                    className={`h-full shadow-soft hover:shadow-hard transition-all duration-300 border-0 card-hover group ${
                                        isVisible ? "animate-fade-in-up" : "opacity-0"
                                    }`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    styles={{ body: { padding: "2rem" } }}
                                >
                                    <div className="text-center mb-6 group-hover:scale-105 transition-transform flex justify-center">
                                        {feature.icon}
                                    </div>
                                    <Title
                                        level={4}
                                        className="text-xl font-bold text-gray-800 mb-4 text-center group-hover:text-blue-600 transition-colors"
                                    >
                                        {feature.title}
                                    </Title>
                                    <Paragraph className="text-gray-600 text-center leading-relaxed">
                                        {feature.description}
                                    </Paragraph>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <Title level={2} className="text-4xl font-bold text-gray-800 mb-4">
                            Trusted by Healthcare Professionals
                        </Title>
                        <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto">
                            See what doctors and patients across Malaysia are saying about MyTelmed
                        </Paragraph>
                    </div>

                    <Row gutter={[24, 32]} align="stretch">
                        {testimonials.map((testimonial, index) => (
                            <Col xs={24} sm={12} lg={8} key={index}>
                                <Card
                                    className={`h-full shadow-soft hover:shadow-medium transition-all duration-300 border-0 ${
                                        isVisible ? "animate-fade-in-up" : "opacity-0"
                                    }`}
                                    style={{ animationDelay: `${(index + 6) * 0.1}s` }}
                                    styles={{ body: { padding: "2rem" } }}
                                >
                                    <div className="flex mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="text-yellow-400 w-5 h-5 fill-current" />
                                        ))}
                                    </div>
                                    <Paragraph className="text-gray-600 mb-6 italic">
                                        &quot;{testimonial.content}&quot;
                                    </Paragraph>
                                    <div>
                                        <Text className="font-semibold text-gray-800 block">{testimonial.name}</Text>
                                        <Text className="text-gray-500 text-sm">{testimonial.role}</Text>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <Title level={2} className="text-4xl font-bold text-gray-800 mb-4">
                            How MyTelmed Works
                        </Title>
                        <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Simple, secure, and seamless healthcare access in just a few steps
                        </Paragraph>
                    </div>

                    <Row gutter={[24, 48]} justify="center">
                        <Col xs={24}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {[
                                    {
                                        number: "1",
                                        title: "Register with MyKad",
                                        description:
                                            "Create your secure account using your Malaysian IC for identity verification and data protection.",
                                        color: "bg-blue-600",
                                    },
                                    {
                                        number: "2",
                                        title: "Find Healthcare Providers",
                                        description:
                                            "Browse qualified doctors and healthcare facilities near you, check availability, and read specializations.",
                                        color: "bg-green-600",
                                    },
                                    {
                                        number: "3",
                                        title: "Book & Consult",
                                        description:
                                            "Schedule video consultations or in-person visits, share medical history, and receive professional care.",
                                        color: "bg-purple-600",
                                    },
                                    {
                                        number: "4",
                                        title: "Receive Care",
                                        description:
                                            "Get digital prescriptions, manage medical records, and enjoy home delivery of medications when needed.",
                                        color: "bg-orange-600",
                                    },
                                ].map((step, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 group border border-gray-100"
                                    >
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div
                                                className={`${step.color} text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl shadow-medium transition-transform group-hover:scale-110`}
                                            >
                                                {step.number}
                                            </div>
                                            <div>
                                                <Title
                                                    level={4}
                                                    className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors"
                                                >
                                                    {step.title}
                                                </Title>
                                                <Paragraph className="text-gray-600 leading-relaxed">
                                                    {step.description}
                                                </Paragraph>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>

            {/* Healthcare Professionals Section */}
            <section className="py-20 bg-white relative mb-24">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <div className="mb-12">
                        <Title level={2} className="text-4xl font-bold text-gray-800 mb-4">
                            Healthcare Professionals
                        </Title>
                        <Paragraph className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Access your dedicated portal to manage patients, prescriptions, and healthcare services
                            across Malaysia.
                        </Paragraph>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <Link href="/login/patient">
                            <Card
                                className="h-full shadow-soft hover:shadow-medium transition-all duration-300 border-0 card-hover group cursor-pointer"
                                styles={{ body: { padding: "2rem" } }}
                            >
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg group-hover:scale-105 transition-transform">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <Title
                                        level={4}
                                        className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors"
                                    >
                                        Patient Portal
                                    </Title>
                                    <Text className="text-gray-600 text-sm">
                                        Book appointments and manage health records
                                    </Text>
                                </div>
                            </Card>
                        </Link>

                        <Link href="/login/doctor">
                            <Card
                                className="h-full shadow-soft hover:shadow-medium transition-all duration-300 border-0 card-hover group cursor-pointer"
                                styles={{ body: { padding: "2rem" } }}
                            >
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg group-hover:scale-105 transition-transform">
                                        <Stethoscope className="w-8 h-8 text-white" />
                                    </div>
                                    <Title
                                        level={4}
                                        className="text-lg font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors"
                                    >
                                        Doctor Portal
                                    </Title>
                                    <Text className="text-gray-600 text-sm">Manage consultations and patient care</Text>
                                </div>
                            </Card>
                        </Link>

                        <Link href="/login/pharmacist">
                            <Card
                                className="h-full shadow-soft hover:shadow-medium transition-all duration-300 border-0 card-hover group cursor-pointer"
                                styles={{ body: { padding: "2rem" } }}
                            >
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-4 shadow-lg group-hover:scale-105 transition-transform">
                                        <Pill className="w-8 h-8 text-white" />
                                    </div>
                                    <Title
                                        level={4}
                                        className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors"
                                    >
                                        Pharmacist Portal
                                    </Title>
                                    <Text className="text-gray-600 text-sm">Process prescriptions and deliveries</Text>
                                </div>
                            </Card>
                        </Link>

                        <Link href="/login/admin">
                            <Card
                                className="h-full shadow-soft hover:shadow-medium transition-all duration-300 border-0 card-hover group cursor-pointer"
                                styles={{ body: { padding: "2rem" } }}
                            >
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-4 shadow-lg group-hover:scale-105 transition-transform">
                                        <Shield className="w-8 h-8 text-white" />
                                    </div>
                                    <Title
                                        level={4}
                                        className="text-lg font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors"
                                    >
                                        Admin Portal
                                    </Title>
                                    <Text className="text-gray-600 text-sm">System management and oversight</Text>
                                </div>
                            </Card>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer showKnowledgeHubLink={true} />
        </div>
    );
}
