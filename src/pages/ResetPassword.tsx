import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { supabase } from '../lib/supabase';

const { Title, Text } = Typography;

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export const ResetPassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have access token and type in URL params
    const accessToken = searchParams.get('access_token');
    const type = searchParams.get('type');

    if (accessToken && type === 'recovery') {
      setIsValidToken(true);
    } else {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleSubmit = async (values: ResetPasswordForm) => {
    if (values.password !== values.confirmPassword) {
      form.setFields([
        {
          name: 'confirmPassword',
          errors: ['Passwords do not match!'],
        },
      ]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Please input your password!'));
    }
    if (value.length < 8) {
      return Promise.reject(new Error('Password must be at least 8 characters long!'));
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return Promise.reject(
        new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number!')
      );
    }
    return Promise.resolve();
  };

  if (!isValidToken && !error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Alert
          message="Loading..."
          description="Validating reset link..."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div 
            className="mtcc-logo"
            style={{
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '24px',
              fontWeight: 'bold'
            }}
          >
            M
          </div>
          <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
            Reset Your Password
          </Title>
          <Text type="secondary">
            {success 
              ? 'Password reset successful!' 
              : 'Enter your new password below'
            }
          </Text>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <Alert
              message="Password Updated Successfully"
              description="Your password has been updated. You will be redirected to the login page in a few seconds."
              type="success"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            <Button 
              type="primary" 
              onClick={() => navigate('/login')}
              style={{ width: '100%' }}
            >
              Go to Login
            </Button>
          </div>
        ) : (
          <Form
            form={form}
            name="resetPassword"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="password"
              label="New Password"
              rules={[{ validator: validatePassword }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#6b7280' }} />}
                placeholder="Enter new password"
                autoComplete="new-password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#6b7280' }} />}
                placeholder="Confirm new password"
                autoComplete="new-password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
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

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                style={{ width: '100%', height: '48px' }}
              >
                Update Password
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Button 
                type="link" 
                onClick={() => navigate('/login')}
                style={{ color: '#1e40af' }}
              >
                Back to Login
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};