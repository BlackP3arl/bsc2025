import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Select,
  Input,
  Statistic,
  Tooltip,
  message,
  Popconfirm,
  Badge,
  Divider,
  Modal
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CommentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import {
  useQuarterlyCommentaries,
  useCreateQuarterlyCommentary,
  useUpdateQuarterlyCommentary,
  useDeleteQuarterlyCommentary,
  useStrategicInitiatives,
  useDivisions
} from '../hooks/useData';
import { QuarterlyCommentaryForm } from '../components/QuarterlyCommentaryForm';
import type { QuarterlyCommentary, StrategicInitiative } from '../types';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

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

const getStatusConfig = (status: string) => {
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.Draft;
};

const getQuarterInfo = (quarter: string) => {
  return quarters.find(q => q.value === quarter);
};

export const QuarterlyReview: React.FC = () => {
  const { data: allCommentaries, isLoading: commentariesLoading } = useQuarterlyCommentaries();
  const { data: initiatives } = useStrategicInitiatives();
  const { data: divisions } = useDivisions();
  const createMutation = useCreateQuarterlyCommentary();
  const updateMutation = useUpdateQuarterlyCommentary();
  const deleteMutation = useDeleteQuarterlyCommentary();

  const [selectedDivision, setSelectedDivision] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedQuarter, setSelectedQuarter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState<StrategicInitiative | null>(null);
  const [editingCommentary, setEditingCommentary] = useState<QuarterlyCommentary | null>(null);
  const [viewingCommentary, setViewingCommentary] = useState<QuarterlyCommentary | null>(null);
  const [showInitiativeSelector, setShowInitiativeSelector] = useState(false);

  // Check URL parameters for initiative selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initiativeId = urlParams.get('initiative');
    
    if (initiativeId && initiatives) {
      const initiative = initiatives.find(i => i.id === initiativeId);
      if (initiative) {
        setSelectedInitiative(initiative);
        setShowForm(true);
      }
    }
  }, [initiatives]);

  // Filter commentaries based on selected filters
  const filteredCommentaries = allCommentaries?.filter(commentary => {
    const matchesSearch = commentary.commentary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (commentary as any).initiative?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = commentary.year === selectedYear;
    const matchesQuarter = selectedQuarter === 'All' || commentary.quarter === selectedQuarter;
    
    // For division filter, we need to check the initiative's objective's division
    const matchesDivision = selectedDivision === 'All' || 
                           (commentary as any).initiative?.objective?.division_id === selectedDivision;
    
    
    return matchesSearch && matchesYear && matchesQuarter && matchesDivision;
  }) || [];

  const handleCreateCommentary = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Quarterly commentary added successfully');
      setShowForm(false);
      setSelectedInitiative(null);
    } catch (error: any) {
      message.error(error.message || 'Failed to add commentary');
    }
  };

  const handleUpdateCommentary = async (values: any) => {
    try {
      await updateMutation.mutateAsync({ id: editingCommentary!.id, data: values });
      message.success('Quarterly commentary updated successfully');
      setShowForm(false);
      setEditingCommentary(null);
      setSelectedInitiative(null);
    } catch (error: any) {
      message.error(error.message || 'Failed to update commentary');
    }
  };

  const handleDeleteCommentary = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Quarterly commentary deleted successfully');
    } catch (error: any) {
      message.error(error.message || 'Failed to delete commentary');
    }
  };

  const handleEdit = (commentary: QuarterlyCommentary) => {
    const initiative = initiatives?.find(i => i.id === commentary.initiative_id);
    if (initiative) {
      setSelectedInitiative(initiative);
      setEditingCommentary(commentary);
      setShowForm(true);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCommentary(null);
    setSelectedInitiative(null);
    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('initiative');
    window.history.replaceState({}, '', url.toString());
  };

  const handleInitiativeSelection = (initiative: StrategicInitiative) => {
    setSelectedInitiative(initiative);
    setShowInitiativeSelector(false);
    setShowForm(true);
  };


  const getDivisionName = (divisionId: string) => {
    return divisions?.find(d => d.id === divisionId)?.name || 'Unknown Division';
  };

  const getInitiativeName = (initiativeId: string) => {
    return initiatives?.find(i => i.id === initiativeId)?.name || 'Unknown Initiative';
  };

  // Statistics
  const totalCommentaries = filteredCommentaries.length;
  const draftCount = filteredCommentaries.filter(c => c.status === 'Draft').length;
  const approvedCount = filteredCommentaries.filter(c => c.status === 'Approved').length;
  const submittedCount = filteredCommentaries.filter(c => c.status === 'Submitted').length;

  const columns = [
    {
      title: 'Initiative',
      dataIndex: 'initiative_id',
      key: 'initiative',
      render: (_: any, record: QuarterlyCommentary) => {
        const initiative = (record as any).initiative;
        return initiative?.name || 'Unknown Initiative';
      },
    },
    {
      title: 'Division',
      key: 'division',
      render: (record: QuarterlyCommentary) => {
        const divisionId = (record as any).initiative?.objective?.division_id;
        return (
          <Space>
            <TeamOutlined />
            {getDivisionName(divisionId)}
          </Space>
        );
      },
    },
    {
      title: 'Quarter',
      key: 'quarter',
      render: (record: QuarterlyCommentary) => {
        const quarterInfo = getQuarterInfo(record.quarter);
        return (
          <Tag color={quarterInfo?.color}>
            {record.quarter} {record.year}
          </Tag>
        );
      },
    },
    {
      title: 'Commentary',
      dataIndex: 'commentary',
      key: 'commentary',
      render: (commentary: string) => (
        <div style={{ maxWidth: '300px' }}>
          <Text ellipsis={{ tooltip: commentary }}>
            {commentary}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color.replace('#', '')} icon={config.icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Reviewer',
      dataIndex: 'reviewer_id',
      key: 'reviewer',
      render: (_: any, record: QuarterlyCommentary) => {
        const reviewer = (record as any).reviewer;
        return (
          <Space>
            <UserOutlined />
            {reviewer ? `${reviewer.first_name} ${reviewer.last_name}` : 'Unknown'}
          </Space>
        );
      },
    },
    {
      title: 'Review Date',
      dataIndex: 'review_date',
      key: 'review_date',
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format('MMM DD, YYYY')}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: QuarterlyCommentary) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setViewingCommentary(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Delete Commentary"
            description="Are you sure you want to delete this commentary?"
            onConfirm={() => handleDeleteCommentary(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                size="small"
                loading={deleteMutation.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (showForm && selectedInitiative) {
    return (
      <QuarterlyCommentaryForm
        initiative={selectedInitiative}
        initialValues={editingCommentary || undefined}
        onSubmit={editingCommentary ? handleUpdateCommentary : handleCreateCommentary}
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
            Quarterly Business Plan Review
          </Title>
          <Text type="secondary">
            Review and manage quarterly commentary for strategic initiatives
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setShowInitiativeSelector(true)}
        >
          Add Commentary
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6} lg={6}>
          <Card>
            <Statistic
              title="Total Commentaries"
              value={totalCommentaries}
              prefix={<CommentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} lg={6}>
          <Card>
            <Statistic
              title="Approved"
              value={approvedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} lg={6}>
          <Card>
            <Statistic
              title="Submitted"
              value={submittedCount}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} lg={6}>
          <Card>
            <Statistic
              title="Draft"
              value={draftCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#d9d9d9' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong>Year:</Text>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: '100%', marginTop: '8px' }}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = dayjs().year() - 2 + i;
                  return (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  );
                })}
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong>Quarter:</Text>
              <Select
                value={selectedQuarter}
                onChange={setSelectedQuarter}
                style={{ width: '100%', marginTop: '8px' }}
              >
                <Option value="All">All Quarters</Option>
                {quarters.map(quarter => (
                  <Option key={quarter.value} value={quarter.value}>
                    <Space>
                      <span style={{ color: quarter.color }}>●</span>
                      {quarter.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong>Division:</Text>
              <Select
                value={selectedDivision}
                onChange={setSelectedDivision}
                style={{ width: '100%', marginTop: '8px' }}
              >
                <Option value="All">All Divisions</Option>
                {divisions?.map(division => (
                  <Option key={division.id} value={division.id}>
                    {division.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong>Search:</Text>
              <Input
                placeholder="Search commentaries..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                style={{ marginTop: '8px' }}
              />
            </div>
          </Col>
        </Row>
        
        <Row style={{ marginTop: '16px' }}>
          <Col>
            <Space>
              <Text type="secondary">
                Showing {filteredCommentaries.length} commentaries
              </Text>
              {(searchTerm || selectedQuarter !== 'All' || selectedDivision !== 'All') && (
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedQuarter('All');
                    setSelectedDivision('All');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Commentaries Table */}
      <Card
        title={
          <Space>
            <CommentOutlined />
            Quarterly Commentaries
            <Badge count={filteredCommentaries.length} color="blue" />
          </Space>
        }
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} type="text">
              Export
            </Button>
            <Button icon={<FilterOutlined />} type="text">
              More Filters
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredCommentaries}
          rowKey="id"
          loading={commentariesLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} commentaries`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* View Commentary Modal */}
      <Modal
        title={
          <Space>
            <CommentOutlined />
            View Commentary
          </Space>
        }
        open={!!viewingCommentary}
        onCancel={() => setViewingCommentary(null)}
        footer={[
          <Button key="close" onClick={() => setViewingCommentary(null)}>
            Close
          </Button>,
          <Button key="edit" type="primary" onClick={() => {
            if (viewingCommentary) {
              setViewingCommentary(null);
              handleEdit(viewingCommentary);
            }
          }}>
            Edit Commentary
          </Button>,
        ]}
        width={800}
      >
        {viewingCommentary && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              <Col xs={24} sm={12}>
                <Text strong>Initiative:</Text>
                <div>{getInitiativeName(viewingCommentary.initiative_id)}</div>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Quarter:</Text>
                <div>
                  <Tag color={getQuarterInfo(viewingCommentary.quarter)?.color}>
                    {viewingCommentary.quarter} {viewingCommentary.year}
                  </Tag>
                </div>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              <Col xs={24} sm={12}>
                <Text strong>Status:</Text>
                <div>
                  <Tag color={getStatusConfig(viewingCommentary.status).color.replace('#', '')} 
                       icon={getStatusConfig(viewingCommentary.status).icon}>
                    {viewingCommentary.status}
                  </Tag>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Review Date:</Text>
                <div>{dayjs(viewingCommentary.review_date).format('MMMM DD, YYYY')}</div>
              </Col>
            </Row>
            
            <Divider />
            
            <div>
              <Text strong>Commentary:</Text>
              <Paragraph style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                {viewingCommentary.commentary}
              </Paragraph>
            </div>
          </div>
        )}
      </Modal>

      {/* Initiative Selection Modal */}
      <Modal
        title={
          <Space>
            <ProjectOutlined />
            Select Initiative for Commentary
          </Space>
        }
        open={showInitiativeSelector}
        onCancel={() => setShowInitiativeSelector(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowInitiativeSelector(false)}>
            Cancel
          </Button>,
        ]}
        width={800}
      >
        <div style={{ marginBottom: '16px' }}>
          <Input
            placeholder="Search initiatives..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </div>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {initiatives?.filter(initiative => 
            initiative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            initiative.description?.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(initiative => {
            return (
              <Card 
                key={initiative.id}
                size="small" 
                style={{ marginBottom: '8px', cursor: 'pointer' }}
                hoverable
                onClick={() => handleInitiativeSelection(initiative)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <Text strong>{initiative.name}</Text>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {initiative.description}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <Tag color={initiative.status === 'Active' ? 'green' : 'orange'}>
                        {initiative.status}
                      </Tag>
                      <Tag color={initiative.priority === 'High' ? 'red' : 'blue'}>
                        {initiative.priority}
                      </Tag>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Button type="primary" size="small">
                      Select
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};