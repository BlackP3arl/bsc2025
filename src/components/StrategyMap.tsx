import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Tag, 
  Button, 
  Row, 
  Col,
  Spin,
  Modal,
  Badge,
  Divider
} from 'antd';
import { 
  TrophyOutlined,
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  AimOutlined,
  BarChartOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import * as d3 from 'd3';
import { useStrategicObjectives, useStrategicInitiatives, useKPIDefinitions, useDivisions } from '../hooks/useData';

const { Title, Text } = Typography;

interface StrategyMapProps {
  selectedDivision?: string;
  onObjectiveSelect?: (objective: any) => void;
}

interface ObjectiveNode {
  id: string;
  name: string;
  perspective: string;
  status: string;
  division_id: string;
  kpiCount: number;
  initiativeCount: number;
  x: number;
  y: number;
  color: string;
}

interface Connection {
  source: string;
  target: string;
  type: 'parent' | 'kpi' | 'initiative';
}

const perspectiveColors = {
  'Financial': '#52c41a',
  'Customer': '#1890ff', 
  'Internal': '#faad14',
  'Learning': '#722ed1'
};

const perspectiveOrder = ['Financial', 'Customer', 'Internal', 'Learning'];

export const StrategyMap: React.FC<StrategyMapProps> = ({ 
  selectedDivision, 
  onObjectiveSelect 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedObjective, setSelectedObjective] = useState<ObjectiveNode | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const { data: objectives, isLoading: objectivesLoading } = useStrategicObjectives();
  const { data: initiatives } = useStrategicInitiatives();
  const { data: kpis } = useKPIDefinitions();
  const { data: divisions } = useDivisions();

  // Filter objectives based on selected division
  const filteredObjectives = objectives?.filter(obj => 
    !selectedDivision || obj.division_id === selectedDivision
  ) || [];

  // Process data for visualization
  const processedNodes: ObjectiveNode[] = filteredObjectives.map(obj => {
    const kpiCount = kpis?.filter(kpi => kpi.division_id === obj.division_id).length || 0;
    const initiativeCount = initiatives?.filter(init => init.objective_id === obj.id).length || 0;
    
    return {
      id: obj.id,
      name: obj.name,
      perspective: obj.perspective,
      status: obj.status,
      division_id: obj.division_id,
      kpiCount,
      initiativeCount,
      x: 0,
      y: 0,
      color: perspectiveColors[obj.perspective as keyof typeof perspectiveColors] || '#8c8c8c'
    };
  });

  // Create connections between related objectives
  const connections: Connection[] = [];
  
  // Add parent-child relationships
  filteredObjectives.forEach(obj => {
    if (obj.parent_objective_id) {
      connections.push({
        source: obj.parent_objective_id,
        target: obj.id,
        type: 'parent'
      });
    }
  });

  useEffect(() => {
    if (!svgRef.current || processedNodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 1200;
    const height = 800;
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };

    // Set up SVG
    svg.attr('width', width).attr('height', height);

    const container = svg.append('g')
      .attr('class', 'strategy-map-container');

    // Create perspective sections
    const perspectiveHeight = (height - margin.top - margin.bottom) / 4;
    const perspectiveWidth = width - margin.left - margin.right;

    // Add perspective backgrounds
    perspectiveOrder.forEach((perspective, index) => {
      const y = margin.top + index * perspectiveHeight;
      
      container.append('rect')
        .attr('x', margin.left)
        .attr('y', y)
        .attr('width', perspectiveWidth)
        .attr('height', perspectiveHeight)
        .attr('fill', perspectiveColors[perspective as keyof typeof perspectiveColors])
        .attr('opacity', 0.05)
        .attr('stroke', perspectiveColors[perspective as keyof typeof perspectiveColors])
        .attr('stroke-width', 2)
        .attr('rx', 8);

      // Add perspective labels
      container.append('text')
        .attr('x', margin.left + 20)
        .attr('y', y + 30)
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', perspectiveColors[perspective as keyof typeof perspectiveColors])
        .text(perspective + ' Perspective');
    });

    // Position nodes within their perspectives
    const nodesByPerspective = perspectiveOrder.map(perspective => 
      processedNodes.filter(node => node.perspective === perspective)
    );

    nodesByPerspective.forEach((nodes, perspectiveIndex) => {
      const y = margin.top + perspectiveIndex * perspectiveHeight + perspectiveHeight / 2;
      const xStep = perspectiveWidth / (nodes.length + 1);
      
      nodes.forEach((node, nodeIndex) => {
        node.x = margin.left + (nodeIndex + 1) * xStep;
        node.y = y;
      });
    });

    // Draw connections
    container.selectAll('.link')
      .data(connections)
      .enter().append('line')
      .attr('class', 'link')
      .attr('x1', d => {
        const source = processedNodes.find(n => n.id === d.source);
        return source ? source.x : 0;
      })
      .attr('y1', d => {
        const source = processedNodes.find(n => n.id === d.source);
        return source ? source.y : 0;
      })
      .attr('x2', d => {
        const target = processedNodes.find(n => n.id === d.target);
        return target ? target.x : 0;
      })
      .attr('y2', d => {
        const target = processedNodes.find(n => n.id === d.target);
        return target ? target.y : 0;
      })
      .attr('stroke', '#d9d9d9')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.6);

    // Draw nodes
    const node = container.selectAll('.node')
      .data(processedNodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        setSelectedObjective(d);
        setShowModal(true);
        onObjectiveSelect?.(d);
      })
      .on('mouseover', function(_, d) {
        d3.select(this).select('circle').attr('r', 35);
        
        // Highlight connections
        container.selectAll('.link')
          .attr('opacity', (l: any) => 
            l.source === d.id || l.target === d.id ? 1 : 0.2
          )
          .attr('stroke-width', (l: any) => 
            l.source === d.id || l.target === d.id ? 3 : 2
          );
      })
      .on('mouseout', function() {
        d3.select(this).select('circle').attr('r', 30);
        
        // Reset connections
        container.selectAll('.link')
          .attr('opacity', 0.6)
          .attr('stroke-width', 2);
      });

    // Add circles for nodes
    node.append('circle')
      .attr('r', 30)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('opacity', 0.9);

    // Add status indicators
    node.append('circle')
      .attr('r', 8)
      .attr('cx', 22)
      .attr('cy', -22)
      .attr('fill', d => d.status === 'Active' ? '#52c41a' : '#f5222d')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add KPI count badges
    node.filter(d => d.kpiCount > 0)
      .append('circle')
      .attr('r', 10)
      .attr('cx', -22)
      .attr('cy', -22)
      .attr('fill', '#1890ff')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.filter(d => d.kpiCount > 0)
      .append('text')
      .attr('x', -22)
      .attr('y', -18)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .text(d => d.kpiCount);

    // Add initiative count badges
    node.filter(d => d.initiativeCount > 0)
      .append('circle')
      .attr('r', 10)
      .attr('cx', 22)
      .attr('cy', 22)
      .attr('fill', '#faad14')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.filter(d => d.initiativeCount > 0)
      .append('text')
      .attr('x', 22)
      .attr('y', 26)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .text(d => d.initiativeCount);

    // Add node labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .text(d => d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name);

    // Add zoom and pan behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom as any);

  }, [processedNodes, connections, onObjectiveSelect]);

  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        (d3.zoom() as any).scaleBy, 1.5
      );
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        (d3.zoom() as any).scaleBy, 1 / 1.5
      );
    }
  };

  const handleReset = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        (d3.zoom() as any).transform,
        d3.zoomIdentity
      );
    }
  };

  const getDivisionName = (divisionId: string) => {
    return divisions?.find(d => d.id === divisionId)?.name || 'Unknown Division';
  };

  if (objectivesLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">Loading strategy map...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (filteredObjectives.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <TrophyOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={4} type="secondary">No Strategic Objectives</Title>
          <Text type="secondary">
            {selectedDivision 
              ? 'No objectives found for the selected division' 
              : 'No strategic objectives available to display'
            }
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <TrophyOutlined />
            <span>Interactive Strategy Map</span>
            <Badge count={filteredObjectives.length} color="blue" />
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
            <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
            <Button icon={<ReloadOutlined />} onClick={handleReset} />
            <Button icon={<FullscreenOutlined />} onClick={() => setShowModal(true)} />
          </Space>
        }
      >
        {/* Legend */}
        <div style={{ marginBottom: '16px', padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Title level={5} style={{ marginBottom: '8px' }}>Perspectives</Title>
              <Space wrap>
                {perspectiveOrder.map(perspective => (
                  <Tag key={perspective} color={perspectiveColors[perspective as keyof typeof perspectiveColors]}>
                    {perspective}
                  </Tag>
                ))}
              </Space>
            </Col>
            <Col span={12}>
              <Title level={5} style={{ marginBottom: '8px' }}>Indicators</Title>
              <Space direction="vertical" size="small">
                <Space>
                  <Badge color="#52c41a" />
                  <Text>Active Status</Text>
                  <Badge color="#f5222d" />
                  <Text>Inactive Status</Text>
                </Space>
                <Space>
                  <Badge color="#1890ff" />
                  <Text>KPI Count</Text>
                  <Badge color="#faad14" />
                  <Text>Initiative Count</Text>
                </Space>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Strategy Map Visualization */}
        <div style={{ 
          border: '1px solid #d9d9d9', 
          borderRadius: '8px', 
          overflow: 'hidden',
          background: '#fff'
        }}>
          <svg ref={svgRef} style={{ width: '100%', height: '600px' }} />
        </div>

        {/* Zoom Level Indicator */}
        <div style={{ marginTop: '8px', textAlign: 'center' }}>
          <Text type="secondary">Zoom: {Math.round(zoomLevel * 100)}%</Text>
        </div>
      </Card>

      {/* Objective Details Modal */}
      <Modal
        title={
          <Space>
            <AimOutlined />
            <span>Objective Details</span>
          </Space>
        }
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={800}
      >
        {selectedObjective && (
          <div>
            <Title level={4}>{selectedObjective.name}</Title>
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <div>
                    <Text strong>Perspective: </Text>
                    <Tag color={selectedObjective.color}>
                      {selectedObjective.perspective}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Status: </Text>
                    <Tag color={selectedObjective.status === 'Active' ? 'green' : 'red'}>
                      {selectedObjective.status}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Division: </Text>
                    <Text>{getDivisionName(selectedObjective.division_id)}</Text>
                  </div>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <div>
                    <Space>
                      <BarChartOutlined style={{ color: '#1890ff' }} />
                      <Text strong>KPIs: </Text>
                      <Badge count={selectedObjective.kpiCount} color="blue" />
                    </Space>
                  </div>
                  <div>
                    <Space>
                      <ProjectOutlined style={{ color: '#faad14' }} />
                      <Text strong>Initiatives: </Text>
                      <Badge count={selectedObjective.initiativeCount} color="orange" />
                    </Space>
                  </div>
                </Space>
              </Col>
            </Row>
            
            <Divider />
            
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">
                <InfoCircleOutlined style={{ marginRight: '8px' }} />
                Click on objectives in the map to explore relationships and drill down into details
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};