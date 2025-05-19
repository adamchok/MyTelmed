'use client'

import { Tabs, Input, DatePicker, Typography, Image, Spin } from "antd";
import { useState, useRef, RefObject, useEffect, useCallback, ChangeEvent } from "react";
import { KnowledgePageComponentProps } from "./props";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import BackButton from "@/app/components/BackButton/BackButton";
import CommunityQnAComponent from "./components/CommunityQnAComponent";
import ArticleComponent from "./components/ArticleComponent";

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
  handleCreateQnA,
  qaModalOpen,
  setQaModalOpen
}: KnowledgePageComponentProps) => {
  const topRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("articles");

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const newSearch: string = e.target.value;
    setSearch(newSearch);
  }, [setSearch]);

  const handleTabChange = useCallback((key: string): void => {
    setActiveTab(key);
    if (key === "articles") setCurrentArticlePage(1);
    if (key === "qna") setCurrentQaPage(1);
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
                <ArticleComponent
                  paginatedArticles={paginatedArticles}
                  currentArticlePage={currentArticlePage}
                  setCurrentArticlePage={setCurrentArticlePage}
                  totalArticleSize={totalArticleSize}
                  department={department}
                />
              ),
            },
            {
              key: "qna",
              label: "Community Q&A",
              children: (
                <CommunityQnAComponent
                  paginatedQa={paginatedQa}
                  currentQaPage={currentQaPage}
                  setCurrentQaPage={setCurrentQaPage}
                  totalQaSize={totalQaSize}
                  handleCreateQnA={handleCreateQnA}
                  department={department}
                  qaModalOpen={qaModalOpen}
                  setQaModalOpen={setQaModalOpen}
                />
              ),
            },
          ]}
        />
      </div>
    </div >
  );
};

export default DepartmentKnowledgePageComponent;
