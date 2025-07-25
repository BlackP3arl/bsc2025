import { supabase } from '../lib/supabase';
import type { 
  Division, 
  User, 
  StrategicObjective, 
  StrategicInitiative, 
  KPIDefinition, 
  KPIData,
  QuarterlyCommentary 
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

  async createDefinition(kpi: any): Promise<KPIDefinition> {
    const { objective_ids, ...kpiData } = kpi;
    
    const { data, error } = await supabase
      .from('kpi_definitions')
      .insert(kpiData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Link KPI to objectives if provided
    if (objective_ids && objective_ids.length > 0) {
      await this.linkKPIToObjectives(data.id, objective_ids);
    }
    
    return data;
  },

  async updateDefinition(id: string, kpi: any): Promise<KPIDefinition> {
    try {
      const { objective_ids, ...kpiData } = kpi;
      
      console.log('Updating KPI with data:', kpiData);
      console.log('Objective IDs:', objective_ids);
      
      const { data, error } = await supabase
        .from('kpi_definitions')
        .update(kpiData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('KPI update error:', error);
        throw new Error(`Failed to update KPI: ${error.message}`);
      }
      
      // Update KPI-objective relationships if provided
      if (objective_ids !== undefined) {
        console.log('Updating objective relationships...');
        await this.linkKPIToObjectives(id, objective_ids);
      }
      
      return data;
    } catch (error: any) {
      console.error('Update definition failed:', error);
      throw error;
    }
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
  },

  async deleteKPIData(id: string): Promise<void> {
    const { error } = await supabase
      .from('kpi_data')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Objective-KPI relationship methods
  async linkKPIToObjectives(kpiId: string, objectiveIds: string[]): Promise<void> {
    try {
      console.log('Linking KPI to objectives:', { kpiId, objectiveIds });
      
      // First, remove existing relationships for this KPI
      const { error: deleteError } = await supabase
        .from('objective_kpis')
        .delete()
        .eq('kpi_id', kpiId);

      if (deleteError) {
        console.error('Error deleting existing relationships:', deleteError);
        throw deleteError;
      }

      // Then add new relationships
      if (objectiveIds && objectiveIds.length > 0) {
        // Filter out any invalid objective IDs
        const validObjectiveIds = objectiveIds.filter(id => id && typeof id === 'string');
        
        if (validObjectiveIds.length > 0) {
          const relationships = validObjectiveIds.map(objectiveId => ({
            objective_id: objectiveId,
            kpi_id: kpiId,
            weight: 1.0 // Default weight, can be customized later
          }));

          console.log('Inserting relationships:', relationships);

          const { error: insertError } = await supabase
            .from('objective_kpis')
            .insert(relationships);

          if (insertError) {
            console.error('Error inserting relationships:', insertError);
            throw insertError;
          }
        }
      }
    } catch (error: any) {
      console.error('linkKPIToObjectives failed:', error);
      throw error;
    }
  },

  async getKPIObjectives(kpiId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('objective_kpis')
      .select('objective_id')
      .eq('kpi_id', kpiId);

    if (error) throw error;
    return data?.map(item => item.objective_id) || [];
  },

  async getObjectiveKPIs(objectiveId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('objective_kpis')
      .select('kpi_id')
      .eq('objective_id', objectiveId);

    if (error) throw error;
    return data?.map(item => item.kpi_id) || [];
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
          
          // Create user with basic role, admin emails get special treatment
          const isAdmin = user.email === 'salle.kma@gmail.com' || user.email === 'admin@mtcc.com.mv';
          const userData = {
            id: user.id, // Use Supabase Auth ID
            username: user.email?.split('@')[0] || 'user',
            email: user.email,
            first_name: user.user_metadata?.first_name || (isAdmin ? (user.email === 'salle.kma@gmail.com' ? 'Salle' : 'Admin') : 'User'),
            last_name: user.user_metadata?.last_name || (isAdmin ? (user.email === 'salle.kma@gmail.com' ? 'KMA' : 'MTCC') : 'Name'),
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

  async create(userData: any): Promise<User> {
    try {
      // Step 1: Create user with Supabase Auth signUp (this creates both auth and can trigger user creation)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role,
            username: userData.username,
            phone: userData.phone,
            division_id: userData.division_id,
            is_active: userData.is_active
          }
        }
      });

      if (authError) {
        console.error('Auth user creation failed:', authError);
        throw new Error(`Failed to create user account: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user returned from authentication service');
      }

      // Step 2: Create or update user record in our users table
      const dbUserData = {
        id: authData.user.id,
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || null,
        role: userData.role,
        division_id: userData.division_id,
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        auth_provider: 'email'
      };

      // Use upsert to handle cases where user might already exist
      const { data, error } = await supabase
        .from('users')
        .upsert(dbUserData, { onConflict: 'id' })
        .select()
        .single();
      
      if (error) {
        console.error('Database user creation failed:', error);
        // Try to clean up the auth user if database insert failed
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.warn('Failed to cleanup auth user:', cleanupError);
        }
        throw new Error(`Failed to create user record: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      console.error('User creation failed:', error);
      throw error;
    }
  },

  async update(id: string, userData: any): Promise<User> {
    try {
      let passwordUpdateFailed = false;
      
      // Step 1: Update password in Supabase Auth if provided
      if (userData.password) {
        try {
          const { error: passwordError } = await supabase.auth.admin.updateUserById(id, {
            password: userData.password
          });

          if (passwordError) {
            console.error('Password update failed:', passwordError);
            passwordUpdateFailed = true;
          }
        } catch (authError) {
          console.warn('Auth password update not available:', authError);
          passwordUpdateFailed = true;
        }

        // If password update failed, send password reset email as fallback
        if (passwordUpdateFailed) {
          try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(userData.email || '', {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            
            if (!resetError) {
              console.log('Password reset email sent as fallback');
            }
          } catch (resetError) {
            console.warn('Password reset email also failed:', resetError);
          }
        }
      }

      // Step 2: Remove password fields from userData before database update
      const { password, confirmPassword, ...dbUserData } = userData;

      // Step 3: Update user record in our users table
      const { data, error } = await supabase
        .from('users')
        .update(dbUserData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add a note about password reset if it failed
      if (passwordUpdateFailed && userData.password) {
        const result = { ...data };
        result._passwordResetSent = true;
        return result;
      }
      
      return data;
    } catch (error: any) {
      console.error('User update failed:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      // Step 1: Delete user record from our users table
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (dbError) {
        console.error('Database user deletion failed:', dbError);
        throw dbError;
      }

      // Step 2: Try to delete the Supabase Auth user (optional, may not have admin access)
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(id);
        if (authError) {
          console.warn('Auth user deletion failed (may not have admin access):', authError);
          // Don't throw error here as the database record is already deleted
        }
      } catch (authError) {
        console.warn('Auth admin functions not available, user auth record may remain');
      }
    } catch (error: any) {
      console.error('User deletion failed:', error);
      throw error;
    }
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

// Quarterly Commentary Services
export const quarterlyCommentaryService = {
  async getAll(): Promise<QuarterlyCommentary[]> {
    const { data, error } = await supabase
      .from('quarterly_commentary')
      .select(`
        *,
        initiative:strategic_initiatives(
          id, 
          name, 
          objective_id,
          objective:strategic_objectives(
            id, 
            name, 
            division_id,
            perspective
          )
        ),
        reviewer:users(id, first_name, last_name, role)
      `)
      .order('year', { ascending: false })
      .order('quarter', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByInitiative(initiativeId: string): Promise<QuarterlyCommentary[]> {
    const { data, error } = await supabase
      .from('quarterly_commentary')
      .select(`
        *,
        initiative:strategic_initiatives(
          id, 
          name, 
          objective_id,
          objective:strategic_objectives(
            id, 
            name, 
            division_id,
            perspective
          )
        ),
        reviewer:users(id, first_name, last_name, role)
      `)
      .eq('initiative_id', initiativeId)
      .order('year', { ascending: false })
      .order('quarter', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByYearQuarter(year: number, quarter: string): Promise<QuarterlyCommentary[]> {
    const { data, error } = await supabase
      .from('quarterly_commentary')
      .select(`
        *,
        initiative:strategic_initiatives(
          id, 
          name, 
          objective_id,
          objective:strategic_objectives(
            id, 
            name, 
            division_id,
            perspective
          )
        ),
        reviewer:users(id, first_name, last_name, role)
      `)
      .eq('year', year)
      .eq('quarter', quarter)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByDivision(divisionId: string, year?: number, quarter?: string): Promise<QuarterlyCommentary[]> {
    let query = supabase
      .from('quarterly_commentary')
      .select(`
        *,
        initiative:strategic_initiatives!inner(
          id, name, objective_id,
          objective:strategic_objectives!inner(
            id, name, division_id, perspective
          )
        ),
        reviewer:users(id, first_name, last_name, role)
      `)
      .eq('initiative.objective.division_id', divisionId);

    if (year) query = query.eq('year', year);
    if (quarter) query = query.eq('quarter', quarter);

    const { data, error } = await query
      .order('year', { ascending: false })
      .order('quarter', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(commentary: Omit<QuarterlyCommentary, 'id' | 'created_at' | 'updated_at'>): Promise<QuarterlyCommentary> {
    console.log('Creating quarterly commentary:', commentary);
    const { data, error } = await supabase
      .from('quarterly_commentary')
      .insert(commentary)
      .select(`
        *,
        initiative:strategic_initiatives(
          id, 
          name, 
          objective_id,
          objective:strategic_objectives(
            id, 
            name, 
            division_id,
            perspective
          )
        ),
        reviewer:users(id, first_name, last_name, role)
      `)
      .single();
    
    if (error) {
      console.error('Error creating quarterly commentary:', error);
      throw error;
    }
    return data;
  },

  async update(id: string, commentary: Partial<QuarterlyCommentary>): Promise<QuarterlyCommentary> {
    console.log('Updating quarterly commentary:', id, commentary);
    
    // First, do the update
    const { error: updateError } = await supabase
      .from('quarterly_commentary')
      .update(commentary)
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating quarterly commentary:', updateError);
      throw updateError;
    }
    
    // Then fetch the updated record
    const { data, error: fetchError } = await supabase
      .from('quarterly_commentary')
      .select(`
        *,
        initiative:strategic_initiatives(
          id, 
          name, 
          objective_id,
          objective:strategic_objectives(
            id, 
            name, 
            division_id,
            perspective
          )
        ),
        reviewer:users(id, first_name, last_name, role)
      `)
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching updated quarterly commentary:', fetchError);
      throw fetchError;
    }
    
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('quarterly_commentary')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getCommentaryForInitiativeQuarter(initiativeId: string, year: number, quarter: string): Promise<QuarterlyCommentary | null> {
    const { data, error } = await supabase
      .from('quarterly_commentary')
      .select(`
        *,
        initiative:strategic_initiatives(
          id, 
          name, 
          objective_id,
          objective:strategic_objectives(
            id, 
            name, 
            division_id,
            perspective
          )
        ),
        reviewer:users(id, first_name, last_name, role)
      `)
      .eq('initiative_id', initiativeId)
      .eq('year', year)
      .eq('quarter', quarter)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  }
};