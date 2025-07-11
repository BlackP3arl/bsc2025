-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('Admin', 'Executive', 'Manager', 'User');
CREATE TYPE division_status AS ENUM ('Active', 'Inactive');
CREATE TYPE objective_status AS ENUM ('Active', 'Inactive', 'Archived');
CREATE TYPE perspective_type AS ENUM ('Financial', 'Customer', 'Internal', 'Learning');
CREATE TYPE initiative_type AS ENUM ('Initiative', 'Project', 'Program');
CREATE TYPE initiative_status AS ENUM ('Planning', 'Active', 'Completed', 'Cancelled');
CREATE TYPE frequency_type AS ENUM ('Daily', 'Weekly', 'Monthly', 'Quarterly');
CREATE TYPE kpi_status AS ENUM ('Red', 'Yellow', 'Green');

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
    status initiative_status DEFAULT 'Planning',
    start_date DATE,
    end_date DATE,
    budget_allocated DECIMAL(15,2) DEFAULT 0,
    budget_spent DECIMAL(15,2) DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
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

-- Create indexes for better performance
CREATE INDEX idx_users_division_id ON users(division_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_strategic_objectives_division_id ON strategic_objectives(division_id);
CREATE INDEX idx_strategic_objectives_perspective ON strategic_objectives(perspective);
CREATE INDEX idx_strategic_initiatives_objective_id ON strategic_initiatives(objective_id);
CREATE INDEX idx_strategic_initiatives_owner_id ON strategic_initiatives(owner_id);
CREATE INDEX idx_kpi_definitions_division_id ON kpi_definitions(division_id);
CREATE INDEX idx_kpi_definitions_owner_id ON kpi_definitions(owner_id);
CREATE INDEX idx_kpi_data_kpi_id ON kpi_data(kpi_id);
CREATE INDEX idx_kpi_data_period ON kpi_data(period);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON divisions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategic_objectives_updated_at BEFORE UPDATE ON strategic_objectives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategic_initiatives_updated_at BEFORE UPDATE ON strategic_initiatives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpi_definitions_updated_at BEFORE UPDATE ON kpi_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpi_data_updated_at BEFORE UPDATE ON kpi_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Enable Row Level Security
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples - should be customized based on business rules)
CREATE POLICY "Users can view their own division data" ON divisions
    FOR SELECT USING (
        id IN (SELECT division_id FROM users WHERE id = auth.uid())
        OR auth.uid() IN (SELECT id FROM users WHERE role = 'Admin')
    );

CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (
        id = auth.uid() 
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('Admin', 'Executive'))
    );

CREATE POLICY "Users can view objectives in their division" ON strategic_objectives
    FOR SELECT USING (
        division_id IN (SELECT division_id FROM users WHERE id = auth.uid())
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('Admin', 'Executive'))
    );

CREATE POLICY "Users can view initiatives in their division" ON strategic_initiatives
    FOR SELECT USING (
        objective_id IN (
            SELECT id FROM strategic_objectives 
            WHERE division_id IN (SELECT division_id FROM users WHERE id = auth.uid())
        )
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('Admin', 'Executive'))
    );

CREATE POLICY "Users can view KPI definitions in their division" ON kpi_definitions
    FOR SELECT USING (
        division_id IN (SELECT division_id FROM users WHERE id = auth.uid())
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('Admin', 'Executive'))
    );

CREATE POLICY "Users can view KPI data in their division" ON kpi_data
    FOR SELECT USING (
        kpi_id IN (
            SELECT id FROM kpi_definitions 
            WHERE division_id IN (SELECT division_id FROM users WHERE id = auth.uid())
        )
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('Admin', 'Executive'))
    );

CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());