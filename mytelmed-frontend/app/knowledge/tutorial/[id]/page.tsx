"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Typography, Tag, Spin, Alert, Button, message } from "antd";
import {
    PlayCircleOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    ArrowLeftOutlined,
    ShareAltOutlined,
} from "@ant-design/icons";
import TutorialApi from "../../../api/tutorial";
import { Tutorial } from "../../../api/tutorial/props";
import BackButton from "../../../components/BackButton/BackButton";
import BreadcrumbNav from "../../components/BreadcrumbNav";
import Footer from "../../../components/Footer/Footer";

const { Title, Text } = Typography;

export default function TutorialDetailPage() {
    const [tutorial, setTutorial] = useState<Tutorial | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    useEffect(() => {
        const fetchTutorial = async () => {
            if (!id) return;

            try {
                setLoading(true);
                setError(null);
                const response = await TutorialApi.getTutorialById(id as string);

                const responseData = response.data;

                if (responseData.isSuccess) {
                    setTutorial(responseData.data || null);
                } else {
                    setError("Tutorial not found");
                }
            } catch (err) {
                console.error("Error fetching tutorial:", err);
                setError("Failed to load tutorial");
            } finally {
                setLoading(false);
            }
        };

        fetchTutorial();
    }, [id]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: tutorial?.title,
                text: `Check out this tutorial: ${tutorial?.title}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            message.success("Link copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <Spin size="large" tip="Loading tutorial..." />
            </div>
        );
    }

    if (error || !tutorial) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <div className="max-w-md mx-auto p-6">
                    <Alert
                        message="Tutorial Not Found"
                        description={error || "The requested tutorial could not be found."}
                        type="error"
                        showIcon
                        action={<Button onClick={() => router.push("/knowledge")}>Back to Knowledge Hub</Button>}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-50">
            {/* Hero Banner */}
            <section className="relative bg-blue-800 py-12 px-4 flex flex-col items-center justify-center text-center">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
                    <div className="flex flex-col items-center justify-center text-center w-full">
                        <h1 className="text-white text-4xl md:text-5xl font-bold mb-1">Knowledge Hub</h1>
                        <p className="text-blue-100 text-lg max-w-xl mx-auto">
                            Explore trusted medical articles and interactive tutorials to empower your healthcare
                            journey with MyTelmed.
                        </p>
                        {/* Desktop Breadcrumb */}
                        <div className="hidden md:block">
                            <BreadcrumbNav currentPage="tutorial" currentPageTitle={tutorial.title} showHome={true} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Tutorial Content Card */}
            <div className="relative max-w-6xl mx-auto -mt-16 z-10 px-4 mb-24">
                <div
                    className="bg-white/95 rounded-3xl shadow-2xl border-4 border-blue-400 p-4 sm:p-8 md:p-12"
                    style={{ boxShadow: "0 0 48px 16px rgba(59,130,246,0.15)" }}
                >
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <BackButton backLink="/knowledge" />
                            <Button
                                icon={<ShareAltOutlined />}
                                onClick={handleShare}
                                type="text"
                                className="hover:bg-blue-800 hover:text-gray-50 rounded-lg"
                            >
                                Share
                            </Button>
                        </div>

                        <div className="mb-6 flex flex-wrap gap-2">
                            <Tag color="purple" className="font-medium text-sm px-3 py-1 rounded-lg">
                                <PlayCircleOutlined className="mr-2" />
                                Tutorial
                            </Tag>
                            <Tag color="default" className="font-medium text-sm px-3 py-1 rounded-lg">
                                {tutorial.category}
                            </Tag>
                            {!!tutorial.duration && (
                                <Tag color="blue" className="font-medium text-sm px-3 py-1 rounded-lg">
                                    <ClockCircleOutlined className="mr-2" />
                                    {tutorial.duration} min
                                </Tag>
                            )}
                        </div>

                        <Title
                            level={1}
                            className="mb-6 text-blue-900 text-2xl sm:text-3xl md:text-4xl font-bold leading-tight"
                        >
                            {tutorial.title}
                        </Title>

                        <div className="flex items-center text-gray-500 text-sm bg-gray-50 rounded-lg p-3">
                            <CalendarOutlined className="mr-2 text-blue-500" />
                            <Text type="secondary" className="font-medium">
                                Published on{" "}
                                {new Date(Number(tutorial.createdAt) * 1000).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </Text>
                            {tutorial.updatedAt !== tutorial.createdAt && (
                                <Text type="secondary" className="ml-4 font-medium">
                                    • Updated {new Date(Number(tutorial.updatedAt) * 1000).toLocaleDateString()}
                                </Text>
                            )}
                        </div>
                    </div>

                    {/* Video Player */}
                    {tutorial.videoUrl && (
                        <div className="mb-8">
                            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                <div className="aspect-video bg-black">
                                    <video controls className="w-full h-full" poster={tutorial.thumbnailUrl}>
                                        <source src={tutorial.videoUrl} type="video/mp4" />
                                        <track kind="captions" src="" srcLang="en" label="English captions" default />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tutorial Description */}
                    <div className="mb-8">
                        <div className="prose prose-lg max-w-none">
                            <div
                                className="text-gray-700 leading-relaxed text-base bg-white rounded-xl border border-gray-100 p-4"
                                style={{ whiteSpace: "pre-wrap" }}
                            >
                                {tutorial.description}
                            </div>
                        </div>
                    </div>

                    {/* Tutorial Thumbnail if no video */}
                    {!tutorial.videoUrl && tutorial.thumbnailUrl && (
                        <div className="mb-8">
                            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                <div className="relative w-full h-64">
                                    <Image
                                        src={tutorial.thumbnailUrl}
                                        alt={tutorial.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 gap-4">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => router.push("/knowledge")}
                            className="rounded-lg w-full sm:w-auto"
                        >
                            Back to Knowledge Hub
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => router.push("/knowledge")}
                            className="rounded-lg bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                        >
                            Explore More Tutorials
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer showKnowledgeHubLink={false} />
        </div>
    );
}
