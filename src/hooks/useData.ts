import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  divisionService, 
  objectiveService, 
  kpiService, 
  initiativeService, 
  userService, 
  dashboardService 
} from '../services/database';
import type { Division, StrategicObjective, KPIDefinition, StrategicInitiative } from '../types';

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
    },
  });
};

export const useDeleteKPIDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kpiService.deleteDefinition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-definitions'] });
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

export const useCreateStrategicInitiative = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: initiativeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-initiatives'] });
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
    },
  });
};

export const useDeleteStrategicInitiative = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: initiativeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-initiatives'] });
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