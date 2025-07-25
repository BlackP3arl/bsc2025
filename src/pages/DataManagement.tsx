import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Upload,
  Typography,
  Space,
  Alert,
  Table,
  Tag,
  Tabs,
  List,
  Statistic,
  message,
  Spin
} from 'antd';
import {
  CloudUploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
  BarChartOutlined,
  ProjectOutlined,
  DatabaseOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { CSVService } from '../services/csvService';
import type { ImportResult, CSVError } from '../services/csvService';
import { useCurrentUser } from '../hooks/useData';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Dragger } = Upload;

interface ImportState {
  loading: boolean;
  result: ImportResult | null;
  errors: CSVError[];
}

export const DataManagement: React.FC = () => {
  const { data: currentUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState('objectives');
  const [importState, setImportState] = useState<ImportState>({
    loading: false,
    result: null,
    errors: []
  });
  const [csvInitialized, setCsvInitialized] = useState(false);

  // Initialize CSV service
  useEffect(() => {
    const initializeCSV = async () => {
      try {
        await CSVService.initialize();
        setCsvInitialized(true);
      } catch (error) {
        console.error('Failed to initialize CSV service:', error);
        message.error('Failed to initialize data management service');
      }
    };
    initializeCSV();
  }, []);

  // Check if user has admin permissions
  const canManageData = currentUser?.role === 'Admin';

  if (!canManageData) {
    return (
      <Alert
        message="Access Denied"
        description="Only administrators can access the data management module."
        type="error"
        showIcon
        style={{ margin: '24px' }}
      />
    );
  }

  const handleDownloadTemplate = (type: 'objectives' | 'kpis' | 'initiatives') => {
    try {
      CSVService.downloadTemplate(type);
      message.success(`${type} template downloaded successfully`);
    } catch (error) {
      message.error('Failed to download template');
    }
  };

  const handleFileUpload = async (file: File, type: 'objectives' | 'kpis' | 'initiatives') => {
    if (!csvInitialized) {
      message.error('Data management service not initialized. Please try again.');
      return;
    }

    setImportState({ loading: true, result: null, errors: [] });

    try {
      let parseResult: { data: any[]; errors: CSVError[] };
      let importResult: ImportResult;

      switch (type) {
        case 'objectives':
          parseResult = await CSVService.parseStrategicObjectivesCSV(file);
          if (parseResult.errors.length === 0) {
            importResult = await CSVService.importStrategicObjectives(parseResult.data);
          } else {
            importResult = {
              success: false,
              processed: 0,
              inserted: 0,
              errors: parseResult.errors,
              duplicates: 0
            };
          }
          break;
        case 'kpis':
          parseResult = await CSVService.parseKPIsCSV(file);
          if (parseResult.errors.length === 0) {
            importResult = await CSVService.importKPIs(parseResult.data);
          } else {
            importResult = {
              success: false,
              processed: 0,
              inserted: 0,
              errors: parseResult.errors,
              duplicates: 0
            };
          }
          break;
        case 'initiatives':
          parseResult = await CSVService.parseInitiativesCSV(file);
          if (parseResult.errors.length === 0) {
            importResult = await CSVService.importInitiatives(parseResult.data);
          } else {
            importResult = {
              success: false,
              processed: 0,
              inserted: 0,
              errors: parseResult.errors,
              duplicates: 0
            };
          }
          break;
      }

      setImportState({
        loading: false,
        result: importResult,
        errors: importResult.errors
      });

      if (importResult.success && importResult.inserted > 0) {
        message.success(`Successfully imported ${importResult.inserted} records`);
      } else if (importResult.errors.length > 0) {
        message.error('Import completed with errors. Please check the error details below.');
      }
    } catch (error: any) {
      setImportState({
        loading: false,
        result: null,
        errors: [{ row: 0, field: 'general', message: error.message || 'Import failed' }]
      });
      message.error('Import failed');
    }
  };

  const uploadProps = (type: 'objectives' | 'kpis' | 'initiatives') => ({
    name: 'file',
    accept: '.csv',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file: File) => {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        message.error('Please upload a CSV file');
        return Upload.LIST_IGNORE;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        message.error('File size must be less than 10MB');
        return Upload.LIST_IGNORE;
      }

      handleFileUpload(file, type);
      return false; // Prevent default upload
    }
  });

  const errorColumns = [
    {
      title: 'Row',
      dataIndex: 'row',
      key: 'row',
      width: 80,
      render: (row: number) => <Tag color="red">Row {row}</Tag>
    },
    {
      title: 'Field',
      dataIndex: 'field',
      key: 'field',
      width: 120,
      render: (field: string) => <Tag color="orange">{field}</Tag>
    },
    {
      title: 'Error Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: 150,
      render: (value: any) => value ? <Text code>{String(value)}</Text> : '-'
    }
  ];

  const renderImportSection = (
    type: 'objectives' | 'kpis' | 'initiatives',
    title: string,
    description: string,
    icon: React.ReactNode
  ) => (
    <Card
      title={
        <Space>
          {icon}
          <span>{title}</span>
        </Space>
      }
      style={{ marginBottom: '24px' }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: '16px' }}>
            <Title level={5}>Step 1: Download Template</Title>
            <Paragraph type="secondary">
              Download the CSV template with the correct format and sample data.
            </Paragraph>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadTemplate(type)}
              block
            >
              Download {title} Template
            </Button>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: '16px' }}>
            <Title level={5}>Step 2: Upload CSV File</Title>
            <Paragraph type="secondary">
              {description}
            </Paragraph>
            <Dragger {...uploadProps(type)} style={{ marginBottom: '16px' }}>
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for CSV files only. Maximum file size: 10MB
              </p>
            </Dragger>
          </div>
        </Col>
      </Row>

      {importState.loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Processing your file...</Text>
          </div>
        </div>
      )}

      {importState.result && (
        <div style={{ marginTop: '24px' }}>
          <Alert
            message={`Import ${importState.result.success ? 'Completed' : 'Failed'}`}
            description={
              <div>
                <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                  <Col span={6}>
                    <Statistic
                      title="Processed"
                      value={importState.result.processed}
                      prefix={<InfoCircleOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Inserted"
                      value={importState.result.inserted}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Duplicates"
                      value={importState.result.duplicates}
                      prefix={<ExclamationCircleOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Errors"
                      value={importState.result.errors.length}
                      prefix={<WarningOutlined />}
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Col>
                </Row>
              </div>
            }
            type={importState.result.success ? 'success' : 'error'}
            showIcon
          />
        </div>
      )}

      {importState.errors.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <Title level={5}>Import Errors</Title>
          <Table
            columns={errorColumns}
            dataSource={importState.errors.map((error, index) => ({
              ...error,
              key: index
            }))}
            size="small"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 600 }}
          />
        </div>
      )}
    </Card>
  );

  const renderInstructions = () => (
    <Card
      title={
        <Space>
          <InfoCircleOutlined />
          <span>Import Instructions</span>
        </Space>
      }
      style={{ marginBottom: '24px' }}
    >
      <List
        size="large"
        dataSource={[
          {
            title: 'Download the appropriate CSV template',
            description: 'Each entity type (Objectives, KPIs, Initiatives) has its own template with specific columns and sample data.'
          },
          {
            title: 'Fill in your data',
            description: 'Replace the sample data with your actual data. Ensure all required fields are filled and follow the specified formats.'
          },
          {
            title: 'Validate division codes and user emails',
            description: 'Make sure division codes and user emails exist in the system. Invalid references will cause import errors.'
          },
          {
            title: 'Upload the CSV file',
            description: 'Drag and drop or click to upload your CSV file. The system will validate and import your data.'
          },
          {
            title: 'Review import results',
            description: 'Check the import summary and resolve any errors if needed. Duplicate records will be skipped automatically.'
          }
        ]}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              title={item.title}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </Card>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          <DatabaseOutlined style={{ marginRight: '8px' }} />
          Data Management
        </Title>
        <Text type="secondary">
          Bulk import Strategic Objectives, KPIs, and Initiatives from CSV files
        </Text>
      </div>

      {/* Instructions */}
      {renderInstructions()}

      {/* Import Sections */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        tabPosition="top"
      >
        <TabPane
          tab={
            <Space>
              <TrophyOutlined />
              Strategic Objectives
            </Space>
          }
          key="objectives"
        >
          {renderImportSection(
            'objectives',
            'Strategic Objectives',
            'Upload a CSV file containing strategic objectives with their perspectives, divisions, and owners.',
            <TrophyOutlined />
          )}
        </TabPane>

        <TabPane
          tab={
            <Space>
              <BarChartOutlined />
              KPIs
            </Space>
          }
          key="kpis"
        >
          {renderImportSection(
            'kpis',
            'Key Performance Indicators',
            'Upload a CSV file containing KPI definitions with their formulas, thresholds, and measurement details.',
            <BarChartOutlined />
          )}
        </TabPane>

        <TabPane
          tab={
            <Space>
              <ProjectOutlined />
              Initiatives
            </Space>
          }
          key="initiatives"
        >
          {renderImportSection(
            'initiatives',
            'Strategic Initiatives',
            'Upload a CSV file containing strategic initiatives with their objectives, owners, and project details.',
            <ProjectOutlined />
          )}
        </TabPane>
      </Tabs>

      {/* Additional Information */}
      <Card
        title="Important Notes"
        style={{ marginTop: '24px' }}
      >
        <Alert
          message="Data Import Guidelines"
          description={
            <div>
              <Paragraph>
                <strong>File Format:</strong> Only CSV files are accepted. Excel files must be saved as CSV format.
              </Paragraph>
              <Paragraph>
                <strong>File Size:</strong> Maximum file size is 10MB. For larger datasets, split into multiple files.
              </Paragraph>
              <Paragraph>
                <strong>Data Validation:</strong> All data is validated before import. Invalid records will be rejected with detailed error messages.
              </Paragraph>
              <Paragraph>
                <strong>Duplicate Handling:</strong> Duplicate records (same name and division) are automatically skipped to prevent conflicts.
              </Paragraph>
              <Paragraph>
                <strong>User References:</strong> User emails must exist in the system. Create user accounts before importing data that references them.
              </Paragraph>
              <Paragraph>
                <strong>Division Codes:</strong> Use the correct division codes. Available codes can be found in the Division management section.
              </Paragraph>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};