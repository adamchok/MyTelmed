import { FacilitySearchOptions } from "./props";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";

const RESOURCE: string = "/api/v1/facility";
const PAGE_SIZE: number = 10;

const FacilityApi = {
  findAllFacilities(options?: FacilitySearchOptions) {
    const page: number = options?.page ?? 0;
    // FacilitySearchOptions does not have pageSize, so always use PAGE_SIZE
    const query: string = `?page=${page}&pageSize=${PAGE_SIZE}`;
    return repository.get(`${RESOURCE}${query}`);
  },
  uploadImage(facilityId: string, file: File): Promise<ApiResponse<void>> {
    const formData = new FormData();
    formData.append("file", file);
    return repository.post(`${RESOURCE}/image/${facilityId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default FacilityApi;
