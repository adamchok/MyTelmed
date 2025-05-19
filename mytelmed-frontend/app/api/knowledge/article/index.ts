import { ArticleRequestOptions } from "./props";
import Repository from "../../RepositoryManager";

const ARTICLE_RESOURCE: string = "/article";
const PAGE_SIZE: number = 10;
const multipartConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

const ArticleApi = {
  getArticlesByDepartment(department: string, page: number = 0) {
    return Repository.get(`${ARTICLE_RESOURCE}/${department}?page=${page}&pageSize=${PAGE_SIZE}`);
  },
  getArticleByDepartmentAndId(department: string, id: string) {
    return Repository.get(`${ARTICLE_RESOURCE}/${department}/${id}`);
  },
  createArticleWithoutImage(newArticle: ArticleRequestOptions) {
    return Repository.post(ARTICLE_RESOURCE, newArticle);
  },
  createArticleWithImage(newArticle: ArticleRequestOptions, image: File) {
    const formData = new FormData();
    formData.append("article", JSON.stringify(newArticle));
    formData.append("image", image);
    return Repository.post(`${ARTICLE_RESOURCE}`, formData, multipartConfig);
  },
  updateArticle(department: string, id: string, newArticle: ArticleRequestOptions) {
    return Repository.put(`${ARTICLE_RESOURCE}/${department}/${id}`, newArticle);
  },
  deleteArticle(department: string, id: string) {
    return Repository.delete(`${ARTICLE_RESOURCE}/${department}/${id}`);
  },
};

export default ArticleApi;
