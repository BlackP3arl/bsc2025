import React, { useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  Typography,
  Card,
  Row,
  Col,
  Switch,
  Alert,
  Divider
} from 'antd';
import { 
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useDivisions } from '../hooks/useData';

const { Title, Text } = Typography;
const { Option } = Select;

interface UserFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

const roles = [
  { 
    value: 'Admin', 
    label: 'Administrator', 
    color: '#f5222d',
    description: 'Full system access, user management, system configuration'
  },
  { 
    value: 'Executive', 
    label: 'Executive', 
    color: '#722ed1',
    description: 'Strategic oversight, cross-division visibility, reporting access'
  },
  { 
    value: 'Manager', 
    label: 'Manager', 
    color: '#faad14',
    description: 'Division management, objective and KPI oversight'
  },
  { 
    value: 'User', 
    label: 'User', 
    color: '#52c41a',
    description: 'Basic access, data entry, limited reporting'
  }
];

export const UserForm: React.FC<UserFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false
}) => {
  const [form] = Form.useForm();
  const { data: divisions } = useDivisions();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    // If editing, don't include password if it's empty
    if (isEdit && (!values.password || values.password.trim() === '')) {
      delete values.password;
      delete values.confirmPassword;
    }
    
    onSubmit(values);
  };

  const validatePassword = (_: any, value: string) => {
    // SECURITY: Strong password validation
    if (!isEdit && !value) {
      return Promise.reject(new Error('Password is required'));
    }
    
    if (value && value.length < 12) {
      return Promise.reject(new Error('Password must be at least 12 characters'));
    }
    
    if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
      return Promise.reject(new Error('Password must contain uppercase, lowercase, number, and special character'));
    }
    
    // Check for common weak passwords
    const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome'];
    if (value && weakPasswords.some(weak => value.toLowerCase().includes(weak))) {
      return Promise.reject(new Error('Password contains common weak patterns'));
    }
    
    return Promise.resolve();
  };

  const validateConfirmPassword = (_: any, value: string) => {
    const password = form.getFieldValue('password');
    if (password && value !== password) {
      return Promise.reject(new Error('Passwords do not match'));
    }
    return Promise.resolve();
  };

  return (
    <Card>
      <Title level={3}>
        <UserOutlined style={{ marginRight: '8px' }} />
        {isEdit ? 'Edit User Account' : 'Create User Account'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          role: 'User',
          is_active: true,
          ...initialValues
        }}
      >
        {/* Personal Information */}
        <Divider>Personal Information</Divider>
        
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
              <Input 
                prefix={<UserOutlined />}
                placeholder="Enter first name" 
              />
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
              <Input 
                prefix={<UserOutlined />}
                placeholder="Enter last name" 
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter email address' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />}
                placeholder="Enter email address" 
                disabled={isEdit} // Email shouldn't be editable
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Please enter username' },
                { min: 3, message: 'Username must be at least 3 characters' },
                { 
                  pattern: /^[a-zA-Z0-9._-]+$/, 
                  message: 'Username can only contain letters, numbers, dots, hyphens, and underscores' 
                }
              ]}
            >
              <Input 
                prefix={<UserOutlined />}
                placeholder="Enter username" 
                disabled={isEdit} // Username shouldn't be editable
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="phone"
          label="Phone Number (Optional)"
          rules={[
            { 
              pattern: /^\+?[1-9]\d{6,14}$/, 
              message: 'Please enter a valid phone number' 
            }
          ]}
        >
          <Input 
            prefix={<PhoneOutlined />}
            placeholder="Enter phone number (e.g., +960 123 4567)" 
          />
        </Form.Item>

        {/* Account Security */}
        <Divider>Account Security</Divider>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="password"
              label={isEdit ? "New Password (leave blank to keep current)" : "Password"}
              rules={[
                { validator: validatePassword }
              ]}
            >
              <Input.Password 
                placeholder={isEdit ? "Enter new password (optional)" : "Enter password"} 
              />
            </Form.Item>
            {isEdit && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Note: If password change fails, the user will receive a password reset email instead.
              </Text>
            )}
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                { validator: validateConfirmPassword }
              ]}
            >
              <Input.Password 
                placeholder="Confirm password" 
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Role and Permissions */}
        <Divider>Role and Permissions</Divider>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="role"
              label="User Role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select placeholder="Select user role">
                {roles.map(role => (
                  <Option key={role.value} value={role.value}>
                    <div>
                      <Text strong style={{ color: role.color }}>{role.label}</Text>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {role.description}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="division_id"
              label="Division Assignment"
              rules={[{ required: true, message: 'Please select a division' }]}
            >
              <Select placeholder="Select division">
                {divisions?.map(division => (
                  <Option key={division.id} value={division.id}>
                    {division.name} ({division.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="is_active"
          label="Account Status"
          valuePropName="checked"
        >
          <Switch 
            checkedChildren="Active" 
            unCheckedChildren="Inactive"
          />
        </Form.Item>

        {/* Role Permissions Info */}
        <Alert
          message="Role Permissions"
          description={
            <div style={{ marginTop: '8px' }}>
              <Text strong>Administrator:</Text> Full system access, user management, system configuration<br />
              <Text strong>Executive:</Text> Strategic oversight, cross-division visibility, reporting access<br />
              <Text strong>Manager:</Text> Division management, objective and KPI oversight<br />
              <Text strong>User:</Text> Basic access, data entry, limited reporting
            </div>
          }
          type="info"
          showIcon
          icon={<SafetyOutlined />}
        />

        <Form.Item style={{ marginTop: '24px' }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Update User' : 'Create User'}
            </Button>
            <Button onClick={onCancel}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};