import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovgmatnfpyuoazknbwkp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92Z21hdG5mcHl1b2F6a25id2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMjQ3MDAsImV4cCI6MjA2MTgwMDcwMH0.TmPd5ClXi-Tsevtoys2vWf5iq93o7JejmZWMw4zQUBQ';

export const supabase = createClient(supabaseUrl, supabaseKey);