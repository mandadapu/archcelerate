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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          experience_years: number | null
          target_role: string | null
          onboarded_at: string | null
          diagnosis_completed: boolean | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          experience_years?: number | null
          target_role?: string | null
          onboarded_at?: string | null
          diagnosis_completed?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          experience_years?: number | null
          target_role?: string | null
          onboarded_at?: string | null
          diagnosis_completed?: boolean | null
          created_at?: string
        }
      }
      skill_diagnosis: {
        Row: {
          user_id: string
          quiz_answers: Json
          skill_scores: Json
          recommended_path: string
          completed_at: string
        }
        Insert: {
          user_id: string
          quiz_answers: Json
          skill_scores: Json
          recommended_path: string
          completed_at?: string
        }
        Update: {
          user_id?: string
          quiz_answers?: Json
          skill_scores?: Json
          recommended_path?: string
          completed_at?: string
        }
      }
      learning_events: {
        Row: {
          id: string
          user_id: string
          event_type: string
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          event_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          event_data?: Json
          created_at?: string
        }
      }
    }
  }
}
