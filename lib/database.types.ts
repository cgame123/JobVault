export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      receipts: {
        Row: {
          id: string
          vendor: string
          amount: number
          date: string
          phone_number: string
          staff_id: string | null
          staff_name: string | null
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          vendor: string
          amount: number
          date: string
          phone_number: string
          staff_id?: string | null
          staff_name?: string | null
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          vendor?: string
          amount?: number
          date?: string
          phone_number?: string
          staff_id?: string | null
          staff_name?: string | null
          image_url?: string
          created_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          name: string
          phone_number: string
          role: string
          property: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone_number: string
          role: string
          property?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone_number?: string
          role?: string
          property?: string | null
          created_at?: string
        }
      }
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
