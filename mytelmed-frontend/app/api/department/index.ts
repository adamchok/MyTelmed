import repository from "../RepositoryManager";
import { DepartmentSearchOptions } from "./props";

const RESOURCE: string = "/department";
const PAGE_SIZE: number = 10;

const DepartmentApi = {
  findAllDepartments() {
    return repository.get(`${RESOURCE}/list`);
  },
  findAllPaginatedDepartments(options?: DepartmentSearchOptions) {
    const page: number = options?.page ?? 0;
    const query: string = `?page=${page}&pageSize=${PAGE_SIZE}`;
    return repository.get(`${RESOURCE}/paginated${query}`);
  },
  findDepartmentByName(name: string) {
    const query = `?name=${encodeURIComponent(name)}`;
    return repository.get(`${RESOURCE}${query}`);
  },
};

export default DepartmentApi;
