'use client'

import { useParams } from "next/navigation";
import { departments } from "../../../../constants/departments";
import { useTranslation } from "react-i18next";
import { sampleArticles } from "../../page";
import BackButton from "@/app/components/BackButton/BackButton";
import Image from "next/image";
import Link from "next/link";


export default function ArticleDetailPage() {
  const { t } = useTranslation("forum");
  const params = useParams();
  const departmentKey = params?.departmentKey as string;
  const articleId = params?.articleId as string;
  const department = departments(t).find((d: any) => d.key === departmentKey);
  const article = sampleArticles.find((a: any) => a.id === Number(articleId));

  if (!article || !department) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <Link href={`/forum/${departmentKey}`} className="text-blue-700 hover:underline">Back to Knowledge Hub</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mt-8 md:px-8">
      <div className="max-w-5xl w-full bg-white rounded-lg shadow-lg relative">
        <div className="absolute top-4 left-4 z-10">
          <BackButton backLink={`/forum/${departmentKey}`} />
        </div>
        <div className="w-full h-56 md:h-80 relative rounded-t-lg overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover w-full h-full"
            priority
          />
        </div>
        <div className="px-6 md:px-10 py-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-3 leading-tight">{article.title}</h1>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>{article.date}</span>
            {/* Optionally add author or department here */}
          </div>
          <div className="text-lg text-gray-700 font-medium mb-6 border-l-4 border-blue-200 pl-4 bg-blue-50 py-2">
            {article.summary}
          </div>
          <article className="prose prose-blue max-w-none text-gray-900">
            <p>This is a placeholder for the full article content. Replace this with the actual article body.</p>
          </article>
        </div>
      </div>
    </div>
  );
}
