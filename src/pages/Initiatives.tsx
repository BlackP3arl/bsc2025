import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Typography, 
  Space, 
  Spin,
  Alert,
  Statistic,
  List,
  Avatar,
  Tooltip,
  Empty,
  message,
  Popconfirm,
  Progress
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ProjectOutlined,
  CalendarOutlined,
  DollarOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  FlagOutlined
} from '@ant-design/icons';
import { 
  useStrategicInitiatives, 
  useCreateStrategicInitiative, 
  useUpdateStrategicInitiative, 
  useDeleteStrategicInitiative,
  useStrategicObjectives
} from '../hooks/useData';
import { InitiativeForm } from '../components/InitiativeForm';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const statuses = [
  { value: 'Planning', label: 'Planning', color: '#1890ff' },
  { value: 'Active', label: 'Active', color: '#52c41a' },
  { value: 'On Hold', label: 'On Hold', color: '#faad14' },
  { value: 'Completed', label: 'Completed', color: '#722ed1' },
  { value: 'Cancelled', label: 'Cancelled', color: '#f5222d' },
];

const priorities = [
  { value: 'Low', label: 'Low', color: '#52c41a' },
  { value: 'Medium', label: 'Medium', color: '#faad14' },
  { value: 'High', label: 'High', color: '#fa541c' },
  { value: 'Critical', label: 'Critical', color: '#f5222d' },
];

const getStatusColor = (status: string) => {
  const statusConfig = statuses.find(s => s.value === status);
  return statusConfig?.color || 'default';
};

const getPriorityColor = (priority: string) => {
  const priorityConfig = priorities.find(p => p.value === priority);
  return priorityConfig?.color || 'default';
};

