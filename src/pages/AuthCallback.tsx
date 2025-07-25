import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Card, Spin, Alert, Typography } from 'antd';
import { AzureAuthService, provisionAzureUser } from '../services/azureAuth';
import { useAuthContext } from '../components/AuthProvider';

const { Title, Text } = Typography;

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for OAuth errors
        if (errorParam) {
          throw new Error(errorDescription || `OAuth error: ${errorParam}`);
        }

        // Check for required parameters
        if (!code || !state) {
          throw new Error('Missing required OAuth parameters');
        }

        // Handle the callback
        const authResult = await AzureAuthService.handleAuthCallback(code, state);
        
        if (authResult.user) {
          // Get Azure user info from Microsoft Graph
          if (authResult.session?.provider_token) {
            try {
              const azureUserInfo = await AzureAuthService.getAzureUserInfo(
                authResult.session.provider_token
              );
              
              // Provision user in our database
              await provisionAzureUser(azureUserInfo, authResult.user);
            } catch (graphError) {
              console.warn('Could not fetch Azure user info:', graphError);
              // Continue without Graph API data
            }
          }

          setSuccess(true);
        } else {
          throw new Error('Authentication succeeded but no user data received');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams]);

  // Redirect to dashboard if authentication was successful
  if (success || user) {
    return <Navigate to="/dashboard" replace />;
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
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
      >
        {loading && (
          <>
            <Spin size="large" style={{ marginBottom: '16px' }} />
            <Title level={4}>Authenticating...</Title>
            <Text type="secondary">
              Processing your Microsoft account authentication
            </Text>
          </>
        )}

        {error && (
          <>
            <Alert
              message="Authentication Failed"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            <Text type="secondary">
              Please try again or contact your administrator if the problem persists.
            </Text>
          </>
        )}

        {success && (
          <>
            <Alert
              message="Authentication Successful"
              description="Redirecting to dashboard..."
              type="success"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            <Spin size="small" />
          </>
        )}
      </Card>
    </div>
  );
};