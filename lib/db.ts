import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL!

const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  transform: {
    undefined: null,
  },
})

// Wrap client to return plain array (compatible with previous neon usage)
export const sql: typeof client = client

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
