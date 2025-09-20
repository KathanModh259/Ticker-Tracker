import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ggkppcgntudijqioavht.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdna3BwY2dudHVkaWpxaW9hdmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDA5NjQsImV4cCI6MjA3Mzg3Njk2NH0.MBOmz6n-pwHDphIG2BDKt1JcYmCABINv2lxD8DveFyY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});