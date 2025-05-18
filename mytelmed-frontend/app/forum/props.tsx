export interface Article {
  id: number;
  title: string;
  summary: string;
  image: string;
  link: string;
  date: string;
}

export interface QA {
  id: number;
  question: string;
  answer: string;
  user: string;
  date: string;
}
