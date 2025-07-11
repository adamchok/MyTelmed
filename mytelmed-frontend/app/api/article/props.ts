export interface Article {
    id: string;
    title: string;
    subject: string;
    content: string;
    thumbnailUrl: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateArticleRequest {
    title: string;
    content: string;
    subject: string;
}

export interface UpdateArticleRequest {
    title: string;
    content: string;
}
