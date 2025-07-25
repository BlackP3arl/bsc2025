import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Select, 
  Typography, 
  Space, 
  Button,
  Alert,
  Statistic,
  Tabs,
  Divider
} from 'antd';
import { 
  TrophyOutlined,
  TeamOutlined,
  BarChartOutlined,
  ProjectOutlined,
  InfoCircleOutlined,
  FullscreenOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { InteractiveStrategyMap } from '../components/InteractiveStrategyMap';
import { BSCStrategyMap } from '../components/BSCStrategyMap';
import { useDivisions, useStrategicObjectives, useStrategicInitiatives, useKPIDefinitions } from '../hooks/useData';

const { Title, Text } = Typography;
const { Option } = Select;

export const StrategyMapPage: React.FC = () => {
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedObjective, setSelectedObjective] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('traditional');

  const { data: divisions } = useDivisions();
  const { data: objectives } = useStrategicObjectives();
  const { data: initiatives } = useStrategicInitiatives();
  const { data: kpis } = useKPIDefinitions();

  // Filter data based on selected division
  const filteredObjectives = objectives?.filter(obj => 
    !selectedDivision || obj.division_id === selectedDivision
  ) || [];

  const filteredInitiatives = initiatives?.filter(init => 
    !selectedDivision || filteredObjectives.some(obj => obj.id === init.objective_id)
  ) || [];

  const filteredKPIs = kpis?.filter(kpi => 
    !selectedDivision || kpi.division_id === selectedDivision
  ) || [];

  // Calculate statistics
  const stats = {
    total: {
      objectives: filteredObjectives.length,
      initiatives: filteredInitiatives.length,
      kpis: filteredKPIs.length,
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
    }
  };

  const handleObjectiveSelect = (objective: any) => {
    setSelectedObjective(objective);
    setActiveTab('details');
  };

  const getDivisionName = (divisionId: string) => {
    return divisions?.find(d => d.id === divisionId)?.name || 'Unknown Division';
  };

  const getRelatedInitiatives = (objectiveId: string) => {
    return initiatives?.filter(init => init.objective_id === objectiveId) || [];
  };

  const getRelatedKPIs = (divisionId: string) => {
    return kpis?.filter(kpi => kpi.division_id === divisionId) || [];
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          <TrophyOutlined style={{ marginRight: '8px' }} />
          Strategy Map
        </Title>
        <Text type="secondary">
          Interactive visualization of strategic objectives and their relationships across BSC perspectives
        </Text>
      </div>

      {/* Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong>Division Filter</Text>
              <Select
                placeholder="Select division (optional)"
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
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="small">
              <Text strong>View Mode</Text>
              <Select
                value={activeTab}
                onChange={setActiveTab}
                style={{ width: '100%' }}
              >
                <Option value="mindmap">Interactive MindMap</Option>
                <Option value="traditional">BSC Matrix View</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Space direction="vertical" size="small">
              <Text strong>Quick Actions</Text>
              <Space>
                <Button 
                  icon={<FullscreenOutlined />}
                  onClick={() => setActiveTab('mindmap')}
                >
                  Fullscreen
                </Button>
                <Button 
                  icon={<SettingOutlined />}
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6} lg={3}>
          <Card>
            <Statistic
              title="Objectives"
              value={stats.total.objectives}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} lg={3}>
          <Card>
            <Statistic
              title="Initiatives"
              value={stats.total.initiatives}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} lg={3}>
          <Card>
            <Statistic
              title="KPIs"
              value={stats.total.kpis}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} lg={3}>
          <Card>
            <Statistic
              title="Divisions"
              value={stats.total.divisions}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={12}>
          <Card>
            <Title level={5} style={{ marginBottom: '16px' }}>Perspective Distribution</Title>
            <Row gutter={[8, 8]}>
              <Col span={6}>
                <Statistic
                  title="Financial"
                  value={stats.byPerspective.Financial}
                  valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Customer"
                  value={stats.byPerspective.Customer}
                  valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Internal"
                  value={stats.byPerspective.Internal}
                  valueStyle={{ color: '#faad14', fontSize: '18px' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Learning"
                  value={stats.byPerspective.Learning}
                  valueStyle={{ color: '#722ed1', fontSize: '18px' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        style={{ marginBottom: '24px' }}
        items={[
          {
            key: 'mindmap',
            label: 'Interactive MindMap',
            children: (
              <InteractiveStrategyMap 
                selectedDivision={selectedDivision}
                onObjectiveSelect={handleObjectiveSelect}
              />
            )
          },
          {
            key: 'traditional',
            label: 'BSC Matrix View',
            children: (
              <BSCStrategyMap 
                selectedDivision={selectedDivision}
                onObjectiveSelect={handleObjectiveSelect}
              />
            )
          },
          {
            key: 'details',
            label: 'Objective Details',
            children: (
              selectedObjective ? (
                <Card>
                  <Title level={3}>{selectedObjective.name}</Title>
                  <Divider />
                  
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                          <Title level={5}>Basic Information</Title>
                          <Space direction="vertical" size="small">
                            <div>
                              <Text strong>Perspective: </Text>
                              <Text>{selectedObjective.perspective}</Text>
                            </div>
                            <div>
                              <Text strong>Status: </Text>
                              <Text>{selectedObjective.status}</Text>
                            </div>
                            <div>
                              <Text strong>Division: </Text>
                              <Text>{getDivisionName(selectedObjective.division_id)}</Text>
                            </div>
                          </Space>
                        </div>
                      </Space>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                          <Title level={5}>Related Elements</Title>
                          <Space direction="vertical" size="small">
                            <div>
                              <Text strong>Related Initiatives: </Text>
                              <Text>{getRelatedInitiatives(selectedObjective.id).length}</Text>
                            </div>
                            <div>
                              <Text strong>Related KPIs: </Text>
                              <Text>{getRelatedKPIs(selectedObjective.division_id).length}</Text>
                            </div>
                          </Space>
                        </div>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              ) : (
                <Alert
                  message="No Objective Selected"
                  description="Click on an objective in the strategy map to view its details here."
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined />}
                />
              )
            )
          },
          {
            key: 'analysis',
            label: 'Analysis',
            children: (
              <Card>
                <Title level={4}>Strategy Map Analysis</Title>
                <Divider />
                
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Card>
                      <Title level={5}>Coverage Analysis</Title>
                      <Space direction="vertical" size="small">
                        <div>
                          <Text>Financial Perspective: </Text>
                          <Text strong>{stats.byPerspective.Financial} objectives</Text>
                        </div>
                        <div>
                          <Text>Customer Perspective: </Text>
                          <Text strong>{stats.byPerspective.Customer} objectives</Text>
                        </div>
                        <div>
                          <Text>Internal Perspective: </Text>
                          <Text strong>{stats.byPerspective.Internal} objectives</Text>
                        </div>
                        <div>
                          <Text>Learning Perspective: </Text>
                          <Text strong>{stats.byPerspective.Learning} objectives</Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                  
                  <Col xs={24} md={8}>
                    <Card>
                      <Title level={5}>Status Overview</Title>
                      <Space direction="vertical" size="small">
                        <div>
                          <Text>Active Objectives: </Text>
                          <Text strong style={{ color: '#52c41a' }}>
                            {stats.status.active}
                          </Text>
                        </div>
                        <div>
                          <Text>Inactive Objectives: </Text>
                          <Text strong style={{ color: '#f5222d' }}>
                            {stats.status.inactive}
                          </Text>
                        </div>
                        <div>
                          <Text>Completion Rate: </Text>
                          <Text strong>
                            {stats.total.objectives > 0 ? 
                              Math.round((stats.status.active / stats.total.objectives) * 100) : 0
                            }%
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                  
                  <Col xs={24} md={8}>
                    <Card>
                      <Title level={5}>Recommendations</Title>
                      <Space direction="vertical" size="small">
                        {stats.byPerspective.Financial === 0 && (
                          <Alert message="Consider adding Financial objectives" type="warning" />
                        )}
                        {stats.byPerspective.Learning === 0 && (
                          <Alert message="Consider adding Learning & Growth objectives" type="warning" />
                        )}
                        {stats.total.objectives > 0 && stats.status.active / stats.total.objectives < 0.5 && (
                          <Alert message="Many objectives are inactive" type="info" />
                        )}
                        {stats.total.objectives === 0 && (
                          <Alert message="No objectives defined" type="error" />
                        )}
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>
            )
          }
        ]}
      />

      {/* Help Information */}
      <Alert
        message="How to use the Strategy Map"
        description={
          <div>
            <Text>
              • <strong>MindMap Mode:</strong> Click +/- buttons on nodes to expand/collapse connections
            </Text><br />
            <Text>
              • <strong>Navigate:</strong> Use mouse wheel to zoom, click and drag to pan or move nodes
            </Text><br />
            <Text>
              • <strong>Interact:</strong> Click on objectives to view details and relationships
            </Text><br />
            <Text>
              • <strong>Filter:</strong> Use the division filter to focus on specific areas
            </Text><br />
            <Text>
              • <strong>Expand/Collapse:</strong> Use the expand all/collapse all buttons for quick navigation
            </Text><br />
            <Text>
              • <strong>Analyze:</strong> Review the analysis tab for strategic insights
            </Text>
          </div>
        }
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
      />
    </div>
  );
};