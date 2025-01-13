export type Role = 'admin' | 'manager' | 'employee' | 'user';

export type Resource =
  | 'surveys'
  | 'responses'
  | 'groups'
  | 'locations'
  | 'users'
  | 'analytics'
  | 'reports';

export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'view'
  | 'export'
  | 'schedule';

export type Permission = `${Action}:${Resource}`;

export interface RoleDefinition {
  name: Role;
  description: string;
  permissions: Permission[];
  inherits?: Role[];
}

export interface UserPermissions {
  roles: Role[];
  customPermissions?: Permission[];
}
