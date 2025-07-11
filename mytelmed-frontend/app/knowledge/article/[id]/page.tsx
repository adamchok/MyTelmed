"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Typography, Tag, Spin, Alert, Button, message } from "antd";
import { BookOutlined, CalendarOutlined, ArrowLeftOutlined, ShareAltOutlined } from "@ant-design/icons";
import ArticleApi from "../../../api/article";
import { Article } from "../../../api/article/props";
import BreadcrumbNav from "../../components/BreadcrumbNav";
import BackButton from "../../../components/BackButton/BackButton";
import Footer from "../../../components/Footer/Footer";

const { Title, Text } = Typography;

export default function ArticleDetailPage() {
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) return;

            try {
                setLoading(true);
                setError(null);
                const response = await ArticleApi.getArticleById(id as string);

                const responseData = response.data;

                if (responseData.isSuccess) {
                    setArticle(responseData.data || null);
                } else {
                    setError("Article not found");
                }
            } catch (err) {
                console.error("Error fetching article:", err);
                setError("Failed to load article");
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article?.title,
                text: `Check out this article: ${article?.title}`,
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
                <Spin size="large" tip="Loading article..." />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <div className="max-w-md mx-auto p-6">
                    <Alert
                        message="Article Not Found"
                        description={error || "The requested article could not be found."}
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
                            <BreadcrumbNav currentPage="article" currentPageTitle={article.title} showHome={true} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Article Content Card */}
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
                            <Tag color="blue" className="font-medium text-sm px-3 py-1 rounded-lg">
                                <BookOutlined className="mr-2" />
                                Article
                            </Tag>
                            <Tag color="default" className="font-medium text-sm px-3 py-1 rounded-lg">
                                {article.subject}
                            </Tag>
                        </div>

                        <Title
                            level={1}
                            className="mb-6 text-blue-900 text-2xl sm:text-3xl md:text-4xl font-bold leading-tight"
                        >
                            {article.title}
                        </Title>

                        <div className="flex items-center text-gray-500 text-sm bg-gray-50 rounded-lg p-3">
                            <CalendarOutlined className="mr-2 text-blue-500" />
                            <Text type="secondary" className="font-medium">
                                Published on{" "}
                                {new Date(Number(article.createdAt) * 1000).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </Text>
                            {article.updatedAt !== article.createdAt && (
                                <Text type="secondary" className="ml-4 font-medium">
                                    • Updated {new Date(Number(article.updatedAt) * 1000).toLocaleDateString()}
                                </Text>
                            )}
                        </div>
                    </div>

                    {/* Article Content */}
                    <div className="mb-8">
                        <div className="prose prose-lg max-w-none">
                            <div
                                className="text-gray-700 leading-relaxed text-base bg-white rounded-xl border border-gray-100 p-4"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                        </div>
                    </div>

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
                            Explore More Articles
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer showKnowledgeHubLink={false} />
        </div>
    );
}
