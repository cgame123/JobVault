import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create clients only if configuration is available
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

// Function to get or create the Supabase client
export function getSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Check your environment variables.")
  }

  if (!_supabase) {
    try {
      _supabase = createClient(supabaseUrl!, supabaseAnonKey!)
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      throw new Error("Failed to initialize Supabase client")
    }
  }

  return _supabase
}

// Function to get or create the Supabase admin client
export function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase admin is not configured. Check your environment variables.")
  }

  if (!_supabaseAdmin) {
    try {
      _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    } catch (error) {
      console.error("Failed to initialize Supabase admin client:", error)
      throw new Error("Failed to initialize Supabase admin client")
    }
  }

  return _supabaseAdmin
}

// For backward compatibility - these will be initialized on first access
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (null as unknown as SupabaseClient)

export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : (null as unknown as SupabaseClient)
