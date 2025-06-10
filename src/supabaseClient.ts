import { createClient } from '@supabase/supabase-js'

// Thay các giá trị bên dưới bằng thông tin dự án Supabase của bạn
const supabaseUrl = 'https://jruxzwmjvtdzmdvtohpm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydXh6d21qdnRkem1kdnRvaHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NTczMjgsImV4cCI6MjA2NTEzMzMyOH0.gRQZBw1gnO0VPdfiI-ENMjcqc3fi_k_ZTQDrGKF1MNM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
