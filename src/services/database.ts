import { supabase } from '../lib/supabase';
import type { 
  Division, 
  User, 
  StrategicObjective, 
  StrategicInitiative, 
  KPIDefinition, 
  KPIData 
} from '../types';

// Division Services
export const divisionService = {
  async getAll(): Promise<Division[]> {
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Division | null> {
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(division: Omit<Division, 'id' | 'created_at' | 'updated_at'>): Promise<Division> {
    const { data, error } = await supabase
      .from('divisions')
      .insert(division)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, division: Partial<Division>): Promise<Division> {
    const { data, error } = await supabase
      .from('divisions')
      .update(division)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('divisions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Strategic Objectives Services
export const objectiveService = {
  async getAll(): Promise<StrategicObjective[]> {
    const { data, error } = await supabase
      .from('strategic_objectives')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getByPerspective(perspective: string): Promise<StrategicObjective[]> {
    const { data, error } = await supabase
      .from('strategic_objectives')
      .select('*')
      .eq('perspective', perspective)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getByDivision(divisionId: string): Promise<StrategicObjective[]> {
    const { data, error } = await supabase
      .from('strategic_objectives')
      .select('*')
      .eq('division_id', divisionId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async create(objective: Omit<StrategicObjective, 'id' | 'created_at' | 'updated_at'>): Promise<StrategicObjective> {
    const { data, error } = await supabase
      .from('strategic_objectives')
      .insert(objective)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, objective: Partial<StrategicObjective>): Promise<StrategicObjective> {
    const { data, error } = await supabase
      .from('strategic_objectives')
      .update(objective)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('strategic_objectives')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// KPI Services
export const kpiService = {
  async getDefinitions(): Promise<KPIDefinition[]> {
    const { data, error } = await supabase
      .from('kpi_definitions')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getDefinitionsByDivision(divisionId: string): Promise<KPIDefinition[]> {
    const { data, error } = await supabase
      .from('kpi_definitions')
      .select('*')
      .eq('division_id', divisionId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getKPIData(kpiId: string, startDate?: string, endDate?: string): Promise<KPIData[]> {
    let query = supabase
      .from('kpi_data')
      .select(`
        *,
        kpi:kpi_definitions(name, units),
        entered_by_user:users!kpi_data_entered_by_fkey(first_name, last_name),
        approved_by_user:users!kpi_data_approved_by_fkey(first_name, last_name)
      `)
      .eq('kpi_id', kpiId)
      .order('period', { ascending: false });

    if (startDate) query = query.gte('period', startDate);
    if (endDate) query = query.lte('period', endDate);

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async createDefinition(kpi: Omit<KPIDefinition, 'id' | 'created_at' | 'updated_at'>): Promise<KPIDefinition> {
    const { data, error } = await supabase
      .from('kpi_definitions')
      .insert(kpi)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateDefinition(id: string, kpi: Partial<KPIDefinition>): Promise<KPIDefinition> {
    const { data, error } = await supabase
      .from('kpi_definitions')
      .update(kpi)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteDefinition(id: string): Promise<void> {
    const { error } = await supabase
      .from('kpi_definitions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async addKPIData(kpiData: Omit<KPIData, 'id' | 'created_at' | 'updated_at'>): Promise<KPIData> {
    const { data, error } = await supabase
      .from('kpi_data')
      .insert(kpiData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateKPIData(id: string, kpiData: Partial<KPIData>): Promise<KPIData> {
    const { data, error } = await supabase
      .from('kpi_data')
      .update(kpiData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Initiative Services
export const initiativeService = {
  async getAll(): Promise<StrategicInitiative[]> {
    const { data, error } = await supabase
      .from('strategic_initiatives')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getByObjective(objectiveId: string): Promise<StrategicInitiative[]> {
    const { data, error } = await supabase
      .from('strategic_initiatives')
      .select('*')
      .eq('objective_id', objectiveId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async create(initiative: Omit<StrategicInitiative, 'id' | 'created_at' | 'updated_at'>): Promise<StrategicInitiative> {
    const { data, error } = await supabase
      .from('strategic_initiatives')
      .insert(initiative)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, initiative: Partial<StrategicInitiative>): Promise<StrategicInitiative> {
    const { data, error } = await supabase
      .from('strategic_initiatives')
      .update(initiative)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('strategic_initiatives')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// User Services
export const userService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('last_name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getByDivision(divisionId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('division_id', divisionId)
      .order('last_name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // First try to find user by email (more reliable than ID matching)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();
    
    if (error) {
      // If user doesn't exist in users table, create a basic user record
      // This handles the case where someone signs up through Supabase Auth
      // but doesn't have a record in our users table yet
      if (error.code === 'PGRST116') { // No rows returned
        try {
          // Get first division ID as default
          const { data: divisions } = await supabase
            .from('divisions')
            .select('id')
            .limit(1)
            .single();
          
          // Create user with basic role, admin email gets special treatment
          const isAdmin = user.email === 'salle.kma@gmail.com';
          const userData = {
            id: user.id, // Use Supabase Auth ID
            username: user.email?.split('@')[0] || 'user',
            email: user.email,
            first_name: user.user_metadata?.first_name || (isAdmin ? 'Salle' : 'User'),
            last_name: user.user_metadata?.last_name || (isAdmin ? 'KMA' : 'Name'),
            role: isAdmin ? 'Admin' : 'User',
            division_id: divisions?.id,
            is_active: true
          };
          
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert(userData)
            .select()
            .single();
          
          if (insertError) throw insertError;
          return newUser;
        } catch (insertError) {
          console.error('Error creating user record:', insertError);
          throw insertError;
        }
      } else {
        throw error;
      }
    }
    
    return data;
  },

  async updateProfile(id: string, profile: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(profile)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Dashboard Services
export const dashboardService = {
  async getOverviewStats() {
    const [objectives, kpis, initiatives, divisions] = await Promise.all([
      supabase.from('strategic_objectives').select('id, status').eq('status', 'Active'),
      supabase.from('kpi_definitions').select('id'),
      supabase.from('strategic_initiatives').select('id, status').eq('status', 'Active'),
      supabase.from('divisions').select('id, status').eq('status', 'Active')
    ]);

    return {
      activeObjectives: objectives.data?.length || 0,
      totalKPIs: kpis.data?.length || 0,
      activeInitiatives: initiatives.data?.length || 0,
      activeDivisions: divisions.data?.length || 0
    };
  },

  async getPerformanceByPerspective() {
    const { data, error } = await supabase
      .from('strategic_objectives')
      .select(`
        perspective,
        id,
        objective_kpis(
          kpi_id,
          kpi_definitions(
            name,
            kpi_data(
              actual_value,
              target_value,
              status,
              period
            )
          )
        )
      `)
      .eq('status', 'Active');

    if (error) throw error;
    return data || [];
  },

  async getRecentActivity() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user:users(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }
};