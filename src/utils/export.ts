// Export utilities for reports
export interface ExportData {
  title: string;
  data: any[];
  columns: string[];
  filters?: {
    division?: string;
    dateRange?: [string, string];
  };
}

export const exportToCSV = (exportData: ExportData): void => {
  const { title, data, columns } = exportData;
  
  // Create CSV content
  const headers = columns.join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col] || '';
      // Escape commas and quotes in CSV
      return typeof value === 'string' && (value.includes(',') || value.includes('"'))
        ? `"${value.replace(/"/g, '""')}"`
        : value;
    }).join(',')
  );
  
  const csvContent = [headers, ...rows].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportToJSON = (exportData: ExportData): void => {
  const { title, data } = exportData;
  
  const jsonData = {
    title,
    exportDate: new Date().toISOString(),
    filters: exportData.filters,
    data
  };
  
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { 
    type: 'application/json;charset=utf-8;' 
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const printReport = (title: string, content: HTMLElement): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print reports');
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 20px;
            color: #333;
          }
          .report-header {
            text-align: center;
            border-bottom: 2px solid #1890ff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .report-title {
            font-size: 24px;
            font-weight: bold;
            color: #1890ff;
            margin-bottom: 10px;
          }
          .report-date {
            color: #666;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #d9d9d9;
            padding: 8px 12px;
            text-align: left;
          }
          th {
            background-color: #fafafa;
            font-weight: 600;
          }
          .stat-card {
            display: inline-block;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            padding: 16px;
            margin: 8px;
            min-width: 150px;
          }
          .stat-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 4px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #1890ff;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div class="report-title">${title}</div>
          <div class="report-date">Generated on ${new Date().toLocaleString()}</div>
        </div>
        ${content.innerHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

// Format data for export
export const formatDataForExport = (data: any[], type: 'objectives' | 'kpis' | 'initiatives' | 'divisions'): any[] => {
  switch (type) {
    case 'objectives':
      return data.map(obj => ({
        Name: obj.name,
        Perspective: obj.perspective,
        Status: obj.status,
        Description: obj.description || '',
        Created: obj.created_at ? new Date(obj.created_at).toLocaleDateString() : '',
        Division: obj.division_name || obj.division_id
      }));
      
    case 'kpis':
      return data.map(kpi => ({
        Name: kpi.name,
        Type: kpi.type,
        Frequency: kpi.frequency,
        Status: kpi.status,
        Formula: kpi.formula || '',
        Target: kpi.target || '',
        Unit: kpi.unit || '',
        Division: kpi.division_name || kpi.division_id
      }));
      
    case 'initiatives':
      return data.map(init => ({
        Name: init.name,
        Status: init.status,
        Priority: init.priority,
        'Start Date': init.start_date ? new Date(init.start_date).toLocaleDateString() : '',
        'End Date': init.end_date ? new Date(init.end_date).toLocaleDateString() : '',
        Description: init.description || '',
        Owner: init.owner_name || init.owner_id
      }));
      
    case 'divisions':
      return data.map(div => ({
        Name: div.name,
        Code: div.code,
        Objectives: div.objectives || 0,
        'Active Objectives': div.activeObjectives || 0,
        KPIs: div.kpis || 0,
        Initiatives: div.initiatives || 0,
        'Completion Rate': `${div.completionRate || 0}%`
      }));
      
    default:
      return data;
  }
};

// Excel-like export using CSV with enhanced formatting
export const exportToExcel = (exportData: ExportData): void => {
  // For now, we'll export as CSV since true Excel export requires additional libraries
  // In a production environment, you might want to use libraries like 'xlsx' or 'exceljs'
  exportToCSV(exportData);
};

// PDF export simulation - in production you'd use libraries like jsPDF or Puppeteer
export const exportToPDF = (exportData: ExportData): void => {
  // Create a formatted HTML version and trigger print
  const htmlContent = createPrintableHTML(exportData);
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  printReport(exportData.title, tempDiv);
};

const createPrintableHTML = (exportData: ExportData): string => {
  const { title, data, columns } = exportData;
  
  const tableRows = data.map(row => 
    `<tr>${columns.map(col => `<td>${row[col] || ''}</td>`).join('')}</tr>`
  ).join('');
  
  return `
    <div>
      <h2>${title}</h2>
      <p>Export Date: ${new Date().toLocaleString()}</p>
      ${exportData.filters ? `<p>Filters Applied: ${JSON.stringify(exportData.filters)}</p>` : ''}
      <table>
        <thead>
          <tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <p>Total Records: ${data.length}</p>
    </div>
  `;
};