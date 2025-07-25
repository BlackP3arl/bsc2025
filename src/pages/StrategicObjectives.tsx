import React, { useState, useMemo } from 'react';
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
  Pagination
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  TrophyOutlined,
  LinkOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
  SettingOutlined,
  BookOutlined,
  ExclamationCircleOutlined,
  BranchesOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { 
  useStrategicObjectives, 
  useCreateStrategicObjective, 
  useUpdateStrategicObjective, 
  useDeleteStrategicObjective,
  useDivisions,
  useObjectiveKPIData,
  useObjectiveInitiativeData
} from '../hooks/useData';
import { ObjectiveForm } from '../components/ObjectiveForm';

const { Title, Text } = Typography;
const { Option } = Select;

const perspectives = [
  { 
    value: 'Financial', 
    label: 'Financial', 
    color: '#52c41a',
    icon: <DollarOutlined />
  },
  { 
    value: 'Customer', 
    label: 'Customer', 
    color: '#1890ff',
    icon: <CustomerServiceOutlined />
  },
  { 
    value: 'Internal', 
    label: 'Internal Process', 
    color: '#faad14',
    icon: <SettingOutlined />
  },
  { 
    value: 'Learning', 
    label: 'Learning & Growth', 
    color: '#722ed1',
    icon: <BookOutlined />
  },
];

