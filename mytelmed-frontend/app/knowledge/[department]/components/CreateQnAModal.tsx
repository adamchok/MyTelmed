import { Department } from '@/app/props';
import { Modal, Form, Input, Button } from 'antd';
import { useState } from 'react';

interface CreateQnAModalProps {
  open: boolean;
  handleClose: () => void;
  handleCreateQnA: (question: string) => void;
  department: Department | null;
}

const CreateQnAModal = ({ open, handleClose, handleCreateQnA: onSubmit, department }: CreateQnAModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      onSubmit(values.question);
      form.resetFields();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    handleClose();
  };

  return (
    <Modal
      open={open}
      title={`Ask a Question in ${department?.name}`}
      onCancel={handleCancel}
      onClose={handleCancel}
      onOk={handleOk}
      footer={null}
      centered
    >
      <Form form={form} layout="vertical" onFinish={handleOk}>
        <Form.Item
          name="question"
          label="Your Question"
          rules={[{ required: true, message: 'Please enter your question' }]}
        >
          <Input.TextArea rows={4} placeholder="Type your question here..." disabled={loading || !department} />
        </Form.Item>
        {!department && (
          <div className="text-red-500 mb-2">Department is required to submit a question.</div>
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block disabled={!department}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateQnAModal;
