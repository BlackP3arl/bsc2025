import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Progress,
  Pagination
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
  FlagOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { 
  useStrategicInitiatives, 
  useCreateStrategicInitiative, 
  useUpdateStrategicInitiative, 
  useDeleteStrategicInitiative,
  useStrategicObjectives,
  useDivisions
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
  const navigate = useNavigate();
  const { data: initiatives, isLoading, error } = useStrategicInitiatives();
  const { data: objectives } = useStrategicObjectives();
  const { data: divisions } = useDivisions();
  const createMutation = useCreateStrategicInitiative();
  const updateMutation = useUpdateStrategicInitiative();
  const deleteMutation = useDeleteStrategicInitiative();
  
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedObjective, setSelectedObjective] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter initiatives based on search and filters
  const filteredInitiatives = useMemo(() => {
    return initiatives?.filter(initiative => {
      const matchesSearch = initiative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           initiative.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || initiative.status === selectedStatus;
      const matchesPriority = selectedPriority === 'All' || initiative.priority === selectedPriority;
      const matchesObjective = selectedObjective === 'All' || initiative.objective_id === selectedObjective;
      return matchesSearch && matchesStatus && matchesPriority && matchesObjective;
    }) || [];
  }, [initiatives, searchTerm, selectedStatus, selectedPriority, selectedObjective]);

  // Paginated initiatives for current page
  const paginatedInitiatives = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredInitiatives.slice(startIndex, endIndex);
  }, [filteredInitiatives, currentPage, pageSize]);

  // Optimized calculations using useMemo
  const initiativesByStatus = useMemo(() => {
    return statuses.map(status => ({
      ...status,
      initiatives: initiatives?.filter(init => init.status === status.value) || [],
    }));
  }, [initiatives]);

  const initiativeStats = useMemo(() => {
    const total = initiatives?.length || 0;
    const active = initiatives?.filter(init => init.status === 'Active').length || 0;
    const completed = initiatives?.filter(init => init.status === 'Completed').length || 0;
    const averageProgress = total > 0 ? 
      Math.round((initiatives?.reduce((sum, init) => sum + (init.progress_percentage || 0), 0) || 0) / total) : 0;
    return { total, active, completed, averageProgress };
  }, [initiatives]);

  const { total: totalInitiatives, active: activeInitiatives, completed: completedInitiatives, averageProgress } = initiativeStats;

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

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };

  const handleFilterChange = (type: 'status' | 'priority' | 'objective' | 'search', value: string) => {
    setCurrentPage(1); // Reset to first page when filters change
    switch (type) {
      case 'status':
        setSelectedStatus(value);
        break;
      case 'priority':
        setSelectedPriority(value);
        break;
      case 'objective':
        setSelectedObjective(value);
        break;
      case 'search':
        setSearchTerm(value);
        break;
    }
  };


  const getDivisionName = (divisionId: string) => {
    return divisions?.find(div => div.id === divisionId)?.name || 'Unknown Division';
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
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search initiatives..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Filter by status"
              value={selectedStatus}
              onChange={(value) => handleFilterChange('status', value)}
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
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Filter by priority"
              value={selectedPriority}
              onChange={(value) => handleFilterChange('priority', value)}
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
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by objective"
              value={selectedObjective}
              onChange={(value) => handleFilterChange('objective', value)}
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option value="All">
                <Space>
                  <TrophyOutlined />
                  All Objectives
                </Space>
              </Option>
              {objectives?.map(objective => (
                <Option key={objective.id} value={objective.id}>
                  <div>
                    <Space>
                      <TrophyOutlined />
                      <strong>{objective.name}</strong>
                    </Space>
                    <div style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                      {objective.perspective} • {getDivisionName(objective.division_id)}
                    </div>
                  </div>
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
        
        {/* Clear Filters Button */}
        {(searchTerm || selectedStatus !== 'All' || selectedPriority !== 'All' || selectedObjective !== 'All') && (
          <Row style={{ marginTop: '16px' }}>
            <Col>
              <Button 
                type="link" 
                size="small"
                onClick={() => {
                  handleFilterChange('search', '');
                  handleFilterChange('status', 'All');
                  handleFilterChange('priority', 'All');
                  handleFilterChange('objective', 'All');
                }}
              >
                Clear All Filters
              </Button>
            </Col>
          </Row>
        )}
      </Card>

      {/* Status Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {initiativesByStatus.map((status) => (
          <Col xs={12} sm={8} lg={4} key={status.value}>
            <Card 
              hoverable
              onClick={() => handleFilterChange('status', status.value)}
              style={{ 
                cursor: 'pointer',
                borderColor: selectedStatus === status.value ? status.color : undefined,
                textAlign: 'center'
              }}
              bodyStyle={{ padding: '16px 12px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <ProjectOutlined 
                  style={{ 
                    fontSize: '24px', 
                    color: status.color 
                  }} 
                />
                <div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: status.color,
                    lineHeight: 1
                  }}>
                    {status.initiatives.length}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    lineHeight: 1,
                    marginTop: '2px'
                  }}>
                    {status.label}
                  </div>
                </div>
              </div>
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
          <>
            <List
              itemLayout="vertical"
              size="large"
              dataSource={paginatedInitiatives}
              renderItem={(initiative) => {
              const objective = objectives?.find(obj => obj.id === initiative.objective_id);
              const isOverdue = dayjs(initiative.end_date).isBefore(dayjs()) && initiative.status !== 'Completed';
              
              return (
                <List.Item
                  key={initiative.id}
                  actions={[
                    <Tooltip title="Add Quarterly Commentary">
                      <Button 
                        type="text" 
                        icon={<CommentOutlined />}
                        onClick={() => navigate(`/quarterly-review?initiative=${initiative.id}`)}
                      />
                    </Tooltip>,
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
                            {objective ? (
                              <>
                                Objective: {objective.name} • {objective.perspective} • {getDivisionName(objective.division_id)}
                              </>
                            ) : (
                              'No objective assigned'
                            )}
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
          {filteredInitiatives.length > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredInitiatives.length}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} initiatives`}
                pageSizeOptions={['5', '10', '20', '50']}
              />
            </div>
          )}
          </>
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