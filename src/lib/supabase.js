import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mdfzrqehdhvvhrqvinpo.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_L4n6vcDAs6Q2ujgsZqCKTw_mNRBX0pA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
