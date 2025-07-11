import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  InfoCircleOutlined,
  AimOutlined,
  PlusOutlined,
  MinusOutlined,
  NodeExpandOutlined,
  NodeCollapseOutlined
} from '@ant-design/icons';
import * as d3 from 'd3';
import { useStrategicObjectives, useStrategicInitiatives, useKPIDefinitions, useDivisions } from '../hooks/useData';

const { Title, Text } = Typography;

interface InteractiveStrategyMapProps {
  selectedDivision?: string;
  onObjectiveSelect?: (objective: any) => void;
}

interface MindMapNode {
  id: string;
  name: string;
  type: 'objective' | 'kpi' | 'initiative';
  perspective?: string;
  status: string;
  division_id: string;
  parent_id?: string | undefined;
  children: MindMapNode[];
  expanded: boolean;
  x: number;
  y: number;
  fx?: number | undefined;
  fy?: number | undefined;
  color: string;
  level: number;
  data: any;
}

interface MindMapLink {
  source: string;
  target: string;
  type: 'hierarchy' | 'relation';
}

const perspectiveColors = {
  'Financial': '#52c41a',
  'Customer': '#1890ff', 
  'Internal': '#faad14',
  'Learning': '#722ed1'
};

const typeColors = {
  'objective': '#722ed1',
  'kpi': '#1890ff',
  'initiative': '#faad14'
};

