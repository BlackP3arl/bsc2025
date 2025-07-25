-- Seed data for MTCC BSC System
-- Run this after the main schema.sql

-- Sample Strategic Objectives for each perspective
INSERT INTO strategic_objectives (name, description, perspective, division_id, owner_id, status) VALUES
-- Financial Perspective
('Increase Revenue Growth', 'Achieve 15% year-over-year revenue growth through diversified service offerings', 'Financial', 
 (SELECT id FROM divisions WHERE code = 'FD'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active'),
('Improve Profit Margins', 'Increase gross profit margin to 25% through operational efficiency', 'Financial', 
 (SELECT id FROM divisions WHERE code = 'FD'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active'),
('Cost Management', 'Reduce operational costs by 10% while maintaining service quality', 'Financial', 
 (SELECT id FROM divisions WHERE code = 'FD'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active'),

-- Customer Perspective
('Customer Satisfaction Excellence', 'Achieve 90% customer satisfaction rating across all service lines', 'Customer', 
 (SELECT id FROM divisions WHERE code = 'CSD'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active'),
('Market Share Growth', 'Increase market share in key business segments by 5%', 'Customer', 
 (SELECT id FROM divisions WHERE code = 'MBDD'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active'),
('Customer Retention', 'Maintain 95% customer retention rate for key accounts', 'Customer', 
 (SELECT id FROM divisions WHERE code = 'CSD'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active'),

-- Internal Process Perspective
('Operational Excellence', 'Streamline operations to reduce project delivery time by 20%', 'Internal', 
 (SELECT id FROM divisions WHERE code = 'OD'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active'),
('Quality Improvement', 'Achieve 99% quality compliance across all projects', 'Internal', 
 (SELECT id FROM divisions WHERE code = 'QAD'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active'),
('Innovation Initiative', 'Implement 5 new technology solutions annually', 'Internal', 
 (SELECT id FROM divisions WHERE code = 'ITD'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active'),

-- Learning & Growth Perspective
('Employee Development', 'Implement comprehensive training program for skill development', 'Learning', 
 (SELECT id FROM divisions WHERE code = 'HRD'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active'),
('Leadership Development', 'Develop next generation of leaders through mentorship programs', 'Learning', 
 (SELECT id FROM divisions WHERE code = 'HRD'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active'),
('Knowledge Management', 'Establish knowledge sharing platforms and processes', 'Learning', 
 (SELECT id FROM divisions WHERE code = 'ITDD'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active');

-- Sample KPI Definitions
INSERT INTO kpi_definitions (name, description, formula, frequency, units, target_value, threshold_green, threshold_yellow, threshold_red, owner_id, division_id) VALUES
-- Financial KPIs
('Revenue Growth Rate', 'Year over year revenue growth percentage', '((Current Year Revenue - Previous Year Revenue) / Previous Year Revenue) * 100', 'Quarterly', '%', 15.0, 15.0, 10.0, 5.0,
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
 (SELECT id FROM divisions WHERE code = 'FD')),
('Gross Profit Margin', 'Gross profit as percentage of revenue', '(Gross Profit / Revenue) * 100', 'Monthly', '%', 25.0, 25.0, 20.0, 15.0,
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
 (SELECT id FROM divisions WHERE code = 'FD')),
('Operating Cost Ratio', 'Operating costs as percentage of revenue', '(Operating Costs / Revenue) * 100', 'Monthly', '%', 75.0, 75.0, 80.0, 85.0,
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
 (SELECT id FROM divisions WHERE code = 'FD')),

-- Customer KPIs
('Customer Satisfaction Score', 'Average customer satisfaction rating', 'AVG(satisfaction_ratings)', 'Monthly', 'Score', 4.5, 4.5, 4.0, 3.5,
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
 (SELECT id FROM divisions WHERE code = 'CSD')),
('Net Promoter Score', 'Customer loyalty and satisfaction metric', 'NPS Calculation', 'Quarterly', 'Score', 70.0, 70.0, 50.0, 30.0,
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
 (SELECT id FROM divisions WHERE code = 'CSD')),
('Customer Retention Rate', 'Percentage of customers retained over period', '(Retained Customers / Total Customers) * 100', 'Quarterly', '%', 95.0, 95.0, 90.0, 85.0,
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
 (SELECT id FROM divisions WHERE code = 'CSD')),

-- Internal Process KPIs
('Project Delivery Time', 'Average time to complete projects', 'AVG(project_completion_days)', 'Monthly', 'Days', 30.0, 30.0, 35.0, 40.0,
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
 (SELECT id FROM divisions WHERE code = 'OD')),
('Quality Compliance Rate', 'Percentage of projects meeting quality standards', '(Compliant Projects / Total Projects) * 100', 'Monthly', '%', 99.0, 99.0, 95.0, 90.0,
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
 (SELECT id FROM divisions WHERE code = 'QAD')),
('Innovation Index', 'Number of new solutions implemented', 'COUNT(new_solutions)', 'Quarterly', 'Count', 5.0, 5.0, 3.0, 1.0,
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
 (SELECT id FROM divisions WHERE code = 'ITD')),

-- Learning & Growth KPIs
('Employee Satisfaction Score', 'Average employee satisfaction rating', 'AVG(employee_satisfaction)', 'Quarterly', 'Score', 4.2, 4.2, 3.8, 3.5,
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
 (SELECT id FROM divisions WHERE code = 'HRD')),
('Training Hours per Employee', 'Average training hours per employee annually', 'SUM(training_hours) / COUNT(employees)', 'Quarterly', 'Hours', 40.0, 40.0, 30.0, 20.0,
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
 (SELECT id FROM divisions WHERE code = 'HRD')),
('Employee Retention Rate', 'Percentage of employees retained', '(Retained Employees / Total Employees) * 100', 'Quarterly', '%', 90.0, 90.0, 85.0, 80.0,
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
 (SELECT id FROM divisions WHERE code = 'HRD'));

-- Sample Strategic Initiatives
INSERT INTO strategic_initiatives (name, description, type, objective_id, owner_id, status, start_date, end_date, budget_allocated, progress_percentage) VALUES
('Digital Transformation Program', 'Comprehensive digital transformation across all divisions', 'Program', 
 (SELECT id FROM strategic_objectives WHERE name = 'Innovation Initiative'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active', '2024-01-01', '2024-12-31', 500000.00, 35),
('Customer Experience Enhancement', 'Improve customer touchpoints and service delivery', 'Initiative', 
 (SELECT id FROM strategic_objectives WHERE name = 'Customer Satisfaction Excellence'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active', '2024-02-01', '2024-08-31', 200000.00, 45),
('Leadership Development Program', 'Comprehensive leadership training and development', 'Program', 
 (SELECT id FROM strategic_objectives WHERE name = 'Leadership Development'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Planning', '2024-03-01', '2024-12-31', 150000.00, 10),
('Operational Efficiency Project', 'Streamline processes and reduce waste', 'Project', 
 (SELECT id FROM strategic_objectives WHERE name = 'Operational Excellence'), 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 
 'Active', '2024-01-15', '2024-06-30', 300000.00, 60);

-- Link KPIs to Strategic Objectives
INSERT INTO objective_kpis (objective_id, kpi_id, weight) VALUES
-- Financial Objectives
((SELECT id FROM strategic_objectives WHERE name = 'Increase Revenue Growth'), 
 (SELECT id FROM kpi_definitions WHERE name = 'Revenue Growth Rate'), 1.0),
((SELECT id FROM strategic_objectives WHERE name = 'Improve Profit Margins'), 
 (SELECT id FROM kpi_definitions WHERE name = 'Gross Profit Margin'), 1.0),
((SELECT id FROM strategic_objectives WHERE name = 'Cost Management'), 
 (SELECT id FROM kpi_definitions WHERE name = 'Operating Cost Ratio'), 1.0),

-- Customer Objectives
((SELECT id FROM strategic_objectives WHERE name = 'Customer Satisfaction Excellence'), 
 (SELECT id FROM kpi_definitions WHERE name = 'Customer Satisfaction Score'), 0.7),
((SELECT id FROM strategic_objectives WHERE name = 'Customer Satisfaction Excellence'), 
 (SELECT id FROM kpi_definitions WHERE name = 'Net Promoter Score'), 0.3),
((SELECT id FROM strategic_objectives WHERE name = 'Customer Retention'), 
 (SELECT id FROM kpi_definitions WHERE name = 'Customer Retention Rate'), 1.0),

-- Internal Process Objectives
((SELECT id FROM strategic_objectives WHERE name = 'Operational Excellence'), 
 (SELECT id FROM kpi_definitions WHERE name = 'Project Delivery Time'), 1.0),
((SELECT id FROM strategic_objectives WHERE name = 'Quality Improvement'), 
 (SELECT id FROM kpi_definitions WHERE name = 'Quality Compliance Rate'), 1.0),
((SELECT id FROM strategic_objectives WHERE name = 'Innovation Initiative'), 
 (SELECT id FROM kpi_definitions WHERE name = 'Innovation Index'), 1.0),

-- Learning & Growth Objectives
((SELECT id FROM strategic_objectives WHERE name = 'Employee Development'), 
 (SELECT id FROM kpi_definitions WHERE name = 'Training Hours per Employee'), 0.6),
((SELECT id FROM strategic_objectives WHERE name = 'Employee Development'), 
 (SELECT id FROM kpi_definitions WHERE name = 'Employee Satisfaction Score'), 0.4),
((SELECT id FROM strategic_objectives WHERE name = 'Leadership Development'), 
 (SELECT id FROM kpi_definitions WHERE name = 'Employee Retention Rate'), 1.0);

-- Sample KPI Data for current period
INSERT INTO kpi_data (kpi_id, period, actual_value, target_value, status, comments, entered_by) VALUES
-- Financial KPI Data
((SELECT id FROM kpi_definitions WHERE name = 'Revenue Growth Rate'), '2024-01-01', 12.5, 15.0, 'Yellow', 'Slightly below target but improving', 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1)),
((SELECT id FROM kpi_definitions WHERE name = 'Gross Profit Margin'), '2024-01-01', 23.2, 25.0, 'Yellow', 'Cost optimization needed', 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1)),
((SELECT id FROM kpi_definitions WHERE name = 'Operating Cost Ratio'), '2024-01-01', 77.5, 75.0, 'Yellow', 'Costs slightly above target', 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1)),

-- Customer KPI Data
((SELECT id FROM kpi_definitions WHERE name = 'Customer Satisfaction Score'), '2024-01-01', 4.3, 4.5, 'Yellow', 'Good but room for improvement', 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1)),
((SELECT id FROM kpi_definitions WHERE name = 'Net Promoter Score'), '2024-01-01', 65.0, 70.0, 'Yellow', 'Customer feedback initiatives needed', 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1)),
((SELECT id FROM kpi_definitions WHERE name = 'Customer Retention Rate'), '2024-01-01', 94.2, 95.0, 'Yellow', 'Close to target', 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1)),

-- Internal Process KPI Data
((SELECT id FROM kpi_definitions WHERE name = 'Project Delivery Time'), '2024-01-01', 32.0, 30.0, 'Yellow', 'Process improvements in progress', 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1)),
((SELECT id FROM kpi_definitions WHERE name = 'Quality Compliance Rate'), '2024-01-01', 97.8, 99.0, 'Yellow', 'Quality training scheduled', 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1)),
((SELECT id FROM kpi_definitions WHERE name = 'Innovation Index'), '2024-01-01', 3.0, 5.0, 'Yellow', 'Innovation pipeline building', 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1)),

-- Learning & Growth KPI Data
((SELECT id FROM kpi_definitions WHERE name = 'Employee Satisfaction Score'), '2024-01-01', 4.0, 4.2, 'Yellow', 'Employee engagement programs launched', 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1)),
((SELECT id FROM kpi_definitions WHERE name = 'Training Hours per Employee'), '2024-01-01', 35.0, 40.0, 'Yellow', 'Training schedule being accelerated', 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1)),
((SELECT id FROM kpi_definitions WHERE name = 'Employee Retention Rate'), '2024-01-01', 88.5, 90.0, 'Yellow', 'HR initiatives in progress', 
 (SELECT id FROM users WHERE role = 'Admin' LIMIT 1));