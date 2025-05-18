import { Department, Article } from "@/app/props";
import { QA } from "../props";

export interface KnowledgePageComponentProps {
  department: Department | null;
  search: string;
  setSearch: (search: string) => void;
  dateRange: [any, any];
  setDateRange: (dateRange: [any, any]) => void;
  paginatedArticles: Article[];
  totalArticleSize: number;
  currentArticlePage: number;
  setCurrentArticlePage: (currentArticlePage: number) => void;
  paginatedQa: QA[];
  totalQaSize: number;
  currentQaPage: number;
  setCurrentQaPage: (currentQaPage: number) => void;
  loading: boolean;
}
