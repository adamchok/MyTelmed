import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import {
  Tutorial,
  CreateTutorialRequest,
  UpdateTutorialRequest,
} from "./props";

const RESOURCE = "/api/v1/tutorial";

const TutorialApi = {
  getTutorialById(id: string) {
    return repository.get<ApiResponse<Tutorial>>(`${RESOURCE}/${id}`);
  },
  getTutorialsByCategory(category?: string, page = 0, size = 10) {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    params.append("page", page.toString());
    params.append("size", size.toString());
    return repository.get<
      ApiResponse<{
        content: Tutorial[];
        totalElements: number;
        totalPages: number;
      }>
    >(`${RESOURCE}?${params.toString()}`);
  },
  createTutorial(data: CreateTutorialRequest) {
    return repository.post<ApiResponse<Tutorial>>(RESOURCE, data);
  },
  uploadTutorialVideo(tutorialId: string, file: File) {
    const formData = new FormData();
    formData.append("video", file);
    return repository.post<ApiResponse<void>>(
      `${RESOURCE}/${tutorialId}/video`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },
  uploadTutorialThumbnail(tutorialId: string, file: File) {
    const formData = new FormData();
    formData.append("thumbnail", file);
    return repository.post<ApiResponse<void>>(
      `${RESOURCE}/${tutorialId}/thumbnail`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },
  updateTutorial(tutorialId: string, data: UpdateTutorialRequest) {
    return repository.put<ApiResponse<void>>(`${RESOURCE}/${tutorialId}`, data);
  },
  deleteTutorial(tutorialId: string) {
    return repository.delete<ApiResponse<void>>(`${RESOURCE}/${tutorialId}`);
  },
};

export default TutorialApi;
