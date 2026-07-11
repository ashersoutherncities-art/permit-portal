'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Calendar, ChevronRight, MapPin, Clock } from 'lucide-react'
import { PermitBadges, ActivityTimeline } from '@/components/dashboard/PermitCardShared'
import type { TimelineEntry } from '@/components/dashboard/PermitCardShared'
import { applyFilters } from '@/lib/filterPermits'
import type { FilterState } from '@/app/dashboard/page'

interface ActivePermit {
  id: string
  permit_type: string
  property_address: string
  city: string
  state: string
  zip: string
  status: string
  created_at: string
  estimated_cost: number | null
  estimated_completion_date: string | null
  reference_number: string | null
  priority: string | null
  photo_count: number | null
  ai_analysis_result: Record<string, unknown> | null
  admin_timeline: TimelineEntry[] | null
}

function CompletionDate({ date }: { date: string }) {
  const target = new Date(date)
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  const formatted = target.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="flex items-center gap-2 mt-2">
      <Clock className="w-3.5 h-3.5 text-[#132452]/40" />
      <span className="text-sm text-[#132452]/60">
        Est. completion: <span className="font-semibold text-[#132452]">{formatted}</span>
        {' '}
        {diffDays > 0 ? (
          <span className="text-emerald-600 text-xs">({diffDays} days remaining)</span>
        ) : (
          <span className="text-red-500 text-xs">(Overdue)</span>
        )}
      </span>
    </div>
  )
}

interface ActiveTabProps {
  refreshKey?: number
  filters?: FilterState
}

export function ActiveTab({ refreshKey = 0, filters }: ActiveTabProps) {
  const router = useRouter()
  const [permits, setPermits] = useState<ActivePermit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchPermits() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/permits')
        if (!res.ok) { setPermits([]); return; }
        const data: ActivePermit[] = await res.json()
        setPermits(data.filter(p => p.status === 'active'))
      } catch (err) {
        console.error('Error fetching active permits:', err)
        setPermits([])
      } finally {
        setLoading(false)
      }
    }
    fetchPermits()
  }, [refreshKey])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton h-40 rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  const filtered = filters ? applyFilters(permits, filters) : permits

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="font-heading text-xl font-bold text-navy-900 mb-2">
          No active permits
        </h3>
        <p className="text-navy-900/40 max-w-sm mx-auto">
          Your permits will appear here once they&apos;ve been approved and are active
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filtered.map((permit, idx) => (
        <div
          key={permit.id}
          className="border border-navy-50 rounded-xl p-5 card-hover bg-white group"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-heading font-bold text-navy-900 text-lg">
                  {permit.permit_type}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Active
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-navy-900/40">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Submitted {new Date(permit.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {permit.property_address}{permit.city ? `, ${permit.city}` : ''}{permit.state ? `, ${permit.state}` : ''}
                </span>
              </div>
              {permit.estimated_completion_date && (
                <CompletionDate date={permit.estimated_completion_date} />
              )}
              <PermitBadges
                referenceNumber={permit.reference_number}
                priority={permit.priority}
                photoCount={permit.photo_count}
                aiAnalysisResult={permit.ai_analysis_result}
              />
            </div>
            <button
              onClick={() => router.push(`/dashboard/permits/${permit.id}`)}
              className="flex items-center gap-1 text-orange-400 hover:text-orange-500 text-sm font-semibold transition-colors"
            >
              View Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {permit.estimated_cost != null && (
            <div className="bg-[#f8f9fc] rounded-xl p-3.5">
              <p className="text-xs font-semibold text-navy-900/40 uppercase tracking-wider mb-1">Estimated Cost</p>
              <p className="text-sm text-navy-900 font-medium">
                ${permit.estimated_cost.toLocaleString()}
              </p>
            </div>
          )}

          <ActivityTimeline
            createdAt={permit.created_at}
            timeline={permit.admin_timeline || []}
          />
        </div>
      ))}
    </div>
  )
}
