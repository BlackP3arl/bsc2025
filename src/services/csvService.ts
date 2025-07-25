import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import type { Division, User } from '../types';

export interface CSVError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ImportResult {
  success: boolean;
  processed: number;
  inserted: number;
  errors: CSVError[];
  duplicates: number;
}

// Strategic Objectives CSV Structure
export interface StrategicObjectiveCSV {
  name: string;
  description: string;
  perspective: 'Financial' | 'Customer' | 'Internal' | 'Learning';
  division_code: string;
  owner_email: string;
  status: 'Active' | 'Inactive' | 'Archived';
}

// KPI CSV Structure
export interface KPICSV {
  name: string;
  description: string;
  formula: string;
  data_source: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  units: string;
  target_value: string;
  threshold_red: string;
  threshold_yellow: string;
  threshold_green: string;
  division_code: string;
  owner_email: string;
  status: 'Active' | 'Inactive' | 'Draft';
}

// Initiative CSV Structure
export interface InitiativeCSV {
  name: string;
  description: string;
  type: 'Initiative' | 'Project' | 'Program';
  objective_name: string;
  owner_email: string;
  sponsor_email: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  start_date: string;
  end_date: string;
  budget: string;
  expected_outcome: string;
  success_criteria: string;
}

export class CSVService {
  private static divisions: Division[] = [];
  private static users: User[] = [];

  // Initialize reference data
  static async initialize() {
    const [divisionsResult, usersResult] = await Promise.all([
      supabase.from('divisions').select('*'),
      supabase.from('users').select('*')
    ]);

    if (divisionsResult.data) this.divisions = divisionsResult.data;
    if (usersResult.data) this.users = usersResult.data;
  }

  // Helper methods
  private static getDivisionByCode(code: string): Division | null {
    return this.divisions.find(d => d.code.toLowerCase() === code.toLowerCase()) || null;
  }

