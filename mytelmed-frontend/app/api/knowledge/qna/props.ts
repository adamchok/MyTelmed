export interface CreateQnARequestOptions {
  question: string;
  department: string;
}

export interface UpdateQnARequestOptions {
  answer: string;
  answeredBy: string;
}
