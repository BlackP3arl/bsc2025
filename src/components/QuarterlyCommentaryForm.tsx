import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Card,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  Progress
} from 'antd';
import {
  CommentOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useCurrentUser } from '../hooks/useData';
import type { QuarterlyCommentary, StrategicInitiative } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface QuarterlyCommentaryFormProps {
  initiative: StrategicInitiative;
  initialValues?: QuarterlyCommentary;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const quarters = [
  { value: 'Q1', label: 'Q1 (Jan-Mar)', color: '#52c41a' },
  { value: 'Q2', label: 'Q2 (Apr-Jun)', color: '#1890ff' },
  { value: 'Q3', label: 'Q3 (Jul-Sep)', color: '#faad14' },
  { value: 'Q4', label: 'Q4 (Oct-Dec)', color: '#f5222d' },
];

const statusConfig = {
  Draft: { color: '#d9d9d9', icon: <ClockCircleOutlined /> },
  Submitted: { color: '#faad14', icon: <ExclamationCircleOutlined /> },
  Approved: { color: '#52c41a', icon: <CheckCircleOutlined /> },
};

const getCurrentQuarter = () => {
  const month = dayjs().month() + 1; // dayjs months are 0-based
  if (month <= 3) return 'Q1';
  if (month <= 6) return 'Q2';
  if (month <= 9) return 'Q3';
  return 'Q4';
};

export const QuarterlyCommentaryForm: React.FC<QuarterlyCommentaryFormProps> = ({
  initiative,
  initialValues,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm();
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        review_date: initialValues.review_date ? dayjs(initialValues.review_date) : undefined,
      });
    } else {
      // Set default values for new commentary
      form.setFieldsValue({
        year: dayjs().year(),
        quarter: getCurrentQuarter(),
        reviewer_id: currentUser?.id,
        review_date: dayjs(),
        status: 'Draft',
      });
    }
  }, [initialValues, form, currentUser]);

  const handleFinish = (values: any) => {
    const submissionData = {
      ...values,
      initiative_id: initiative.id,
      review_date: values.review_date ? values.review_date.format('YYYY-MM-DD') : undefined,
      reviewer_id: currentUser?.id,
    };
    
    console.log('Quarterly Commentary submission:', submissionData);
    console.log('Current user:', currentUser);
    console.log('Initiative:', initiative);
    onSubmit(submissionData);
  };


  return (
    <div>
      {/* Compact Header with Initiative Details */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ marginBottom: '8px' }}>
              {initialValues ? 'Update Quarterly Commentary' : 'Add Quarterly Commentary'}
            </Title>
            <div>
              <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                {initiative.name}
              </Text>
              <div style={{ marginTop: '4px', marginBottom: '12px' }}>
                <Text type="secondary">
                  {initiative.description}
                </Text>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Tag color={initiative.status === 'Active' ? 'green' : 'orange'}>
                  {initiative.status}
                </Tag>
                <Tag color={initiative.priority === 'High' ? 'red' : 'blue'}>
                  {initiative.priority}
                </Tag>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Progress 
                    percent={initiative.progress_percentage || 0} 
                    size="small"
                    style={{ width: '100px' }}
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {initiative.progress_percentage || 0}%
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {dayjs(initiative.start_date).format('MMM DD, YYYY')} - {dayjs(initiative.end_date).format('MMM DD, YYYY')}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  MVR {initiative.budget?.toLocaleString() || '0'}
                </Text>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" form="quarterly-commentary-form" htmlType="submit" loading={loading}>
              {initialValues ? 'Update Commentary' : 'Add Commentary'}
            </Button>
          </Space>
        </div>
      </Card>

      {/* Commentary Form */}
      <Card title={<Space><CommentOutlined />Quarterly Commentary</Space>}>
        <Form
          id="quarterly-commentary-form"
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="year"
                label="Year"
                rules={[{ required: true, message: 'Please select the year' }]}
              >
                <Select placeholder="Select year">
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = dayjs().year() - 2 + i;
                    return (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                name="quarter"
                label="Quarter"
                rules={[{ required: true, message: 'Please select the quarter' }]}
              >
                <Select placeholder="Select quarter">
                  {quarters.map(quarter => (
                    <Option key={quarter.value} value={quarter.value}>
                      <Space>
                        <span style={{ color: quarter.color }}>●</span>
                        {quarter.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                name="review_date"
                label="Review Date"
                rules={[{ required: true, message: 'Please select the review date' }]}
              >
                <DatePicker
                  placeholder="Select review date"
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name="commentary"
                label="Commentary"
                rules={[
                  { required: true, message: 'Please enter commentary' },
                  { min: 10, message: 'Commentary must be at least 10 characters' },
                  { max: 2000, message: 'Commentary must be less than 2000 characters' }
                ]}
              >
                <TextArea
                  placeholder="Enter detailed commentary about the initiative's progress, achievements, challenges, and recommendations..."
                  rows={6}
                  showCount
                  maxLength={2000}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <Option key={status} value={status}>
                      <Space>
                        <span style={{ color: config.color }}>
                          {config.icon}
                        </span>
                        {status}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="reviewer_id"
                label="Reviewer"
                tooltip="Current user will be set as reviewer"
              >
                <Select
                  placeholder="Reviewer"
                  disabled
                  style={{ backgroundColor: '#f5f5f5' }}
                >
                  <Option value={currentUser?.id}>
                    <Space>
                      <UserOutlined />
                      {currentUser?.first_name} {currentUser?.last_name}
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Guidelines */}
          <Card size="small" style={{ marginTop: '16px', backgroundColor: '#f9f9f9' }}>
            <Title level={5}>Commentary Guidelines</Title>
            <ul style={{ marginBottom: 0 }}>
              <li>Provide specific details about progress and achievements</li>
              <li>Identify challenges and obstacles encountered</li>
              <li>Include recommendations for improvements</li>
              <li>Mention resource requirements or adjustments needed</li>
              <li>Assess alignment with strategic objectives</li>
              <li>Note any changes in timeline or scope</li>
            </ul>
          </Card>
        </Form>
      </Card>
    </div>
  );
};