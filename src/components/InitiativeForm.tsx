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
  DatePicker,
  InputNumber,
  Divider
} from 'antd';
import { 
  ProjectOutlined
} from '@ant-design/icons';
import { useStrategicObjectives, useUsers } from '../hooks/useData';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface InitiativeFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const priorities = [
  { value: 'Low', label: 'Low', color: '#52c41a' },
  { value: 'Medium', label: 'Medium', color: '#faad14' },
  { value: 'High', label: 'High', color: '#fa541c' },
  { value: 'Critical', label: 'Critical', color: '#f5222d' },
];

const statuses = [
  { value: 'Planning', label: 'Planning', color: '#1890ff' },
  { value: 'Active', label: 'Active', color: '#52c41a' },
  { value: 'On Hold', label: 'On Hold', color: '#faad14' },
  { value: 'Completed', label: 'Completed', color: '#722ed1' },
  { value: 'Cancelled', label: 'Cancelled', color: '#f5222d' },
];

export const InitiativeForm: React.FC<InitiativeFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm();
  const { data: objectives } = useStrategicObjectives();
  const { data: users } = useUsers();

  useEffect(() => {
    if (initialValues) {
      const formValues = {
        ...initialValues,
        timeline: initialValues.start_date && initialValues.end_date ? [
          dayjs(initialValues.start_date),
          dayjs(initialValues.end_date)
        ] : null
      };
      form.setFieldsValue(formValues);
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      start_date: values.timeline?.[0]?.toISOString(),
      end_date: values.timeline?.[1]?.toISOString(),
      timeline: undefined
    };
    onSubmit(formattedValues);
  };

  return (
    <Card>
      <Title level={3}>
        <ProjectOutlined style={{ marginRight: '8px' }} />
        {initialValues ? 'Edit Strategic Initiative' : 'Create Strategic Initiative'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          status: 'Planning',
          priority: 'Medium',
          budget: 0,
          ...initialValues
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Initiative Name"
              rules={[
                { required: true, message: 'Please enter initiative name' },
                { min: 5, message: 'Name must be at least 5 characters' }
              ]}
            >
              <Input placeholder="Enter initiative name" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="objective_id"
              label="Strategic Objective"
              rules={[{ required: true, message: 'Please select a strategic objective' }]}
            >
              <Select placeholder="Select strategic objective">
                {objectives?.map(objective => (
                  <Option key={objective.id} value={objective.id}>
                    {objective.name} ({objective.perspective})
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
            placeholder="Describe the strategic initiative and its objectives"
          />
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select placeholder="Select status">
                {statuses.map(status => (
                  <Option key={status.value} value={status.value}>
                    <Space>
                      <span style={{ color: status.color }}>●</span>
                      {status.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="priority"
              label="Priority"
              rules={[{ required: true, message: 'Please select priority' }]}
            >
              <Select placeholder="Select priority">
                {priorities.map(priority => (
                  <Option key={priority.value} value={priority.value}>
                    <Space>
                      <span style={{ color: priority.color }}>●</span>
                      {priority.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="timeline"
              label="Timeline"
              rules={[{ required: true, message: 'Please select start and end dates' }]}
            >
              <RangePicker 
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="budget"
              label="Budget (MVR)"
              rules={[{ required: true, message: 'Please enter budget amount' }]}
            >
              <InputNumber 
                placeholder="Enter budget amount"
                style={{ width: '100%' }}
                min={0}
                precision={2}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Ownership & Responsibility</Divider>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="owner_id"
              label="Initiative Owner"
              rules={[{ required: true, message: 'Please select an owner' }]}
            >
              <Select placeholder="Select initiative owner">
                {users?.map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="sponsor_id"
              label="Executive Sponsor"
              tooltip="Executive sponsor who provides strategic oversight"
            >
              <Select placeholder="Select executive sponsor">
                {users?.map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider>Progress Tracking</Divider>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="progress_percentage"
              label="Progress Percentage"
              rules={[{ required: true, message: 'Please enter progress percentage' }]}
            >
              <InputNumber 
                placeholder="Enter progress percentage"
                style={{ width: '100%' }}
                min={0}
                max={100}
                precision={0}
                formatter={(value) => `${value}%`}
                parser={(value) => value?.replace('%', '') as any}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="expected_outcome"
              label="Expected Outcome"
              rules={[{ required: true, message: 'Please enter expected outcome' }]}
            >
              <Input placeholder="Enter expected outcome or deliverable" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="success_criteria"
          label="Success Criteria"
          rules={[{ required: true, message: 'Please enter success criteria' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Define measurable success criteria for this initiative"
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialValues ? 'Update Initiative' : 'Create Initiative'}
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