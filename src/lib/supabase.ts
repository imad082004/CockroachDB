import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for the frontend (Respects RLS - Read Only mostly)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for the backend/admin (Bypasses RLS - Full Access)
// IMPORTANT: Only use this in server-side code (API routes, Server Actions, or Admin panel if secured)
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey);
