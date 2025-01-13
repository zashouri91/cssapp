export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          organization_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          role: 'admin' | 'manager' | 'employee' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          role: 'admin' | 'manager' | 'employee' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          role?: 'admin' | 'manager' | 'employee' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      user_permissions: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          permission: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          permission: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          permission?: string
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string | null
          action: 'add_role' | 'remove_role' | 'add_permission' | 'remove_permission' | 'login' | 'logout' | 'access_denied'
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          action: 'add_role' | 'remove_role' | 'add_permission' | 'remove_permission' | 'login' | 'logout' | 'access_denied'
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          action?: 'add_role' | 'remove_role' | 'add_permission' | 'remove_permission' | 'login' | 'logout' | 'access_denied'
          details?: Json
          created_at?: string
        }
      }
    }
    Functions: {
      get_user_permissions: {
        Args: {
          p_user_id: string
          p_organization_id: string
        }
        Returns: {
          permission: string
        }[]
      }
    }
  }
}
