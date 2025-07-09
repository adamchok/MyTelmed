"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Card,
    Button,
    Typography,
    Input,
    Select,
    Row,
    Col,
    Empty,
    Spin,
    Tag,
    Space,
} from "antd";
import {
    SearchOutlined,
    BookOutlined,
    PlayCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import {
    KnowledgeHubPageProps,
    ContentCardProps,
    Article,
    Tutorial,
} from "./props";
import BackButton from "../components/BackButton/BackButton";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const ContentCard = ({ content, type, onClick }: ContentCardProps) => {
    const isArticle = type === "article";
    const article = content as Article;
    const tutorial = content as Tutorial;

    const renderCover = () => {
        if (!isArticle && tutorial.thumbnailUrl) {
            return (
                <div className="relative overflow-hidden h-48">
                    <Image
                        src={tutorial.thumbnailUrl}
                        alt={content.title}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <PlayCircleOutlined className="text-white text-4xl" />
                    </div>
                </div>
            );
        }

        return (
            <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                {isArticle ? (
                    <FileTextOutlined className="text-blue-400 text-6xl" />
                ) : (
                    <PlayCircleOutlined className="text-blue-400 text-6xl" />
                )}
            </div>
        );
    };

    return (
        <Card
            hoverable
            className="h-full rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            onClick={onClick}
            cover={renderCover()}
        >
            <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                    <Tag color={isArticle ? "blue" : "purple"} className="mb-0">
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
                    {!isArticle && tutorial.duration && (
                        <Text type="secondary" className="text-sm">
                            <ClockCircleOutlined className="mr-1" />
                            {tutorial.duration} min
                        </Text>
                    )}
                </div>

                <Title level={5} className="mb-2 line-clamp-2 h-12">
                    {content.title}
                </Title>

                <Paragraph
                    className="text-gray-600 mb-3 line-clamp-3"
                    ellipsis={{ rows: 3 }}
                >
                    {isArticle ? article.content : tutorial.description}
                </Paragraph>

                <div className="flex items-center justify-between">
                    <Tag color="default" className="text-xs">
                        {isArticle ? article.speciality : tutorial.category}
                    </Tag>
                    <Text type="secondary" className="text-xs">
                        {new Date(content.createdAt).toLocaleDateString()}
                    </Text>
                </div>
            </div>
        </Card>
    );
};

const KnowledgeHubPageComponent = ({
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
}: KnowledgeHubPageProps) => {
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
                    item.type === "article"
                        ? (item.content as Article).speciality
                        : (item.content as Tutorial).category;
                return category === selectedCategory;
            });
        }

        // Filter by search term
        if (searchTerm) {
            allContent = allContent.filter((item) => {
                const title = item.content.title.toLowerCase();
                const description =
                    item.type === "article"
                        ? (item.content as Article).content.toLowerCase()
                        : (item.content as Tutorial).description.toLowerCase();
                const search = searchTerm.toLowerCase();
                return title.includes(search) || description.includes(search);
            });
        }

        return allContent;
    }, [articles, tutorials, selectedType, selectedCategory, searchTerm]);

    const handleContentClick = (
        content: Article | Tutorial,
        type: "article" | "tutorial"
    ) => {
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
                    <Spin size="large" tip="Loading knowledge content..." />
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
            <div className="bg-white rounded-lg shadow-sm p-12">
                <Empty
                    description={
                        <div>
                            <Title level={4} className="text-gray-400 mb-2">
                                No content found
                            </Title>
                            <Text type="secondary">
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
                            <Button onClick={() => setSearchTerm("")}>
                                Clear Search
                            </Button>
                            <Button onClick={() => setSelectedCategory(undefined)}>
                                Clear Filters
                            </Button>
                        </Space>
                    )}
                </Empty>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <BackButton backLink="/dashboard" />
                            <Title level={2} className="mb-0 text-blue-900">
                                Knowledge Hub
                            </Title>
                            <div />
                        </div>

                        <Paragraph className="text-gray-600 text-center mb-6 max-w-2xl mx-auto">
                            Explore our comprehensive collection of medical articles and
                            interactive tutorials to enhance your healthcare knowledge and
                            understanding.
                        </Paragraph>

                        {/* Search and Filters */}
                        <Row gutter={[16, 16]} className="mb-6">
                            <Col xs={24} md={12} lg={10}>
                                <Search
                                    placeholder="Search articles and tutorials..."
                                    prefix={<SearchOutlined />}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    allowClear
                                    size="large"
                                />
                            </Col>
                            <Col xs={12} md={6} lg={7}>
                                <Select
                                    placeholder="Select category"
                                    value={selectedCategory}
                                    onChange={setSelectedCategory}
                                    allowClear
                                    size="large"
                                    className="w-full"
                                    suffixIcon={<FilterOutlined />}
                                >
                                    {categories.map((category) => (
                                        <Option key={category} value={category}>
                                            {category}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col xs={12} md={6} lg={7}>
                                <Select
                                    value={selectedType}
                                    onChange={setSelectedType}
                                    size="large"
                                    className="w-full"
                                >
                                    <Option value="all">All Content</Option>
                                    <Option value="article">Articles Only</Option>
                                    <Option value="tutorial">Tutorials Only</Option>
                                </Select>
                            </Col>
                        </Row>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 mb-6">
                            <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                                <BookOutlined className="text-blue-500 mr-2" />
                                <Text strong>{articles.length} Articles</Text>
                            </div>
                            <div className="flex items-center bg-purple-50 px-4 py-2 rounded-lg">
                                <PlayCircleOutlined className="text-purple-500 mr-2" />
                                <Text strong>{tutorials.length} Tutorials</Text>
                            </div>
                            {searchTerm && (
                                <div className="flex items-center bg-green-50 px-4 py-2 rounded-lg">
                                    <SearchOutlined className="text-green-500 mr-2" />
                                    <Text strong>{filteredContent.length} Results</Text>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                {renderContent()}
            </div>
        </div>
    );
};

export default KnowledgeHubPageComponent;