export const StrategicObjectives: React.FC = () => {
  const { data: objectives, isLoading, error } = useStrategicObjectives();
  const { data: divisions } = useDivisions();
  const { data: kpiCounts = {} } = useObjectiveKPIData();
  const { data: initiativeCounts = {} } = useObjectiveInitiativeData();
  const createMutation = useCreateStrategicObjective();
  const updateMutation = useUpdateStrategicObjective();
  const deleteMutation = useDeleteStrategicObjective();
  
  const [selectedPerspective, setSelectedPerspective] = useState('All');
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingObjective, setEditingObjective] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter objectives based on search and filters
  const filteredObjectives = useMemo(() => {
    return objectives?.filter(objective => {
      const matchesSearch = objective.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           objective.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPerspective = selectedPerspective === 'All' || objective.perspective === selectedPerspective;
      const matchesDivision = selectedDivision === 'All' || objective.division_id === selectedDivision;
      return matchesSearch && matchesPerspective && matchesDivision;
    }) || [];
  }, [objectives, searchTerm, selectedPerspective, selectedDivision]);

  // Paginated objectives for current page
  const paginatedObjectives = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredObjectives.slice(startIndex, endIndex);
  }, [filteredObjectives, currentPage, pageSize]);

  // Optimized calculations using useMemo
  const objectivesByPerspective = useMemo(() => {
    return perspectives.map(perspective => ({
      ...perspective,
      objectives: objectives?.filter(obj => {
        const matchesPerspective = obj.perspective === perspective.value;
        const matchesDivision = selectedDivision === 'All' || obj.division_id === selectedDivision;
        return matchesPerspective && matchesDivision;
      }) || [],
    }));
  }, [objectives, selectedDivision]);

  const handleCreateObjective = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Strategic objective created successfully');
      setShowForm(false);
    } catch (error: any) {
      message.error(error.message || 'Failed to create objective');
    }
  };

  const handleUpdateObjective = async (values: any) => {
    try {
      await updateMutation.mutateAsync({ id: editingObjective.id, data: values });
      message.success('Strategic objective updated successfully');
      setShowForm(false);
      setEditingObjective(null);
    } catch (error: any) {
      message.error(error.message || 'Failed to update objective');
    }
  };

  const handleDeleteObjective = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Strategic objective deleted successfully');
    } catch (error: any) {
      message.error(error.message || 'Failed to delete objective');
    }
  };

  const handleEdit = (objective: any) => {
    setEditingObjective(objective);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingObjective(null);
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };

  const handleFilterChange = (type: 'perspective' | 'division' | 'search', value: string) => {
    setCurrentPage(1); // Reset to first page when filters change
    switch (type) {
      case 'perspective':
        setSelectedPerspective(value);
        break;
      case 'division':
        setSelectedDivision(value);
        break;
      case 'search':
        setSearchTerm(value);
        break;
    }
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

  if (error) {
    return (
      <Alert
        message="Error loading objectives"
        description={error.message}
        type="error"
        showIcon
        style={{ margin: '24px' }}
      />
    );
  }

  const getPerspectiveDetails = (perspective: string) => {
    return perspectives.find(p => p.value === perspective);
  };

  if (showForm) {
    return (
      <ObjectiveForm
        initialValues={editingObjective}
        onSubmit={editingObjective ? handleUpdateObjective : handleCreateObjective}
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
            Strategic Objectives
          </Title>
          <Text type="secondary">
            Manage strategic objectives across the four BSC perspectives
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setShowForm(true)}
        >
          Add Objective
        </Button>
      </div>

      {/* Search and Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search objectives..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by perspective"
              value={selectedPerspective}
              onChange={(value) => handleFilterChange('perspective', value)}
              style={{ width: '100%' }}
            >
              <Option value="All">All Perspectives</Option>
              {perspectives.map(p => (
                <Option key={p.value} value={p.value}>
                  <Space>
                    {p.icon}
                    {p.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by division"
              value={selectedDivision}
              onChange={(value) => handleFilterChange('division', value)}
              style={{ width: '100%' }}
            >
              <Option value="All">All Divisions</Option>
              {divisions?.map(division => (
                <Option key={division.id} value={division.id}>
                  {division.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Space>
              <Text type="secondary">
                Showing {filteredObjectives.length} of {objectives?.length || 0} objectives
              </Text>
              {(searchTerm || selectedPerspective !== 'All' || selectedDivision !== 'All') && (
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => {
                    handleFilterChange('search', '');
                    handleFilterChange('perspective', 'All');
                    handleFilterChange('division', 'All');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Perspective Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {objectivesByPerspective.map((perspective) => (
          <Col xs={24} sm={12} lg={6} key={perspective.value}>
            <Card 
              hoverable
              onClick={() => handleFilterChange('perspective', perspective.value)}
              style={{ 
                cursor: 'pointer',
                borderColor: selectedPerspective === perspective.value ? perspective.color : undefined
              }}
            >
              <Statistic
                title={perspective.label}
                value={perspective.objectives.length}
                prefix={
                  <Avatar 
                    size={40} 
                    style={{ backgroundColor: perspective.color }}
                    icon={perspective.icon}
                  />
                }
                valueStyle={{ color: perspective.color }}
                suffix="objectives"
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Objectives List */}
      <Card 
        title={
          <Space>
            <TrophyOutlined />
            <span>
              Objectives
              {selectedPerspective !== 'All' && (
                <Tag color={getPerspectiveDetails(selectedPerspective)?.color} style={{ marginLeft: '8px' }}>
                  {getPerspectiveDetails(selectedPerspective)?.label}
                </Tag>
              )}
              {selectedDivision !== 'All' && (
                <Tag color="blue" icon={<TeamOutlined />} style={{ marginLeft: '8px' }}>
                  {getDivisionName(selectedDivision)}
                </Tag>
              )}
            </span>
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        {filteredObjectives.length > 0 ? (
          <>
            <List
              itemLayout="vertical"
              size="large"
              dataSource={paginatedObjectives}
              renderItem={(objective) => {
              const perspectiveDetails = getPerspectiveDetails(objective.perspective);
              return (
                <List.Item
                  key={objective.id}
                  actions={[
                    <Tooltip title="Edit">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(objective)}
                      />
                    </Tooltip>,
                    <Popconfirm
                      title="Delete Objective"
                      description="Are you sure you want to delete this objective?"
                      onConfirm={() => handleDeleteObjective(objective.id)}
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
                        color={perspectiveDetails?.color}
                        icon={perspectiveDetails?.icon}
                      >
                        {objective.perspective}
                      </Tag>
                      <Tag 
                        color={objective.status === 'Active' ? 'green' : 'red'}
                      >
                        {objective.status}
                      </Tag>
                      <Tag 
                        color="blue"
                        icon={<TeamOutlined />}
                      >
                        {getDivisionName(objective.division_id)}
                      </Tag>
                    </Space>
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={48} 
                        style={{ backgroundColor: perspectiveDetails?.color }}
                        icon={perspectiveDetails?.icon}
                      />
                    }
                    title={
                      <Text strong style={{ fontSize: '16px' }}>
                        {objective.name}
                      </Text>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                          {objective.description}
                        </Text>
                        <Space size="large">
                          <Space size="small">
                            <LinkOutlined />
                            <Text type="secondary">
                              {kpiCounts[objective.id] || 0} KPI{(kpiCounts[objective.id] || 0) !== 1 ? 's' : ''}
                            </Text>
                          </Space>
                          <Space size="small">
                            <LinkOutlined />
                            <Text type="secondary">
                              {initiativeCounts[objective.id] || 0} Initiative{(initiativeCounts[objective.id] || 0) !== 1 ? 's' : ''}
                            </Text>
                          </Space>
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
          {filteredObjectives.length > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredObjectives.length}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} objectives`}
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
                {searchTerm || selectedPerspective !== 'All' || selectedDivision !== 'All'
                  ? 'No objectives match your search criteria'
                  : 'No objectives found'
                }
              </span>
            }
          >
            {!searchTerm && selectedPerspective === 'All' && selectedDivision === 'All' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
                Create Objective
              </Button>
            )}
          </Empty>
        )}
      </Card>

      {/* Strategy Map Preview */}
      <Card 
        title={
          <Space>
            <TrophyOutlined />
            <span>Strategy Map Preview</span>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            href="/strategy-map"
            icon={<BranchesOutlined />}
          >
            View Full Strategy Map
          </Button>
        }
      >
        {filteredObjectives.length > 0 ? (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              {perspectives.map(perspective => {
                const count = filteredObjectives.filter(obj => obj.perspective === perspective.value).length;
                return (
                  <Col xs={24} sm={12} md={6} key={perspective.value}>
                    <Card size="small">
                      <Statistic
                        title={perspective.label}
                        value={count}
                        prefix={
                          <Avatar 
                            size={32} 
                            style={{ backgroundColor: perspective.color }}
                            icon={perspective.icon}
                          />
                        }
                        valueStyle={{ color: perspective.color }}
                        suffix="objectives"
                      />
                    </Card>
                  </Col>
                );
              })}
            </Row>
            <div style={{ textAlign: 'center', padding: '40px 0', background: '#fafafa', borderRadius: '8px' }}>
              <TrophyOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={4}>
                {filteredObjectives.length} Strategic Objectives
              </Title>
              <Text type="secondary">
                Distributed across {perspectives.filter(p => 
                  filteredObjectives.some(obj => obj.perspective === p.value)
                ).length} BSC perspectives
              </Text>
              <div style={{ marginTop: '16px' }}>
                <Button 
                  type="primary" 
                  size="large"
                  href="/strategy-map"
                  icon={<BranchesOutlined />}
                >
                  Explore Interactive Strategy Map
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <TrophyOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={4} type="secondary">
              No Strategic Objectives
            </Title>
            <Text type="secondary">
              Create strategic objectives to visualize them in the strategy map
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
};