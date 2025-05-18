'use client'

import { useRouter } from "next/navigation";
import { Card, Button, Image, Typography } from "antd";
import { departments } from "../constants/departments";
import { useTranslation } from "react-i18next";
import BackButton from "../components/BackButton/BackButton";

const { Title, Paragraph } = Typography;

const Component = () => {
  const router = useRouter();
  const { t } = useTranslation("forum");

  return (
    <div className="flex items-center justify-center mt-8 md:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg px-6 py-6">
        <BackButton backLink="/" />
        <Title level={2} className="text-3xl font-bold mb-8 text-blue-900 text-center">{t("knowledgeHub")}</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments(t).map((dept) => (
            <Card
              key={dept.key}
              hoverable
              className="rounded-lg shadow-sm flex flex-col items-center text-center"
              onClick={() => router.push(`/forum/${dept.key}`)}
              cover={
                dept.image ? (
                  <Image
                    src={dept.image}
                    alt={dept.label}
                    width={140}
                    height={120}
                    className="mx-auto mt-4"
                    preview={false}
                  />
                ) : null
              }
            >
              <Title level={4} className="font-bold text-xl mb-2">{dept.label}</Title>
              <Paragraph className="text-gray-600 mb-4">{dept.description || "Explore Q&A and resources for this department."}</Paragraph>
              <Button type="primary">View</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Component;
