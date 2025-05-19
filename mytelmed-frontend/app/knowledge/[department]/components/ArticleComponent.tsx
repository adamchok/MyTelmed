'use client'

import { Article, Department } from "@/app/props";
import { Card, Button, Pagination, Image } from "antd";
import { calculateReadingTime } from "@/app/utils/ReadingTimeUtils";
import dayjs from "dayjs";
import Link from "next/link";

interface ArticleComponentProps {
  department: Department;
  paginatedArticles: Article[];
  currentArticlePage: number;
  setCurrentArticlePage: (page: number) => void;
  totalArticleSize: number;
}

const ArticleComponent = ({ paginatedArticles, currentArticlePage, setCurrentArticlePage, totalArticleSize, department }: ArticleComponentProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-5">
        {paginatedArticles.map((article) => (
          <Link
            href={`/knowledge/${department.name}/article/${article.id}`}
            key={article.id}
          >
            <Card
              hoverable
              cover={
                <div className="w-full h-full overflow-hidden">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    className="object-cover"
                    preview={false}
                  />
                </div>
              }
              className="rounded-lg shadow-sm w-full"
            >
              <Card.Meta
                title={
                  <>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <span>{dayjs(article.createdAt).format("MMM D, YYYY")}</span>
                      <span className="mx-2">•</span>
                      <span>{calculateReadingTime(article.content)} min read</span>
                    </div>
                    <span
                      className="font-bold text-lg"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {article.title}
                    </span>
                  </>
                }
                description={
                  <>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2 mt-1">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700"
                          >
                            #{tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{article.tags.length - 3} more</span>
                        )}
                      </div>
                    )}
                    <span
                      className="text-gray-600"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {article.content}
                    </span>
                  </>
                }
              />
              <Button
                type="link"
                className="mt-2 p-0 text-blue-600"
                style={{ padding: "0px" }}
              >
                Read More
              </Button>
            </Card>
          </Link>
        ))}
      </div>
      <div className="flex justify-end pb-5 mt-4">
        <Pagination
          current={currentArticlePage}
          pageSize={10}
          total={totalArticleSize}
          onChange={setCurrentArticlePage}
          className="text-center"
          style={{ padding: "10px 20px" }}
          showQuickJumper
        />
      </div>
    </>
  )
}

export default ArticleComponent;
