import React from 'react';
import { Alert, Card, Typography } from 'antd';

const { Title, Text } = Typography;

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '50px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <Card style={{ maxWidth: 600, width: '100%' }}>
            <Alert
              message="Application Error"
              description={
                <div>
                  <Text>Something went wrong while loading the application.</Text>
                  <br /><br />
                  <Text strong>Error Details:</Text>
                  <br />
                  <Text code>{this.state.error?.message || 'Unknown error'}</Text>
                  <br /><br />
                  <Text type="secondary">
                    Please check the browser console for more details.
                  </Text>
                </div>
              }
              type="error"
              showIcon
            />
            <div style={{ marginTop: 20 }}>
              <Title level={4}>Possible Solutions:</Title>
              <ul>
                <li>Check if your Supabase environment variables are configured correctly</li>
                <li>Refresh the page to try again</li>
                <li>Check the browser console for additional error information</li>
              </ul>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}