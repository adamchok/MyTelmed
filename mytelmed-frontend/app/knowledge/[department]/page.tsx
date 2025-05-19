"use client";

import { useParams } from "next/navigation";
import { Article, QA } from "../props";
import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { Department } from "@/app/props";
import dayjs, { Dayjs } from "dayjs";
import DepartmentApi from "@/app/api/department";
import ArticleApi from "@/app/api/knowledge/article";
import QnAApi from "@/app/api/knowledge/qna";
import DepartmentKnowledgePageComponent from "./component";
import { CreateQnARequestOptions } from "@/app/api/knowledge/qna/props";

const DepartmentKnowledgePage = () => {
  const [department, setDepartment] = useState<Department | null>(null);
  const [search, setSearch] = useState<string>("");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [loading, setLoading] = useState<boolean>(false);
  const [qaModalOpen, setQaModalOpen] = useState<boolean>(false);
  const [paginatedArticles, setPaginatedArticles] = useState<Article[]>([]);
  const [currentArticlePage, setCurrentArticlePage] = useState<number>(1);
  const [totalArticleSize, setTotalArticleSize] = useState<number>(0);
  const [paginatedQa, setPaginatedQa] = useState<QA[]>([]);
  const [currentQaPage, setCurrentQaPage] = useState<number>(1);
  const [totalQaSize, setTotalQaSize] = useState<number>(0);
  const params = useParams();
  const departmentName = params?.department as string;

  const findDepartmentByName = useCallback(async () => {
    try {
      const { data } = await DepartmentApi.findDepartmentByName(
        departmentName
      );
      setDepartment(data ?? null);
    } catch (error) {
      console.error("Error fetching department:", error);
      message.error("Failed to fetch department");
    }
  }, [departmentName]);

  const findArticlesByDepartment = useCallback(async () => {
    try {
      const { data } = await ArticleApi.getArticlesByDepartment(
        departmentName,
        currentArticlePage - 1
      );
      setPaginatedArticles(data.content ?? []);
      setTotalArticleSize(data.totalElements ?? 0);
    } catch (error) {
      console.error("Error fetching articles:", error);
      message.error("Failed to fetch articles");
    }
  }, [departmentName, currentArticlePage]);

  const findQaByDepartment = useCallback(async () => {
    try {
      const { data } = await QnAApi.findQnAByDepartment(
        departmentName,
        currentQaPage - 1
      );
      setPaginatedQa(data.content ?? []);
      setTotalQaSize(data.totalElements ?? 0);
    } catch (error) {
      console.error("Error fetching Q&A:", error);
      message.error("Failed to fetch Q&A");
    }
  }, [departmentName, currentQaPage]);

  const filterArticles = useCallback((articles: Article[]): Article[] => {
    return articles.filter(article => {
      const matchesSearch = search
        ? article.title.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesDate = dateRange && (dateRange[0] || dateRange[1])
        ? (!dateRange[0] || dayjs(article.createdAt).isAfter(dateRange[0])) &&
        (!dateRange[1] || dayjs(article.createdAt).isBefore(dateRange[1]))
        : true;
      return matchesSearch && matchesDate;
    });
  }, [search, dateRange]);

  const filterQa = useCallback((qa: QA[]): QA[] => {
    return qa.filter(item => {
      const matchesSearch = search
        ? item.question.toLowerCase().includes(search.toLowerCase()) ||
        (item.answer && item.answer.toLowerCase().includes(search.toLowerCase()))
        : true;
      const matchesDate = dateRange && (dateRange[0] || dateRange[1])
        ? (!dateRange[0] || dayjs(item.createdAt).isAfter(dateRange[0])) &&
        (!dateRange[1] || dayjs(item.createdAt).isBefore(dateRange[1]))
        : true;
      return matchesSearch && matchesDate;
    });
  }, [search, dateRange]);

  const createQnA = async (question: string) => {
    if (!department) {
      message.error('Department is required to submit a question.');
      return;
    }
    try {
      const createQnARequestOptions: CreateQnARequestOptions = {
        question,
        department: department.name
      }
      const data = await QnAApi.createQnA(createQnARequestOptions);
      if (data) {
        message.success('Question submitted!');
        setQaModalOpen(false);
        setCurrentQaPage(1);
        await findQaByDepartment();
      } else {
        message.error('Failed to submit question');
      }
    } catch {
      message.error('Failed to submit question');
    }
  };

  useEffect(() => {
    if (!department && departmentName) {
      setLoading(true);
      findDepartmentByName()
        .catch((error) => {
          message.error("Failed to fetch department.");
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [department, departmentName, findDepartmentByName]);

  useEffect(() => {
    if (department) {
      setLoading(true);
      findArticlesByDepartment()
        .catch((error) => {
          message.error("Failed to fetch articles.");
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentArticlePage, department, findArticlesByDepartment]);

  useEffect(() => {
    if (department) {
      setLoading(true);
      findQaByDepartment()
        .catch((error) => {
          message.error("Failed to fetch Q&A.");
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentQaPage, department, findQaByDepartment]);

  useEffect(() => {
    setCurrentArticlePage(1);
    setCurrentQaPage(1);
  }, [search, dateRange]);

  return (
    <DepartmentKnowledgePageComponent
      department={department}
      search={search}
      setSearch={setSearch}
      dateRange={dateRange}
      setDateRange={setDateRange}
      paginatedArticles={filterArticles(paginatedArticles)}
      totalArticleSize={totalArticleSize}
      currentArticlePage={currentArticlePage}
      setCurrentArticlePage={setCurrentArticlePage}
      paginatedQa={filterQa(paginatedQa)}
      totalQaSize={totalQaSize}
      currentQaPage={currentQaPage}
      setCurrentQaPage={setCurrentQaPage}
      loading={loading}
      handleCreateQnA={createQnA}
      qaModalOpen={qaModalOpen}
      setQaModalOpen={setQaModalOpen}
    />
  );
};

export default DepartmentKnowledgePage;
