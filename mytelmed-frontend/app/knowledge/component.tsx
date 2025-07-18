"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Typography, Input, Select, Row, Col, Empty, Spin, Tag, Space, Image } from "antd";
import {
    SearchOutlined,
    BookOutlined,
    PlayCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import { KnowledgeHubPageProps, ContentCardProps, Article, Tutorial } from "./props";
import BreadcrumbNav from "./components/BreadcrumbNav";
import Footer from "../components/Footer/Footer";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ContentCard = ({ content, type, onClick }: ContentCardProps) => {
    const isArticle = type === "article";
    const article = content as Article;
    const tutorial = content as Tutorial;

    const renderCover = () => {
        if (isArticle) {
            if (article.thumbnailUrl) {
                return (
                    <div className="relative overflow-hidden h-48 rounded-t-lg">
                        <Image
                            src={article.thumbnailUrl}
                            alt={content.title}
                            className="object-cover"
                            preview={false}
                        />
                    </div>
                );
            }
            return (
                <div className="relative overflow-hidden h-48 rounded-t-lg">
                    <FileTextOutlined className="text-blue-400 text-6xl" />
                </div>
            );
        } else {
            if (tutorial.thumbnailUrl) {
                return (
                    <div className="relative overflow-hidden h-48 rounded-t-lg">
                        <Image
                            src={tutorial.thumbnailUrl}
                            alt={content.title}
                            className="object-cover"
                            preview={false}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <PlayCircleOutlined className="text-white text-4xl" />
                        </div>
                    </div>
                );
            }
            return (
                <div className="relative overflow-hidden h-48 rounded-t-lg">
                    <FileTextOutlined className="text-blue-400 text-6xl" />
                </div>
            );
        }
    };

    return (
        <Card
            hoverable
            className="h-full rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
            onClick={onClick}
            cover={renderCover()}
            styles={{
                body: {
                    padding: 16,
                },
            }}
        >
            <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                    <Tag color={isArticle ? "blue" : "purple"} className="mb-0 font-medium text-xs px-2 py-1 rounded">
                        {isArticle ? (
                            <>
                                <BookOutlined className="mr-1" />
                                Article
                            </>
                        ) : (
                            <>
                                <PlayCircleOutlined className="mr-1" />
                                Tutorial
                            </>
                        )}
                    </Tag>
                    {!isArticle && tutorial.duration !== undefined && (
                        <Text type="secondary" className="text-xs">
                            <ClockCircleOutlined className="mr-1" />
                            {tutorial.duration} min
                        </Text>
                    )}
                </div>

                <Title level={5} className="mb-2 line-clamp-2 h-12 text-blue-900">
                    {content.title}
                </Title>

                <div className="prose prose-sm text-gray-600 mb-3 line-clamp-3 max-w-none">
                    {isArticle
                        ? article.content.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
                        : tutorial.description}
                </div>

                <div className="flex items-center justify-between mt-2">
                    <Tag color="default" className="text-xs">
                        {isArticle ? article.subject : tutorial.category}
                    </Tag>
                    <Text type="secondary" className="text-xs">
                        {new Date(Number(content.createdAt) * 1000).toLocaleDateString()}
                    </Text>
                </div>
            </div>
        </Card>
    );
};

export default function KnowledgeHubPageComponent({
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedType,
    setSelectedType,
    articles,
    tutorials,
    loading,
    categories,
}: Readonly<KnowledgeHubPageProps>) {
    const router = useRouter();

    // Filter and search content
    const filteredContent = useMemo(() => {
        let allContent: Array<{
            content: Article | Tutorial;
            type: "article" | "tutorial";
        }> = [];

        if (selectedType === "all" || selectedType === "article") {
            allContent.push(
                ...articles.map((article) => ({
                    content: article,
                    type: "article" as const,
                }))
            );
        }
        if (selectedType === "all" || selectedType === "tutorial") {
            allContent.push(
                ...tutorials.map((tutorial) => ({
                    content: tutorial,
                    type: "tutorial" as const,
                }))
            );
        }

        // Filter by category
        if (selectedCategory) {
            allContent = allContent.filter((item) => {
                const category =
                    item.type === "article" ? (item.content as Article).subject : (item.content as Tutorial).category;
                return category === selectedCategory;
            });
        }

        // Filter by search term
        if (searchTerm) {
            allContent = allContent.filter((item) => {
                const title = item.content.title.toLowerCase();
                const description =
                    item.type === "article"
                        ? (item.content as Article).content.replace(/<[^>]*>/g, "").toLowerCase()
                        : (item.content as Tutorial).description.toLowerCase();
                const search = searchTerm.toLowerCase();
                return title.includes(search) || description.includes(search);
            });
        }

        return allContent;
    }, [articles, tutorials, selectedType, selectedCategory, searchTerm]);

    const handleContentClick = (content: Article | Tutorial, type: "article" | "tutorial") => {
        if (type === "article") {
            router.push(`/knowledge/article/${content.id}`);
        } else {
            router.push(`/knowledge/tutorial/${content.id}`);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center py-20">
                    <Spin size="large" tip="Loading knowledge hub..." />
                </div>
            );
        }

        if (filteredContent.length > 0) {
            return (
                <Row gutter={[24, 24]}>
                    {filteredContent.map(({ content, type }) => (
                        <Col key={`${type}-${content.id}`} xs={24} sm={12} lg={8} xl={6}>
                            <ContentCard
                                content={content}
                                type={type}
                                onClick={() => handleContentClick(content, type)}
                            />
                        </Col>
                    ))}
                </Row>
            );
        }

        return (
            <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center">
                <Empty
                    description={
                        <div>
                            <Title level={4} className="text-gray-400 mb-2 text-center">
                                No content found
                            </Title>
                            <Text type="secondary" className="text-center">
                                {searchTerm || selectedCategory
                                    ? "Try adjusting your search or filters"
                                    : "No articles or tutorials available at the moment"}
                            </Text>
                        </div>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    {(searchTerm || selectedCategory) && (
                        <Space>
                            <Button onClick={() => setSearchTerm("")}>Clear Search</Button>
                            <Button onClick={() => setSelectedCategory(undefined)}>Clear Filters</Button>
                        </Space>
                    )}
                </Empty>
            </div>
        );
    };

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
                        <BreadcrumbNav currentPage="knowledge" showHome={true} />
                    </div>
                </div>
            </section>

            {/* Search and Filters Card */}
            <div className="relative max-w-5xl mx-auto -mt-16 z-10">
                <div
                    className="bg-white/95 rounded-2xl shadow-2xl border border-blue-100 p-6 md:p-10 flex flex-col gap-6 items-center"
                    style={{ boxShadow: "0 0 32px 8px rgba(59,130,246,0.10)" }}
                >
                    <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-center">
                        <div className="w-full md:w-1/2">
                            <Search
                                placeholder="Search articles and tutorials..."
                                prefix={<SearchOutlined />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                allowClear
                                size="large"
                                className="rounded-lg shadow-sm w-full"
                            />
                        </div>
                        <div className="w-full md:w-1/4">
                            <Select
                                placeholder="Select category"
                                value={selectedCategory}
                                onChange={setSelectedCategory}
                                allowClear
                                size="large"
                                className="w-full rounded-lg shadow-sm"
                                suffixIcon={<FilterOutlined />}
                            >
                                {categories.map((category) => (
                                    <Option key={category} value={category}>
                                        {category}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="w-full md:w-1/4">
                            <Select
                                placeholder="Type"
                                value={selectedType}
                                onChange={setSelectedType}
                                size="large"
                                className="w-full rounded-lg shadow-sm"
                            >
                                <Option value="all">All</Option>
                                <Option value="article">Articles</Option>
                                <Option value="tutorial">Tutorials</Option>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card with Glowing Border */}
            <div className="relative max-w-7xl mx-auto mt-16 px-4 mb-24">
                <div
                    className="relative bg-white/95 rounded-3xl shadow-2xl border-4 border-blue-400 p-8 md:p-12"
                    style={{ boxShadow: "0 0 48px 16px rgba(59,130,246,0.15)" }}
                >
                    {/* Content Grid */}
                    {renderContent()}
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}
