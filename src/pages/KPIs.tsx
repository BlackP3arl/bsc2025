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
  Badge,
  Pagination
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  BarChartOutlined,
  LineChartOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { 
  useKPIDefinitions, 
  useCreateKPIDefinition, 
  useUpdateKPIDefinition, 
  useDeleteKPIDefinition,
  useDivisions
} from '../hooks/useData';
import { KPIForm } from '../components/KPIForm';

const { Title, Text } = Typography;
const { Option } = Select;

const frequencies = [
  { value: 'Daily', label: 'Daily', color: '#52c41a' },
  { value: 'Weekly', label: 'Weekly', color: '#1890ff' },
  { value: 'Monthly', label: 'Monthly', color: '#faad14' },
  { value: 'Quarterly', label: 'Quarterly', color: '#722ed1' },
];

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'green';
    case 'inactive': return 'red';
    case 'draft': return 'orange';
    default: return 'default';
  }
};


export const KPIs: React.FC = () => {
  const { data: kpiDefinitions, isLoading, error } = useKPIDefinitions();
  const { data: divisions } = useDivisions();
  const createMutation = useCreateKPIDefinition();
  const updateMutation = useUpdateKPIDefinition();
  const deleteMutation = useDeleteKPIDefinition();
  
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [selectedFrequency, setSelectedFrequency] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingKPI, setEditingKPI] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter KPIs based on search and filters
  const filteredKPIs = useMemo(() => {
    return kpiDefinitions?.filter(kpi => {
      const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           kpi.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDivision = selectedDivision === 'All' || kpi.division_id === selectedDivision;
      const matchesFrequency = selectedFrequency === 'All' || kpi.frequency === selectedFrequency;
      return matchesSearch && matchesDivision && matchesFrequency;
    }) || [];
  }, [kpiDefinitions, searchTerm, selectedDivision, selectedFrequency]);

  // Paginated KPIs for current page
  const paginatedKPIs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredKPIs.slice(startIndex, endIndex);
  }, [filteredKPIs, currentPage, pageSize]);

  const handleCreateKPI = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('KPI definition created successfully');
      setShowForm(false);
    } catch (error: any) {
      message.error(error.message || 'Failed to create KPI definition');
    }
  };

  const handleUpdateKPI = async (values: any) => {
    try {
      await updateMutation.mutateAsync({ id: editingKPI.id, data: values });
      message.success('KPI definition updated successfully');
      setShowForm(false);
      setEditingKPI(null);
    } catch (error: any) {
      message.error(error.message || 'Failed to update KPI definition');
    }
  };

  const handleDeleteKPI = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('KPI definition deleted successfully');
    } catch (error: any) {
      message.error(error.message || 'Failed to delete KPI definition');
    }
  };

  const handleEdit = (kpi: any) => {
    setEditingKPI(kpi);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingKPI(null);
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };

  const handleFilterChange = (type: 'division' | 'frequency' | 'search', value: string) => {
    setCurrentPage(1); // Reset to first page when filters change
    switch (type) {
      case 'division':
        setSelectedDivision(value);
        break;
      case 'frequency':
        setSelectedFrequency(value);
        break;
      case 'search':
        setSearchTerm(value);
        break;
    }
  };

  // Optimized calculations using useMemo
  const kpisByFrequency = useMemo(() => {
    return frequencies.map(freq => ({
      ...freq,
      kpis: kpiDefinitions?.filter(kpi => kpi.frequency === freq.value) || [],
    }));
  }, [kpiDefinitions]);

  const kpiStats = useMemo(() => {
    const total = kpiDefinitions?.length || 0;
    const active = kpiDefinitions?.filter(kpi => kpi.status === 'Active').length || 0;
    const draft = kpiDefinitions?.filter(kpi => kpi.status === 'Draft').length || 0;
    return { total, active, draft };
  }, [kpiDefinitions]);

  const { total: totalKPIs, active: activeKPIs, draft: draftKPIs } = kpiStats;

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
        message="Error loading KPI definitions"
        description={error.message}
        type="error"
        showIcon
        style={{ margin: '24px' }}
      />
    );
  }

  if (showForm) {
    return (
      <KPIForm
        initialValues={editingKPI}
        onSubmit={editingKPI ? handleUpdateKPI : handleCreateKPI}
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
            KPI Management
          </Title>
          <Text type="secondary">
            Define and manage Key Performance Indicators across all divisions
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setShowForm(true)}
        >
          Add KPI Definition
        </Button>
      </div>

      {/* KPI Overview Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Total KPIs"
              value={totalKPIs}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Active KPIs"
              value={activeKPIs}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Draft KPIs"
              value={draftKPIs}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={totalKPIs > 0 ? Math.round((activeKPIs / totalKPIs) * 100) : 0}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search KPIs..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
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
                  {division.name} ({division.code})
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by frequency"
              value={selectedFrequency}
              onChange={(value) => handleFilterChange('frequency', value)}
              style={{ width: '100%' }}
            >
              <Option value="All">All Frequencies</Option>
              {frequencies.map(freq => (
                <Option key={freq.value} value={freq.value}>
                  {freq.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Text type="secondary">
              Showing {filteredKPIs.length} of {totalKPIs} KPIs
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Frequency Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {kpisByFrequency.map((frequency) => (
          <Col xs={24} sm={12} lg={6} key={frequency.value}>
            <Card 
              hoverable
              onClick={() => handleFilterChange('frequency', frequency.value)}
              style={{ 
                cursor: 'pointer',
                borderColor: selectedFrequency === frequency.value ? frequency.color : undefined
              }}
            >
              <Statistic
                title={frequency.label}
                value={frequency.kpis.length}
                prefix={
                  <Avatar 
                    size={40} 
                    style={{ backgroundColor: frequency.color }}
                    icon={<LineChartOutlined />}
                  />
                }
                valueStyle={{ color: frequency.color }}
                suffix="KPIs"
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* KPI Definitions List */}
      <Card 
        title={
          <Space>
            <DashboardOutlined />
            <span>
              KPI Definitions
              {selectedDivision !== 'All' && (
                <Tag color="blue" style={{ marginLeft: '8px' }}>
                  {divisions?.find(d => d.id === selectedDivision)?.name}
                </Tag>
              )}
              {selectedFrequency !== 'All' && (
                <Tag color={frequencies.find(f => f.value === selectedFrequency)?.color} style={{ marginLeft: '8px' }}>
                  {selectedFrequency}
                </Tag>
              )}
            </span>
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        {filteredKPIs.length > 0 ? (
          <>
            <List
              itemLayout="vertical"
              size="large"
              dataSource={paginatedKPIs}
              renderItem={(kpi) => {
              const frequencyDetails = frequencies.find(f => f.value === kpi.frequency);
              const division = divisions?.find(d => d.id === kpi.division_id);
              
              return (
                <List.Item
                  key={kpi.id}
                  actions={[
                    <Tooltip title="Edit">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(kpi)}
                      />
                    </Tooltip>,
                    <Popconfirm
                      title="Delete KPI Definition"
                      description="Are you sure you want to delete this KPI definition?"
                      onConfirm={() => handleDeleteKPI(kpi.id)}
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
                        color={frequencyDetails?.color}
                        icon={<LineChartOutlined />}
                      >
                        {kpi.frequency}
                      </Tag>
                      <Tag 
                        color={getStatusColor(kpi.status || 'Active')}
                      >
                        {kpi.status || 'Active'}
                      </Tag>
                      <Badge count={kpi.units} color="blue" />
                    </Space>
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={48} 
                        style={{ backgroundColor: frequencyDetails?.color }}
                        icon={<BarChartOutlined />}
                      />
                    }
                    title={
                      <div>
                        <Text strong style={{ fontSize: '16px' }}>
                          {kpi.name}
                        </Text>
                        <div style={{ marginTop: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {division?.name} ({division?.code})
                          </Text>
                        </div>
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                          {kpi.description}
                        </Text>
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong>Formula: </Text>
                          <Text code>{kpi.formula}</Text>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong>Data Source: </Text>
                          <Text>{kpi.data_source}</Text>
                        </div>
                        <Row gutter={[8, 8]}>
                          <Col>
                            <Text strong>Target: </Text>
                            <Tag color="green">{kpi.target_value} {kpi.units}</Tag>
                          </Col>
                          <Col>
                            <Text strong>Thresholds: </Text>
                            <Tag color="green">{kpi.threshold_green}</Tag>
                            <Tag color="orange">{kpi.threshold_yellow}</Tag>
                            <Tag color="red">{kpi.threshold_red}</Tag>
                          </Col>
                        </Row>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
          {filteredKPIs.length > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredKPIs.length}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} KPIs`}
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
                {searchTerm || selectedDivision !== 'All' || selectedFrequency !== 'All'
                  ? 'No KPIs match your search criteria'
                  : 'No KPI definitions found'
                }
              </span>
            }
          >
            {!searchTerm && selectedDivision === 'All' && selectedFrequency === 'All' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
                Create KPI Definition
              </Button>
            )}
          </Empty>
        )}
      </Card>
    </div>
  );
};