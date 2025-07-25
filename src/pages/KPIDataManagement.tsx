import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Select,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Tag,
  Tooltip,
  Statistic,
  Alert,
  Checkbox,
  List,
  Badge,
  Pagination,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BarChartOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  UpOutlined
} from '@ant-design/icons';
import {
  useKPIDefinitions,
  useKPIData,
  useAddKPIData,
  useUpdateKPIData,
  useDeleteKPIData,
  useCurrentUser,
  useDivisions
} from '../hooks/useData';
import type { KPIData } from '../types';
import dayjs from 'dayjs';
import { supabase } from '../lib/supabase';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export const KPIDataManagement: React.FC = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: kpiDefinitions } = useKPIDefinitions();
  const { data: divisions } = useDivisions();
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState<KPIData | null>(null);
  const [currentKPIForEntry, setCurrentKPIForEntry] = useState<string>('');
  const [viewingKPIData, setViewingKPIData] = useState<string>('');
  const [kpiDataCounts, setKpiDataCounts] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [loadingCounts, setLoadingCounts] = useState<boolean>(false);
  const [form] = Form.useForm();

  // Refs for scrolling
  const dataTableRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const addMutation = useAddKPIData();
  const updateMutation = useUpdateKPIData();
  const deleteMutation = useDeleteKPIData();

  // Filter KPIs based on division and search term
  const filteredKPIs = useMemo(() => {
    if (!kpiDefinitions) return [];
    
    return kpiDefinitions.filter(kpi => {
      const matchesDivision = selectedDivision === 'All' || kpi.division_id === selectedDivision;
      const matchesSearch = searchTerm === '' || 
        kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kpi.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesDivision && matchesSearch;
    });
  }, [kpiDefinitions, selectedDivision, searchTerm]);

  // Paginated KPIs for current page
  const paginatedKPIs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredKPIs.slice(startIndex, endIndex);
  }, [filteredKPIs, currentPage, pageSize]);

  // Fetch data counts for currently visible KPIs only
  useEffect(() => {
    const fetchKPIDataCounts = async () => {
      if (!paginatedKPIs.length) return;
      
      setLoadingCounts(true);
      const counts: Record<string, number> = { ...kpiDataCounts };
      
      console.log('Fetching KPI data counts for', paginatedKPIs.length, 'visible KPIs');
      
      // Only fetch counts for KPIs that we don't already have
      const kpisToFetch = paginatedKPIs.filter(kpi => !(kpi.id in counts));
      
      if (kpisToFetch.length === 0) {
        setLoadingCounts(false);
        return;
      }
      
      // Fetch data count for each visible KPI in batches
      const batchSize = 5;
      for (let i = 0; i < kpisToFetch.length; i += batchSize) {
        const batch = kpisToFetch.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (kpi) => {
            try {
              const { count, error } = await supabase
                .from('kpi_data')
                .select('*', { count: 'exact', head: true })
                .eq('kpi_id', kpi.id);
              
              if (error) {
                console.error(`Error fetching count for KPI ${kpi.name}:`, error);
                counts[kpi.id] = 0;
              } else {
                counts[kpi.id] = count || 0;
              }
            } catch (error) {
              console.error(`Error fetching data count for KPI ${kpi.id}:`, error);
              counts[kpi.id] = 0;
            }
          })
        );
        
        // Update state after each batch to show progressive loading
        setKpiDataCounts({ ...counts });
      }
      
      setLoadingCounts(false);
    };

    fetchKPIDataCounts();
  }, [paginatedKPIs]);

  const { data: kpiData, isLoading } = useKPIData(
    viewingKPIData || currentKPIForEntry,
    dateRange?.[0]?.format('YYYY-MM-DD'),
    dateRange?.[1]?.format('YYYY-MM-DD')
  );

  const handleSubmit = async (values: any) => {
    try {
      if (!currentUser?.id) {
        message.error('User not authenticated');
        return;
      }

      const dataToSubmit = {
        kpi_id: currentKPIForEntry,
        period: values.period.format('YYYY-MM-DD'),
        actual_value: values.actual_value,
        target_value: values.target_value,
        status: values.status,
        comments: values.comments || null,
        entered_by: currentUser.id
      };

      console.log('Data to submit:', dataToSubmit);

      if (editingData) {
        await updateMutation.mutateAsync({ id: editingData.id, data: dataToSubmit });
        message.success('KPI data updated successfully');
      } else {
        await addMutation.mutateAsync(dataToSubmit);
        message.success('KPI data added successfully');
        
        // Update the count for this KPI
        setKpiDataCounts(prev => ({
          ...prev,
          [currentKPIForEntry]: (prev[currentKPIForEntry] || 0) + 1
        }));
      }

      setShowForm(false);
      setEditingData(null);
      setCurrentKPIForEntry('');
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Failed to save KPI data');
    }
  };

  const handleKPISelection = (kpiId: string, checked: boolean) => {
    if (checked) {
      setSelectedKPIs(prev => [...prev, kpiId]);
    } else {
      setSelectedKPIs(prev => prev.filter(id => id !== kpiId));
    }
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when page size changes
    }
    // Clear selections when changing pages to avoid confusion
    setSelectedKPIs([]);
    setViewingKPIData('');
  };

  const handleAddDataForSelectedKPIs = () => {
    if (selectedKPIs.length === 0) {
      message.warning('Please select at least one KPI to add data');
      return;
    }
    
    if (selectedKPIs.length === 1) {
      setCurrentKPIForEntry(selectedKPIs[0]);
      setShowForm(true);
    } else {
      // For multiple KPIs, we'll show a modal to select which one to add data for
      // For now, we'll take the first one and show a message
      setCurrentKPIForEntry(selectedKPIs[0]);
      setShowForm(true);
      message.info(`Adding data for the first selected KPI. You can add data for other KPIs after completing this one.`);
    }
  };


  const handleViewKPIData = (kpiId: string) => {
    setViewingKPIData(kpiId);
    setCurrentKPIForEntry(''); // Clear any entry mode
    message.success('Viewing KPI data entries');
    
    // Auto-scroll to data table after a short delay to allow state update
    setTimeout(() => {
      if (dataTableRef.current) {
        dataTableRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  const handleClearView = () => {
    setViewingKPIData('');
    setCurrentKPIForEntry('');
  };

  const handleEdit = (record: KPIData) => {
    setEditingData(record);
    setCurrentKPIForEntry(record.kpi_id);
    form.setFieldsValue({
      ...record,
      period: dayjs(record.period)
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, kpiId?: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('KPI data deleted successfully');
      
      // Update the count for the KPI if we know which KPI it belongs to
      if (kpiId) {
        setKpiDataCounts(prev => ({
          ...prev,
          [kpiId]: Math.max((prev[kpiId] || 1) - 1, 0)
        }));
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to delete KPI data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Green': return 'green';
      case 'Yellow': return 'orange';
      case 'Red': return 'red';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Green': return <CheckCircleOutlined />;
      case 'Yellow': return <ExclamationCircleOutlined />;
      case 'Red': return <CloseCircleOutlined />;
      default: return null;
    }
  };

  const columns = [
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (period: string) => (
        <Space>
          <CalendarOutlined />
          {dayjs(period).format('MMM YYYY')}
        </Space>
      ),
      sorter: (a: KPIData, b: KPIData) => dayjs(a.period).unix() - dayjs(b.period).unix(),
      defaultSortOrder: 'descend' as const
    },
    {
      title: 'Actual Value',
      dataIndex: 'actual_value',
      key: 'actual_value',
      render: (value: number, record: KPIData) => {
        const kpi = kpiDefinitions?.find(k => k.id === record.kpi_id);
        return (
          <Text strong>
            {value}{kpi?.units ? ` ${kpi.units}` : ''}
          </Text>
        );
      }
    },
    {
      title: 'Target Value',
      dataIndex: 'target_value',
      key: 'target_value',
      render: (value: number, record: KPIData) => {
        const kpi = kpiDefinitions?.find(k => k.id === record.kpi_id);
        return (
          <Text type="secondary">
            {value}{kpi?.units ? ` ${kpi.units}` : ''}
          </Text>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Green', value: 'Green' },
        { text: 'Yellow', value: 'Yellow' },
        { text: 'Red', value: 'Red' }
      ],
      onFilter: (value: any, record: KPIData) => record.status === value
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_: any, record: KPIData) => {
        const progress = record.target_value ? (record.actual_value / record.target_value) * 100 : 0;
        return (
          <Statistic
            value={progress}
            precision={1}
            suffix="%"
            valueStyle={{ 
              color: progress >= 100 ? '#52c41a' : progress >= 80 ? '#faad14' : '#f5222d',
              fontSize: '14px'
            }}
          />
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: KPIData) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record.id, record.kpi_id)}
              size="small"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const currentKPIInfo = kpiDefinitions?.find(k => k.id === (viewingKPIData || currentKPIForEntry));

  return (
    <div>
      <div ref={topRef} style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          <BarChartOutlined style={{ marginRight: '8px' }} />
          KPI Data Management
        </Title>
        <Text type="secondary">
          Add and manage actual performance data for your KPIs
        </Text>
      </div>

      {/* Enhanced KPI Filters and Selection */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                <FilterOutlined style={{ marginRight: '4px' }} />
                Filter by Division
              </Text>
              <Select
                placeholder="All Divisions"
                value={selectedDivision}
                onChange={setSelectedDivision}
                style={{ width: '100%' }}
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
          <Col xs={24} sm={8} md={6}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                <SearchOutlined style={{ marginRight: '4px' }} />
                Search KPIs
              </Text>
              <Input
                placeholder="Search by KPI name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                prefix={<SearchOutlined />}
              />
            </div>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                <CalendarOutlined style={{ marginRight: '4px' }} />
                Date Range
              </Text>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                style={{ width: '100%' }}
                picker="month"
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ paddingTop: '32px' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddDataForSelectedKPIs}
                disabled={selectedKPIs.length === 0}
                style={{ width: '100%' }}
              >
                <Badge count={selectedKPIs.length} size="small">
                  Add KPI Data
                </Badge>
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* KPI Selection List */}
      <Card 
        title={
          <Space>
            <TrophyOutlined />
            <span>Select KPIs for Data Entry</span>
            <Badge count={filteredKPIs.length} showZero color="#1890ff" />
          </Space>
        }
        style={{ marginBottom: '24px' }}
        extra={
          <Space>
            <Button 
              size="small" 
              onClick={() => setSelectedKPIs(paginatedKPIs.map(k => k.id))}
              disabled={paginatedKPIs.length === 0}
            >
              Select Page
            </Button>
            <Button 
              size="small" 
              onClick={() => setSelectedKPIs([])}
              disabled={selectedKPIs.length === 0}
            >
              Clear All
            </Button>
          </Space>
        }
      >
        {filteredKPIs.length > 0 ? (
          <>
            <Spin spinning={loadingCounts} tip="Loading KPI data counts...">
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
                dataSource={paginatedKPIs}
                renderItem={(kpi) => (
                <List.Item>
                  <Card 
                    size="small" 
                    hoverable
                    style={{ 
                      border: selectedKPIs.includes(kpi.id) ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      backgroundColor: selectedKPIs.includes(kpi.id) ? '#f6ffed' : 'white'
                    }}
                    bodyStyle={{ padding: '12px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Checkbox
                        checked={selectedKPIs.includes(kpi.id)}
                        onChange={(e) => handleKPISelection(kpi.id, e.target.checked)}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          fontSize: '14px', 
                          marginBottom: '4px',
                          color: selectedKPIs.includes(kpi.id) ? '#1890ff' : 'inherit'
                        }}>
                          {kpi.name}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#666', 
                          marginBottom: '8px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {kpi.description}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Tag 
                            color={kpiDataCounts[kpi.id] > 0 ? "orange" : "default"} 
                            style={{ fontSize: '11px', margin: 0 }}
                          >
                            <BarChartOutlined style={{ marginRight: '2px' }} />
                            {kpiDataCounts[kpi.id] || 0} entries
                          </Tag>
                          <Button
                            size="small"
                            type={viewingKPIData === kpi.id ? "primary" : "default"}
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (viewingKPIData === kpi.id) {
                                handleClearView();
                              } else {
                                handleViewKPIData(kpi.id);
                              }
                            }}
                            style={{ fontSize: '11px' }}
                          >
                            {viewingKPIData === kpi.id ? 'Hide Data' : 'View Data'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
            </Spin>
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
                  pageSizeOptions={['6', '12', '24', '48']}
                />
              </div>
            )}
          </>
        ) : (
          <Alert
            message="No KPIs Found"
            description="No KPIs match your current filter criteria. Try adjusting the division filter or search term."
            type="info"
            showIcon
          />
        )}
      </Card>

      {/* Current KPI Info */}
      {currentKPIInfo && (
        <Card 
          title={
            <Space>
              {viewingKPIData ? <EyeOutlined /> : <BarChartOutlined />}
              <span>{viewingKPIData ? 'Viewing KPI Data' : 'KPI Data Entry'}</span>
              {viewingKPIData && (
                <Button 
                  size="small" 
                  type="text" 
                  onClick={handleClearView}
                  icon={<CloseCircleOutlined />}
                >
                  Clear View
                </Button>
              )}
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div>
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  {currentKPIInfo.name}
                </Text>
                <br />
                <Text type="secondary">
                  {currentKPIInfo.description}
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Target Value"
                    value={currentKPIInfo.target_value}
                    suffix={currentKPIInfo.units}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Frequency"
                    value={currentKPIInfo.frequency}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      )}

      {/* Data Table */}
      <div ref={dataTableRef}>
        {(viewingKPIData || currentKPIForEntry) ? (
          <Card 
            title={
              <Space>
                <BarChartOutlined />
                <span>KPI Data Entries</span>
                <Badge count={kpiData?.length || 0} color="#1890ff" />
              </Space>
            }
            extra={
              viewingKPIData && (
                <Button 
                  type="text" 
                  icon={<UpOutlined />} 
                  onClick={scrollToTop}
                  size="small"
                >
                  Back to Top
                </Button>
              )
            }
          >
          <Table
            columns={columns}
            dataSource={kpiData || []}
            loading={isLoading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
            }}
            scroll={{ x: 800 }}
          />
        </Card>
        ) : (
          <Card>
            <Alert
              message="Select a KPI"
              description="Please select a KPI to view its data or use the checkboxes to select KPIs for data entry."
              type="info"
              showIcon
            />
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <Space>
            <BarChartOutlined />
            {editingData ? 'Edit KPI Data' : 'Add KPI Data'}
            {currentKPIInfo && (
              <Tag color="blue">
                {currentKPIInfo.name}
              </Tag>
            )}
          </Space>
        }
        open={showForm}
        onCancel={() => {
          setShowForm(false);
          setEditingData(null);
          setCurrentKPIForEntry('');
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'Green'
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="period"
                label="Period"
                rules={[{ required: true, message: 'Please select a period' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  picker="month"
                  format="YYYY-MM"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="actual_value"
                label="Actual Value"
                rules={[{ required: true, message: 'Please enter the actual value' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="target_value"
                label="Target Value"
                rules={[{ required: true, message: 'Please enter the target value' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select a status' }]}
              >
                <Select>
                  <Option value="Green">Green</Option>
                  <Option value="Yellow">Yellow</Option>
                  <Option value="Red">Red</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="comments"
            label="Comments"
          >
            <Input.TextArea
              rows={3}
              placeholder="Add any comments or notes about this data point..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setShowForm(false);
                setEditingData(null);
                setCurrentKPIForEntry('');
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={addMutation.isPending || updateMutation.isPending}
              >
                {editingData ? 'Update' : 'Add'} Data
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};