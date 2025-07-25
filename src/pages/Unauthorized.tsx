import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined } from '@ant-design/icons';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        icon={<LockOutlined style={{ color: '#ff4d4f' }} />}
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />
    </div>
  );
};