export interface User {
  id: string;          // This will be Clerk's userId
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  organizationId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

export interface UserPermission {
  id: string;
  userId: string;    // Clerk's userId
  resource: string;
  action: string;
  conditions?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
