import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const MESAS_TABLE = 'mesas'
export const RESERVAS_TABLE = 'reservas'
export const HORARIOS_TABLE = 'horarios'