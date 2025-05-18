export interface Article {
  id: string;
  title: string;
  content: string;
  department: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  featured: boolean;
  tags: string[];
}

export interface QA {
  id: number;
  question: string;
  answer: string;
  user: string;
  date: string;
}
