# Data Management Module

The Data Management module provides bulk import functionality for Strategic Objectives, KPIs, and Initiatives using CSV files.

## Features

- **Bulk Import**: Import multiple records at once using CSV files
- **Data Validation**: Comprehensive validation with detailed error reporting
- **Template Generation**: Download properly formatted CSV templates
- **Duplicate Prevention**: Automatic detection and skipping of duplicate records
- **Admin Only Access**: Restricted to users with Admin role

## Supported Entities

### 1. Strategic Objectives
- **Template**: `strategic_objectives_template.csv`
- **Required Fields**: name, description, perspective, division_code, owner_email, status
- **Perspectives**: Financial, Customer, Internal, Learning
- **Statuses**: Active, Inactive, Archived

### 2. KPIs (Key Performance Indicators)
- **Template**: `kpis_template.csv`
- **Required Fields**: name, description, frequency, division_code, owner_email, status
- **Frequencies**: Daily, Weekly, Monthly, Quarterly
- **Statuses**: Active, Inactive, Draft
- **Numeric Fields**: target_value, threshold_red, threshold_yellow, threshold_green

### 3. Strategic Initiatives
- **Template**: `initiatives_template.csv`
- **Required Fields**: name, description, type, objective_name, owner_email, status, priority
- **Types**: Initiative, Project, Program
- **Statuses**: Planning, Active, On Hold, Completed, Cancelled
- **Priorities**: Low, Medium, High, Critical
- **Date Fields**: start_date, end_date (format: YYYY-MM-DD)

## How to Use

### Step 1: Download Template
1. Navigate to Data Management page
2. Select the entity type tab (Objectives, KPIs, or Initiatives)
3. Click "Download [Entity] Template" button
4. Save the CSV file to your computer

### Step 2: Prepare Your Data
1. Open the downloaded template in Excel or a text editor
2. Replace the sample data with your actual data
3. Ensure all required fields are filled
4. Validate division codes and user emails exist in the system
5. Save the file as CSV format

### Step 3: Import Data
1. Return to the Data Management page
2. Select the appropriate entity type tab
3. Drag and drop your CSV file or click to upload
4. Wait for processing to complete
5. Review the import results

## Data Validation Rules

### Strategic Objectives
- **Name**: Required, unique per division
- **Description**: Required
- **Perspective**: Must be one of: Financial, Customer, Internal, Learning
- **Division Code**: Must exist in the system
- **Owner Email**: Must be a valid user in the system
- **Status**: Must be one of: Active, Inactive, Archived

### KPIs
- **Name**: Required, unique per division
- **Description**: Required
- **Frequency**: Must be one of: Daily, Weekly, Monthly, Quarterly
- **Division Code**: Must exist in the system
- **Owner Email**: Must be a valid user in the system
- **Status**: Must be one of: Active, Inactive, Draft
- **Numeric Fields**: Must be valid numbers if provided

### Initiatives
- **Name**: Required, unique per objective
- **Description**: Required
- **Type**: Must be one of: Initiative, Project, Program
- **Objective Name**: Must exist in the system
- **Owner Email**: Must be a valid user in the system
- **Sponsor Email**: Must be a valid user in the system (optional)
- **Status**: Must be one of: Planning, Active, On Hold, Completed, Cancelled
- **Priority**: Must be one of: Low, Medium, High, Critical
- **Dates**: Must be in YYYY-MM-DD format if provided
- **Budget**: Must be a valid number if provided

## Division Codes

The following division codes are available in the system:

- **CDD**: Construction & Dredging Division
- **TD**: Transport Division  
- **EDD**: Engineering & Docking Division
- **TRD**: Trading Division
- **MBDD**: Marketing & Business Development Division
- **ITD**: Innovation & Technology Division
- **CBAD**: Corporate Bureau & Administration Division
- **RMD**: Risk Management Division
- **FD**: Finance Division
- **HRD**: Human Resources Division
- **LD**: Logistics Division
- **OD**: Operations Division
- **QAD**: Quality Assurance Division
- **HSD**: Health & Safety Division
- **LCD**: Legal & Compliance Division
- **ITDD**: Information Technology Division
- **PD**: Procurement Division
- **CSD**: Customer Service Division
- **SPD**: Strategic Planning Division

## Error Handling

The system provides detailed error messages for validation failures:

- **Row Number**: Indicates which row in the CSV has the error
- **Field Name**: Shows which field contains the invalid data
- **Error Message**: Describes what is wrong with the data
- **Value**: Shows the invalid value that was provided

## Best Practices

1. **Start Small**: Test with a small dataset first
2. **Validate References**: Ensure all division codes and email addresses exist
3. **Use Templates**: Always start with the official templates
4. **Check Duplicates**: The system will skip duplicates automatically
5. **Review Errors**: Address all validation errors before re-importing
6. **Backup Data**: Keep backups of your CSV files

## File Limitations

- **Format**: CSV files only
- **Size**: Maximum 10MB per file
- **Encoding**: UTF-8 recommended
- **Separators**: Comma-separated values

## Troubleshooting

### Common Issues

1. **"User not found" errors**: Ensure user email addresses exist in the system
2. **"Invalid division code" errors**: Check division codes against the list above
3. **"Invalid date format" errors**: Use YYYY-MM-DD format for dates
4. **"Must be a number" errors**: Ensure numeric fields contain valid numbers

### Support

For technical support or questions about the Data Management module, contact your system administrator.