export const InteractiveStrategyMap: React.FC<InteractiveStrategyMapProps> = ({ 
  selectedDivision, 
  onObjectiveSelect 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [links, setLinks] = useState<MindMapLink[]>([]);
  const [simulation, setSimulation] = useState<d3.Simulation<MindMapNode, MindMapLink> | null>(null);
  
  const { data: objectives, isLoading: objectivesLoading } = useStrategicObjectives();
  const { data: initiatives } = useStrategicInitiatives();
  const { data: kpis } = useKPIDefinitions();
  const { data: divisions } = useDivisions();

  // Filter objectives based on selected division
  const filteredObjectives = objectives?.filter(obj => 
    !selectedDivision || obj.division_id === selectedDivision
  ) || [];

  // Build mindmap tree structure using useMemo to prevent infinite loops
  const initialMindMapData = useMemo(() => {
    const mindMapNodes: MindMapNode[] = [];
    const mindMapLinks: MindMapLink[] = [];

    // Create objective nodes (root level)
    filteredObjectives.forEach(obj => {
      const objNode: MindMapNode = {
        id: obj.id,
        name: obj.name,
        type: 'objective',
        perspective: obj.perspective,
        status: obj.status,
        division_id: obj.division_id,
        children: [],
        expanded: false,
        x: 0,
        y: 0,
        color: perspectiveColors[obj.perspective as keyof typeof perspectiveColors] || '#722ed1',
        level: 0,
        data: obj
      };
      mindMapNodes.push(objNode);

      // Add KPI children
      const objectiveKPIs = kpis?.filter(kpi => kpi.division_id === obj.division_id) || [];
      objectiveKPIs.forEach(kpi => {
        const kpiNode: MindMapNode = {
          id: `kpi-${kpi.id}`,
          name: kpi.name,
          type: 'kpi',
          status: kpi.status || 'Active',
          division_id: kpi.division_id,
          parent_id: obj.id,
          children: [],
          expanded: false,
          x: 0,
          y: 0,
          color: typeColors.kpi,
          level: 1,
          data: kpi
        };
        mindMapNodes.push(kpiNode);
        objNode.children.push(kpiNode);
        
        mindMapLinks.push({
          source: obj.id,
          target: `kpi-${kpi.id}`,
          type: 'hierarchy'
        });
      });

      // Add Initiative children
      const objectiveInitiatives = initiatives?.filter(init => init.objective_id === obj.id) || [];
      objectiveInitiatives.forEach(init => {
        const initNode: MindMapNode = {
          id: `init-${init.id}`,
          name: init.name,
          type: 'initiative',
          status: init.status || 'Active',
          division_id: obj.division_id,
          parent_id: obj.id,
          children: [],
          expanded: false,
          x: 0,
          y: 0,
          color: typeColors.initiative,
          level: 1,
          data: init
        };
        mindMapNodes.push(initNode);
        objNode.children.push(initNode);
        
        mindMapLinks.push({
          source: obj.id,
          target: `init-${init.id}`,
          type: 'hierarchy'
        });
      });
    });

    return { nodes: mindMapNodes, links: mindMapLinks };
  }, [filteredObjectives, kpis, initiatives]);

  // Initialize mindmap data only once - fixed dependencies with safety checks
  useEffect(() => {
    if (filteredObjectives.length > 0 && initialMindMapData.nodes.length > 0) {
      setNodes(initialMindMapData.nodes);
      setLinks(initialMindMapData.links);
    }
  }, [filteredObjectives.length, initialMindMapData.nodes.length, initialMindMapData.links.length]);

  // Toggle node expansion using useCallback to prevent recreation
  const toggleNode = useCallback((nodeId: string) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId 
          ? { ...node, expanded: !node.expanded }
          : node
      )
    );
  }, []);

  // Get visible nodes (only expanded children are shown) - stable memoization
  const getVisibleNodes = useMemo(() => {
    const visibleNodes: MindMapNode[] = [];
    const visibleLinks: MindMapLink[] = [];

    const addNodeAndChildren = (node: MindMapNode) => {
      visibleNodes.push(node);
      
      if (node.expanded && node.children.length > 0) {
        node.children.forEach(child => {
          addNodeAndChildren(child);
          visibleLinks.push({
            source: node.id,
            target: child.id,
            type: 'hierarchy'
          });
        });
      }
    };

    // Add root nodes (objectives)
    nodes.filter(node => node.type === 'objective').forEach(addNodeAndChildren);

    return { visibleNodes, visibleLinks };
  }, [nodes]);

  // D3 Force Simulation - with additional safety checks
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0 || objectivesLoading) return;

    const { visibleNodes, visibleLinks } = getVisibleNodes;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 1200;
    const height = 800;

    // Set up SVG
    svg.attr('width', width).attr('height', height);

    // Create container group for zooming
    const container = svg.append('g')
      .attr('class', 'mindmap-container');

    // Create force simulation
    const forceSimulation = d3.forceSimulation(visibleNodes)
      .force('link', d3.forceLink(visibleLinks).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Create links
    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(visibleLinks)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    // Create nodes
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(visibleNodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, MindMapNode>()
        .on('start', (event, d) => {
          if (!event.active) forceSimulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) forceSimulation.alphaTarget(0);
          d.fx = undefined;
          d.fy = undefined;
        })
      );

    // Add circles for nodes
    node.append('circle')
      .attr('r', d => d.type === 'objective' ? 40 : 25)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('opacity', 0.9);

    // Add expand/collapse buttons for nodes with children
    node.filter(d => d.children.length > 0)
      .append('circle')
      .attr('r', 12)
      .attr('cx', d => d.type === 'objective' ? 35 : 22)
      .attr('cy', d => d.type === 'objective' ? -35 : -22)
      .attr('fill', '#fff')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        toggleNode(d.id);
      });

    // Add +/- icons for expand/collapse
    node.filter(d => d.children.length > 0)
      .append('text')
      .attr('x', d => d.type === 'objective' ? 35 : 22)
      .attr('y', d => d.type === 'objective' ? -30 : -17)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', d => d.color)
      .text(d => d.expanded ? '−' : '+')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        toggleNode(d.id);
      });

    // Add status indicators
    node.append('circle')
      .attr('r', 6)
      .attr('cx', d => d.type === 'objective' ? 30 : 18)
      .attr('cy', d => d.type === 'objective' ? 30 : 18)
      .attr('fill', d => d.status === 'Active' ? '#52c41a' : '#f5222d')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add node labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', d => d.type === 'objective' ? '12px' : '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .text(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name);

    // Add type labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.type === 'objective' ? -50 : -35)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', d => d.color)
      .text(d => d.type.toUpperCase());

    // Add click handlers
    node.on('click', (event, d) => {
      if (event.defaultPrevented) return;
      setSelectedNode(d);
      setShowModal(true);
      onObjectiveSelect?.(d);
    });

    // Add hover effects
    node.on('mouseover', function(_, d) {
      d3.select(this).select('circle').attr('r', d.type === 'objective' ? 45 : 30);
      
      // Highlight connected links
      link.attr('stroke-opacity', (l: any) => 
        l.source.id === d.id || l.target.id === d.id ? 1 : 0.2
      );
    })
    .on('mouseout', function(_, d) {
      d3.select(this).select('circle').attr('r', d.type === 'objective' ? 40 : 25);
      
      // Reset links
      link.attr('stroke-opacity', 0.6);
    });

    // Update positions on simulation tick
    forceSimulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Add zoom and pan behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom as any);

    setSimulation(forceSimulation);

    // Cleanup
    return () => {
      forceSimulation.stop();
    };

  }, [nodes, links]);

  // Memoize the expansion state to prevent infinite re-renders
  const expansionState = useMemo(() => 
    nodes.map(n => n.expanded).join(','), 
    [nodes]
  );

  // Re-run simulation when nodes expand/collapse - fixed dependencies
  useEffect(() => {
    if (simulation) {
      const { visibleNodes, visibleLinks } = getVisibleNodes;
      simulation.nodes(visibleNodes);
      simulation.force('link', d3.forceLink(visibleLinks).id((d: any) => d.id).distance(150));
      simulation.alpha(1).restart();
    }
  }, [expansionState, simulation, getVisibleNodes]);

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

  const expandAll = useCallback(() => {
    setNodes(prevNodes => 
      prevNodes.map(node => ({ ...node, expanded: true }))
    );
  }, []);

  const collapseAll = useCallback(() => {
    setNodes(prevNodes => 
      prevNodes.map(node => ({ ...node, expanded: false }))
    );
  }, []);

  const getDivisionName = (divisionId: string) => {
    return divisions?.find(d => d.id === divisionId)?.name || 'Unknown Division';
  };

  if (objectivesLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">Loading interactive strategy map...</Text>
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
            <span>Interactive Strategy MindMap</span>
            <Badge count={filteredObjectives.length} color="blue" />
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Expand All">
              <Button icon={<NodeExpandOutlined />} onClick={expandAll} />
            </Tooltip>
            <Tooltip title="Collapse All">
              <Button icon={<NodeCollapseOutlined />} onClick={collapseAll} />
            </Tooltip>
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
            <Col span={8}>
              <Title level={5} style={{ marginBottom: '8px' }}>Node Types</Title>
              <Space wrap>
                <Tag color={typeColors.objective}>Objectives</Tag>
                <Tag color={typeColors.kpi}>KPIs</Tag>
                <Tag color={typeColors.initiative}>Initiatives</Tag>
              </Space>
            </Col>
            <Col span={8}>
              <Title level={5} style={{ marginBottom: '8px' }}>Perspectives</Title>
              <Space wrap>
                {Object.entries(perspectiveColors).map(([perspective, color]) => (
                  <Tag key={perspective} color={color}>
                    {perspective}
                  </Tag>
                ))}
              </Space>
            </Col>
            <Col span={8}>
              <Title level={5} style={{ marginBottom: '8px' }}>Controls</Title>
              <Space direction="vertical" size="small">
                <Text><PlusOutlined /> / <MinusOutlined /> Click to expand/collapse</Text>
                <Text>Drag nodes to reposition</Text>
                <Text>Hover to highlight connections</Text>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Interactive MindMap */}
        <div style={{ 
          border: '1px solid #d9d9d9', 
          borderRadius: '8px', 
          overflow: 'hidden',
          background: '#fff'
        }}>
          <svg ref={svgRef} style={{ width: '100%', height: '700px' }} />
        </div>

        {/* Zoom Level Indicator */}
        <div style={{ marginTop: '8px', textAlign: 'center' }}>
          <Text type="secondary">Zoom: {Math.round(zoomLevel * 100)}%</Text>
        </div>
      </Card>

      {/* Node Details Modal */}
      <Modal
        title={
          <Space>
            <AimOutlined />
            <span>{selectedNode?.type.toUpperCase()} Details</span>
          </Space>
        }
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={800}
      >
        {selectedNode && (
          <div>
            <Title level={4}>{selectedNode.name}</Title>
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <div>
                    <Text strong>Type: </Text>
                    <Tag color={selectedNode.color}>
                      {selectedNode.type.toUpperCase()}
                    </Tag>
                  </div>
                  {selectedNode.perspective && (
                    <div>
                      <Text strong>Perspective: </Text>
                      <Tag color={selectedNode.color}>
                        {selectedNode.perspective}
                      </Tag>
                    </div>
                  )}
                  <div>
                    <Text strong>Status: </Text>
                    <Tag color={selectedNode.status === 'Active' ? 'green' : 'red'}>
                      {selectedNode.status}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Division: </Text>
                    <Text>{getDivisionName(selectedNode.division_id)}</Text>
                  </div>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <div>
                    <Text strong>Connected Items: </Text>
                    <Badge count={selectedNode.children.length} color="blue" />
                  </div>
                  <div>
                    <Text strong>Level: </Text>
                    <Text>{selectedNode.level}</Text>
                  </div>
                  <div>
                    <Text strong>Expanded: </Text>
                    <Text>{selectedNode.expanded ? 'Yes' : 'No'}</Text>
                  </div>
                </Space>
              </Col>
            </Row>
            
            <Divider />
            
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">
                <InfoCircleOutlined style={{ marginRight: '8px' }} />
                Click the +/- buttons on nodes to expand/collapse their connections
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};