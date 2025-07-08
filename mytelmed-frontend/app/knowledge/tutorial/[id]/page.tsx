"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Typography, Tag, Spin, Alert, Button, Space, Card } from "antd";
import {
  PlayCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import TutorialApi from "../../../api/tutorial";
import { Tutorial } from "../../../api/tutorial/props";
import BackButton from "../../../components/BackButton/BackButton";

const { Title, Paragraph, Text } = Typography;

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

        if (response.data?.isSuccess) {
          setTutorial(response.data.data || null);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading tutorial..." />
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <Alert
            message="Tutorial Not Found"
            description={error || "The requested tutorial could not be found."}
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
      <div className="container mx-auto px-4 py-6 max-w-6xl">
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
              <Tag color="purple" className="mb-2">
                <PlayCircleOutlined className="mr-1" />
                Tutorial
              </Tag>
              <Tag color="default">{tutorial.category}</Tag>
              {tutorial.duration && (
                <Tag color="blue" className="ml-2">
                  <ClockCircleOutlined className="mr-1" />
                  {tutorial.duration} min
                </Tag>
              )}
            </div>

            <Title level={1} className="mb-4 text-blue-900">
              {tutorial.title}
            </Title>

            <div className="flex items-center text-gray-500 text-sm">
              <CalendarOutlined className="mr-1" />
              <Text type="secondary">
                Published on{" "}
                {new Date(tutorial.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              {tutorial.updatedAt !== tutorial.createdAt && (
                <Text type="secondary" className="ml-4">
                  • Updated {new Date(tutorial.updatedAt).toLocaleDateString()}
                </Text>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Video Player */}
            {tutorial.videoUrl && (
              <Card className="mb-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full h-full"
                    poster={tutorial.thumbnailUrl}
                  >
                    <source src={tutorial.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </Card>
            )}

            {/* Tutorial Description */}
            <div className="prose prose-lg max-w-none">
              <Title level={3} className="text-gray-800 mb-4">
                About This Tutorial
              </Title>
              <Paragraph
                className="text-gray-700 leading-relaxed text-base"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {tutorial.description}
              </Paragraph>
            </div>

            {/* Tutorial Thumbnail if no video */}
            {!tutorial.videoUrl && tutorial.thumbnailUrl && (
              <Card className="mb-6">
                <img
                  src={tutorial.thumbnailUrl}
                  alt={tutorial.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </Card>
            )}
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
                Explore More Tutorials
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
