'use client'

import { Tabs, Card, Button, List, Avatar, Pagination, Input, DatePicker, Modal, Image, Typography } from "antd";
import { useState, useRef } from "react";
import { ForumComponentProps } from "./props";
import { Article, QA } from "../props";
import dayjs, { Dayjs } from "dayjs";
import Link from "next/link";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import BackButton from "@/app/components/BackButton/BackButton";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;
const { Title, Paragraph } = Typography;

const getReadingTime = (text: string) => {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};

const ForumComponent = ({
  department,
  articles,
  qa,
  t
}: ForumComponentProps) => {
  const [articlePage, setArticlePage] = useState(1);
  const [qaPage, setQaPage] = useState(1);
  const [activeTab, setActiveTab] = useState("articles");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const pageSize = 6;
  const qaPageSize = 8;
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [qaModalOpen, setQaModalOpen] = useState(false);
  const [selectedQA, setSelectedQA] = useState<QA | null>(null);

  const filterBySearchAndDate = (item: Article | QA, fields: string[]) => {
    const matchesSearch = fields.some(field =>
      (item as any)[field]?.toLowerCase().includes(search.toLowerCase())
    );
    const itemDate = dayjs(item.date);
    const noDateFilter = !dateRange || (!dateRange[0] && !dateRange[1]);
    const matchesDate =
      noDateFilter ||
      (!dateRange[0] || itemDate.isSameOrAfter(dateRange[0], 'day')) &&
      (!dateRange[1] || itemDate.isSameOrBefore(dateRange[1], 'day'));
    return matchesSearch && matchesDate;
  };

  const filteredArticles = articles.filter(article =>
    filterBySearchAndDate(article, ["title", "summary"])
  );
  const pagedArticles = filteredArticles.slice((articlePage - 1) * pageSize, articlePage * pageSize);

  const filteredQA = qa.filter(qaItem =>
    filterBySearchAndDate(qaItem, ["question", "answer"])
  );
  const pagedQA = filteredQA.slice((qaPage - 1) * qaPageSize, qaPage * qaPageSize);

  const handleQAClick = (qaItem: QA) => {
    setSelectedQA(qaItem);
    setQaModalOpen(true);
  };

  return (
    <div className="flex items-center justify-center mt-8 md:px-8">
      <div ref={mainContentRef} className="max-w-6xl w-full px-6 bg-white rounded-lg shadow-lg relative">
        <BackButton backLink="/forum" className="mt-4" />

        <div className="flex flex-col md:flex-row items-center gap-6 pt-6 px-6 pb-4 border-b">
          <Image
            src={department.image}
            alt={department.label}
            width={140}
            height={120}
            className="rounded-2xl object-contain"
            preview={false}
          />
          <div className="flex-1 text-center md:text-left">
            <Title level={2} className="text-3xl font-bold text-blue-900 mb-2">{department.label}</Title>
            <Paragraph className="text-gray-600 text-lg">{department.description}</Paragraph>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 px-5 md:px-6 pb-2 mb-4">
          <RangePicker
            value={dateRange}
            onChange={(range) => {
              setDateRange(range as [Dayjs | null, Dayjs | null]);
              setArticlePage(1);
              setQaPage(1);
              if (mainContentRef.current) mainContentRef.current.scrollIntoView({ behavior: "smooth" });
            }}
            allowClear
            className="mb-2 md:mb-0"
          />
          <Input.Search
            placeholder={t("Search...") || "Search..."}
            allowClear
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setArticlePage(1);
              setQaPage(1);
              if (mainContentRef.current) mainContentRef.current.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full md:w-[320px]"
          />
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={key => {
            setActiveTab(key);
            if (key === "articles") setArticlePage(1);
            if (key === "qa") setQaPage(1);
            if (mainContentRef.current) mainContentRef.current.scrollIntoView({ behavior: "smooth" });
          }}
          tabBarStyle={{
            padding: "0 24px",
            justifyContent: "center"
          }}
          items={[
            {
              key: "articles",
              label: t("Latest Articles") || "Latest Articles",
              children: (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-5">
                    {pagedArticles.map((article) => (
                      <Link
                        href={`/forum/${department.key}/article/${article.id}`}
                        style={{ textDecoration: 'none' }}
                        key={article.id}
                      >
                        <Card
                          hoverable
                          cover={
                            <Image
                              src={article.image}
                              alt={article.title}
                              width={400}
                              height={160}
                              className="h-40 object-cover w-full"
                              preview={false}
                            />
                          }
                          className="rounded-lg shadow-sm"
                        >
                          <Card.Meta
                            title={
                              <>
                                <div className="flex items-center text-xs text-gray-500 mb-1">
                                  <span>{dayjs(article.date).format("MMM D, YYYY")}</span>
                                  <span className="mx-2">•</span>
                                  <span>{getReadingTime(article.summary)} min read</span>
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
                              <span
                                className="text-gray-600"
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {article.summary}
                              </span>
                            }
                          />
                          <Button
                            type="link"
                            className="mt-2 p-0 text-blue-600"
                            style={{ padding: "0px" }}
                          >
                            {t("Read More") || "Read More"}
                          </Button>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  <div className="flex justify-end pb-5 mt-4">
                    <Pagination
                      current={articlePage}
                      pageSize={pageSize}
                      total={filteredArticles.length}
                      onChange={page => {
                        setArticlePage(page);
                        if (mainContentRef.current) mainContentRef.current.scrollIntoView();
                      }}
                      className="text-center"
                      style={{ padding: "10px 20px" }}
                      showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
                      showQuickJumper
                    />
                  </div>
                </>
              ),
            },
            {
              key: "qa",
              label: t("Community Q&A") || "Community Q&A",
              children: (
                <div className="px-5">
                  <List
                    itemLayout="horizontal"
                    dataSource={pagedQA}
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
                      {t("Ask a Question") || "Ask a Question"}
                    </Button>
                    <Pagination
                      current={qaPage}
                      pageSize={qaPageSize}
                      total={filteredQA.length}
                      onChange={page => {
                        setQaPage(page);
                        if (mainContentRef.current) mainContentRef.current.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-center"
                      style={{ padding: "10px 20px" }}
                      showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
                      showQuickJumper
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
                    <div className="text-xs text-gray-500 mb-4">{selectedQA?.user} • {selectedQA?.date}</div>
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

export default ForumComponent;
