import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  divisionService, 
  objectiveService, 
  kpiService, 
  initiativeService, 
  userService, 
  dashboardService,
  quarterlyCommentaryService
} from '../services/database';
import { supabase } from '../lib/supabase';
import type { Division, StrategicObjective, KPIDefinition, StrategicInitiative, QuarterlyCommentary } from '../types';

// Division Hooks
export const useDivisions = () => {
  return useQuery({
    queryKey: ['divisions'],
    queryFn: divisionService.getAll,
  });
};

export const useDivision = (id: string) => {
  return useQuery({
    queryKey: ['division', id],
    queryFn: () => divisionService.getById(id),
    enabled: !!id,
  });
};

export const useCreateDivision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: divisionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] });
    },
  });
};

export const useUpdateDivision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Division> }) =>
      divisionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] });
    },
  });
};

export const useDeleteDivision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: divisionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions'] });
    },
  });
};

// Strategic Objectives Hooks
export const useStrategicObjectives = () => {
  return useQuery({
    queryKey: ['strategic-objectives'],
    queryFn: objectiveService.getAll,
  });
};

export const useStrategicObjectivesByPerspective = (perspective: string) => {
  return useQuery({
    queryKey: ['strategic-objectives', 'perspective', perspective],
    queryFn: () => objectiveService.getByPerspective(perspective),
    enabled: !!perspective,
  });
};

export const useStrategicObjectivesByDivision = (divisionId: string) => {
  return useQuery({
    queryKey: ['strategic-objectives', 'division', divisionId],
    queryFn: () => objectiveService.getByDivision(divisionId),
    enabled: !!divisionId,
  });
};

export const useCreateStrategicObjective = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: objectiveService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-objectives'] });
    },
  });
};

export const useUpdateStrategicObjective = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StrategicObjective> }) =>
      objectiveService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-objectives'] });
    },
  });
};

export const useDeleteStrategicObjective = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: objectiveService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-objectives'] });
    },
  });
};

// KPI Hooks
export const useKPIDefinitions = () => {
  return useQuery({
    queryKey: ['kpi-definitions'],
    queryFn: kpiService.getDefinitions,
  });
};

export const useKPIDefinitionsByDivision = (divisionId: string) => {
  return useQuery({
    queryKey: ['kpi-definitions', 'division', divisionId],
    queryFn: () => kpiService.getDefinitionsByDivision(divisionId),
    enabled: !!divisionId,
  });
};

export const useKPIData = (kpiId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['kpi-data', kpiId, startDate, endDate],
    queryFn: () => kpiService.getKPIData(kpiId, startDate, endDate),
    enabled: !!kpiId,
  });
};

export const useCreateKPIDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kpiService.createDefinition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-definitions'] });
      queryClient.invalidateQueries({ queryKey: ['objective-kpi-data'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-objectives'] });
      queryClient.invalidateQueries({ queryKey: ['objective-kpis'] });
    },
  });
};

export const useUpdateKPIDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<KPIDefinition> }) =>
      kpiService.updateDefinition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-definitions'] });
      queryClient.invalidateQueries({ queryKey: ['objective-kpi-data'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-objectives'] });
      queryClient.invalidateQueries({ queryKey: ['objective-kpis'] });
    },
  });
};

export const useDeleteKPIDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kpiService.deleteDefinition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-definitions'] });
      queryClient.invalidateQueries({ queryKey: ['objective-kpi-data'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-objectives'] });
      queryClient.invalidateQueries({ queryKey: ['objective-kpis'] });
    },
  });
};

export const useAddKPIData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kpiService.addKPIData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-data'] });
    },
  });
};

export const useUpdateKPIData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
      kpiService.updateKPIData(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-data'] });
    },
  });
};

export const useDeleteKPIData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kpiService.deleteKPIData(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-data'] });
    },
  });
};

// KPI-Objective relationship hooks
export const useKPIObjectives = (kpiId: string) => {
  return useQuery({
    queryKey: ['kpi-objectives', kpiId],
    queryFn: () => kpiService.getKPIObjectives(kpiId),
    enabled: !!kpiId,
  });
};

export const useObjectiveKPIs = (objectiveId: string) => {
  return useQuery({
    queryKey: ['objective-kpis', objectiveId],
    queryFn: () => kpiService.getObjectiveKPIs(objectiveId),
    enabled: !!objectiveId,
  });
};

// Get full KPI data for objectives (with counts)
export const useObjectiveKPIData = () => {
  return useQuery({
    queryKey: ['objective-kpi-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('objective_kpis')
        .select(`
          objective_id,
          kpi_id,
          kpi_definitions!inner(id, name)
        `);
      
      if (error) throw error;
      
      // Group by objective_id and count KPIs
      const kpiCounts: { [key: string]: number } = {};
      data?.forEach(item => {
        kpiCounts[item.objective_id] = (kpiCounts[item.objective_id] || 0) + 1;
      });
      
      return kpiCounts;
    },
    staleTime: 30000, // Cache for 30 seconds
  });
};

