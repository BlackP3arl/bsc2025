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
import { useDivisions, useUsers, useStrategicObjectives, useKPIObjectives } from '../hooks/useData';

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
  const { data: objectives } = useStrategicObjectives();
  const { data: kpiObjectives } = useKPIObjectives(initialValues?.id);

  useEffect(() => {
    if (initialValues) {
      const formValues = { ...initialValues };
      
      // Add objective_ids if we're editing and have KPI objectives
      if (kpiObjectives && kpiObjectives.length > 0) {
        formValues.objective_ids = kpiObjectives;
        
        // Auto-set perspective based on objectives
        if (objectives) {
          const linkedObjectives = objectives.filter(obj => kpiObjectives.includes(obj.id));
          const perspectives = [...new Set(linkedObjectives.map(obj => obj.perspective))];
          if (perspectives.length === 1) {
            formValues.perspective = perspectives[0];
          }
        }
      }
      
      form.setFieldsValue(formValues);
    }
  }, [initialValues, form, kpiObjectives, objectives]);

  const handleFinish = (values: any) => {
    // Remove perspective field as it's not stored in KPI definition table
    // It's automatically derived from linked objectives
    const { perspective, ...rawData } = values;
    
    // Sanitize data to ensure proper types and handle null/undefined values
    const submissionData = {
      ...rawData,
      target_value: rawData.target_value || 0,
      threshold_red: rawData.threshold_red || 0,
      threshold_yellow: rawData.threshold_yellow || 0,
      threshold_green: rawData.threshold_green || 0,
      // Ensure strings are not empty
      name: rawData.name?.trim() || '',
      description: rawData.description?.trim() || '',
      formula: rawData.formula?.trim() || '',
      data_source: rawData.data_source?.trim() || '',
      units: rawData.units?.trim() || '',
    };
    
    console.log('Form submission data:', submissionData);
    onSubmit(submissionData);
  };

  // Handle objective selection change to auto-set perspective
  const handleObjectiveChange = (selectedObjectiveIds: string[]) => {
    if (selectedObjectiveIds.length > 0 && objectives) {
      // Get the selected objectives
      const selectedObjectives = objectives.filter(obj => selectedObjectiveIds.includes(obj.id));
      
      // Check if all objectives have the same perspective
      const perspectives = [...new Set(selectedObjectives.map(obj => obj.perspective))];
      
      if (perspectives.length === 1) {
        // All objectives have the same perspective, auto-set it
        form.setFieldsValue({ perspective: perspectives[0] });
      } else {
        // Multiple perspectives, clear the field
        form.setFieldsValue({ perspective: undefined });
      }
    } else {
      // No objectives selected, clear perspective
      form.setFieldsValue({ perspective: undefined });
    }
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

        <Divider>Strategic Alignment</Divider>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="objective_ids"
              label="Strategic Objectives"
              rules={[{ required: true, message: 'Please select at least one strategic objective' }]}
              tooltip="Link this KPI to the strategic objectives it supports"
            >
              <Select 
                mode="multiple"
                placeholder="Select strategic objectives this KPI supports"
                optionFilterProp="children"
                onChange={handleObjectiveChange}
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {objectives?.map(objective => (
                  <Option key={objective.id} value={objective.id}>
                    <div>
                      <strong>{objective.name}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {objective.perspective} • {divisions?.find(d => d.id === objective.division_id)?.name}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="perspective"
              label="BSC Perspective"
              tooltip="Automatically set based on selected objectives"
            >
              <Select 
                placeholder="Auto-selected based on objectives"
                disabled
                style={{ backgroundColor: '#f5f5f5' }}
              >
                <Option value="Financial">Financial</Option>
                <Option value="Customer">Customer</Option>
                <Option value="Internal">Internal Process</Option>
                <Option value="Learning">Learning & Growth</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

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