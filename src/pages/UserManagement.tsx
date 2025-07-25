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
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  UserOutlined,
  CrownOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  UserSwitchOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { 
  useUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser,
  useDivisions,
  useCurrentUser
} from '../hooks/useData';
import { UserForm } from '../components/UserForm';

const { Title, Text } = Typography;
const { Option } = Select;

const roleColors = {
  'Admin': '#f5222d',
  'Executive': '#722ed1', 
  'Manager': '#faad14',
  'User': '#52c41a'
};

const roleIcons = {
  'Admin': <CrownOutlined />,
  'Executive': <UserSwitchOutlined />,
  'Manager': <TeamOutlined />,
  'User': <UserOutlined />
};

export const UserManagement: React.FC = () => {
  const { data: users, isLoading, error } = useUsers();
  const { data: divisions } = useDivisions();
  const { data: currentUser } = useCurrentUser();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [divisionFilter, setDivisionFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || 
                         (statusFilter === 'Active' && user.is_active) ||
                         (statusFilter === 'Inactive' && !user.is_active);
    const matchesDivision = divisionFilter === 'All' || user.division_id === divisionFilter;
    
    return matchesSearch && matchesRole && matchesStatus && matchesDivision;
  }) || [];

  const handleCreateUser = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('User created successfully');
      setShowForm(false);
    } catch (error: any) {
      message.error(error.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (values: any) => {
    try {
      const result = await updateMutation.mutateAsync({ id: editingUser.id, data: values });
      
      if ((result as any)._passwordResetSent) {
        message.success('User updated successfully. Password reset email sent to user.');
      } else {
        message.success('User updated successfully');
      }
      
      setShowForm(false);
      setEditingUser(null);
    } catch (error: any) {
      message.error(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('User deleted successfully');
    } catch (error: any) {
      message.error(error.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      await updateMutation.mutateAsync({ 
        id: user.id, 
        data: { is_active: !user.is_active } 
      });
      message.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (error: any) {
      message.error(error.message || 'Failed to update user status');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const getDivisionName = (divisionId: string) => {
    return divisions?.find(d => d.id === divisionId)?.name || 'Unknown Division';
  };

  const canManageUser = (user: any) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    if (currentUser.role === 'Executive' && user.role !== 'Admin') return true;
    if (currentUser.role === 'Manager' && user.role === 'User' && user.division_id === currentUser.division_id) return true;
    return false;
  };

  const canDeleteUser = (user: any) => {
    if (!currentUser) return false;
    if (currentUser.id === user.id) return false; // Can't delete self
    return canManageUser(user);
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
        message="Error loading users"
        description={error.message}
        type="error"
        showIcon
        style={{ margin: '24px' }}
      />
    );
  }

  // Statistics
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u => u.is_active).length || 0;
  const inactiveUsers = users?.filter(u => !u.is_active).length || 0;
  const roleStats = {
    Admin: users?.filter(u => u.role === 'Admin').length || 0,
    Executive: users?.filter(u => u.role === 'Executive').length || 0,
    Manager: users?.filter(u => u.role === 'Manager').length || 0,
    User: users?.filter(u => u.role === 'User').length || 0,
  };

  if (showForm) {
    return (
      <UserForm
        initialValues={editingUser}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        onCancel={handleCancel}
        loading={createMutation.isPending || updateMutation.isPending}
        isEdit={!!editingUser}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={2} style={{ marginBottom: '8px' }}>
            User Management
          </Title>
          <Text type="secondary">
            Manage user accounts, roles, and permissions across the organization
          </Text>
        </div>
        {currentUser?.role === 'Admin' && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setShowForm(true)}
          >
            Add User
          </Button>
        )}
      </div>

      {/* User Overview Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6} lg={4}>
          <Card>
            <Statistic
              title="Total Users"
              value={totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} lg={4}>
          <Card>
            <Statistic
              title="Active Users"
              value={activeUsers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} lg={4}>
          <Card>
            <Statistic
              title="Inactive Users"
              value={inactiveUsers}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} lg={4}>
          <Card>
            <Statistic
              title="Admins"
              value={roleStats.Admin}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Title level={5} style={{ marginBottom: '12px' }}>Role Distribution</Title>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <Badge color={roleColors.Executive} />
                  <Text>Executive: {roleStats.Executive}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Badge color={roleColors.Manager} />
                  <Text>Manager: {roleStats.Manager}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <Badge color={roleColors.User} />
                  <Text>User: {roleStats.User}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Badge color={roleColors.Admin} />
                  <Text>Admin: {roleStats.Admin}</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Filter by role"
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ width: '100%' }}
            >
              <Option value="All">All Roles</Option>
              <Option value="Admin">Admin</Option>
              <Option value="Executive">Executive</Option>
              <Option value="Manager">Manager</Option>
              <Option value="User">User</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="All">All Status</Option>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by division"
              value={divisionFilter}
              onChange={setDivisionFilter}
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
          <Col xs={24} sm={24} md={4}>
            <Text type="secondary">
              Showing {filteredUsers.length} of {totalUsers} users
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Users List */}
      <Card 
        title={
          <Space>
            <UserOutlined />
            <span>System Users</span>
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        {filteredUsers.length > 0 ? (
          <List
            itemLayout="vertical"
            size="large"
            dataSource={filteredUsers}
            renderItem={(user) => (
              <List.Item
                key={user.id}
                actions={[
                  <Tooltip title="Edit">
                    <Button 
                      type="text" 
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(user)}
                      disabled={!canManageUser(user)}
                    />
                  </Tooltip>,
                  <Tooltip title={user.is_active ? 'Deactivate' : 'Activate'}>
                    <Button 
                      type="text" 
                      icon={user.is_active ? <StopOutlined /> : <CheckCircleOutlined />}
                      onClick={() => handleToggleStatus(user)}
                      disabled={!canManageUser(user)}
                      style={{ 
                        color: user.is_active ? '#f5222d' : '#52c41a' 
                      }}
                    />
                  </Tooltip>,
                  <Popconfirm
                    title="Delete User"
                    description={`Are you sure you want to delete ${user.first_name} ${user.last_name}?`}
                    onConfirm={() => handleDeleteUser(user.id)}
                    okText="Yes"
                    cancelText="No"
                    icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    disabled={!canDeleteUser(user)}
                  >
                    <Tooltip title="Delete">
                      <Button 
                        type="text" 
                        icon={<DeleteOutlined />} 
                        danger
                        loading={deleteMutation.isPending}
                        disabled={!canDeleteUser(user)}
                      />
                    </Tooltip>
                  </Popconfirm>
                ]}
                extra={
                  <Space direction="vertical" size="small">
                    <Tag 
                      color={roleColors[user.role as keyof typeof roleColors]}
                      icon={roleIcons[user.role as keyof typeof roleIcons]}
                    >
                      {user.role}
                    </Tag>
                    <Tag 
                      color={user.is_active ? 'green' : 'red'}
                      icon={user.is_active ? <CheckCircleOutlined /> : <StopOutlined />}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Tag>
                    {currentUser?.id === user.id && (
                      <Tag color="blue">
                        Current User
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
                        backgroundColor: roleColors[user.role as keyof typeof roleColors],
                        fontSize: '24px'
                      }}
                      icon={roleIcons[user.role as keyof typeof roleIcons]}
                    />
                  }
                  title={
                    <div>
                      <Text strong style={{ fontSize: '18px' }}>
                        {user.first_name} {user.last_name}
                      </Text>
                      <div style={{ marginTop: '4px' }}>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          @{user.username}
                        </Text>
                      </div>
                    </div>
                  }
                  description={
                    <div>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <Space>
                            <MailOutlined />
                            <Text>{user.email}</Text>
                          </Space>
                        </div>
                        
                        {user.phone && (
                          <div>
                            <Space>
                              <PhoneOutlined />
                              <Text>{user.phone}</Text>
                            </Space>
                          </div>
                        )}
                        
                        <div>
                          <Space>
                            <TeamOutlined />
                            <Text>{getDivisionName(user.division_id)}</Text>
                          </Space>
                        </div>
                        
                        <div>
                          <Space>
                            <SafetyOutlined />
                            <Text type="secondary">
                              Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                            </Text>
                          </Space>
                        </div>
                        
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Created: {new Date(user.created_at).toLocaleDateString()} | 
                            Updated: {new Date(user.updated_at).toLocaleDateString()}
                          </Text>
                        </div>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                {searchTerm || roleFilter !== 'All' || statusFilter !== 'All' || divisionFilter !== 'All'
                  ? 'No users match your search criteria'
                  : 'No users found'
                }
              </span>
            }
          >
            {!searchTerm && roleFilter === 'All' && statusFilter === 'All' && divisionFilter === 'All' && currentUser?.role === 'Admin' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
                Create User
              </Button>
            )}
          </Empty>
        )}
      </Card>

      {/* Help Information */}
      <Alert
        message="User Management Guidelines"
        description={
          <div>
            <Text>
              • <strong>Admin:</strong> Can manage all users and system settings
            </Text><br />
            <Text>
              • <strong>Executive:</strong> Can manage Managers and Users, view cross-division data
            </Text><br />
            <Text>
              • <strong>Manager:</strong> Can manage Users within their division
            </Text><br />
            <Text>
              • <strong>User:</strong> Has basic access to assigned functions
            </Text>
          </div>
        }
        type="info"
        showIcon
        icon={<KeyOutlined />}
      />
    </div>
  );
};