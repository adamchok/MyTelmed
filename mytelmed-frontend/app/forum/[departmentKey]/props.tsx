import { Article, QA } from "../props";
import { Department } from "../../props";

export interface ForumComponentProps {
  department: Department;
  articles: Article[];
  qa: QA[];
  t: (key: string) => string;
}
