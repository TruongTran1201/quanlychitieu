import { createClient } from '@supabase/supabase-js'

// Thay các giá trị bên dưới bằng thông tin dự án Supabase của bạn
const supabaseUrl = 'https://cytspcfhwqbntgorqfbd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5dHNwY2Zod3FibnRnb3JxZmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDAzNjUsImV4cCI6MjA2NTExNjM2NX0.X0mHBnk4OLkyjnGPqosoVChMB12XMDpcGgdYZbc1Rvg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
