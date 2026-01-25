import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.ZRrw' // valid JWT structure to prevent parsing errors

// This client is for client-side usage or server-side where we don't need admin privileges
// For strictly server-side operations (like custom auth), we might need the service_role key
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// If we need a service role client for admin tasks:
// export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
