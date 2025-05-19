import { CreateQnARequestOptions, UpdateQnARequestOptions } from "./props";
import Repository from "../../RepositoryManager";

const QA_RESOURCE: string = "/qna";
const PAGE_SIZE: number = 10;

const QnAApi = {
  findQnAByDepartment(department: string, page: number = 0) {
    return Repository.get(`${QA_RESOURCE}/${department}?page=${page}&pageSize=${PAGE_SIZE}`);
  },
  createQnA(newQnA: CreateQnARequestOptions) {
    return Repository.post(QA_RESOURCE, newQnA);
  },
  updateQnA(department: string, id: string, newQnA: UpdateQnARequestOptions) {
    return Repository.put(`${QA_RESOURCE}/${department}/${id}`, newQnA);
  },
  deleteQnA(department: string, id: string) {
    return Repository.delete(`${QA_RESOURCE}/${department}/${id}`);
  },
};

export default QnAApi;
