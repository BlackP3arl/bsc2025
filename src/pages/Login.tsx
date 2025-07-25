import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Spin, Divider, Space } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, WindowsOutlined } from '@ant-design/icons';
import { useAuthContext } from '../components/AuthProvider';
import { AzureAuthService } from '../services/azureAuth';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [azureLoading, setAzureLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, user } = useAuthContext();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAzureLogin = async () => {
    setAzureLoading(true);
    setError('');

    try {
      await AzureAuthService.signInWithAzure();
      // User will be redirected to Azure AD, no need to handle response here
    } catch (err: any) {
      setError(err.message || 'Azure sign-in failed');
      setAzureLoading(false);
    }
  };

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
            MTCC Balanced Scorecard
          </Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#6b7280' }} />}
              placeholder="Email address"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#6b7280' }} />}
              placeholder="Password"
              autoComplete="current-password"
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
              disabled={azureLoading}
              style={{ width: '100%', height: '48px' }}
            >
              {loading ? <Spin /> : 'Sign In with Email'}
            </Button>
          </Form.Item>

          {AzureAuthService.isAzureConfigured() && (
            <>
              <Divider>
                <Text type="secondary" style={{ fontSize: '12px' }}>OR</Text>
              </Divider>

              <Form.Item>
                <Button
                  type="default"
                  onClick={handleAzureLogin}
                  loading={azureLoading}
                  disabled={loading}
                  style={{ 
                    width: '100%', 
                    height: '48px',
                    borderColor: '#0078d4',
                    color: '#0078d4'
                  }}
                >
                  <Space>
                    <WindowsOutlined />
                    {azureLoading ? 'Connecting...' : 'Sign In with Microsoft'}
                  </Space>
                </Button>
              </Form.Item>
            </>
          )}

          <div style={{ textAlign: 'center' }}>
            <Button 
              type="link" 
              onClick={() => setShowForgotPassword(true)}
              style={{ color: '#1e40af' }}
            >
              Forgot your password?
            </Button>
          </div>
        </Form>

        <ForgotPasswordModal
          open={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
      </Card>
    </div>
  );
};