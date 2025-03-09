import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjhynilecxatbqybqalr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqaHluaWxlY3hhdGJxeWJxYWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MjgxMDcsImV4cCI6MjA1NzEwNDEwN30.iMxWdrisC5V9_vX_cuYQiWxLCu7jcdJdm8TbTacx3Qg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
