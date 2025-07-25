import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const Test: React.FC = () => {
  return (
    <div style={{ 
      padding: '50px', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Card style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
        <Space direction="vertical" size="large">
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
          <Title level={2}>MTCC BSC Application</Title>
          <Text>The application is running successfully with Ant Design!</Text>
          <div>
            <Text strong>System Status:</Text>
            <br />
            <Text>Application: ✅ Running</Text>
            <br />
            <Text>Database: ✅ Connected</Text>
          </div>
          <Button type="primary" href="/login">
            Go to Login
          </Button>
        </Space>
      </Card>
    </div>
  );
};