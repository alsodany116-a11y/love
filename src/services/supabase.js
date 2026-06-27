import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nwchrjhdcwfzfzamorho.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Y2hyamhkY3dmemZ6YW1vcmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDYzMDUsImV4cCI6MjA5ODA4MjMwNX0.S5kOTX2-rkYgz3ACgYJLOvIa5Xhs3uWPFWuLleAjo00'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
