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
  Col
} from 'antd';
import { 
  TeamOutlined
} from '@ant-design/icons';
import { useDivisions, useUsers } from '../hooks/useData';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface DivisionFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DivisionForm: React.FC<DivisionFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm();
  const { data: divisions } = useDivisions();
  const { data: users } = useUsers();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  // Filter out the current division from parent options to prevent circular references
  const availableParentDivisions = divisions?.filter(division => 
    division.id !== initialValues?.id
  ) || [];

  return (
    <Card>
      <Title level={3}>
        <TeamOutlined style={{ marginRight: '8px' }} />
        {initialValues ? 'Edit Division' : 'Create Division'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          status: 'Active',
          ...initialValues
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Division Name"
              rules={[
                { required: true, message: 'Please enter division name' },
                { min: 3, message: 'Name must be at least 3 characters' }
              ]}
            >
              <Input placeholder="Enter division name" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="code"
              label="Division Code"
              rules={[
                { required: true, message: 'Please enter division code' },
                { min: 2, message: 'Code must be at least 2 characters' },
                { max: 10, message: 'Code must be at most 10 characters' },
                { 
                  pattern: /^[A-Z0-9]+$/, 
                  message: 'Code must contain only uppercase letters and numbers' 
                }
              ]}
            >
              <Input 
                placeholder="Enter division code (e.g., CDD, TD)" 
                style={{ textTransform: 'uppercase' }}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  form.setFieldsValue({ code: value });
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: 'Please enter description' },
            { min: 10, message: 'Description must be at least 10 characters' }
          ]}
        >
          <TextArea 
            rows={4} 
            placeholder="Describe the division's purpose and responsibilities"
          />
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="parent_division_id"
              label="Parent Division"
              tooltip="Select a parent division if this division reports to another division"
            >
              <Select 
                placeholder="Select parent division (optional)"
                allowClear
              >
                {availableParentDivisions.map(division => (
                  <Option key={division.id} value={division.id}>
                    {division.name} ({division.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="head_id"
              label="Division Head"
              tooltip="Select the person who heads this division"
            >
              <Select 
                placeholder="Select division head (optional)"
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                }
              >
                {users?.map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select>
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialValues ? 'Update Division' : 'Create Division'}
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