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
  id: string;
  question: string;
  answer: string | null;
  department: string;
  answeredBy: string | null;
  createdAt: string;
  updatedAt: string;
  lastAnsweredAt: string | null;
}
