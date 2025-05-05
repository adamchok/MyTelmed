"use client";

import { Button, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { ComponentProps } from "./props";
import "./index.css";

const Component = ({ onFinish }: ComponentProps) => {
  const [form] = Form.useForm();
  const { t } = useTranslation('signIn');

  return (
    <div className="flex items-center justify-center w-full min-h-[700px] md:min-h-[600px] h-full px-5">
      <div className="md:w-[450px] w-full md:h-[450px] h-auto bg-white rounded-sm shadow-md px-10 py-10">
        <div className="flex flex-col">
          <h2 className="font-bold text-2xl">{t('login-title') || 'Login'}</h2>
          <Form
            form={form}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            onFinish={onFinish}
            variant="filled"
            autoComplete="off"
            initialValues={{ remember: true }}
          >
            <div className="mt-8">
              <Form.Item
                label={t('userIc') || 'IC Number'}
                name="userIc"
                className="font-bold form-text"
                rules={[{ required: true, message: t("error.emptyUserIc") }]}
              >
                <Input placeholder={t('placeholder.userIc') || 'Enter your IC number'} className="h-10" />
              </Form.Item>
              <div className="mt-5">
                <Form.Item
                  label={t('password') || 'Password'}
                  name="password"
                  className="font-bold form-text"
                  rules={[{ required: true, message: t("error.emptyPassword") }]}
                >
                  <Input.Password placeholder={t('placeholder.password') || 'Enter your password'} className="h-10" />
                </Form.Item>
              </div>
              <div className="mt-16">
                <Form.Item wrapperCol={{ span: 24 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full font-bold"
                    style={{ height: 35 }}
                  >
                    <p className="text-[15px] font-bold">{t('login') || 'Log In'}</p>
                  </Button>
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Component;
