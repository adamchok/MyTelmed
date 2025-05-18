'use client'

import { Tabs, Card, Button, List, Avatar, Pagination, Input, DatePicker, Modal, Typography, Image, Spin } from "antd";
import { useState, useRef, RefObject, useEffect, useCallback, ChangeEvent } from "react";
import { KnowledgePageComponentProps } from "./props";
import { QA } from "../props";
import { calculateReadingTime } from "@/app/utils/ReadingTimeUtils";
import dayjs, { Dayjs } from "dayjs";
import Link from "next/link";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import BackButton from "@/app/components/BackButton/BackButton";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;
const { Title, Paragraph } = Typography;

const DepartmentKnowledgePageComponent = ({
  department,
  search,
  setSearch,
  dateRange,
  setDateRange,
  paginatedArticles,
  totalArticleSize,
  currentArticlePage,
  setCurrentArticlePage,
  paginatedQa,
  totalQaSize,
  currentQaPage,
  setCurrentQaPage,
  loading,
}: KnowledgePageComponentProps) => {
  const topRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("articles");
  const [qaModalOpen, setQaModalOpen] = useState(false);
  const [selectedQA, setSelectedQA] = useState<QA | null>(null);

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const newSearch: string = e.target.value;
    setSearch(newSearch);
  }, [setSearch]);

  const handleQAClick = (qaItem: QA) => {
    setSelectedQA(qaItem);
    setQaModalOpen(true);
  };

  const handleTabChange = useCallback((key: string): void => {
    setActiveTab(key);
    if (key === "articles") setCurrentArticlePage(1);
    if (key === "qa") setCurrentQaPage(1);
  }, [setActiveTab, setCurrentArticlePage, setCurrentQaPage]);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentArticlePage, currentQaPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Title level={2} className="text-2xl font-bold">Department Not Found</Title>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mt-8 md:px-8">
      <div ref={topRef} className="max-w-6xl w-full px-6 bg-white rounded-lg shadow-lg relative">
        <BackButton backLink="/knowledge" className="mt-4" />

        <div className="flex flex-col md:flex-row items-center gap-6 pt-6 px-6 pb-4 border-b">
          <Image
            src={department.imageUrl}
            alt={department.name}
            width={140}
            height={140}
            className="rounded-2xl object-cover"
            preview={false}
          />
          <div className="flex-1 text-center md:text-left">
            <Title level={2} className="text-3xl font-bold text-blue-900 mb-2">{department.name}</Title>
            <Paragraph className="text-gray-600 text-lg">{department.description}</Paragraph>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 px-5 md:px-6 pb-2 mb-4">
          <RangePicker
            value={dateRange}
            onChange={(range) => {
              setDateRange(range as [Dayjs | null, Dayjs | null]);
            }}
            allowClear
            className="mb-2 md:mb-0"
          />
          <Input.Search
            placeholder="Search..."
            allowClear
            value={search}
            onChange={handleSearch}
            className="w-full md:w-[320px]"
          />
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          tabBarStyle={{
            padding: "0 24px",
            justifyContent: "center"
          }}
          items={[
            {
              key: "articles",
              label: "Latest Articles",
              children: (
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
              ),
            },
            {
              key: "qa",
              label: "Community Q&A",
              children: (
                <div className="px-5">
                  <List
                    itemLayout="horizontal"
                    dataSource={paginatedQa}
                    pagination={false}
                    renderItem={(item) => (
                      <List.Item
                        className="bg-gray-50 rounded mb-4 cursor-pointer"
                        style={{ padding: "10px 20px" }}
                        onClick={() => handleQAClick(item)}
                      >
                        <List.Item.Meta
                          avatar={<Avatar>{item.user[0]}</Avatar>}
                          title={
                            <span
                              className="font-bold"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.question}
                            </span>}
                          description={
                            <span
                              className="text-gray-700"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.answer}
                            </span>
                          }
                        />
                        <span className="text-xs text-gray-500 ml-2">{item.user}</span>
                      </List.Item>
                    )}
                  />
                  <div className="flex justify-between items-center pb-5">
                    <Button type="primary" className="font-bold">
                      Ask a Question
                    </Button>
                    <Pagination
                      current={currentQaPage}
                      pageSize={10}
                      total={totalQaSize}
                      onChange={setCurrentQaPage}
                      className="text-center"
                      style={{ padding: "10px 20px" }}
                    />
                  </div>
                  <Modal
                    open={qaModalOpen}
                    title={selectedQA?.question}
                    onCancel={() => setQaModalOpen(false)}
                    footer={null}
                    centered
                  >
                    <div className="mb-2 text-gray-800">{selectedQA?.answer}</div>
                    <div className="text-xs text-gray-500 mb-4">
                      {selectedQA?.user} • {dayjs(selectedQA?.date).format("MMM D, YYYY")}
                    </div>
                  </Modal>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div >
  );
};

export default DepartmentKnowledgePageComponent;
