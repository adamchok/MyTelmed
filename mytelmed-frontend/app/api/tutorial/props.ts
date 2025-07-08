export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTutorialRequest {
  title: string;
  description: string;
  category: string;
}

export interface UpdateTutorialRequest {
  title: string;
  description: string;
  category: string;
}
