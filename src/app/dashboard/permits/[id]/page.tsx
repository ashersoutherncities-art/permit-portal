'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { Permit } from '@/components/dashboard/PermitDetailView'
import { PermitDetailView } from '@/components/dashboard/PermitDetailView'

export default function PermitDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const [permit, setPermit] = useState<Permit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const res = await fetch(`/api/permits/${id}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.error ?? 'Failed to load permit')
          return
        }
        const data = await res.json()
        setPermit(data)
      } catch {
        setError('Network error — please try again')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#fa8c41] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#132452]/50 text-sm font-medium">Loading permit details…</p>
        </div>
      </div>
    )
  }

  if (error || !permit) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="font-heading font-bold text-[#132452] text-xl mb-2">Permit Not Found</h2>
          <p className="text-[#132452]/50 text-sm mb-6">{error || 'This permit could not be found or you don\'t have access.'}</p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-[#132452] hover:bg-[#1a2f63] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return <PermitDetailView permit={permit} backHref="/dashboard" backLabel="← My Permits" />
}
