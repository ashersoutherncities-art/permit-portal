'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Calendar, MapPin, ChevronRight } from 'lucide-react'
import { PermitBadges, ActivityTimeline } from '@/components/dashboard/PermitCardShared'
import type { TimelineEntry } from '@/components/dashboard/PermitCardShared'
import { applyFilters } from '@/lib/filterPermits'
import type { FilterState } from '@/app/dashboard/page'

interface ProcessingPermit {
  id: string
  permit_type: string
  property_address: string
  city: string
  state: string
  zip: string
  status: string
  created_at: string
  estimated_cost: number | null
  reference_number: string | null
  priority: string | null
  photo_count: number | null
  ai_analysis_result: Record<string, unknown> | null
  admin_timeline: TimelineEntry[] | null
}

const STEPS = ['Submitted', 'Under Review', 'Docs Verified', 'Approved', 'Active']

function getStepIndex(status: string): number {
  if (status === 'active') return 4
  if (status === 'processing') return 1
  return 0
}

function ProgressTracker({ status }: { status: string }) {
  const currentStep = getStepIndex(status)

  return (
    <div className="flex items-center gap-1 mt-4">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentStep
        const isCurrent = i === currentStep

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#fa8c41]'
                    : isCurrent
                    ? 'bg-[#fa8c41] animate-pulse'
                    : 'bg-gray-200'
                }`}
              />
              <span className={`text-[10px] mt-1.5 text-center leading-tight hidden lg:block max-w-[80px] ${
                isCurrent ? 'text-[#fa8c41] font-semibold' : isCompleted ? 'text-[#132452]/60' : 'text-gray-300'
              }`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
                isCompleted ? 'bg-[#fa8c41]' : isCurrent ? 'bg-gradient-to-r from-[#fa8c41] to-gray-200' : 'bg-gray-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function daysInQueue(createdAt: string): number {
  const created = new Date(createdAt).getTime()
  const now = Date.now()
  return Math.floor((now - created) / (1000 * 60 * 60 * 24))
}

interface ProcessingTabProps {
  refreshKey?: number
  filters?: FilterState
}

export function ProcessingTab({ refreshKey = 0, filters }: ProcessingTabProps) {
  const router = useRouter()
  const [permits, setPermits] = useState<ProcessingPermit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchPermits() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/permits')
        if (!res.ok) { setPermits([]); return; }
        const data: ProcessingPermit[] = await res.json()
        setPermits(data.filter(p => p.status === 'processing'))
      } catch (err) {
        console.error('Error fetching processing permits:', err)
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
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-32 rounded-xl" />
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
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Clock className="w-8 h-8 text-orange-400" />
        </div>
        <h3 className="font-heading text-xl font-bold text-navy-900 mb-2">
          No permits in processing
        </h3>
        <p className="text-navy-900/40 mb-6 max-w-sm mx-auto">
          Submit a new permit application to get started with the process
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filtered.map((permit, idx) => {
        const days = daysInQueue(permit.created_at)
        return (
          <div
            key={permit.id}
            className="border border-navy-50 rounded-xl p-5 card-hover bg-white group"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="font-heading font-bold text-navy-900 text-lg">
                    {permit.permit_type}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-500 text-xs font-semibold rounded-lg">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse-soft" />
                    In Progress
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#132452]/5 text-[#132452]/60 text-xs font-semibold rounded-lg">
                    <Clock className="w-3 h-3" />
                    {days} day{days !== 1 ? 's' : ''} in queue
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-navy-900/40">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(permit.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {permit.property_address}{permit.city ? `, ${permit.city}` : ''}{permit.state ? `, ${permit.state}` : ''}
                  </span>
                </div>
                <PermitBadges
                  referenceNumber={permit.reference_number}
                  priority={permit.priority}
                  photoCount={permit.photo_count}
                  aiAnalysisResult={permit.ai_analysis_result}
                />
              </div>
              <button
                onClick={() => router.push(`/dashboard/permits/${permit.id}`)}
                className="flex items-center gap-1 text-orange-400 hover:text-orange-500 text-sm font-semibold transition-colors group-hover:gap-2"
              >
                View Details
                <ChevronRight className="w-4 h-4 transition-transform" />
              </button>
            </div>

            <ProgressTracker status={permit.status} />

            <ActivityTimeline
              createdAt={permit.created_at}
              timeline={permit.admin_timeline || []}
            />
          </div>
        )
      })}
    </div>
  )
}
