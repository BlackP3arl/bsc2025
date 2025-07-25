import React from 'react';
import { Card, Typography, Space, Button, Alert } from 'antd';
import { useAuthContext } from './AuthProvider';
import { useCurrentUser } from '../hooks/useData';

const { Title, Text, Paragraph } = Typography;

export const AuthDebug: React.FC = () => {
  const { user: authUser, session, loading } = useAuthContext();
  const { data: currentUser, isLoading: userLoading, error: userError } = useCurrentUser();

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return (
      <Card title="Auth Debug Info" style={{ margin: '20px', maxWidth: '800px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Title level={5}>Auth Context User:</Title>
            <Paragraph>
              <Text code>{JSON.stringify(authUser, null, 2)}</Text>
            </Paragraph>
          </div>

          <div>
            <Title level={5}>Current User (from database):</Title>
            <Paragraph>
              <Text code>{JSON.stringify(currentUser, null, 2)}</Text>
            </Paragraph>
          </div>

          <div>
            <Title level={5}>Session Info:</Title>
            <Paragraph>
              <Text code>{JSON.stringify({ 
                hasSession: !!session,
                userEmail: session?.user?.email,
                loading,
                userLoading,
                userError: userError?.message 
              }, null, 2)}</Text>
            </Paragraph>
          </div>

          {authUser && authUser.email === 'salle.kma@gmail.com' && (
            <Alert
              message="Admin User Detected"
              description={`Role: ${authUser.role || 'NOT SET'} - This user should have Admin access to all features.`}
              type={authUser.role === 'Admin' ? 'success' : 'warning'}
              showIcon
            />
          )}

          <Button 
            onClick={() => window.location.reload()} 
            type="primary"
          >
            Refresh Page
          </Button>
        </Space>
      </Card>
    );
  }

  return null;
};