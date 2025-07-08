import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import { Article, CreateArticleRequest, UpdateArticleRequest } from "./props";

const RESOURCE = "/article";

const ArticleApi = {
  getArticleById(id: string) {
    return repository.get<ApiResponse<Article>>(`${RESOURCE}/${id}`);
  },
  getArticlesBySpeciality(speciality: string) {
    return repository.get<ApiResponse<Article[]>>(`${RESOURCE}/${speciality}`);
  },
  createArticle(data: CreateArticleRequest) {
    return repository.post<ApiResponse<void>>(RESOURCE, data);
  },
  updateArticle(articleId: string, data: UpdateArticleRequest) {
    return repository.put<ApiResponse<void>>(`${RESOURCE}/${articleId}`, data);
  },
  deleteArticle(articleId: string) {
    return repository.delete<ApiResponse<void>>(`${RESOURCE}/${articleId}`);
  },
};

export default ArticleApi;
