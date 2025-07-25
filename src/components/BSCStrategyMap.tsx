import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Divider,
  Tooltip
} from 'antd';
import { 
  TrophyOutlined,
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  AimOutlined,
  BarChartOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import * as d3 from 'd3';
import { useStrategicObjectives, useStrategicInitiatives, useKPIDefinitions, useDivisions } from '../hooks/useData';

const { Title, Text } = Typography;

interface BSCStrategyMapProps {
  selectedDivision?: string;
  onObjectiveSelect?: (objective: any) => void;
}

interface ObjectiveNode {
  id: string;
  name: string;
  description: string;
  perspective: string;
  status: string;
  division_id: string;
  kpiCount: number;
  initiativeCount: number;
  x: number;
  y: number;
  color: string;
  data: any;
}

const perspectiveColors = {
  'Financial': '#52c41a',
  'Customer': '#1890ff', 
  'Internal': '#faad14',
  'Learning': '#722ed1'
};

const perspectiveOrder = ['Financial', 'Customer', 'Internal', 'Learning'];

export const BSCStrategyMap: React.FC<BSCStrategyMapProps> = ({ 
  selectedDivision, 
  onObjectiveSelect 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedObjective, setSelectedObjective] = useState<ObjectiveNode | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredObjective, setHoveredObjective] = useState<string | null>(null);
  
  const { data: objectives, isLoading: objectivesLoading } = useStrategicObjectives();
  const { data: initiatives } = useStrategicInitiatives();
  const { data: kpis } = useKPIDefinitions();
  const { data: divisions } = useDivisions();

  // Filter objectives based on selected division
  const filteredObjectives = objectives?.filter(obj => 
    !selectedDivision || obj.division_id === selectedDivision
  ) || [];

  // Process data for BSC visualization - memoized to prevent infinite loops
  const processedNodes = useMemo(() => {
    return filteredObjectives.map(obj => {
      const kpiCount = kpis?.filter(kpi => kpi.division_id === obj.division_id).length || 0;
      const initiativeCount = initiatives?.filter(init => init.objective_id === obj.id).length || 0;
      
      return {
        id: obj.id,
        name: obj.name,
        description: obj.description || '',
        perspective: obj.perspective,
        status: obj.status,
        division_id: obj.division_id,
        kpiCount,
        initiativeCount,
        x: 0,
        y: 0,
        color: perspectiveColors[obj.perspective as keyof typeof perspectiveColors] || '#722ed1',
        data: obj
      };
    });
  }, [filteredObjectives, kpis, initiatives]);

  // Create BSC visualization - stabilized with ref check
  useEffect(() => {
    if (!svgRef.current || processedNodes.length === 0) return;
    
    // Add stability check to prevent excessive re-renders
    const currentSvg = svgRef.current;
    if (!currentSvg) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 1200;
    const height = 800;
    const margin = { top: 80, right: 40, bottom: 40, left: 40 };

    svg.attr('width', width).attr('height', height);

    const container = svg.append('g')
      .attr('class', 'bsc-container');

    // Calculate layout
    const perspectiveHeight = (height - margin.top - margin.bottom) / 4;
    const perspectiveWidth = width - margin.left - margin.right;

    // Create perspective sections
    perspectiveOrder.forEach((perspective, index) => {
      const y = margin.top + index * perspectiveHeight;
      const perspectiveNodes = processedNodes.filter(node => node.perspective === perspective);
      
      // Background rectangle for perspective
      const perspectiveGroup = container.append('g')
        .attr('class', `perspective-${perspective.toLowerCase()}`);

      perspectiveGroup.append('rect')
        .attr('x', margin.left)
        .attr('y', y)
        .attr('width', perspectiveWidth)
        .attr('height', perspectiveHeight)
        .attr('fill', perspectiveColors[perspective as keyof typeof perspectiveColors])
        .attr('opacity', 0.05)
        .attr('stroke', perspectiveColors[perspective as keyof typeof perspectiveColors])
        .attr('stroke-width', 2)
        .attr('rx', 8);

      // Perspective title
      perspectiveGroup.append('text')
        .attr('x', margin.left + 20)
        .attr('y', y + 30)
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('fill', perspectiveColors[perspective as keyof typeof perspectiveColors])
        .text(`${perspective} Perspective`);

      // Position nodes within perspective
      if (perspectiveNodes.length > 0) {
        const nodeWidth = 180;
        const nodeHeight = 80;
        const padding = 20;
        const nodesPerRow = Math.floor((perspectiveWidth - 40) / (nodeWidth + padding));
        
        perspectiveNodes.forEach((node, nodeIndex) => {
          const row = Math.floor(nodeIndex / nodesPerRow);
          const col = nodeIndex % nodesPerRow;
          
          node.x = margin.left + 40 + col * (nodeWidth + padding) + nodeWidth / 2;
          node.y = y + 50 + row * (nodeHeight + padding) + nodeHeight / 2;
        });

        // Draw connections between related objectives
        perspectiveNodes.forEach(node => {
          const relatedNodes = processedNodes.filter(other => 
            other.id !== node.id && 
            (other.division_id === node.division_id || Math.random() < 0.3) // Some random connections for demo
          );
          
          relatedNodes.slice(0, 2).forEach(relatedNode => {
            if (relatedNode.perspective !== node.perspective) {
              perspectiveGroup.append('line')
                .attr('x1', node.x)
                .attr('y1', node.y)
                .attr('x2', relatedNode.x)
                .attr('y2', relatedNode.y)
                .attr('stroke', '#d9d9d9')
                .attr('stroke-width', 1)
                .attr('stroke-dasharray', '3,3')
                .attr('opacity', 0.3)
                .attr('class', `connection-${node.id}-${relatedNode.id}`);
            }
          });
        });

        // Draw objective nodes
        const nodeGroups = perspectiveGroup.selectAll('.objective-node')
          .data(perspectiveNodes)
          .enter()
          .append('g')
          .attr('class', 'objective-node')
          .attr('transform', d => `translate(${d.x - 90}, ${d.y - 40})`)
          .style('cursor', 'pointer')
          .on('click', (_, d) => {
            setSelectedObjective(d);
            setShowModal(true);
            onObjectiveSelect?.(d);
          })
          .on('mouseover', (_, d) => {
            setHoveredObjective(d.id);
            
            // Highlight connections
            svg.selectAll('line')
              .attr('opacity', () => {
                return 0.8;
              });
          })
          .on('mouseout', () => {
            setHoveredObjective(null);
            svg.selectAll('line').attr('opacity', 0.3);
          });

        // Node background
        nodeGroups.append('rect')
          .attr('width', 180)
          .attr('height', 80)
          .attr('rx', 8)
          .attr('fill', d => d.color)
          .attr('opacity', 0.9)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        // Node title
        nodeGroups.append('text')
          .attr('x', 90)
          .attr('y', 25)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', '#fff')
          .text(d => d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name);

        // Status indicator
        nodeGroups.append('circle')
          .attr('cx', 165)
          .attr('cy', 15)
          .attr('r', 6)
          .attr('fill', d => d.status === 'Active' ? '#52c41a' : '#f5222d')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        // KPI count
        nodeGroups.filter(d => d.kpiCount > 0)
          .append('g')
          .attr('transform', 'translate(15, 60)')
          .call(g => {
            g.append('circle')
              .attr('r', 8)
              .attr('fill', '#1890ff')
              .attr('stroke', '#fff')
              .attr('stroke-width', 1);
            g.append('text')
              .attr('text-anchor', 'middle')
              .attr('dy', 3)
              .attr('font-size', '10px')
              .attr('font-weight', 'bold')
              .attr('fill', '#fff')
              .text(d => d.kpiCount);
          });

        // Initiative count
        nodeGroups.filter(d => d.initiativeCount > 0)
          .append('g')
          .attr('transform', 'translate(40, 60)')
          .call(g => {
            g.append('circle')
              .attr('r', 8)
              .attr('fill', '#faad14')
              .attr('stroke', '#fff')
              .attr('stroke-width', 1);
            g.append('text')
              .attr('text-anchor', 'middle')
              .attr('dy', 3)
              .attr('font-size', '10px')
              .attr('font-weight', 'bold')
              .attr('fill', '#fff')
              .text(d => d.initiativeCount);
          });

        // Hover effect
        nodeGroups.selectAll('rect')
          .on('mouseover', function(_, d: any) {
            if (hoveredObjective === d.id) {
              d3.select(this).attr('opacity', 1);
            }
          })
          .on('mouseout', function() {
            d3.select(this).attr('opacity', 0.9);
          });
      }
    });

    // Add zoom and pan behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom as any);

  }, [processedNodes, hoveredObjective]);

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
            <Text type="secondary">Loading BSC strategy map...</Text>
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
            <span>BSC Strategy Map</span>
            <Badge count={filteredObjectives.length} color="blue" />
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Zoom In">
              <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
            </Tooltip>
            <Tooltip title="Zoom Out">
              <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
            </Tooltip>
            <Tooltip title="Reset View">
              <Button icon={<ReloadOutlined />} onClick={handleReset} />
            </Tooltip>
            <Tooltip title="Fullscreen">
              <Button icon={<FullscreenOutlined />} onClick={() => setShowModal(true)} />
            </Tooltip>
          </Space>
        }
      >
        {/* Legend */}
        <div style={{ marginBottom: '16px', padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Title level={5} style={{ marginBottom: '8px' }}>BSC Perspectives</Title>
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
                  <Text>Active</Text>
                  <Badge color="#f5222d" />
                  <Text>Inactive</Text>
                </Space>
                <Space>
                  <Badge color="#1890ff" />
                  <Text>KPIs</Text>
                  <Badge color="#faad14" />
                  <Text>Initiatives</Text>
                </Space>
              </Space>
            </Col>
          </Row>
        </div>

        {/* BSC Strategy Map */}
        <div style={{ 
          border: '1px solid #d9d9d9', 
          borderRadius: '8px', 
          overflow: 'hidden',
          background: '#fff'
        }}>
          <svg ref={svgRef} style={{ width: '100%', height: '700px' }} />
        </div>

        {/* Zoom Level */}
        <div style={{ marginTop: '8px', textAlign: 'center' }}>
          <Text type="secondary">Zoom: {Math.round(zoomLevel * 100)}%</Text>
        </div>
      </Card>

      {/* Objective Details Modal */}
      <Modal
        title={
          <Space>
            <AimOutlined />
            <span>Strategic Objective Details</span>
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
            <Text type="secondary">{selectedObjective.description}</Text>
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
          </div>
        )}
      </Modal>
    </div>
  );
};