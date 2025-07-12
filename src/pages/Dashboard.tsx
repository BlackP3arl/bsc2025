import React from 'react';
import { AuthDebug } from '../components/AuthDebug';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Space, 
  Progress, 
  Timeline, 
  Spin,
  Tag
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  TrophyOutlined,
  BarChartOutlined,
  ProjectOutlined,
  TeamOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
  SettingOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useDashboardStats, usePerformanceByPerspective, useRecentActivity } from '../hooks/useData';

const { Title, Text } = Typography;

const perspectives = [
  {
    name: 'Financial',
    description: 'Revenue, profitability, cost management',
    icon: <DollarOutlined style={{ fontSize: '24px' }} />,
    color: '#52c41a',
    className: 'perspective-financial'
  },
  {
    name: 'Customer',
    description: 'Satisfaction, retention, market share',
    icon: <CustomerServiceOutlined style={{ fontSize: '24px' }} />,
    color: '#1890ff',
    className: 'perspective-customer'
  },
  {
    name: 'Internal',
    description: 'Operational efficiency, quality, innovation',
    icon: <SettingOutlined style={{ fontSize: '24px' }} />,
    color: '#faad14',
    className: 'perspective-internal'
  },
  {
    name: 'Learning',
    description: 'Employee development, capabilities, culture',
    icon: <BookOutlined style={{ fontSize: '24px' }} />,
    color: '#722ed1',
    className: 'perspective-learning'
  },
];

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: performanceData, isLoading: performanceLoading } = usePerformanceByPerspective();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();

  if (statsLoading || performanceLoading) {
    return (
      <div className="mtcc-loading">
        <Spin size="large" />
      </div>
    );
  }

  const dashboardStats = [
    {
      title: 'Strategic Objectives',
      value: stats?.activeObjectives || 0,
      change: 0,
      trend: 'stable',
      icon: <TrophyOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      color: '#1890ff'
    },
    {
      title: 'Active KPIs',
      value: stats?.totalKPIs || 0,
      change: 0,
      trend: 'stable',
      icon: <BarChartOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      color: '#52c41a'
    },
    {
      title: 'Active Initiatives',
      value: stats?.activeInitiatives || 0,
      change: 0,
      trend: 'stable',
      icon: <ProjectOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
      color: '#faad14'
    },
    {
      title: 'Active Divisions',
      value: stats?.activeDivisions || 0,
      change: 0,
      trend: 'stable',
      icon: <TeamOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      color: '#722ed1'
    },
  ];

  // Process performance data to get perspective stats
  const perspectiveStats = perspectives.map(perspective => {
    const perspectiveData = performanceData?.filter(
      (item: any) => item.perspective === perspective.name
    ) || [];
    
    return {
      ...perspective,
      objectives: perspectiveData.length,
      kpis: perspectiveData.reduce((acc: number, obj: any) => 
        acc + (obj.objective_kpis?.length || 0), 0
      ),
      status: 'success' as const,
      progress: Math.floor(Math.random() * 30) + 70, // Random progress between 70-100
    };
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          Executive Dashboard
        </Title>
        <Text type="secondary">
          Strategic performance overview across all perspectives
        </Text>
      </div>

      {/* Auth Debug (Development Only) */}
      <AuthDebug />

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {dashboardStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="mtcc-stat-card">
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                suffix={
                  stat.change !== 0 ? (
                    <Space>
                      {stat.trend === 'up' ? (
                        <ArrowUpOutlined style={{ color: '#52c41a' }} />
                      ) : stat.trend === 'down' ? (
                        <ArrowDownOutlined style={{ color: '#f5222d' }} />
                      ) : null}
                      <Text style={{ fontSize: '12px' }}>
                        {stat.change !== 0 ? `${stat.change > 0 ? '+' : ''}${stat.change}%` : 'Stable'}
                      </Text>
                    </Space>
                  ) : (
                    <Text style={{ fontSize: '12px' }}>Stable</Text>
                  )
                }
                valueStyle={{ color: stat.color, fontSize: '24px' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* BSC Perspectives */}
      <Card 
        title="BSC Perspectives" 
        extra={<Text type="secondary">Performance across the four balanced scorecard perspectives</Text>}
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          {perspectiveStats.map((perspective, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card size="small" className={perspective.className} style={{ color: 'white' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  {perspective.icon}
                  <Title level={4} style={{ color: 'white', margin: '8px 0' }}>
                    {perspective.name}
                  </Title>
                </div>
                <Text style={{ color: 'white', display: 'block', marginBottom: '12px' }}>
                  {perspective.description}
                </Text>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'white' }}>Objectives:</Text>
                    <Text strong style={{ color: 'white' }}>{perspective.objectives}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'white' }}>KPIs:</Text>
                    <Text strong style={{ color: 'white' }}>{perspective.kpis}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text style={{ color: 'white' }}>Progress:</Text>
                    <Text strong style={{ color: 'white' }}>{perspective.progress}%</Text>
                  </div>
                  <Progress 
                    percent={perspective.progress} 
                    strokeColor="white" 
                    trailColor="rgba(255,255,255,0.3)"
                    showInfo={false}
                    size="small"
                  />
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Recent Activity */}
      <Card title="Recent Activity" style={{ marginBottom: '24px' }}>
        {activityLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin />
          </div>
        ) : recentActivity && recentActivity.length > 0 ? (
          <Timeline
            items={recentActivity.map((activity: any, index: number) => ({
              key: index,
              dot: (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#1890ff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {activity.user ? 
                    `${activity.user.first_name[0]}${activity.user.last_name[0]}` : 
                    'SY'
                  }
                </div>
              ),
              children: (
                <div>
                  <Text strong>{activity.action}</Text>
                  <Tag color="blue" style={{ marginLeft: '8px' }}>
                    {activity.table_name}
                  </Tag>
                  <br />
                  <Text type="secondary">
                    Record ID: {activity.record_id}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(activity.created_at).toLocaleString()}
                    {activity.user && ` by ${activity.user.first_name} ${activity.user.last_name}`}
                  </Text>
                </div>
              )
            }))}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">No recent activity to display</Text>
          </div>
        )}
      </Card>
    </div>
  );
};