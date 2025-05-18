import { CreateArticleRequestOptions } from "./props";
import Repository from "../RepositoryManager";

const RESOURCE: string = "/article";
const PAGE_SIZE: number = 10;

const KnowledgeApi = {
  findAllArticles(page: number = 0) {
    return Repository.get(`${RESOURCE}?page=${page}&pageSize=${PAGE_SIZE}`);
  },
  findArticlesByDepartment(department: string, page: number = 0) {
    return Repository.get(`${RESOURCE}/${department}?page=${page}&pageSize=${PAGE_SIZE}`);
  },
  findArticleByDepartmentAndId(department: string, id: string) {
    return Repository.get(`${RESOURCE}/${department}/${id}`);
  },
  createArticle(newArticle: CreateArticleRequestOptions) {
    return Repository.post(RESOURCE, newArticle);
  },
  updateArticle(department: string, id: string, newArticle: CreateArticleRequestOptions) {
    return Repository.put(`${RESOURCE}/${department}/${id}`, newArticle);
  },
  deleteArticle(department: string, id: string) {
    return Repository.delete(`${RESOURCE}/${department}/${id}`);
  },
};

export default KnowledgeApi;