export const Initiatives: React.FC = () => {
  const { data: initiatives, isLoading, error } = useStrategicInitiatives();
  const { data: objectives } = useStrategicObjectives();
  const createMutation = useCreateStrategicInitiative();
  const updateMutation = useUpdateStrategicInitiative();
  const deleteMutation = useDeleteStrategicInitiative();
  
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState<any>(null);

  const filteredInitiatives = initiatives?.filter(initiative => {
    const matchesSearch = initiative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         initiative.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || initiative.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || initiative.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  const handleCreateInitiative = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Strategic initiative created successfully');
      setShowForm(false);
    } catch (error: any) {
      message.error(error.message || 'Failed to create initiative');
    }
  };

  const handleUpdateInitiative = async (values: any) => {
    try {
      await updateMutation.mutateAsync({ id: editingInitiative.id, data: values });
      message.success('Strategic initiative updated successfully');
      setShowForm(false);
      setEditingInitiative(null);
    } catch (error: any) {
      message.error(error.message || 'Failed to update initiative');
    }
  };

  const handleDeleteInitiative = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Strategic initiative deleted successfully');
    } catch (error: any) {
      message.error(error.message || 'Failed to delete initiative');
    }
  };

  const handleEdit = (initiative: any) => {
    setEditingInitiative(initiative);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInitiative(null);
  };

  if (isLoading) {
    return (
      <div className="mtcc-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error loading initiatives"
        description={error.message}
        type="error"
        showIcon
        style={{ margin: '24px' }}
      />
    );
  }

  const initiativesByStatus = statuses.map(status => ({
    ...status,
    initiatives: initiatives?.filter(init => init.status === status.value) || [],
  }));

  const totalInitiatives = initiatives?.length || 0;
  const activeInitiatives = initiatives?.filter(init => init.status === 'Active').length || 0;
  const completedInitiatives = initiatives?.filter(init => init.status === 'Completed').length || 0;
  const averageProgress = totalInitiatives > 0 ? 
    Math.round((initiatives?.reduce((sum, init) => sum + (init.progress_percentage || 0), 0) || 0) / totalInitiatives) : 0;

  if (showForm) {
    return (
      <InitiativeForm
        initialValues={editingInitiative}
        onSubmit={editingInitiative ? handleUpdateInitiative : handleCreateInitiative}
        onCancel={handleCancel}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={2} style={{ marginBottom: '8px' }}>
            Strategic Initiatives
          </Title>
          <Text type="secondary">
            Manage strategic initiatives that drive objective achievement
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setShowForm(true)}
        >
          Add Initiative
        </Button>
      </div>

      {/* Initiative Overview Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6} lg={6}>
          <Card>
            <Statistic
              title="Total Initiatives"
              value={totalInitiatives}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} lg={6}>
          <Card>
            <Statistic
              title="Active Initiatives"
              value={activeInitiatives}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} lg={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedInitiatives}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} lg={6}>
          <Card>
            <Statistic
              title="Avg Progress"
              value={averageProgress}
              suffix="%"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search initiatives..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
            >
              <Option value="All">All Statuses</Option>
              {statuses.map(status => (
                <Option key={status.value} value={status.value}>
                  <Space>
                    <span style={{ color: status.color }}>●</span>
                    {status.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by priority"
              value={selectedPriority}
              onChange={setSelectedPriority}
              style={{ width: '100%' }}
            >
              <Option value="All">All Priorities</Option>
              {priorities.map(priority => (
                <Option key={priority.value} value={priority.value}>
                  <Space>
                    <span style={{ color: priority.color }}>●</span>
                    {priority.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Text type="secondary">
              Showing {filteredInitiatives.length} of {totalInitiatives} initiatives
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Status Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {initiativesByStatus.map((status) => (
          <Col xs={24} sm={12} lg={4} key={status.value}>
            <Card 
              hoverable
              onClick={() => setSelectedStatus(status.value)}
              style={{ 
                cursor: 'pointer',
                borderColor: selectedStatus === status.value ? status.color : undefined
              }}
            >
              <Statistic
                title={status.label}
                value={status.initiatives.length}
                prefix={
                  <Avatar 
                    size={40} 
                    style={{ backgroundColor: status.color }}
                    icon={<ProjectOutlined />}
                  />
                }
                valueStyle={{ color: status.color }}
                suffix="initiatives"
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Initiatives List */}
      <Card 
        title={
          <Space>
            <ProjectOutlined />
            <span>
              Strategic Initiatives
              {selectedStatus !== 'All' && (
                <Tag color={getStatusColor(selectedStatus)} style={{ marginLeft: '8px' }}>
                  {selectedStatus}
                </Tag>
              )}
              {selectedPriority !== 'All' && (
                <Tag color={getPriorityColor(selectedPriority)} style={{ marginLeft: '8px' }}>
                  {selectedPriority}
                </Tag>
              )}
            </span>
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        {filteredInitiatives.length > 0 ? (
          <List
            itemLayout="vertical"
            size="large"
            dataSource={filteredInitiatives}
            renderItem={(initiative) => {
              const objective = objectives?.find(obj => obj.id === initiative.objective_id);
              const isOverdue = dayjs(initiative.end_date).isBefore(dayjs()) && initiative.status !== 'Completed';
              
              return (
                <List.Item
                  key={initiative.id}
                  actions={[
                    <Tooltip title="Edit">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(initiative)}
                      />
                    </Tooltip>,
                    <Popconfirm
                      title="Delete Initiative"
                      description="Are you sure you want to delete this initiative?"
                      onConfirm={() => handleDeleteInitiative(initiative.id)}
                      okText="Yes"
                      cancelText="No"
                      icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    >
                      <Tooltip title="Delete">
                        <Button 
                          type="text" 
                          icon={<DeleteOutlined />} 
                          danger
                          loading={deleteMutation.isPending}
                        />
                      </Tooltip>
                    </Popconfirm>
                  ]}
                  extra={
                    <Space direction="vertical" size="small">
                      <Tag 
                        color={getStatusColor(initiative.status)}
                        icon={<FlagOutlined />}
                      >
                        {initiative.status}
                      </Tag>
                      <Tag 
                        color={getPriorityColor(initiative.priority)}
                      >
                        {initiative.priority}
                      </Tag>
                      {isOverdue && (
                        <Tag color="red">
                          Overdue
                        </Tag>
                      )}
                    </Space>
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={48} 
                        style={{ backgroundColor: getStatusColor(initiative.status) }}
                        icon={<ProjectOutlined />}
                      />
                    }
                    title={
                      <div>
                        <Text strong style={{ fontSize: '16px' }}>
                          {initiative.name}
                        </Text>
                        <div style={{ marginTop: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Objective: {objective?.name || 'N/A'}
                          </Text>
                        </div>
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                          {initiative.description}
                        </Text>
                        
                        {/* Progress */}
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong>Progress: </Text>
                          <Progress 
                            percent={initiative.progress_percentage || 0} 
                            size="small" 
                            style={{ width: '200px', display: 'inline-block' }}
                          />
                        </div>
                        
                        {/* Timeline */}
                        <div style={{ marginBottom: '8px' }}>
                          <Space size="large">
                            <Space size="small">
                              <CalendarOutlined />
                              <Text type="secondary">
                                {dayjs(initiative.start_date).format('MMM DD, YYYY')} - {dayjs(initiative.end_date).format('MMM DD, YYYY')}
                              </Text>
                            </Space>
                            <Space size="small">
                              <DollarOutlined />
                              <Text type="secondary">
                                MVR {initiative.budget?.toLocaleString() || '0'}
                              </Text>
                            </Space>
                          </Space>
                        </div>
                        
                        {/* Success Criteria */}
                        <div>
                          <Text strong>Success Criteria: </Text>
                          <Text type="secondary">{initiative.success_criteria}</Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                {searchTerm || selectedStatus !== 'All' || selectedPriority !== 'All'
                  ? 'No initiatives match your search criteria'
                  : 'No strategic initiatives found'
                }
              </span>
            }
          >
            {!searchTerm && selectedStatus === 'All' && selectedPriority === 'All' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
                Create Initiative
              </Button>
            )}
          </Empty>
        )}
      </Card>
    </div>
  );
};