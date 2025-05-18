import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { FacilityResponse, FacilitySearchOptions } from "./props";

const RESOURCE: string = "/facility";
const PAGE_SIZE: number = 10;

const FacilityApi = {
  findAllFacilities(options?: FacilitySearchOptions): Promise<AxiosResponse<FacilityResponse>> {
    const page: number = options?.page ?? 0;
    const query: string = `?page=${page}&pageSize=${PAGE_SIZE}`;
    return repository.get(`${RESOURCE}${query}`);
  },
};

export default FacilityApi;
