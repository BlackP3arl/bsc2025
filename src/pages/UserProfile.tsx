import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Avatar, 
  Row, 
  Col, 
  Tag,
  Divider,
  Alert,
  Spin,
  message,
  Tabs,
  List,
  Badge
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  SafetyOutlined,
  EditOutlined,
  KeyOutlined,
  TeamOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useCurrentUser, useUpdateUserProfile, useDivisions } from '../hooks/useData';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const roleColors = {
  'Admin': '#f5222d',
  'Executive': '#722ed1', 
  'Manager': '#faad14',
  'User': '#52c41a'
};

const roleDescriptions = {
  'Admin': 'Full system access, user management, system configuration',
  'Executive': 'Strategic oversight, cross-division visibility, reporting access',
  'Manager': 'Division management, objective and KPI oversight',
  'User': 'Basic access, data entry, limited reporting'
};

export const UserProfile: React.FC = () => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const { data: divisions } = useDivisions();
  const updateMutation = useUpdateUserProfile();
  
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const handleUpdateBasicInfo = async (values: any) => {
    try {
      await updateMutation.mutateAsync({ 
        id: currentUser!.id, 
        data: values 
      });
      message.success('Profile updated successfully');
      setEditingBasicInfo(false);
    } catch (error: any) {
      message.error(error.message || 'Failed to update profile');
    }
  };

  const handleUpdatePassword = async (values: any) => {
    try {
      await updateMutation.mutateAsync({ 
        id: currentUser!.id, 
        data: { password: values.newPassword } 
      });
      message.success('Password updated successfully');
      setEditingPassword(false);
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Failed to update password');
    }
  };

  const validateConfirmPassword = (_: any, value: string) => {
    const newPassword = passwordForm.getFieldValue('newPassword');
    if (newPassword && value !== newPassword) {
      return Promise.reject(new Error('Passwords do not match'));
    }
    return Promise.resolve();
  };

  const getDivisionName = (divisionId: string) => {
    return divisions?.find(d => d.id === divisionId)?.name || 'Unknown Division';
  };

  if (isLoading) {
    return (
      <div className="mtcc-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Alert
        message="User not found"
        description="Unable to load user profile information."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          <UserOutlined style={{ marginRight: '8px' }} />
          User Profile
        </Title>
        <Text type="secondary">
          Manage your personal information and account settings
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Overview */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar 
                size={120} 
                style={{ 
                  backgroundColor: roleColors[currentUser.role as keyof typeof roleColors],
                  fontSize: '48px',
                  marginBottom: '16px'
                }}
                icon={<UserOutlined />}
              />
              <Title level={3} style={{ marginBottom: '8px' }}>
                {currentUser.first_name} {currentUser.last_name}
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                @{currentUser.username}
              </Text>
            </div>

            <Divider />

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>Role</Text>
                <div style={{ marginTop: '4px' }}>
                  <Tag 
                    color={roleColors[currentUser.role as keyof typeof roleColors]}
                    style={{ fontSize: '14px', padding: '4px 12px' }}
                  >
                    {currentUser.role}
                  </Tag>
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {roleDescriptions[currentUser.role as keyof typeof roleDescriptions]}
                </Text>
              </div>

              <div>
                <Text strong>Division</Text>
                <div style={{ marginTop: '4px' }}>
                  <Space>
                    <TeamOutlined />
                    <Text>{getDivisionName(currentUser.division_id)}</Text>
                  </Space>
                </div>
              </div>

              <div>
                <Text strong>Account Status</Text>
                <div style={{ marginTop: '4px' }}>
                  <Badge 
                    status={currentUser.is_active ? 'success' : 'error'} 
                    text={currentUser.is_active ? 'Active' : 'Inactive'}
                  />
                </div>
              </div>

              <div>
                <Text strong>Member Since</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text type="secondary">
                    {new Date(currentUser.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </div>
              </div>

              <div>
                <Text strong>Last Login</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text type="secondary">
                    {currentUser.last_login 
                      ? new Date(currentUser.last_login).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Never'
                    }
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Profile Management */}
        <Col xs={24} lg={16}>
          <Tabs defaultActiveKey="basic">
            <TabPane tab="Basic Information" key="basic">
              <Card 
                title="Personal Information"
                extra={
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingBasicInfo(true);
                      form.setFieldsValue({
                        first_name: currentUser.first_name,
                        last_name: currentUser.last_name,
                        phone: currentUser.phone || ''
                      });
                    }}
                    disabled={editingBasicInfo}
                  >
                    Edit
                  </Button>
                }
              >
                {editingBasicInfo ? (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateBasicInfo}
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="first_name"
                          label="First Name"
                          rules={[
                            { required: true, message: 'Please enter first name' },
                            { min: 2, message: 'First name must be at least 2 characters' }
                          ]}
                        >
                          <Input prefix={<UserOutlined />} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="last_name"
                          label="Last Name"
                          rules={[
                            { required: true, message: 'Please enter last name' },
                            { min: 2, message: 'Last name must be at least 2 characters' }
                          ]}
                        >
                          <Input prefix={<UserOutlined />} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      name="phone"
                      label="Phone Number"
                      rules={[
                        { 
                          pattern: /^\+?[1-9]\d{6,14}$/, 
                          message: 'Please enter a valid phone number' 
                        }
                      ]}
                    >
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>
                    <Form.Item>
                      <Space>
                        <Button 
                          type="primary" 
                          htmlType="submit"
                          loading={updateMutation.isPending}
                        >
                          Save Changes
                        </Button>
                        <Button onClick={() => setEditingBasicInfo(false)}>
                          Cancel
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                ) : (
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <div>
                          <Text strong>First Name</Text>
                          <div style={{ marginTop: '4px' }}>
                            <Text>{currentUser.first_name}</Text>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} md={12}>
                        <div>
                          <Text strong>Last Name</Text>
                          <div style={{ marginTop: '4px' }}>
                            <Text>{currentUser.last_name}</Text>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <div>
                          <Text strong>Email Address</Text>
                          <div style={{ marginTop: '4px' }}>
                            <Space>
                              <MailOutlined />
                              <Text>{currentUser.email}</Text>
                            </Space>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} md={12}>
                        <div>
                          <Text strong>Phone Number</Text>
                          <div style={{ marginTop: '4px' }}>
                            <Space>
                              <PhoneOutlined />
                              <Text>{currentUser.phone || 'Not provided'}</Text>
                            </Space>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Space>
                )}
              </Card>
            </TabPane>

            <TabPane tab="Security" key="security">
              <Card 
                title="Password Management"
                extra={
                  <Button 
                    type="primary" 
                    icon={<KeyOutlined />}
                    onClick={() => setEditingPassword(true)}
                    disabled={editingPassword}
                  >
                    Change Password
                  </Button>
                }
              >
                {editingPassword ? (
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleUpdatePassword}
                  >
                    <Form.Item
                      name="newPassword"
                      label="New Password"
                      rules={[
                        { required: true, message: 'Please enter new password' },
                        { min: 8, message: 'Password must be at least 8 characters' }
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item
                      name="confirmPassword"
                      label="Confirm New Password"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Please confirm your password' },
                        { validator: validateConfirmPassword }
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item>
                      <Space>
                        <Button 
                          type="primary" 
                          htmlType="submit"
                          loading={updateMutation.isPending}
                        >
                          Update Password
                        </Button>
                        <Button onClick={() => {
                          setEditingPassword(false);
                          passwordForm.resetFields();
                        }}>
                          Cancel
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                ) : (
                  <div>
                    <Alert
                      message="Password Security"
                      description="Your password is encrypted and secure. Update it regularly to maintain account security."
                      type="info"
                      showIcon
                      icon={<SafetyOutlined />}
                    />
                    <div style={{ marginTop: '16px' }}>
                      <Text type="secondary">
                        Last updated: {new Date(currentUser.updated_at).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                )}
              </Card>
            </TabPane>

            <TabPane tab="Activity" key="activity">
              <Card title="Account Activity">
                <List
                  dataSource={[
                    {
                      id: 1,
                      action: 'Account Created',
                      date: currentUser.created_at,
                      description: 'Your account was created'
                    },
                    {
                      id: 2,
                      action: 'Last Login',
                      date: currentUser.last_login,
                      description: 'Your last successful login'
                    },
                    {
                      id: 3,
                      action: 'Profile Updated',
                      date: currentUser.updated_at,
                      description: 'Your profile information was last updated'
                    }
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<HistoryOutlined />} />}
                        title={item.action}
                        description={
                          <div>
                            <Text type="secondary">{item.description}</Text>
                            <div style={{ marginTop: '4px' }}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {item.date ? new Date(item.date).toLocaleString() : 'Never'}
                              </Text>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};