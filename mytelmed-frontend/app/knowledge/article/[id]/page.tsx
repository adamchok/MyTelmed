"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Typography, Tag, Spin, Alert, Button, Space, message } from "antd";
import {
    BookOutlined,
    CalendarOutlined,
    ArrowLeftOutlined,
    ShareAltOutlined,
} from "@ant-design/icons";
import ArticleApi from "../../../api/article";
import { Article } from "../../../api/article/props";
import BackButton from "../../../components/BackButton/BackButton";

const { Title, Paragraph, Text } = Typography;

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Spin size="large" tip="Loading article..." />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto p-6">
                    <Alert
                        message="Article Not Found"
                        description={error || "The requested article could not be found."}
                        type="error"
                        showIcon
                        action={
                            <Button onClick={() => router.push("/knowledge")}>
                                Back to Knowledge Hub
                            </Button>
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <BackButton backLink="/knowledge" />
                            <Button
                                icon={<ShareAltOutlined />}
                                onClick={handleShare}
                                type="text"
                            >
                                Share
                            </Button>
                        </div>

                        <div className="mb-4">
                            <Tag color="blue" className="mb-2">
                                <BookOutlined className="mr-1" />
                                Article
                            </Tag>
                            <Tag color="default">{article.speciality}</Tag>
                        </div>

                        <Title level={1} className="mb-4 text-blue-900">
                            {article.title}
                        </Title>

                        <div className="flex items-center text-gray-500 text-sm">
                            <CalendarOutlined className="mr-1" />
                            <Text type="secondary">
                                Published on{" "}
                                {new Date(article.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </Text>
                            {article.updatedAt !== article.createdAt && (
                                <Text type="secondary" className="ml-4">
                                    • Updated {new Date(article.updatedAt).toLocaleDateString()}
                                </Text>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="prose prose-lg max-w-none">
                            <Paragraph
                                className="text-gray-700 leading-relaxed text-base"
                                style={{ whiteSpace: "pre-wrap" }}
                            >
                                {article.content}
                            </Paragraph>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <Space>
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => router.push("/knowledge")}
                                >
                                    Back to Knowledge Hub
                                </Button>
                            </Space>
                            <Button type="primary" onClick={() => router.push("/knowledge")}>
                                Explore More Articles
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
