import { Article } from "../api/article/props";
import { Tutorial } from "../api/tutorial/props";

export type { Article, Tutorial };

export interface KnowledgeSearchOptions {
  category?: string;
  type?: "article" | "tutorial";
  page?: number;
  size?: number;
}

export interface KnowledgeHubPageProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string | undefined;
  setSelectedCategory: (category: string | undefined) => void;
  selectedType: "all" | "article" | "tutorial";
  setSelectedType: (type: "all" | "article" | "tutorial") => void;
  articles: Article[];
  tutorials: Tutorial[];
  loading: boolean;
  categories: string[];
}

export interface ContentCardProps {
  content: Article | Tutorial;
  type: "article" | "tutorial";
  onClick: () => void;
}
