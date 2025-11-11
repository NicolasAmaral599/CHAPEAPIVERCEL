import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xgavqfjrzeieozkxqmsr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYXZxZmpyemVpZW96a3hxbXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NjE1NDEsImV4cCI6MjA3NjQzNzU0MX0.9ZVul_3ckaIVYU3ZExopIeJVir3Hp8zZei3qf_lk2pE';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);