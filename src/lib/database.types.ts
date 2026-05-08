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
          username: string
          avatar_color: string
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          avatar_color?: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_color?: string
          created_at?: string
        }
      }
      scores: {
        Row: {
          id: string
          user_id: string
          score: number
          total_questions: number
          correct_answers: number
          time_taken: number
          created_at: string
          users: {
            username: string
            avatar_color: string
          }
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          total_questions: number
          correct_answers: number
          time_taken?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          total_questions?: number
          correct_answers?: number
          time_taken?: number
          created_at?: string
        }
      }
    }
  }
}
