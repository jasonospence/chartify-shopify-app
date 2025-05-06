import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ejezmujvscltmsxfuiia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZXptdWp2c2NsdG1zeGZ1aWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0OTgyNzAsImV4cCI6MjA2MjA3NDI3MH0.4OH6p4HPviKtzVe9Lll2ShcZTwUyixppRN1o1g45DO8';

export const supabase = createClient(supabaseUrl, supabaseKey);
