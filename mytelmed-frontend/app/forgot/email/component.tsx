'use client';

import { Button, Col, Form, Input, Modal, Row, Tooltip, Typography, Image } from "antd";
import { ForgotEmailPageComponentProps } from './props';
import { useState } from "react";
import { InfoCircleOutlined } from '@ant-design/icons';
import BackButton from "../../components/BackButton/BackButton";

const { Title, Paragraph } = Typography;

const ForgotEmailPageComponent = ({ onFinish }: ForgotEmailPageComponentProps) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const MALAYSIAN_PHONE_REGEX = /1[0-46-9]-?[0-9]{7,8}$/;

  return (
    <div className="flex items-center justify-center mt-8">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg p-6 md:p-12 lg:p-16 relative flex flex-col md:flex-row md:items-center md:justify-center">
        <BackButton backLink="/forgot/password" className="absolute top-6 left-6" />
        <div className="w-full md:w-1/3 flex flex-col justify-center md:pr-6 lg:pr-10 mb-8 md:mb-0 mt-6 md:mt-0">
          <Title level={2} className="font-bold text-3xl mb-2 text-blue-900">Forgot Email</Title>
          <Paragraph className="text-gray-600 mt-2 mb-6">
            Enter your details to receive a link to reset your email.
          </Paragraph>
        </div>
        <div className="w-full md:w-2/3">
          <Form
            form={form}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            onFinish={onFinish}
            variant="filled"
            autoComplete="off"
            layout="vertical"
          >
            <Row gutter={[16, 4]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="NRIC (without hyphens)"
                  name="nric"
                  className="form-text"
                  rules={[{ required: true, message: 'Please input your NRIC Number' }]}
                  style={{ marginBottom: 20 }}
                >
                  <Input placeholder="Enter your NRIC Number" className="h-10" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Full Name (as stated in NRIC)"
                  name="name"
                  className="form-text"
                  rules={[{ required: true, message: 'Please input your Full Name' }]}
                  style={{ marginBottom: 20 }}
                >
                  <Input placeholder="Enter your Full Name" className="h-10" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Phone Number (without hyphens)"
                  name="phone"
                  className="form-text"
                  rules={[
                    { required: true, message: 'Please input your phone number.' },
                    { pattern: MALAYSIAN_PHONE_REGEX, message: 'Please enter a valid Malaysian phone number.' }
                  ]}
                  style={{ marginBottom: 20 }}
                >
                  <Input prefix={"+60"} placeholder="123456789" className="h-10" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <span>
                      NRIC Serial Number
                      <Tooltip title="Where to find?">
                        <InfoCircleOutlined
                          className="text-blue-900 ml-2 cursor-pointer"
                          onClick={() => setIsModalVisible(true)}
                        />
                      </Tooltip>
                    </span>
                  }
                  name="serialNumber"
                  className="form-text"
                  rules={[{ required: true, message: "Please input your NRIC's Serial Number" }]}
                  style={{ marginBottom: 20 }}
                >
                  <Input placeholder="Enter your NRIC's Serial Number" className="h-10" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24}>
                <Form.Item
                  label="Email Address"
                  name="email"
                  className="form-text"
                  rules={[
                    { required: true, message: 'Please input your Email Address' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                  style={{ marginBottom: 30 }}
                >
                  <Input placeholder="Enter your Email Address" className="h-10" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24}>
                <Form.Item style={{ marginBottom: 10 }}>
                  <Button type="primary" htmlType="submit" className="w-full font-bold" style={{ height: 36 }}>
                    <p className="text-[15px] font-bold">Submit</p>
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
      <Modal
        open={isModalVisible}
        title="Where to find your NRIC Serial Number"
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        onClose={() => setIsModalVisible(false)}
        centered
      >
        <div className="flex items-center justify-center my-4">
          <Image
            src="/icons/nric-serial-location-example.png"
            alt="NRIC Serial Number Location"
            width={250}
            preview={false}
            className="bg-transparent"
          />
        </div>
      </Modal>
    </div >
  );
};

export default ForgotEmailPageComponent;
