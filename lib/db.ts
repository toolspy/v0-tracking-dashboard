import { getDatabase } from '@netlify/database'

const database = getDatabase()

export const sql = database.sql.bind(database)

export interface Tracking {
  id: string
  nomor_target: string
  ip: string | null
  user_agent: string | null
  latitude: number | null
  longitude: number | null
  city: string | null
  province: string | null
  country: string | null
  status_link: 'active' | 'opened' | 'expired'
  status_lokasi: 'pending' | 'gagal' | 'Lokasi Didapatkan'
  password_hash: string | null
  password_plain: string | null
  created_at: string
  expired_at: string
}
