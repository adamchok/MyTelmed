import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import { Article, CreateArticleRequest, UpdateArticleRequest } from "./props";

const RESOURCE: string = "/api/v1/article";

const ArticleApi = {
    /**
     * Get all articles (Open endpoint)
     */
    getAllArticles(): Promise<AxiosResponse<ApiResponse<Article[]>>> {
        return repository.get<ApiResponse<Article[]>>(`${RESOURCE}`);
    },

    /**
     * Get article by ID (Open endpoint)
     */
    getArticleById(articleId: string): Promise<AxiosResponse<ApiResponse<Article>>> {
        return repository.get<ApiResponse<Article>>(`${RESOURCE}/${articleId}`);
    },

    /**
     * Get articles by speciality (Open endpoint)
     */
    getArticlesBySpeciality(speciality: string): Promise<AxiosResponse<ApiResponse<Article[]>>> {
        return repository.get<ApiResponse<Article[]>>(`${RESOURCE}/${speciality}`);
    },

    /**
     * Create a new article (Admin only)
     */
    createArticle(request: CreateArticleRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${RESOURCE}`, request);
    },

    /**
     * Update an existing article (Admin only)
     */
    updateArticle(articleId: string, request: UpdateArticleRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${RESOURCE}/${articleId}`, request);
    },

    /**
     * Delete an article (Admin only)
     */
    deleteArticle(articleId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.delete<ApiResponse<void>>(`${RESOURCE}/${articleId}`);
    },
};

export default ArticleApi;
