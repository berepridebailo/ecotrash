import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type PointType = 'recycling' | 'trash' | 'compost' | 'hazardous'

export interface RecyclingPoint {
  id: string
  name: string
  type: PointType
  address: string
  latitude: number
  longitude: number
  schedule: string | null
  accepted_materials: string[] | null
  notes: string | null
  created_at: string
}
