

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Supabase URL:', url ? '있음' : '없음!!')
console.log('🔍 Supabase KEY:', key ? '있음' : '없음!!')

export const supabase = url && key
  ? createClient(url, key)
  : null