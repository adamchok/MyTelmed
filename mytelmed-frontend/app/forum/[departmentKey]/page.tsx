"use client";

import { useParams } from "next/navigation";
import { departments } from "../../constants/departments";
import { useTranslation } from "react-i18next";
import { Article, QA } from "../props";
import Link from "next/link";
import ForumComponent from "./component";

const sampleArticles: Article[] = [
  {
    id: 1,
    title: "Managing Hypertension",
    summary: "Tips and guidelines for managing high blood pressure in adults. Tips and guidelines for managing high blood pressure in adults. Tips and guidelines for managing high blood pressure in adults. Tips and guidelines for managing high blood pressure in adults. Tips and guidelines for managing high blood pressure in adults. Tips and guidelines for managing high blood pressure in adults.",
    image: "/icons/general-medicine-icon.png",
    link: "#",
    date: "2024-05-01",
  },
  {
    id: 2,
    title: "Diabetes: What You Need to Know",
    summary: "Understanding diabetes, its symptoms, and management strategies.",
    image: "/icons/general-medicine-icon.png",
    link: "#",
    date: "2024-05-10",
  },
  {
    id: 3,
    title: "Recognizing Early Signs of Stroke",
    summary: "Learn how to identify early warning signs of a stroke and what to do.",
    image: "/icons/neurology-icon.png",
    link: "#",
    date: "2024-04-15",
  },
  {
    id: 4,
    title: "Heart Disease Prevention",
    summary: "A guide to reducing your risk of heart disease through lifestyle changes.",
    image: "/icons/cardiology-icon.png",
    link: "#",
    date: "2024-03-20",
  },
  {
    id: 5,
    title: "Healthy Eating for Seniors",
    summary: "Nutritional advice tailored for aging adults to stay healthy and active.",
    image: "/icons/nutrition-icon.png",
    link: "#",
    date: "2024-02-28",
  },
  {
    id: 6,
    title: "Asthma Management in Children",
    summary: "How to manage and reduce asthma symptoms in pediatric patients.",
    image: "/icons/pediatrics-icon.png",
    link: "#",
    date: "2024-01-10",
  },
  {
    id: 7,
    title: "Understanding Anxiety Disorders",
    summary: "A look into different anxiety disorders and effective treatments.",
    image: "/icons/mental-health-icon.png",
    link: "#",
    date: "2023-12-05",
  },
  {
    id: 8,
    title: "Coping with Chronic Pain",
    summary: "Strategies for managing chronic pain without relying solely on medication.",
    image: "/icons/general-medicine-icon.png",
    link: "#",
    date: "2023-11-18",
  },
];

const sampleQA: QA[] = [
  {
    id: 1,
    question: "What are the early symptoms of hypertension?",
    answer: "Often there are no symptoms, but some may experience headaches or dizziness.",
    user: "Dr. Lim K.S.",
    date: "2024-05-01",
  },
  {
    id: 2,
    question: "How often should I get my blood pressure checked?",
    answer: "At least once a year for adults, or more frequently if you have risk factors.",
    user: "Nurse Aisyah M.",
    date: "2024-05-10",
  },
  {
    id: 3,
    question: "How often should I get my blood pressure checked?",
    answer: "At least once a year for adults, or more frequently if you have risk factors.",
    user: "Nurse Aisyah M.",
    date: "2024-05-10",
  },
  {
    id: 4,
    question: "How often should I get my blood pressure checked?",
    answer: "At least once a year for adults, or more frequently if you have risk factors.",
    user: "Nurse Aisyah M.",
    date: "2024-05-10",
  },
  {
    id: 5,
    question: "How often should I get my blood pressure checked?",
    answer: "At least once a year for adults, or more frequently if you have risk factors.",
    user: "Nurse Aisyah M.",
    date: "2024-05-10",
  },
  {
    id: 6,
    question: "How often should I get my blood pressure checked?",
    answer: "At least once a year for adults, or more frequently if you have risk factors.",
    user: "Nurse Aisyah M.",
    date: "2024-05-10",
  },
  {
    id: 7,
    question: "How often should I get my blood pressure checked?",
    answer: "At least once a year for adults, or more frequently if you have risk factors.",
    user: "Nurse Aisyah M.",
    date: "2024-05-10",
  },
  {
    id: 8,
    question: "How often should I get my blood pressure checked?",
    answer: "At least once a year for adults, or more frequently if you have risk factors.",
    user: "Nurse Aisyah M.",
    date: "2024-05-10",
  },
];

export default function DepartmentForumPage() {
  const { t } = useTranslation("forum");
  const params = useParams();
  const departmentKey = params?.departmentKey as string;
  const department = departments(t).find((d: any) => d.key === departmentKey);

  if (!department) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Department Not Found</h1>
        <Link href="/forum" className="text-blue-700 hover:underline">Back to Knowledge Hub</Link>
      </div>
    );
  }

  return (
    <ForumComponent
      department={department}
      articles={sampleArticles}
      qa={sampleQA}
      t={t}
    />
  );
}

export { sampleArticles };
