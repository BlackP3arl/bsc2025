export interface Division {
  id: string;
  name: string;
  code: string;
  description: string;
  head_id: string;
  parent_division_id?: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'Admin' | 'Executive' | 'Manager' | 'User';
  division_id: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface StrategicObjective {
  id: string;
  name: string;
  description: string;
  perspective: 'Financial' | 'Customer' | 'Internal' | 'Learning';
  division_id: string;
  parent_objective_id?: string;
  owner_id: string;
  status: 'Active' | 'Inactive' | 'Archived';
  created_at: string;
  updated_at: string;
}

export interface StrategicInitiative {
  id: string;
  name: string;
  description: string;
  type: 'Initiative' | 'Project' | 'Program';
  objective_id: string;
  owner_id: string;
  sponsor_id?: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  start_date: string;
  end_date: string;
  budget: number;
  budget_allocated?: number;
  budget_spent?: number;
  progress_percentage: number;
  expected_outcome?: string;
  success_criteria?: string;
  created_at: string;
  updated_at: string;
}

export interface KPIDefinition {
  id: string;
  name: string;
  description: string;
  formula: string;
  data_source: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  units: string;
  target_value: number;
  threshold_red: number;
  threshold_yellow: number;
  threshold_green: number;
  owner_id: string;
  division_id: string;
  status?: 'Active' | 'Inactive' | 'Draft';
  created_at: string;
  updated_at: string;
}

export interface KPIData {
  id: string;
  kpi_id: string;
  period: string;
  actual_value: number;
  target_value: number;
  status: 'Red' | 'Yellow' | 'Green';
  comments?: string;
  entered_by: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ObjectiveKPI {
  id: string;
  objective_id: string;
  kpi_id: string;
  weight: number;
  created_at: string;
}

export interface QuarterlyCommentary {
  id: string;
  initiative_id: string;
  year: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  commentary: string;
  reviewer_id: string;
  review_date: string;
  status: 'Draft' | 'Submitted' | 'Approved';
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  status: 'Red' | 'Yellow' | 'Green';
}

export interface MenuItem {
  name: string;
  icon: React.ComponentType<any>;
  href: string;
  current: boolean;
  children?: MenuItem[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
}