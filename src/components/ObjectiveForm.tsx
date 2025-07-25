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
  DollarOutlined,
  CustomerServiceOutlined,
  SettingOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useDivisions, useUsers } from '../hooks/useData';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ObjectiveFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const perspectives = [
  { 
    value: 'Financial', 
    label: 'Financial', 
    icon: <DollarOutlined />,
    description: 'Revenue, profitability, cost management'
  },
  { 
    value: 'Customer', 
    label: 'Customer', 
    icon: <CustomerServiceOutlined />,
    description: 'Satisfaction, retention, market share'
  },
  { 
    value: 'Internal', 
    label: 'Internal Process', 
    icon: <SettingOutlined />,
    description: 'Operational efficiency, quality, innovation'
  },
  { 
    value: 'Learning', 
    label: 'Learning & Growth', 
    icon: <BookOutlined />,
    description: 'Employee development, capabilities, culture'
  },
];

export const ObjectiveForm: React.FC<ObjectiveFormProps> = ({
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

  return (
    <Card>
      <Title level={3}>
        {initialValues ? 'Edit Strategic Objective' : 'Create Strategic Objective'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          status: 'Active',
          perspective: 'Financial',
          ...initialValues
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Objective Name"
              rules={[
                { required: true, message: 'Please enter objective name' },
                { min: 5, message: 'Name must be at least 5 characters' }
              ]}
            >
              <Input placeholder="Enter objective name" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="perspective"
              label="BSC Perspective"
              rules={[{ required: true, message: 'Please select a perspective' }]}
            >
              <Select placeholder="Select perspective">
                {perspectives.map(perspective => (
                  <Option key={perspective.value} value={perspective.value}>
                    <Space>
                      {perspective.icon}
                      <div>
                        <div>{perspective.label}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {perspective.description}
                        </div>
                      </div>
                    </Space>
                  </Option>
                ))}
              </Select>
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
            placeholder="Describe the strategic objective and its purpose"
          />
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="division_id"
              label="Division"
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
          
          <Col xs={24} md={12}>
            <Form.Item
              name="owner_id"
              label="Owner"
              rules={[{ required: true, message: 'Please select an owner' }]}
            >
              <Select placeholder="Select objective owner">
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
            <Option value="Archived">Archived</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialValues ? 'Update Objective' : 'Create Objective'}
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