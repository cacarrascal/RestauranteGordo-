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

export const uploadImage = async (file) => {
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
  const { data, error } = await supabase.storage
    .from('mesas')
    .upload(fileName, file)
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('mesas')
    .getPublicUrl(fileName)
  
  return publicUrl
}