// Initiative Hooks
export const useStrategicInitiatives = () => {
  return useQuery({
    queryKey: ['strategic-initiatives'],
    queryFn: initiativeService.getAll,
  });
};

export const useStrategicInitiativesByObjective = (objectiveId: string) => {
  return useQuery({
    queryKey: ['strategic-initiatives', 'objective', objectiveId],
    queryFn: () => initiativeService.getByObjective(objectiveId),
    enabled: !!objectiveId,
  });
};

// Get initiative counts for all objectives
export const useObjectiveInitiativeData = () => {
  return useQuery({
    queryKey: ['objective-initiative-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_initiatives')
        .select('objective_id');
      
      if (error) throw error;
      
      // Group by objective_id and count initiatives
      const initiativeCounts: { [key: string]: number } = {};
      data?.forEach(item => {
        if (item.objective_id) {
          initiativeCounts[item.objective_id] = (initiativeCounts[item.objective_id] || 0) + 1;
        }
      });
      
      return initiativeCounts;
    },
    staleTime: 30000, // Cache for 30 seconds
  });
};

export const useCreateStrategicInitiative = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: initiativeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-initiatives'] });
      queryClient.invalidateQueries({ queryKey: ['objective-initiative-data'] });
    },
  });
};

export const useUpdateStrategicInitiative = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StrategicInitiative> }) =>
      initiativeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-initiatives'] });
      queryClient.invalidateQueries({ queryKey: ['objective-initiative-data'] });
    },
  });
};

export const useDeleteStrategicInitiative = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: initiativeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-initiatives'] });
      queryClient.invalidateQueries({ queryKey: ['objective-initiative-data'] });
    },
  });
};

// User Hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });
};

export const useUsersByDivision = (divisionId: string) => {
  return useQuery({
    queryKey: ['users', 'division', divisionId],
    queryFn: () => userService.getByDivision(divisionId),
    enabled: !!divisionId,
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: userService.getCurrentUser,
    retry: (failureCount, error) => {
      // Don't retry if user is not authenticated
      if (error?.message?.includes('not authenticated')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
      userService.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
      userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Dashboard Hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getOverviewStats,
  });
};

export const usePerformanceByPerspective = () => {
  return useQuery({
    queryKey: ['performance-by-perspective'],
    queryFn: dashboardService.getPerformanceByPerspective,
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: dashboardService.getRecentActivity,
  });
};

// Quarterly Commentary Hooks
export const useQuarterlyCommentaries = () => {
  return useQuery({
    queryKey: ['quarterly-commentaries'],
    queryFn: quarterlyCommentaryService.getAll,
  });
};

export const useQuarterlyCommentariesByInitiative = (initiativeId: string) => {
  return useQuery({
    queryKey: ['quarterly-commentaries', 'initiative', initiativeId],
    queryFn: () => quarterlyCommentaryService.getByInitiative(initiativeId),
    enabled: !!initiativeId,
  });
};

export const useQuarterlyCommentariesByYearQuarter = (year: number, quarter: string) => {
  return useQuery({
    queryKey: ['quarterly-commentaries', 'year-quarter', year, quarter],
    queryFn: () => quarterlyCommentaryService.getByYearQuarter(year, quarter),
    enabled: !!year && !!quarter,
  });
};

export const useQuarterlyCommentariesByDivision = (divisionId: string, year?: number, quarter?: string) => {
  return useQuery({
    queryKey: ['quarterly-commentaries', 'division', divisionId, year, quarter],
    queryFn: () => quarterlyCommentaryService.getByDivision(divisionId, year, quarter),
    enabled: !!divisionId,
  });
};

export const useQuarterlyCommentaryForInitiativeQuarter = (initiativeId: string, year: number, quarter: string) => {
  return useQuery({
    queryKey: ['quarterly-commentary', 'initiative-quarter', initiativeId, year, quarter],
    queryFn: () => quarterlyCommentaryService.getCommentaryForInitiativeQuarter(initiativeId, year, quarter),
    enabled: !!initiativeId && !!year && !!quarter,
  });
};

export const useCreateQuarterlyCommentary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quarterlyCommentaryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarterly-commentaries'] });
      queryClient.invalidateQueries({ queryKey: ['quarterly-commentary'] });
    },
  });
};

export const useUpdateQuarterlyCommentary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QuarterlyCommentary> }) =>
      quarterlyCommentaryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarterly-commentaries'] });
      queryClient.invalidateQueries({ queryKey: ['quarterly-commentary'] });
    },
  });
};

export const useDeleteQuarterlyCommentary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quarterlyCommentaryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarterly-commentaries'] });
      queryClient.invalidateQueries({ queryKey: ['quarterly-commentary'] });
    },
  });
};