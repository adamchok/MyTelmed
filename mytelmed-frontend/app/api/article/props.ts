export interface Article {
    id: string;
    title: string;
    speciality: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateArticleRequest {
    title: string;
    content: string;
    specialityId: string;
}

export interface UpdateArticleRequest {
    title: string;
    content: string;
}
