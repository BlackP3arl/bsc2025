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
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  BranchesOutlined
} from '@ant-design/icons';
import { 
  useDivisions, 
  useCreateDivision, 
  useUpdateDivision, 
  useDeleteDivision,
  useUsers
} from '../hooks/useData';
import { DivisionForm } from '../components/DivisionForm';

const { Title, Text } = Typography;
const { Option } = Select;

export const Divisions: React.FC = () => {
  const { data: divisions, isLoading, error } = useDivisions();
  const { data: users } = useUsers();
  const createMutation = useCreateDivision();
  const updateMutation = useUpdateDivision();
  const deleteMutation = useDeleteDivision();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingDivision, setEditingDivision] = useState<any>(null);

  const filteredDivisions = divisions?.filter(division => {
    const matchesSearch = division.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         division.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         division.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || division.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreateDivision = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Division created successfully');
      setShowForm(false);
    } catch (error: any) {
      message.error(error.message || 'Failed to create division');
    }
  };

  const handleUpdateDivision = async (values: any) => {
    try {
      await updateMutation.mutateAsync({ id: editingDivision.id, data: values });
      message.success('Division updated successfully');
      setShowForm(false);
      setEditingDivision(null);
    } catch (error: any) {
      message.error(error.message || 'Failed to update division');
    }
  };

  const handleDeleteDivision = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Division deleted successfully');
    } catch (error: any) {
      message.error(error.message || 'Failed to delete division');
    }
  };

  const handleEdit = (division: any) => {
    setEditingDivision(division);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDivision(null);
  };

  const getDivisionHead = (headId: string) => {
    return users?.find(user => user.id === headId);
  };

  const getParentDivision = (parentId: string) => {
    return divisions?.find(division => division.id === parentId);
  };

  const getChildDivisions = (divisionId: string) => {
    return divisions?.filter(division => division.parent_division_id === divisionId) || [];
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
        message="Error loading divisions"
        description={error.message}
        type="error"
        showIcon
        style={{ margin: '24px' }}
      />
    );
  }

  const activeDivisions = divisions?.filter(d => d.status === 'Active').length || 0;
  const inactiveDivisions = divisions?.filter(d => d.status === 'Inactive').length || 0;
  const totalDivisions = divisions?.length || 0;

  if (showForm) {
    return (
      <DivisionForm
        initialValues={editingDivision}
        onSubmit={editingDivision ? handleUpdateDivision : handleCreateDivision}
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
            Division Management
          </Title>
          <Text type="secondary">
            Manage MTCC organizational divisions and their hierarchical structures
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setShowForm(true)}
        >
          Add Division
        </Button>
      </div>

      {/* Division Overview Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Total Divisions"
              value={totalDivisions}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Active Divisions"
              value={activeDivisions}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Inactive Divisions"
              value={inactiveDivisions}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={6}>
          <Card>
            <Statistic
              title="Utilization Rate"
              value={totalDivisions > 0 ? Math.round((activeDivisions / totalDivisions) * 100) : 0}
              suffix="%"
              prefix={<BranchesOutlined />}
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
              placeholder="Search divisions..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="All">All Status</Option>
              <Option value="Active">
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  Active
                </Space>
              </Option>
              <Option value="Inactive">
                <Space>
                  <StopOutlined style={{ color: '#f5222d' }} />
                  Inactive
                </Space>
              </Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={10}>
            <Text type="secondary">
              Showing {filteredDivisions.length} of {totalDivisions} divisions
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Divisions List */}
      <Card 
        title={
          <Space>
            <TeamOutlined />
            <span>
              MTCC Divisions
              {statusFilter !== 'All' && (
                <Tag color={statusFilter === 'Active' ? 'green' : 'red'} style={{ marginLeft: '8px' }}>
                  {statusFilter}
                </Tag>
              )}
            </span>
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        {filteredDivisions.length > 0 ? (
          <List
            itemLayout="vertical"
            size="large"
            dataSource={filteredDivisions}
            renderItem={(division) => {
              const divisionHead = division.head_id ? getDivisionHead(division.head_id) : null;
              const parentDivision = division.parent_division_id ? getParentDivision(division.parent_division_id) : null;
              const childDivisions = getChildDivisions(division.id);
              
              return (
                <List.Item
                  key={division.id}
                  actions={[
                    <Tooltip title="Edit">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(division)}
                      />
                    </Tooltip>,
                    <Popconfirm
                      title="Delete Division"
                      description={`Are you sure you want to delete ${division.name}?`}
                      onConfirm={() => handleDeleteDivision(division.id)}
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
                        color={division.status === 'Active' ? 'green' : 'red'}
                        icon={division.status === 'Active' ? <CheckCircleOutlined /> : <StopOutlined />}
                      >
                        {division.status}
                      </Tag>
                      <Tag color="blue">
                        {division.code}
                      </Tag>
                      {childDivisions.length > 0 && (
                        <Tag color="purple">
                          {childDivisions.length} sub-divisions
                        </Tag>
                      )}
                    </Space>
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={64} 
                        style={{ 
                          backgroundColor: division.status === 'Active' ? '#1890ff' : '#8c8c8c',
                          fontSize: '20px',
                          fontWeight: 'bold'
                        }}
                      >
                        {division.code}
                      </Avatar>
                    }
                    title={
                      <div>
                        <Text strong style={{ fontSize: '18px' }}>
                          {division.name}
                        </Text>
                        <div style={{ marginTop: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '14px' }}>
                            Code: {division.code}
                          </Text>
                        </div>
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>
                          {division.description}
                        </Text>
                        
                        <Row gutter={[16, 8]}>
                          <Col xs={24} sm={12}>
                            <Space size="small">
                              <UserOutlined />
                              <Text strong>Head: </Text>
                              <Text>
                                {divisionHead 
                                  ? `${divisionHead.first_name} ${divisionHead.last_name}`
                                  : 'Not assigned'
                                }
                              </Text>
                            </Space>
                          </Col>
                          
                          <Col xs={24} sm={12}>
                            <Space size="small">
                              <BranchesOutlined />
                              <Text strong>Parent: </Text>
                              <Text>
                                {parentDivision 
                                  ? `${parentDivision.name} (${parentDivision.code})`
                                  : 'Root division'
                                }
                              </Text>
                            </Space>
                          </Col>
                        </Row>
                        
                        {childDivisions.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <Text strong>Sub-divisions: </Text>
                            {childDivisions.map(child => (
                              <Tag key={child.id} color="geekblue" style={{ marginBottom: '4px' }}>
                                {child.name}
                              </Tag>
                            ))}
                          </div>
                        )}
                        
                        <div style={{ marginTop: '8px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Created: {new Date(division.created_at).toLocaleDateString()} | 
                            Updated: {new Date(division.updated_at).toLocaleDateString()}
                          </Text>
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
                {searchTerm || statusFilter !== 'All'
                  ? 'No divisions match your search criteria'
                  : 'No divisions found'
                }
              </span>
            }
          >
            {!searchTerm && statusFilter === 'All' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
                Create Division
              </Button>
            )}
          </Empty>
        )}
      </Card>
    </div>
  );
};