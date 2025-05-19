'use client'

import { useRouter } from "next/navigation";
import { Card, Button, Image, Typography } from "antd";
import { Department } from "../props";
import BackButton from "../components/BackButton/BackButton";

const { Title, Paragraph } = Typography;

const KnowledgeHubLandingPageComponent = ({ departments }: { departments: Department[] }) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center mt-8 md:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg px-6 py-6">
        <BackButton backLink="/" />
        <Title level={2} className="text-3xl font-bold mb-8 text-blue-900 text-center">Knowledge Hub</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <Card
              key={dept.id}
              hoverable
              className="rounded-lg shadow-sm flex flex-col items-center text-center"
              onClick={() => router.push(`/knowledge/${dept.name}`)}
              cover={
                dept.imageUrl ? (
                  <div className="w-full overflow-hidden">
                    <Image
                      src={dept.imageUrl}
                      alt={dept.name}
                      className="object-fill"
                      preview={false}
                    />
                  </div>
                ) : null
              }
            >
              <Title level={4} className="font-bold text-xl mb-2 mt-0">{dept.name}</Title>
              <Paragraph className="text-gray-600 mb-4">{dept.description || "Explore Q&A and resources for this department."}</Paragraph>
              <Button type="primary">View</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeHubLandingPageComponent;
