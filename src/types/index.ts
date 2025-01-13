export type Role = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  email: string;
  role: Role;
  organization_id: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
  organization_id: string;
}

export interface Group {
  id: string;
  name: string;
  organization_id: string;
}