  private static getUserByEmail(email: string): User | null {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  // Generate CSV templates
  static generateStrategicObjectivesTemplate(): string {
    const headers = [
      'name',
      'description', 
      'perspective',
      'division_code',
      'owner_email',
      'status'
    ];

    const sampleData = [
      {
        name: 'Increase Revenue Growth',
        description: 'Achieve 15% revenue growth through expanded services',
        perspective: 'Financial',
        division_code: 'FD',
        owner_email: 'john.doe@mtcc.com.mv',
        status: 'Active'
      },
      {
        name: 'Improve Customer Satisfaction',
        description: 'Achieve 95% customer satisfaction rating',
        perspective: 'Customer',
        division_code: 'CSD',
        owner_email: 'jane.smith@mtcc.com.mv',
        status: 'Active'
      }
    ];

    return Papa.unparse([headers, ...sampleData.map(obj => headers.map(h => obj[h as keyof typeof obj]))]);
  }

  static generateKPIsTemplate(): string {
    const headers = [
      'name',
      'description',
      'formula',
      'data_source',
      'frequency',
      'units',
      'target_value',
      'threshold_red',
      'threshold_yellow',
      'threshold_green',
      'division_code',
      'owner_email',
      'status'
    ];

    const sampleData = [
      {
        name: 'Revenue Growth Rate',
        description: 'Percentage increase in revenue compared to previous period',
        formula: '(Current Revenue - Previous Revenue) / Previous Revenue * 100',
        data_source: 'Financial System',
        frequency: 'Monthly',
        units: '%',
        target_value: '15.0',
        threshold_red: '5.0',
        threshold_yellow: '10.0',
        threshold_green: '15.0',
        division_code: 'FD',
        owner_email: 'john.doe@mtcc.com.mv',
        status: 'Active'
      },
      {
        name: 'Customer Satisfaction Score',
        description: 'Average customer satisfaction rating from surveys',
        formula: 'Sum of all ratings / Number of responses',
        data_source: 'Customer Survey System',
        frequency: 'Monthly',
        units: 'Score',
        target_value: '4.5',
        threshold_red: '3.0',
        threshold_yellow: '4.0',
        threshold_green: '4.5',
        division_code: 'CSD',
        owner_email: 'jane.smith@mtcc.com.mv',
        status: 'Active'
      }
    ];

    return Papa.unparse([headers, ...sampleData.map(obj => headers.map(h => obj[h as keyof typeof obj]))]);
  }

  static generateInitiativesTemplate(): string {
    const headers = [
      'name',
      'description',
      'type',
      'objective_name',
      'owner_email',
      'sponsor_email',
      'status',
      'priority',
      'start_date',
      'end_date',
      'budget',
      'expected_outcome',
      'success_criteria'
    ];

    const sampleData = [
      {
        name: 'Digital Transformation Initiative',
        description: 'Implement digital solutions across all business processes',
        type: 'Initiative',
        objective_name: 'Increase Revenue Growth',
        owner_email: 'john.doe@mtcc.com.mv',
        sponsor_email: 'admin@mtcc.com.mv',
        status: 'Active',
        priority: 'High',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        budget: '500000.00',
        expected_outcome: 'Streamlined operations and improved efficiency',
        success_criteria: 'All core processes digitized and 20% efficiency improvement achieved'
      },
      {
        name: 'Customer Experience Enhancement',
        description: 'Improve customer touchpoints and service delivery',
        type: 'Program',
        objective_name: 'Improve Customer Satisfaction',
        owner_email: 'jane.smith@mtcc.com.mv',
        sponsor_email: 'admin@mtcc.com.mv',
        status: 'Planning',
        priority: 'Medium',
        start_date: '2024-02-01',
        end_date: '2024-08-31',
        budget: '250000.00',
        expected_outcome: 'Enhanced customer satisfaction and loyalty',
        success_criteria: 'Customer satisfaction score of 95% or above'
      }
    ];

    return Papa.unparse([headers, ...sampleData.map(obj => headers.map(h => obj[h as keyof typeof obj]))]);
  }

  // Parse and validate CSV data
  static async parseStrategicObjectivesCSV(file: File): Promise<{ data: StrategicObjectiveCSV[]; errors: CSVError[] }> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const errors: CSVError[] = [];
          const validData: StrategicObjectiveCSV[] = [];

          results.data.forEach((row: any, index: number) => {
            const rowNumber = index + 2; // +2 for header row and 0-based index
            
            // Validate required fields
            if (!row.name?.trim()) {
              errors.push({ row: rowNumber, field: 'name', message: 'Name is required' });
            }
            if (!row.description?.trim()) {
              errors.push({ row: rowNumber, field: 'description', message: 'Description is required' });
            }
            if (!['Financial', 'Customer', 'Internal', 'Learning'].includes(row.perspective)) {
              errors.push({ row: rowNumber, field: 'perspective', message: 'Invalid perspective. Must be: Financial, Customer, Internal, or Learning', value: row.perspective });
            }
            if (!row.division_code?.trim()) {
              errors.push({ row: rowNumber, field: 'division_code', message: 'Division code is required' });
            } else if (!this.getDivisionByCode(row.division_code)) {
              errors.push({ row: rowNumber, field: 'division_code', message: 'Invalid division code', value: row.division_code });
            }
            if (!row.owner_email?.trim()) {
              errors.push({ row: rowNumber, field: 'owner_email', message: 'Owner email is required' });
            } else if (!this.getUserByEmail(row.owner_email)) {
              errors.push({ row: rowNumber, field: 'owner_email', message: 'User not found', value: row.owner_email });
            }
            if (!['Active', 'Inactive', 'Archived'].includes(row.status)) {
              errors.push({ row: rowNumber, field: 'status', message: 'Invalid status. Must be: Active, Inactive, or Archived', value: row.status });
            }

            if (errors.filter(e => e.row === rowNumber).length === 0) {
              validData.push(row as StrategicObjectiveCSV);
            }
          });

          resolve({ data: validData, errors });
        }
      });
    });
  }

  static async parseKPIsCSV(file: File): Promise<{ data: KPICSV[]; errors: CSVError[] }> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const errors: CSVError[] = [];
          const validData: KPICSV[] = [];

          results.data.forEach((row: any, index: number) => {
            const rowNumber = index + 2;
            
            // Validate required fields
            if (!row.name?.trim()) {
              errors.push({ row: rowNumber, field: 'name', message: 'Name is required' });
            }
            if (!row.description?.trim()) {
              errors.push({ row: rowNumber, field: 'description', message: 'Description is required' });
            }
            if (!['Daily', 'Weekly', 'Monthly', 'Quarterly'].includes(row.frequency)) {
              errors.push({ row: rowNumber, field: 'frequency', message: 'Invalid frequency. Must be: Daily, Weekly, Monthly, or Quarterly', value: row.frequency });
            }
            if (!row.division_code?.trim()) {
              errors.push({ row: rowNumber, field: 'division_code', message: 'Division code is required' });
            } else if (!this.getDivisionByCode(row.division_code)) {
              errors.push({ row: rowNumber, field: 'division_code', message: 'Invalid division code', value: row.division_code });
            }
            if (!row.owner_email?.trim()) {
              errors.push({ row: rowNumber, field: 'owner_email', message: 'Owner email is required' });
            } else if (!this.getUserByEmail(row.owner_email)) {
              errors.push({ row: rowNumber, field: 'owner_email', message: 'User not found', value: row.owner_email });
            }
            if (!['Active', 'Inactive', 'Draft'].includes(row.status)) {
              errors.push({ row: rowNumber, field: 'status', message: 'Invalid status. Must be: Active, Inactive, or Draft', value: row.status });
            }

            // Validate numeric fields
            if (row.target_value && isNaN(parseFloat(row.target_value))) {
              errors.push({ row: rowNumber, field: 'target_value', message: 'Target value must be a number', value: row.target_value });
            }
            if (row.threshold_red && isNaN(parseFloat(row.threshold_red))) {
              errors.push({ row: rowNumber, field: 'threshold_red', message: 'Red threshold must be a number', value: row.threshold_red });
            }
            if (row.threshold_yellow && isNaN(parseFloat(row.threshold_yellow))) {
              errors.push({ row: rowNumber, field: 'threshold_yellow', message: 'Yellow threshold must be a number', value: row.threshold_yellow });
            }
            if (row.threshold_green && isNaN(parseFloat(row.threshold_green))) {
              errors.push({ row: rowNumber, field: 'threshold_green', message: 'Green threshold must be a number', value: row.threshold_green });
            }

            if (errors.filter(e => e.row === rowNumber).length === 0) {
              validData.push(row as KPICSV);
            }
          });

          resolve({ data: validData, errors });
        }
      });
    });
  }

  static async parseInitiativesCSV(file: File): Promise<{ data: InitiativeCSV[]; errors: CSVError[] }> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const errors: CSVError[] = [];
          const validData: InitiativeCSV[] = [];

          results.data.forEach((row: any, index: number) => {
            const rowNumber = index + 2;
            
            // Validate required fields
            if (!row.name?.trim()) {
              errors.push({ row: rowNumber, field: 'name', message: 'Name is required' });
            }
            if (!row.description?.trim()) {
              errors.push({ row: rowNumber, field: 'description', message: 'Description is required' });
            }
            if (!['Initiative', 'Project', 'Program'].includes(row.type)) {
              errors.push({ row: rowNumber, field: 'type', message: 'Invalid type. Must be: Initiative, Project, or Program', value: row.type });
            }
            if (!row.objective_name?.trim()) {
              errors.push({ row: rowNumber, field: 'objective_name', message: 'Objective name is required' });
            }
            if (!row.owner_email?.trim()) {
              errors.push({ row: rowNumber, field: 'owner_email', message: 'Owner email is required' });
            } else if (!this.getUserByEmail(row.owner_email)) {
              errors.push({ row: rowNumber, field: 'owner_email', message: 'User not found', value: row.owner_email });
            }
            if (row.sponsor_email && !this.getUserByEmail(row.sponsor_email)) {
              errors.push({ row: rowNumber, field: 'sponsor_email', message: 'Sponsor user not found', value: row.sponsor_email });
            }
            if (!['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'].includes(row.status)) {
              errors.push({ row: rowNumber, field: 'status', message: 'Invalid status. Must be: Planning, Active, On Hold, Completed, or Cancelled', value: row.status });
            }
            if (!['Low', 'Medium', 'High', 'Critical'].includes(row.priority)) {
              errors.push({ row: rowNumber, field: 'priority', message: 'Invalid priority. Must be: Low, Medium, High, or Critical', value: row.priority });
            }

            // Validate dates
            if (row.start_date && !Date.parse(row.start_date)) {
              errors.push({ row: rowNumber, field: 'start_date', message: 'Invalid start date format (use YYYY-MM-DD)', value: row.start_date });
            }
            if (row.end_date && !Date.parse(row.end_date)) {
              errors.push({ row: rowNumber, field: 'end_date', message: 'Invalid end date format (use YYYY-MM-DD)', value: row.end_date });
            }

            // Validate budget
            if (row.budget && isNaN(parseFloat(row.budget))) {
              errors.push({ row: rowNumber, field: 'budget', message: 'Budget must be a number', value: row.budget });
            }

            if (errors.filter(e => e.row === rowNumber).length === 0) {
              validData.push(row as InitiativeCSV);
            }
          });

          resolve({ data: validData, errors });
        }
      });
    });
  }

  // Import methods
  static async importStrategicObjectives(data: StrategicObjectiveCSV[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      processed: data.length,
      inserted: 0,
      errors: [],
      duplicates: 0
    };

    try {
      // Check for existing objectives to avoid duplicates
      const existingObjectives = await supabase
        .from('strategic_objectives')
        .select('name, division_id');

      const existingNames = new Set(
        existingObjectives.data?.map(obj => `${obj.name.toLowerCase()}-${obj.division_id}`) || []
      );

      const objectivesToInsert = [];
      for (const csvRow of data) {
        const division = this.getDivisionByCode(csvRow.division_code);
        const owner = this.getUserByEmail(csvRow.owner_email);
        
        if (division && owner) {
          const uniqueKey = `${csvRow.name.toLowerCase()}-${division.id}`;
          if (existingNames.has(uniqueKey)) {
            result.duplicates++;
          } else {
            objectivesToInsert.push({
              name: csvRow.name,
              description: csvRow.description,
              perspective: csvRow.perspective,
              division_id: division.id,
              owner_id: owner.id,
              status: csvRow.status
            });
          }
        }
      }

      if (objectivesToInsert.length > 0) {
        const { error } = await supabase
          .from('strategic_objectives')
          .insert(objectivesToInsert);

        if (error) throw error;
        result.inserted = objectivesToInsert.length;
      }

      result.success = true;
    } catch (error: any) {
      result.errors.push({
        row: 0,
        field: 'general',
        message: error.message || 'Unknown error occurred during import'
      });
    }

    return result;
  }

  static async importKPIs(data: KPICSV[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      processed: data.length,
      inserted: 0,
      errors: [],
      duplicates: 0
    };

    try {
      // Check for existing KPIs to avoid duplicates
      const existingKPIs = await supabase
        .from('kpi_definitions')
        .select('name, division_id');

      const existingNames = new Set(
        existingKPIs.data?.map(kpi => `${kpi.name.toLowerCase()}-${kpi.division_id}`) || []
      );

      const kpisToInsert = [];
      for (const csvRow of data) {
        const division = this.getDivisionByCode(csvRow.division_code);
        const owner = this.getUserByEmail(csvRow.owner_email);
        
        if (division && owner) {
          const uniqueKey = `${csvRow.name.toLowerCase()}-${division.id}`;
          if (existingNames.has(uniqueKey)) {
            result.duplicates++;
          } else {
            kpisToInsert.push({
              name: csvRow.name,
              description: csvRow.description,
              formula: csvRow.formula,
              data_source: csvRow.data_source,
              frequency: csvRow.frequency,
              units: csvRow.units,
              target_value: csvRow.target_value ? parseFloat(csvRow.target_value) : null,
              threshold_red: csvRow.threshold_red ? parseFloat(csvRow.threshold_red) : null,
              threshold_yellow: csvRow.threshold_yellow ? parseFloat(csvRow.threshold_yellow) : null,
              threshold_green: csvRow.threshold_green ? parseFloat(csvRow.threshold_green) : null,
              division_id: division.id,
              owner_id: owner.id,
              status: csvRow.status
            });
          }
        }
      }

      if (kpisToInsert.length > 0) {
        const { error } = await supabase
          .from('kpi_definitions')
          .insert(kpisToInsert);

        if (error) throw error;
        result.inserted = kpisToInsert.length;
      }

      result.success = true;
    } catch (error: any) {
      result.errors.push({
        row: 0,
        field: 'general',
        message: error.message || 'Unknown error occurred during import'
      });
    }

    return result;
  }

  static async importInitiatives(data: InitiativeCSV[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      processed: data.length,
      inserted: 0,
      errors: [],
      duplicates: 0
    };

    try {
      // Get objectives for linking
      const objectives = await supabase
        .from('strategic_objectives')
        .select('id, name');

      const objectiveMap = new Map(
        objectives.data?.map(obj => [obj.name.toLowerCase(), obj.id]) || []
      );

      // Check for existing initiatives to avoid duplicates
      const existingInitiatives = await supabase
        .from('strategic_initiatives')
        .select('name, objective_id');

      const existingNames = new Set(
        existingInitiatives.data?.map(init => `${init.name.toLowerCase()}-${init.objective_id}`) || []
      );

      const initiativesToInsert = [];
      for (const csvRow of data) {
        const owner = this.getUserByEmail(csvRow.owner_email);
        const sponsor = csvRow.sponsor_email ? this.getUserByEmail(csvRow.sponsor_email) : null;
        const objectiveId = objectiveMap.get(csvRow.objective_name.toLowerCase());
        
        if (owner && objectiveId) {
          const uniqueKey = `${csvRow.name.toLowerCase()}-${objectiveId}`;
          if (existingNames.has(uniqueKey)) {
            result.duplicates++;
          } else {
            initiativesToInsert.push({
              name: csvRow.name,
              description: csvRow.description,
              type: csvRow.type,
              objective_id: objectiveId,
              owner_id: owner.id,
              sponsor_id: sponsor?.id || null,
              status: csvRow.status,
              priority: csvRow.priority,
              start_date: csvRow.start_date || null,
              end_date: csvRow.end_date || null,
              budget: csvRow.budget ? parseFloat(csvRow.budget) : null,
              expected_outcome: csvRow.expected_outcome,
              success_criteria: csvRow.success_criteria
            });
          }
        }
      }

      if (initiativesToInsert.length > 0) {
        const { error } = await supabase
          .from('strategic_initiatives')
          .insert(initiativesToInsert);

        if (error) throw error;
        result.inserted = initiativesToInsert.length;
      }

      result.success = true;
    } catch (error: any) {
      result.errors.push({
        row: 0,
        field: 'general',
        message: error.message || 'Unknown error occurred during import'
      });
    }

    return result;
  }

  // Download template files
  static downloadTemplate(type: 'objectives' | 'kpis' | 'initiatives') {
    let content: string;
    let filename: string;

    switch (type) {
      case 'objectives':
        content = this.generateStrategicObjectivesTemplate();
        filename = 'strategic_objectives_template.csv';
        break;
      case 'kpis':
        content = this.generateKPIsTemplate();
        filename = 'kpis_template.csv';
        break;
      case 'initiatives':
        content = this.generateInitiativesTemplate();
        filename = 'initiatives_template.csv';
        break;
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}