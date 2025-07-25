-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('Admin', 'Executive', 'Manager', 'User');
CREATE TYPE division_status AS ENUM ('Active', 'Inactive');
CREATE TYPE objective_status AS ENUM ('Active', 'Inactive', 'Archived');
CREATE TYPE perspective_type AS ENUM ('Financial', 'Customer', 'Internal', 'Learning');
CREATE TYPE initiative_type AS ENUM ('Initiative', 'Project', 'Program');
CREATE TYPE initiative_status AS ENUM ('Planning', 'Active', 'On Hold', 'Completed', 'Cancelled');
CREATE TYPE initiative_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE frequency_type AS ENUM ('Daily', 'Weekly', 'Monthly', 'Quarterly');
CREATE TYPE kpi_status AS ENUM ('Red', 'Yellow', 'Green');
CREATE TYPE kpi_definition_status AS ENUM ('Active', 'Inactive', 'Draft');

-- Create divisions table
CREATE TABLE divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    head_id UUID,
    parent_division_id UUID REFERENCES divisions(id),
    status division_status DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'User',
    division_id UUID REFERENCES divisions(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for division head
ALTER TABLE divisions ADD CONSTRAINT fk_division_head 
    FOREIGN KEY (head_id) REFERENCES users(id);

-- Create strategic objectives table
CREATE TABLE strategic_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    perspective perspective_type NOT NULL,
    division_id UUID REFERENCES divisions(id),
    parent_objective_id UUID REFERENCES strategic_objectives(id),
    owner_id UUID REFERENCES users(id),
    status objective_status DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create strategic initiatives table
CREATE TABLE strategic_initiatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type initiative_type DEFAULT 'Initiative',
    objective_id UUID REFERENCES strategic_objectives(id),
    owner_id UUID REFERENCES users(id),
    sponsor_id UUID REFERENCES users(id),
    status initiative_status DEFAULT 'Planning',
    priority initiative_priority DEFAULT 'Medium',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2) DEFAULT 0,
    budget_allocated DECIMAL(15,2) DEFAULT 0,
    budget_spent DECIMAL(15,2) DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    expected_outcome TEXT,
    success_criteria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create KPI definitions table
CREATE TABLE kpi_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    formula TEXT,
    data_source VARCHAR(255),
    frequency frequency_type DEFAULT 'Monthly',
    units VARCHAR(50),
    target_value DECIMAL(15,4),
    threshold_red DECIMAL(15,4),
    threshold_yellow DECIMAL(15,4),
    threshold_green DECIMAL(15,4),
    owner_id UUID REFERENCES users(id),
    division_id UUID REFERENCES divisions(id),
    status kpi_definition_status DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create KPI data table
CREATE TABLE kpi_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_id UUID REFERENCES kpi_definitions(id),
    period DATE NOT NULL,
    actual_value DECIMAL(15,4),
    target_value DECIMAL(15,4),
    status kpi_status,
    comments TEXT,
    entered_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(kpi_id, period)
);

-- Create objective-KPI mapping table
CREATE TABLE objective_kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    objective_id UUID REFERENCES strategic_objectives(id),
    kpi_id UUID REFERENCES kpi_definitions(id),
    weight DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(objective_id, kpi_id)
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default MTCC divisions
INSERT INTO divisions (name, code, description, status) VALUES
('Construction & Dredging Division', 'CDD', 'Construction and dredging operations', 'Active'),
('Transport Division', 'TD', 'Transportation services', 'Active'),
('Engineering & Docking Division', 'EDD', 'Engineering and docking facilities', 'Active'),
('Trading Division', 'TRD', 'Trading operations', 'Active'),
('Marketing & Business Development Division', 'MBDD', 'Marketing and business development', 'Active'),
('Innovation & Technology Division', 'ITD', 'Innovation and technology initiatives', 'Active'),
('Corporate Bureau & Administration Division', 'CBAD', 'Corporate administration', 'Active'),
('Risk Management Division', 'RMD', 'Risk management and compliance', 'Active'),
('Finance Division', 'FD', 'Financial management', 'Active'),
('Human Resources Division', 'HRD', 'Human resources management', 'Active'),
('Logistics Division', 'LD', 'Logistics and supply chain', 'Active'),
('Operations Division', 'OD', 'Operations management', 'Active'),
('Quality Assurance Division', 'QAD', 'Quality assurance and control', 'Active'),
('Health & Safety Division', 'HSD', 'Health and safety management', 'Active'),
('Legal & Compliance Division', 'LCD', 'Legal and compliance services', 'Active'),
('Information Technology Division', 'ITDD', 'Information technology services', 'Active'),
('Procurement Division', 'PD', 'Procurement and purchasing', 'Active'),
('Customer Service Division', 'CSD', 'Customer service and support', 'Active'),
('Strategic Planning Division', 'SPD', 'Strategic planning and management', 'Active');

