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
      dogs: {
        Row: {
          id: string
          user_id: string
          name: string
          breed: string
          age: number
          weight: number
          activity_level: number
          image: string | null
          health_conditions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          breed: string
          age: number
          weight: number
          activity_level: number
          image?: string | null
          health_conditions?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          breed?: string
          age?: number
          weight?: number
          activity_level?: number
          image?: string | null
          health_conditions?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      // ... other tables
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}