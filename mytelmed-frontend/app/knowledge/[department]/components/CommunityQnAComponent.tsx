'use client'

import { List, Avatar, Button, Modal, Pagination, Typography } from 'antd';
import { useState } from 'react';
import { QA } from '@/app/knowledge/props';
import dayjs from 'dayjs';
import CreateQnAModal from './CreateQnAModal';
import { Department } from '@/app/props';

interface CommunityQnAComponentProps {
  paginatedQa: QA[];
  currentQaPage: number;
  setCurrentQaPage: (page: number) => void;
  totalQaSize: number;
  department: Department | null;
  handleCreateQnA: (question: string) => void;
  qaModalOpen: boolean;
  setQaModalOpen: (qaModalOpen: boolean) => void;
}

const { Paragraph, Text } = Typography;

const CommunityQnAComponent = ({ paginatedQa, currentQaPage, setCurrentQaPage, totalQaSize, department, handleCreateQnA, qaModalOpen, setQaModalOpen }: CommunityQnAComponentProps) => {
  const [selectedQA, setSelectedQA] = useState<QA | null>(null);

  const handleQAClick = (qaItem: QA) => {
    setSelectedQA(qaItem);
    setQaModalOpen(true);
  };

  return (
    <div className="px-5">
      <List
        itemLayout="horizontal"
        dataSource={paginatedQa}
        pagination={false}
        renderItem={(item) => (
          <List.Item
            className="bg-gray-50 rounded-lg shadow-md mb-4 cursor-pointer px-5 py-3"
            onClick={() => handleQAClick(item)}
          >
            <List.Item.Meta
              avatar={<Avatar>{item.answeredBy?.charAt(0) ?? ""}</Avatar>}
              title={
                <Paragraph
                  ellipsis={{ rows: 2, expandable: false, tooltip: item.question }}
                  strong
                  className="mb-1"
                >
                  {item.question}
                </Paragraph>
              }
              description={
                <>
                  <Paragraph
                    ellipsis={{
                      rows: 3,
                      expandable: false,
                    }}
                    className="text-gray-700"
                  >
                    {item.answer ?? "No answer yet"}
                  </Paragraph>
                  {(item.answeredBy || item.createdAt) && (
                    <div className="flex items-center text-gray-500">
                      {item.answeredBy && <Text type="secondary" className="text-xs">{item.answeredBy}</Text>}
                      {item.answeredBy && item.createdAt && <span className="mx-2">•</span>}
                      {item.createdAt && (
                        <Text type="secondary" className="text-xs">{dayjs(item.createdAt).format("MMM D, YYYY")}</Text>
                      )}
                    </div>
                  )}
                </>
              }
            />
          </List.Item>
        )}
      />
      <div className="flex justify-between items-center pb-5">
        <Button type="primary" className="font-bold" onClick={() => setQaModalOpen(true)}>
          Ask a Question
        </Button>
        <Pagination
          current={currentQaPage}
          pageSize={10}
          total={totalQaSize}
          onChange={setCurrentQaPage}
          className="text-center"
          style={{ padding: "10px 20px" }}
        />
      </div>
      <Modal
        open={qaModalOpen}
        title={selectedQA?.question}
        onCancel={() => setQaModalOpen(false)}
        footer={null}
        centered
      >
        <Paragraph className="text-gray-800 mb-8 mt-4">{selectedQA?.answer ?? "No answer yet"}</Paragraph>
        <div className="text-xs text-gray-500">
          <Text type="secondary">{selectedQA?.answeredBy}</Text>
          {selectedQA?.answeredBy && ' • '}
          <Text type="secondary">
            {selectedQA?.createdAt && dayjs(selectedQA.createdAt).format("MMM D, YYYY")}
          </Text>
        </div>
      </Modal>
      <CreateQnAModal
        open={qaModalOpen}
        handleClose={() => setQaModalOpen(false)}
        handleCreateQnA={handleCreateQnA}
        department={department}
      />
    </div>
  )
}

export default CommunityQnAComponent;
