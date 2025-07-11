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
  InputNumber,
  Divider
} from 'antd';
import { 
  BarChartOutlined
} from '@ant-design/icons';
import { useDivisions, useUsers } from '../hooks/useData';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface KPIFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const frequencies = [
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
];

export const KPIForm: React.FC<KPIFormProps> = ({
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
        <BarChartOutlined style={{ marginRight: '8px' }} />
        {initialValues ? 'Edit KPI Definition' : 'Create KPI Definition'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          frequency: 'Monthly',
          units: '%',
          ...initialValues
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="KPI Name"
              rules={[
                { required: true, message: 'Please enter KPI name' },
                { min: 3, message: 'Name must be at least 3 characters' }
              ]}
            >
              <Input placeholder="Enter KPI name" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="units"
              label="Units"
              rules={[{ required: true, message: 'Please enter units' }]}
            >
              <Input placeholder="e.g., %, $, Count, Score" />
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
            rows={3} 
            placeholder="Describe what this KPI measures and its purpose"
          />
        </Form.Item>

        <Form.Item
          name="formula"
          label="Formula"
          rules={[{ required: true, message: 'Please enter the calculation formula' }]}
        >
          <TextArea 
            rows={2} 
            placeholder="e.g., (Revenue - Cost) / Revenue * 100"
          />
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="frequency"
              label="Measurement Frequency"
              rules={[{ required: true, message: 'Please select frequency' }]}
            >
              <Select placeholder="Select frequency">
                {frequencies.map(freq => (
                  <Option key={freq.value} value={freq.value}>
                    {freq.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="data_source"
              label="Data Source"
              rules={[{ required: true, message: 'Please enter data source' }]}
            >
              <Input placeholder="e.g., Financial System, Survey, Manual Entry" />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Performance Thresholds</Divider>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Form.Item
              name="target_value"
              label="Target Value"
              rules={[{ required: true, message: 'Please enter target value' }]}
            >
              <InputNumber 
                placeholder="Target"
                style={{ width: '100%' }}
                precision={2}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={6}>
            <Form.Item
              name="threshold_green"
              label="Green Threshold"
              rules={[{ required: true, message: 'Please enter green threshold' }]}
              tooltip="Values at or above this threshold will be marked as 'Good'"
            >
              <InputNumber 
                placeholder="Green"
                style={{ width: '100%' }}
                precision={2}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={6}>
            <Form.Item
              name="threshold_yellow"
              label="Yellow Threshold"
              rules={[{ required: true, message: 'Please enter yellow threshold' }]}
              tooltip="Values at or above this threshold will be marked as 'Caution'"
            >
              <InputNumber 
                placeholder="Yellow"
                style={{ width: '100%' }}
                precision={2}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={6}>
            <Form.Item
              name="threshold_red"
              label="Red Threshold"
              rules={[{ required: true, message: 'Please enter red threshold' }]}
              tooltip="Values below this threshold will be marked as 'Poor'"
            >
              <InputNumber 
                placeholder="Red"
                style={{ width: '100%' }}
                precision={2}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Ownership</Divider>

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
              label="KPI Owner"
              rules={[{ required: true, message: 'Please select an owner' }]}
            >
              <Select placeholder="Select KPI owner">
                {users?.map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialValues ? 'Update KPI' : 'Create KPI'}
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