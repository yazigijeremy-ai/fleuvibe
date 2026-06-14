import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from '../../utils/constants.js';

const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
