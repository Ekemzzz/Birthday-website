import { createClient } from '@supabase/supabase-js'

/* Supabase client for the birthday wishes feature.
   Wishes are stored privately: visitors can INSERT a wish but can never read
   them — Row Level Security on the "wishes" table blocks all anonymous reads.
   Credentials come from your .env file:
     VITE_SUPABASE_URL       -> project URL, e.g. https://xxxx.supabase.co
     VITE_SUPABASE_ANON_KEY  -> publishable/anon key (safe to expose in browser) */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Stays null until both env vars are set, so the form fails gracefully
// instead of crashing when Supabase isn't configured yet.
export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null
