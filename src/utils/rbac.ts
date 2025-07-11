import type { User } from '../types';

export interface Permission {
  resource: string;
  action: string;
  condition?: (user: User, resource?: any) => boolean;
}

export const ROLES = {
  ADMIN: 'Admin',
  EXECUTIVE: 'Executive',
  MANAGER: 'Manager',
  USER: 'User'
} as const;

export const RESOURCES = {
  USERS: 'users',
  DIVISIONS: 'divisions',
  OBJECTIVES: 'objectives',
  KPIS: 'kpis',
  INITIATIVES: 'initiatives',
  REPORTS: 'reports',
  STRATEGY_MAP: 'strategy_map',
  DASHBOARD: 'dashboard'
} as const;

export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage'
} as const;

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [ROLES.ADMIN]: [
    // Full access to everything
    { resource: '*', action: '*' }
  ],
  
  [ROLES.EXECUTIVE]: [
    // User management (except admins)
    { 
      resource: RESOURCES.USERS, 
      action: ACTIONS.READ 
    },
    { 
      resource: RESOURCES.USERS, 
      action: ACTIONS.UPDATE,
      condition: (_, targetUser) => targetUser?.role !== ROLES.ADMIN
    },
    { 
      resource: RESOURCES.USERS, 
      action: ACTIONS.CREATE,
      condition: (_, targetUser) => targetUser?.role !== ROLES.ADMIN
    },
    
    // Full access to business objects
    { resource: RESOURCES.DIVISIONS, action: ACTIONS.READ },
    { resource: RESOURCES.OBJECTIVES, action: '*' },
    { resource: RESOURCES.KPIS, action: '*' },
    { resource: RESOURCES.INITIATIVES, action: '*' },
    { resource: RESOURCES.REPORTS, action: ACTIONS.READ },
    { resource: RESOURCES.STRATEGY_MAP, action: ACTIONS.READ },
    { resource: RESOURCES.DASHBOARD, action: ACTIONS.READ }
  ],
  
  [ROLES.MANAGER]: [
    // Limited user management (only users in same division)
    { 
      resource: RESOURCES.USERS, 
      action: ACTIONS.READ,
      condition: (user, targetUser) => targetUser?.division_id === user.division_id
    },
    { 
      resource: RESOURCES.USERS, 
      action: ACTIONS.UPDATE,
      condition: (user, targetUser) => 
        targetUser?.division_id === user.division_id && targetUser?.role === ROLES.USER
    },
    { 
      resource: RESOURCES.USERS, 
      action: ACTIONS.CREATE,
      condition: (_, targetUser) => targetUser?.role === ROLES.USER
    },
    
    // Division-specific business objects
    { resource: RESOURCES.DIVISIONS, action: ACTIONS.READ },
    { 
      resource: RESOURCES.OBJECTIVES, 
      action: '*',
      condition: (user, objective) => objective?.division_id === user.division_id
    },
    { 
      resource: RESOURCES.KPIS, 
      action: '*',
      condition: (user, kpi) => kpi?.division_id === user.division_id
    },
    { 
      resource: RESOURCES.INITIATIVES, 
      action: '*',
      condition: (user, initiative) => {
        // Check if initiative belongs to user's division through objective
        return initiative?.objective?.division_id === user.division_id;
      }
    },
    { 
      resource: RESOURCES.REPORTS, 
      action: ACTIONS.READ,
      condition: (user, report) => report?.division_id === user.division_id
    },
    { resource: RESOURCES.STRATEGY_MAP, action: ACTIONS.READ },
    { resource: RESOURCES.DASHBOARD, action: ACTIONS.READ }
  ],
  
  [ROLES.USER]: [
    // Read-only for most resources
    { resource: RESOURCES.DIVISIONS, action: ACTIONS.READ },
    { 
      resource: RESOURCES.OBJECTIVES, 
      action: ACTIONS.READ,
      condition: (user, objective) => objective?.division_id === user.division_id
    },
    { 
      resource: RESOURCES.KPIS, 
      action: ACTIONS.READ,
      condition: (user, kpi) => kpi?.division_id === user.division_id
    },
    { 
      resource: RESOURCES.INITIATIVES, 
      action: ACTIONS.READ,
      condition: (user, initiative) => {
        // Check if initiative belongs to user's division through objective
        return initiative?.objective?.division_id === user.division_id;
      }
    },
    { 
      resource: RESOURCES.REPORTS, 
      action: ACTIONS.READ,
      condition: (user, report) => report?.division_id === user.division_id
    },
    { resource: RESOURCES.STRATEGY_MAP, action: ACTIONS.READ },
    { resource: RESOURCES.DASHBOARD, action: ACTIONS.READ }
  ]
};

