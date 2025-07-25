import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Tabs,
  Button,
  Select,
  DatePicker,
  Statistic,
  Alert,
  Table,
  Progress,
  Tag,
} from 'antd';
import {
  FileTextOutlined,
  BarChartOutlined,
  TrophyOutlined,
  TeamOutlined,
  DownloadOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { useDivisions, useStrategicObjectives, useKPIDefinitions, useStrategicInitiatives } from '../hooks/useData';
import { exportToCSV, exportToPDF, formatDataForExport, type ExportData } from '../utils/export';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export const Reports: React.FC = () => {
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [activeTab, setActiveTab] = useState('executive');

  const { data: divisions } = useDivisions();
  const { data: objectives } = useStrategicObjectives();
  const { data: kpis } = useKPIDefinitions();
  const { data: initiatives } = useStrategicInitiatives();

  // Filter data based on selected criteria
  const filteredObjectives = objectives?.filter(obj => 
    !selectedDivision || obj.division_id === selectedDivision
  ) || [];

  const filteredKPIs = kpis?.filter(kpi => 
    !selectedDivision || kpi.division_id === selectedDivision
  ) || [];

  const filteredInitiatives = initiatives?.filter(init => 
    !selectedDivision || filteredObjectives.some(obj => obj.id === init.objective_id)
  ) || [];

  // Calculate statistics
  const stats = {
    total: {
      objectives: filteredObjectives.length,
      kpis: filteredKPIs.length,
      initiatives: filteredInitiatives.length,
      divisions: selectedDivision ? 1 : (divisions?.length || 0)
    },
    byPerspective: {
      Financial: filteredObjectives.filter(obj => obj.perspective === 'Financial').length,
      Customer: filteredObjectives.filter(obj => obj.perspective === 'Customer').length,
      Internal: filteredObjectives.filter(obj => obj.perspective === 'Internal').length,
      Learning: filteredObjectives.filter(obj => obj.perspective === 'Learning').length,
    },
    status: {
      active: filteredObjectives.filter(obj => obj.status === 'Active').length,
      inactive: filteredObjectives.filter(obj => obj.status === 'Inactive').length,
    },
    initiatives: {
      planning: filteredInitiatives.filter(init => init.status === 'Planning').length,
      inProgress: filteredInitiatives.filter(init => init.status === 'Planning').length, // Note: Adjust status names as needed
      completed: filteredInitiatives.filter(init => init.status === 'Completed').length,
      onHold: filteredInitiatives.filter(init => init.status === 'On Hold').length,
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    let exportData: ExportData;
    
    switch (activeTab) {
      case 'executive':
        exportData = {
          title: 'Executive Summary Report',
          data: [
            { metric: 'Total Objectives', value: stats.total.objectives },
            { metric: 'Active KPIs', value: stats.total.kpis },
            { metric: 'Strategic Initiatives', value: stats.total.initiatives },
            { metric: 'Divisions Covered', value: stats.total.divisions },
            { metric: 'Financial Objectives', value: stats.byPerspective.Financial },
            { metric: 'Customer Objectives', value: stats.byPerspective.Customer },
            { metric: 'Internal Objectives', value: stats.byPerspective.Internal },
            { metric: 'Learning Objectives', value: stats.byPerspective.Learning },
            { metric: 'Active Objectives', value: stats.status.active },
            { metric: 'Inactive Objectives', value: stats.status.inactive }
          ],
          columns: ['metric', 'value'],
          filters: { division: selectedDivision }
        };
        break;
        
      case 'kpi':
        exportData = {
          title: 'KPI Performance Report',
          data: formatDataForExport(filteredKPIs, 'kpis'),
          columns: ['Name', 'Type', 'Frequency', 'Status', 'Formula', 'Target', 'Unit', 'Division'],
          filters: { division: selectedDivision }
        };
        break;
        
      case 'objectives':
        exportData = {
          title: 'Strategic Objectives Report',
          data: formatDataForExport(filteredObjectives, 'objectives'),
          columns: ['Name', 'Perspective', 'Status', 'Description', 'Created', 'Division'],
          filters: { division: selectedDivision }
        };
        break;
        
      case 'divisions':
        const divisionStats = divisions?.map(division => {
          const divObjectives = objectives?.filter(obj => obj.division_id === division.id) || [];
          const divKPIs = kpis?.filter(kpi => kpi.division_id === division.id) || [];
          const divInitiatives = initiatives?.filter(init => 
            divObjectives.some(obj => obj.id === init.objective_id)
          ) || [];

          return {
            name: division.name,
            code: division.code,
            objectives: divObjectives.length,
            activeObjectives: divObjectives.filter(obj => obj.status === 'Active').length,
            kpis: divKPIs.length,
            initiatives: divInitiatives.length,
            completionRate: divObjectives.length > 0 
              ? Math.round((divObjectives.filter(obj => obj.status === 'Active').length / divObjectives.length) * 100)
              : 0
          };
        }) || [];
        
        exportData = {
          title: 'Division Performance Report',
          data: formatDataForExport(divisionStats, 'divisions'),
          columns: ['Name', 'Code', 'Objectives', 'Active Objectives', 'KPIs', 'Initiatives', 'Completion Rate'],
          filters: { division: selectedDivision }
        };
        break;
        
      default:
        return;
    }
    
    if (format === 'pdf') {
      exportToPDF(exportData);
    } else {
      exportToCSV(exportData);
    }
  };

  const renderExecutiveSummary = () => (
    <div>
      {/* Key Metrics Overview */}
      <Card title="Executive Summary" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Statistic
              title="Total Objectives"
              value={stats.total.objectives}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="Active KPIs"
              value={stats.total.kpis}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="Strategic Initiatives"
              value={stats.total.initiatives}
              prefix={<PieChartOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="Divisions Covered"
              value={stats.total.divisions}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>
      </Card>

      {/* BSC Perspectives Performance */}
      <Card title="BSC Perspectives Overview" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          {Object.entries(stats.byPerspective).map(([perspective, count]) => (
            <Col xs={24} sm={6} key={perspective}>
              <Card size="small">
                <Statistic
                  title={`${perspective} Perspective`}
                  value={count}
                  valueStyle={{ 
                    color: perspective === 'Financial' ? '#52c41a' :
                           perspective === 'Customer' ? '#1890ff' :
                           perspective === 'Internal' ? '#faad14' : '#722ed1'
                  }}
                />
                <Progress 
                  percent={stats.total.objectives > 0 ? Math.round((count / stats.total.objectives) * 100) : 0}
                  size="small"
                  strokeColor={
                    perspective === 'Financial' ? '#52c41a' :
                    perspective === 'Customer' ? '#1890ff' :
                    perspective === 'Internal' ? '#faad14' : '#722ed1'
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Status Summary */}
      <Card title="Status Summary" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card size="small" title="Objectives Status">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Active: </Text>
                  <Text strong style={{ color: '#52c41a' }}>{stats.status.active}</Text>
                  <Progress 
                    percent={stats.total.objectives > 0 ? Math.round((stats.status.active / stats.total.objectives) * 100) : 0}
                    size="small"
                    strokeColor="#52c41a"
                    style={{ marginLeft: '12px', flex: 1 }}
                  />
                </div>
                <div>
                  <Text>Inactive: </Text>
                  <Text strong style={{ color: '#f5222d' }}>{stats.status.inactive}</Text>
                  <Progress 
                    percent={stats.total.objectives > 0 ? Math.round((stats.status.inactive / stats.total.objectives) * 100) : 0}
                    size="small"
                    strokeColor="#f5222d"
                    style={{ marginLeft: '12px', flex: 1 }}
                  />
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" title="Initiatives Status">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>In Progress: </Text>
                  <Text strong style={{ color: '#1890ff' }}>{stats.initiatives.inProgress}</Text>
                </div>
                <div>
                  <Text>Completed: </Text>
                  <Text strong style={{ color: '#52c41a' }}>{stats.initiatives.completed}</Text>
                </div>
                <div>
                  <Text>Planning: </Text>
                  <Text strong style={{ color: '#faad14' }}>{stats.initiatives.planning}</Text>
                </div>
                <div>
                  <Text>On Hold: </Text>
                  <Text strong style={{ color: '#f5222d' }}>{stats.initiatives.onHold}</Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );

  const renderKPIReport = () => {
    const kpiColumns = [
      {
        title: 'KPI Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => <Text strong>{text}</Text>
      },
      {
        title: 'Division',
        dataIndex: 'division_id',
        key: 'division',
        render: (divisionId: string) => {
          const division = divisions?.find(d => d.id === divisionId);
          return <Tag color="blue">{division?.name || 'Unknown'}</Tag>;
        }
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (type: string) => (
          <Tag color={type === 'Leading' ? 'green' : 'orange'}>{type}</Tag>
        )
      },
      {
        title: 'Frequency',
        dataIndex: 'frequency',
        key: 'frequency',
        render: (freq: string) => <Text>{freq}</Text>
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
        )
      }
    ];

    return (
      <Card title="KPI Performance Report">
        <div style={{ marginBottom: '16px' }}>
          <Text type="secondary">
            Total KPIs: {filteredKPIs.length} | 
            Active: {filteredKPIs.filter(kpi => kpi.status === 'Active').length} | 
            Inactive: {filteredKPIs.filter(kpi => kpi.status === 'Inactive').length}
          </Text>
        </div>
        <Table
          columns={kpiColumns}
          dataSource={filteredKPIs.map(kpi => ({ ...kpi, key: kpi.id }))}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    );
  };

  const renderObjectivesReport = () => {
    const objectiveColumns = [
      {
        title: 'Objective',
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => <Text strong>{text}</Text>
      },
      {
        title: 'Perspective',
        dataIndex: 'perspective',
        key: 'perspective',
        render: (perspective: string) => {
          const colors = {
            'Financial': 'green',
            'Customer': 'blue',
            'Internal': 'orange',
            'Learning': 'purple'
          };
          return <Tag color={colors[perspective as keyof typeof colors] || 'default'}>{perspective}</Tag>;
        }
      },
      {
        title: 'Division',
        dataIndex: 'division_id',
        key: 'division',
        render: (divisionId: string) => {
          const division = divisions?.find(d => d.id === divisionId);
          return <Tag color="blue">{division?.name || 'Unknown'}</Tag>;
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
        )
      },
      {
        title: 'KPIs',
        key: 'kpis',
        render: (record: any) => {
          const kpiCount = filteredKPIs.filter(kpi => kpi.division_id === record.division_id).length;
          return <Text>{kpiCount}</Text>;
        }
      },
      {
        title: 'Initiatives',
        key: 'initiatives',
        render: (record: any) => {
          const initCount = filteredInitiatives.filter(init => init.objective_id === record.id).length;
          return <Text>{initCount}</Text>;
        }
      }
    ];

    return (
      <Card title="Strategic Objectives Report">
        <div style={{ marginBottom: '16px' }}>
          <Text type="secondary">
            Total Objectives: {filteredObjectives.length} | 
            Active: {stats.status.active} | 
            Inactive: {stats.status.inactive}
          </Text>
        </div>
        <Table
          columns={objectiveColumns}
          dataSource={filteredObjectives.map(obj => ({ ...obj, key: obj.id }))}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>
    );
  };

  const renderDivisionReport = () => {
    const divisionStats = divisions?.map(division => {
      const divObjectives = objectives?.filter(obj => obj.division_id === division.id) || [];
      const divKPIs = kpis?.filter(kpi => kpi.division_id === division.id) || [];
      const divInitiatives = initiatives?.filter(init => 
        divObjectives.some(obj => obj.id === init.objective_id)
      ) || [];

      return {
        key: division.id,
        name: division.name,
        code: division.code,
        objectives: divObjectives.length,
        activeObjectives: divObjectives.filter(obj => obj.status === 'Active').length,
        kpis: divKPIs.length,
        initiatives: divInitiatives.length,
        completionRate: divObjectives.length > 0 
          ? Math.round((divObjectives.filter(obj => obj.status === 'Active').length / divObjectives.length) * 100)
          : 0
      };
    }) || [];

    const divisionColumns = [
      {
        title: 'Division',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: any) => (
          <div>
            <Text strong>{text}</Text><br />
            <Text type="secondary" style={{ fontSize: '12px' }}>({record.code})</Text>
          </div>
        )
      },
      {
        title: 'Objectives',
        dataIndex: 'objectives',
        key: 'objectives',
        render: (total: number, record: any) => (
          <div>
            <Text strong>{total}</Text><br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Active: {record.activeObjectives}
            </Text>
          </div>
        )
      },
      {
        title: 'KPIs',
        dataIndex: 'kpis',
        key: 'kpis'
      },
      {
        title: 'Initiatives',
        dataIndex: 'initiatives',
        key: 'initiatives'
      },
      {
        title: 'Completion Rate',
        dataIndex: 'completionRate',
        key: 'completionRate',
        render: (rate: number) => (
          <div>
            <Text>{rate}%</Text>
            <Progress
              percent={rate}
              size="small"
              strokeColor={rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : '#f5222d'}
            />
          </div>
        )
      }
    ];

    return (
      <Card title="Division Performance Report">
        <div style={{ marginBottom: '16px' }}>
          <Text type="secondary">
            Total Divisions: {divisions?.length || 0}
          </Text>
        </div>
        <Table
          columns={divisionColumns}
          dataSource={divisionStats}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          <FileTextOutlined style={{ marginRight: '8px' }} />
          Reports & Analytics
        </Title>
        <Text type="secondary">
          Comprehensive reporting and analytics for BSC performance monitoring
        </Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong>Division Filter</Text>
              <Select
                placeholder="All Divisions"
                value={selectedDivision}
                onChange={setSelectedDivision}
                style={{ width: '100%' }}
                allowClear
              >
                {divisions?.map(division => (
                  <Option key={division.id} value={division.id}>
                    {division.name} ({division.code})
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={8}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong>Date Range</Text>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
              />
            </Space>
          </Col>
          <Col xs={24} sm={8}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong>Export Options</Text>
              <Space>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => handleExport('pdf')}
                >
                  PDF
                </Button>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => handleExport('excel')}
                >
                  Excel
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Reports Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'executive',
            label: (
              <Space>
                <TrophyOutlined />
                Executive Summary
              </Space>
            ),
            children: renderExecutiveSummary()
          },
          {
            key: 'kpi',
            label: (
              <Space>
                <BarChartOutlined />
                KPI Report
              </Space>
            ),
            children: renderKPIReport()
          },
          {
            key: 'objectives',
            label: (
              <Space>
                <TrophyOutlined />
                Objectives Report
              </Space>
            ),
            children: renderObjectivesReport()
          },
          {
            key: 'divisions',
            label: (
              <Space>
                <TeamOutlined />
                Division Report
              </Space>
            ),
            children: renderDivisionReport()
          }
        ]}
      />

      {/* Help Information */}
      <Alert
        message="Report Guide"
        description={
          <div>
            <Text>
              • <strong>Executive Summary:</strong> High-level overview of BSC performance across all perspectives
            </Text><br />
            <Text>
              • <strong>KPI Report:</strong> Detailed analysis of key performance indicators and their status
            </Text><br />
            <Text>
              • <strong>Objectives Report:</strong> Strategic objectives breakdown by perspective and division
            </Text><br />
            <Text>
              • <strong>Division Report:</strong> Performance analysis for each MTCC division
            </Text><br />
            <Text>
              • <strong>Filters:</strong> Use division and date filters to focus on specific areas or time periods
            </Text><br />
            <Text>
              • <strong>Export:</strong> Download reports in PDF or Excel format for sharing and archival
            </Text>
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: '24px' }}
      />
    </div>
  );
};