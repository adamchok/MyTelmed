"use client";

import { useEffect, useCallback, useState } from "react";
import { message } from "antd";
import KnowledgeHubPageComponent from "./component";
import { Article, Tutorial } from "./props";
import ArticleApi from "../api/article";
import TutorialApi from "../api/tutorial";

const KnowledgeHubPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedType, setSelectedType] = useState<
    "all" | "article" | "tutorial"
  >("all");
  const [categories, setCategories] = useState<string[]>([]);

  const fetchArticles = useCallback(async () => {
    try {
      // For now, we'll fetch articles by a general speciality
      // In production, you might want to fetch all articles or paginate
      const response = await ArticleApi.getArticlesBySpeciality("general");
      if (response.data?.isSuccess) {
        setArticles(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  }, []);

  const fetchTutorials = useCallback(async () => {
    try {
      const response = await TutorialApi.getTutorialsByCategory();
      if (response.data?.isSuccess) {
        const tutorialData = response.data.data;
        if (tutorialData && "content" in tutorialData) {
          setTutorials(tutorialData.content);
          // Extract unique categories from tutorials
          const tutorialCategories = Array.from(
            new Set(tutorialData.content.map((t) => t.category))
          );
          setCategories((prev) =>
            Array.from(new Set([...prev, ...tutorialCategories]))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching tutorials:", error);
    }
  }, []);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([fetchArticles(), fetchTutorials()]);
    } catch (error) {
      console.error("Error fetching content:", error);
      message.error("Failed to fetch knowledge content");
    } finally {
      setLoading(false);
    }
  }, [fetchArticles, fetchTutorials]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Extract unique categories from articles as well
  useEffect(() => {
    const articleCategories = Array.from(
      new Set(articles.map((a) => a.speciality))
    );
    setCategories((prev) =>
      Array.from(new Set([...prev, ...articleCategories]))
    );
  }, [articles]);

  return (
    <KnowledgeHubPageComponent
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      selectedType={selectedType}
      setSelectedType={setSelectedType}
      articles={articles}
      tutorials={tutorials}
      loading={loading}
      categories={categories}
    />
  );
};

export default KnowledgeHubPage;