export class RBACService {
  static hasPermission(
    user: User | null,
    resource: string,
    action: string,
    resourceData?: any
  ): boolean {
    if (!user) return false;
    
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    
    // Check for wildcard permissions (Admin)
    const wildcardPermission = permissions.find(p => p.resource === '*' && p.action === '*');
    if (wildcardPermission) return true;
    
    // Check for specific resource permissions
    const resourcePermissions = permissions.filter(p => p.resource === resource);
    
    for (const permission of resourcePermissions) {
      // Check if action matches (wildcard or specific)
      if (permission.action === '*' || permission.action === action) {
        // Check condition if present
        if (permission.condition) {
          return permission.condition(user, resourceData);
        }
        return true;
      }
    }
    
    return false;
  }
  
  static canManageUsers(user: User | null): boolean {
    return this.hasPermission(user, RESOURCES.USERS, ACTIONS.MANAGE);
  }
  
  static canCreateUsers(user: User | null): boolean {
    return this.hasPermission(user, RESOURCES.USERS, ACTIONS.CREATE);
  }
  
  static canUpdateUser(user: User | null, targetUser: User): boolean {
    return this.hasPermission(user, RESOURCES.USERS, ACTIONS.UPDATE, targetUser);
  }
  
  static canDeleteUser(user: User | null, targetUser: User): boolean {
    // Can't delete self
    if (user?.id === targetUser.id) return false;
    return this.hasPermission(user, RESOURCES.USERS, ACTIONS.DELETE, targetUser);
  }
  
  static canAccessDivisions(user: User | null): boolean {
    return this.hasPermission(user, RESOURCES.DIVISIONS, ACTIONS.READ);
  }
  
  static canManageDivisions(user: User | null): boolean {
    return this.hasPermission(user, RESOURCES.DIVISIONS, ACTIONS.MANAGE);
  }
  
  static canCreateObjectives(user: User | null): boolean {
    return this.hasPermission(user, RESOURCES.OBJECTIVES, ACTIONS.CREATE);
  }
  
  static canUpdateObjective(user: User | null, objective: any): boolean {
    return this.hasPermission(user, RESOURCES.OBJECTIVES, ACTIONS.UPDATE, objective);
  }
  
  static canCreateKPIs(user: User | null): boolean {
    return this.hasPermission(user, RESOURCES.KPIS, ACTIONS.CREATE);
  }
  
  static canUpdateKPI(user: User | null, kpi: any): boolean {
    return this.hasPermission(user, RESOURCES.KPIS, ACTIONS.UPDATE, kpi);
  }
  
  static canCreateInitiatives(user: User | null): boolean {
    return this.hasPermission(user, RESOURCES.INITIATIVES, ACTIONS.CREATE);
  }
  
  static canUpdateInitiative(user: User | null, initiative: any): boolean {
    return this.hasPermission(user, RESOURCES.INITIATIVES, ACTIONS.UPDATE, initiative);
  }
  
  static canAccessReports(user: User | null): boolean {
    return this.hasPermission(user, RESOURCES.REPORTS, ACTIONS.READ);
  }
  
  static canAccessStrategyMap(user: User | null): boolean {
    return this.hasPermission(user, RESOURCES.STRATEGY_MAP, ACTIONS.READ);
  }
  
  static getAccessibleDivisions(user: User | null, allDivisions: any[]): any[] {
    if (!user) return [];
    
    // Admin and Executive can see all divisions
    if (user.role === ROLES.ADMIN || user.role === ROLES.EXECUTIVE) {
      return allDivisions;
    }
    
    // Manager and User can only see their own division
    return allDivisions.filter(division => division.id === user.division_id);
  }
  
  static getRoleHierarchy(): string[] {
    return [ROLES.ADMIN, ROLES.EXECUTIVE, ROLES.MANAGER, ROLES.USER];
  }
  
  static isHigherRole(userRole: string, targetRole: string): boolean {
    const hierarchy = this.getRoleHierarchy();
    return hierarchy.indexOf(userRole) < hierarchy.indexOf(targetRole);
  }
  
  static getManageableRoles(userRole: string): string[] {
    const hierarchy = this.getRoleHierarchy();
    const userIndex = hierarchy.indexOf(userRole);
    
    if (userIndex === -1) return [];
    
    // Return all roles below the user's role
    return hierarchy.slice(userIndex + 1);
  }
}

// Export commonly used functions
export const hasPermission = RBACService.hasPermission.bind(RBACService);
export const canManageUsers = RBACService.canManageUsers.bind(RBACService);
export const canCreateUsers = RBACService.canCreateUsers.bind(RBACService);
export const canUpdateUser = RBACService.canUpdateUser.bind(RBACService);
export const canDeleteUser = RBACService.canDeleteUser.bind(RBACService);
export const getAccessibleDivisions = RBACService.getAccessibleDivisions.bind(RBACService);
export const getManageableRoles = RBACService.getManageableRoles.bind(RBACService);