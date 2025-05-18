export interface CreateArticleRequestOptions {
  title: string;
  content: string;
  department: string;
  author: string;
  imageUrl: string;
  featured: boolean;
  tags: string[];
}
