"use client";

import { Image, Spin } from "antd";
import { useParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { Article } from "@/app/props";
import { calculateReadingTime } from "@/app/utils/ReadingTimeUtils";
import BackButton from "@/app/components/BackButton/BackButton";
import Link from "next/link";
import ArticleApi from "@/app/api/knowledge/qna";
import dayjs from "dayjs";

export default function ArticleDetailPage() {
  const params = useParams();
  const departmentName = params?.department as string;
  const articleId = params?.articleId as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const findArticleById = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await ArticleApi.getArticleByDepartmentAndId(
        departmentName,
        articleId
      );
      setArticle(data ?? null);
    } catch (error) {
      console.error("Error fetching article:", error);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }, [articleId, departmentName]);

  useEffect(() => {
    findArticleById();
  }, [departmentName, articleId, findArticleById]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Spin size="large" tip="Loading article..." />
      </div>
    );
  }

  if (!articleId || !departmentName || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <Link
          href={`/knowledge/${departmentName}`}
          className="text-blue-700 hover:underline"
        >
          Back to Knowledge Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mt-8 md:px-8">
      <div className="max-w-5xl w-full bg-white rounded-lg shadow-lg relative">
        <div className="absolute top-4 left-4 z-10">
          <BackButton backLink={`/knowledge/${departmentName}`} />
        </div>
        <div className="w-full h-56 md:h-80 rounded-t-lg overflow-hidden bg-gray-100">
          <Image
            src={article.imageUrl}
            alt={article.title}
            className="object-cover"
            preview={false}
          />
        </div>
        <div className="px-6 md:px-10 py-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-3 leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>{dayjs(article.createdAt).format("MMM D, YYYY")}</span>
            <span className="mx-2">•</span>
            <span>{article.department}</span>
            <span className="mx-2">•</span>
            <span>{article.author}</span>
            <span className="mx-2">•</span>
            <span>{calculateReadingTime(article.content)} min read</span>
          </div>
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <article className="prose prose-blue max-w-none text-gray-900">
            <p>{article.content}</p>
          </article>
        </div>
      </div>
    </div>
  );
}
