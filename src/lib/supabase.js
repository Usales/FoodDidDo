import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dahkegyfcrwtussgtuod.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaGtlZ3lmY3J3dHVzc2d0dW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzczOTQsImV4cCI6MjA3NDY1MzM5NH0.xeBhltT2hTmTWWB_3f9qxThqDL6A0gxjIgpwuMgNeBk'

export const supabase = createClient(supabaseUrl, supabaseKey)
