import React, { useState } from 'react';
import { Modal, Form, Input, Button, Alert, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { supabase } from '../lib/supabase';

const { Text } = Typography;

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

interface ForgotPasswordForm {
  email: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  open,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values: ForgotPasswordForm) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        form.resetFields();
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Modal
      title="Reset Password"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={400}
    >
      {success ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Alert
            message="Check your email"
            description="We've sent you a password reset link. Please check your email and follow the instructions to reset your password."
            type="success"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <Button type="primary" onClick={handleClose}>
            Close
          </Button>
        </div>
      ) : (
        <Form
          form={form}
          name="forgotPassword"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter your email address!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#6b7280' }} />}
              placeholder="Enter your email address"
              autoComplete="email"
            />
          </Form.Item>

          {error && (
            <Form.Item>
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: '8px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
            >
              Send Reset Link
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            <Button type="link" onClick={handleClose}>
              Back to Login
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};