-- Create some sample users
INSERT INTO users (username, email, first_name, last_name, role, division_id) VALUES
('admin', 'admin@mtcc.com.mv', 'System', 'Administrator', 'Admin', (SELECT id FROM divisions WHERE code = 'SPD')),
('john.doe', 'john.doe@mtcc.com.mv', 'John', 'Doe', 'Executive', (SELECT id FROM divisions WHERE code = 'FD')),
('jane.smith', 'jane.smith@mtcc.com.mv', 'Jane', 'Smith', 'Manager', (SELECT id FROM divisions WHERE code = 'CDD')),
('bob.wilson', 'bob.wilson@mtcc.com.mv', 'Bob', 'Wilson', 'Manager', (SELECT id FROM divisions WHERE code = 'TD')),
('alice.brown', 'alice.brown@mtcc.com.mv', 'Alice', 'Brown', 'User', (SELECT id FROM divisions WHERE code = 'HRD'));

-- Create some sample strategic objectives
INSERT INTO strategic_objectives (name, description, perspective, division_id, owner_id) VALUES
('Increase Revenue by 15%', 'Achieve 15% revenue growth through expanded services and new markets', 'Financial', 
 (SELECT id FROM divisions WHERE code = 'FD'), (SELECT id FROM users WHERE username = 'john.doe')),
('Improve Customer Satisfaction', 'Achieve 95% customer satisfaction rating through enhanced service delivery', 'Customer',
 (SELECT id FROM divisions WHERE code = 'CSD'), (SELECT id FROM users WHERE username = 'alice.brown')),
('Optimize Construction Efficiency', 'Reduce project completion time by 20% through process improvements', 'Internal',
 (SELECT id FROM divisions WHERE code = 'CDD'), (SELECT id FROM users WHERE username = 'jane.smith')),
('Enhance Employee Skills', 'Implement comprehensive training program for 80% of workforce', 'Learning',
 (SELECT id FROM divisions WHERE code = 'HRD'), (SELECT id FROM users WHERE username = 'alice.brown'));

-- Create some sample KPI definitions
INSERT INTO kpi_definitions (name, description, formula, data_source, frequency, units, target_value, threshold_red, threshold_yellow, threshold_green, owner_id, division_id) VALUES
('Revenue Growth Rate', 'Percentage increase in revenue compared to previous period', '(Current Revenue - Previous Revenue) / Previous Revenue * 100', 'Financial System', 'Monthly', '%', 15.0, 5.0, 10.0, 15.0,
 (SELECT id FROM users WHERE username = 'john.doe'), (SELECT id FROM divisions WHERE code = 'FD')),
('Customer Satisfaction Score', 'Average customer satisfaction rating from surveys', 'Sum of all ratings / Number of responses', 'Customer Survey System', 'Monthly', 'Score', 4.5, 3.0, 4.0, 4.5,
 (SELECT id FROM users WHERE username = 'alice.brown'), (SELECT id FROM divisions WHERE code = 'CSD')),
('Project Completion Time', 'Average time to complete construction projects', 'Total project days / Number of projects', 'Project Management System', 'Monthly', 'Days', 90, 120, 105, 90,
 (SELECT id FROM users WHERE username = 'jane.smith'), (SELECT id FROM divisions WHERE code = 'CDD'));

-- Create some sample strategic initiatives
INSERT INTO strategic_initiatives (name, description, objective_id, owner_id, status, priority, start_date, end_date, budget, progress_percentage, expected_outcome, success_criteria) VALUES
('Digital Transformation Initiative', 'Implement digital solutions across all business processes', 
 (SELECT id FROM strategic_objectives WHERE name = 'Increase Revenue by 15%'), 
 (SELECT id FROM users WHERE username = 'john.doe'), 'Active', 'High', '2024-01-01', '2024-12-31', 500000.00, 25,
 'Streamlined operations and improved efficiency', 'All core processes digitized and 20% efficiency improvement achieved'),
('Customer Experience Enhancement Program', 'Improve customer touchpoints and service delivery processes',
 (SELECT id FROM strategic_objectives WHERE name = 'Improve Customer Satisfaction'),
 (SELECT id FROM users WHERE username = 'alice.brown'), 'Active', 'Medium', '2024-02-01', '2024-08-31', 250000.00, 40,
 'Enhanced customer satisfaction and loyalty', 'Customer satisfaction score of 95% or above'),
('Construction Process Optimization', 'Implement lean construction methodologies and new technologies',
 (SELECT id FROM strategic_objectives WHERE name = 'Optimize Construction Efficiency'),
 (SELECT id FROM users WHERE username = 'jane.smith'), 'Planning', 'High', '2024-03-01', '2024-11-30', 750000.00, 10,
 'Reduced project completion time and costs', '20% reduction in project completion time and 15% cost savings');