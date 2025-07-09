import React from 'react';
import { Modal, Form, FormInstance } from 'antd';

export interface FormModalProps {
    title: string;
    visible: boolean;
    onCancel: () => void;
    onOk: () => void;
    loading?: boolean;
    width?: number | string;
    children: React.ReactNode;
    form?: FormInstance;
    okText?: string;
    cancelText?: string;
    destroyOnClose?: boolean;
    centered?: boolean;
}

const FormModal: React.FC<FormModalProps> = ({
    title,
    visible,
    onCancel,
    onOk,
    loading = false,
    width = 600,
    children,
    form,
    okText = "Save",
    cancelText = "Cancel",
    destroyOnClose: destroyOnHidden = true,
    centered = true,
}) => {
    return (
        <Modal
            title={title}
            open={visible}
            onCancel={onCancel}
            onOk={onOk}
            confirmLoading={loading}
            width={width}
            okText={okText}
            cancelText={cancelText}
            destroyOnHidden={destroyOnHidden}
            centered={centered}
            className="admin-form-modal"
        >
            {form ? (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onOk}
                    className="mt-4"
                >
                    {children}
                </Form>
            ) : (
                <div className="mt-4">
                    {children}
                </div>
            )}
        </Modal>
    );
};

export default FormModal;
