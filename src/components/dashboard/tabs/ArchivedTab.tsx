'use client'

import { useState, useEffect } from 'react'
import { Archive, CheckCircle, XCircle, Calendar, MapPin, Download, RefreshCw, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { NewPermitModal } from '@/components/dashboard/NewPermitModal'
import { Toast } from '@/components/ui/Toast'
import { PermitBadges, ActivityTimeline } from '@/components/dashboard/PermitCardShared'
import type { TimelineEntry } from '@/components/dashboard/PermitCardShared'
import { applyFilters } from '@/lib/filterPermits'
import type { FilterState } from '@/app/dashboard/page'

interface ArchivedPermit {
  id: string
  permit_type: string
  property_address: string
  city: string
  state: string
  zip: string
  status: string
  created_at: string
  updated_at: string | null
  scope_of_work: string | null
  denial_reason: string | null
  estimated_cost: number | null
  contractor_info: string | null
  contract_signed: boolean
  upfront_paid: boolean
  reference_number: string | null
  priority: string | null
  photo_count: number | null
  ai_analysis_result: Record<string, unknown> | null
  admin_timeline: TimelineEntry[] | null
}

interface ArchivedTabProps {
  refreshKey?: number
  filters?: FilterState
}

export function ArchivedTab({ refreshKey = 0, filters }: ArchivedTabProps) {
  const router = useRouter()
  const [permits, setPermits] = useState<ArchivedPermit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resubmitPermit, setResubmitPermit] = useState<ArchivedPermit | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPermits() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/permits')
        if (!res.ok) { setPermits([]); return; }
        const data: ArchivedPermit[] = await res.json()
        setPermits(data.filter(p => p.status === 'completed' || p.status === 'denied'))
      } catch (err) {
        console.error('Error fetching archived permits:', err)
        setPermits([])
      } finally {
        setLoading(false)
      }
    }
    fetchPermits()
  }, [refreshKey])

  const handleResubmitSuccess = () => {
    setToast('Your permit has been resubmitted and is back in the processing queue.')
    setResubmitPermit(null)
  }

  const getStatusConfig = (status: string) => {
    if (status === 'completed') {
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
        label: 'Completed',
        icon: CheckCircle,
        borderColor: 'border-emerald-100',
      }
    }
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      dot: 'bg-red-500',
      label: 'Denied',
      icon: XCircle,
      borderColor: 'border-red-100',
    }
  }

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
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Archive className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-heading text-xl font-bold text-navy-900 mb-2">
          No archived permits
        </h3>
        <p className="text-navy-900/40 max-w-sm mx-auto">
          Completed and denied permits will appear here
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {filtered.map((permit, idx) => {
          const config = getStatusConfig(permit.status)
          const StatusIcon = config.icon
          const dateLabel = permit.updated_at
            ? new Date(permit.updated_at).toLocaleDateString()
            : new Date(permit.created_at).toLocaleDateString()

          return (
            <div
              key={permit.id}
              className={`border ${config.borderColor} rounded-xl p-5 bg-white`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-heading font-bold text-navy-900 text-lg">
                      {permit.permit_type}
                    </h3>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${config.bg} ${config.text} text-xs font-semibold rounded-lg`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-navy-900/40">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {permit.status === 'completed' ? 'Completed' : 'Denied'} {dateLabel}
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
              </div>

              {/* CHANGE 7: Denial reason shown prominently */}
              {permit.status === 'denied' && permit.denial_reason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-3 flex gap-2">
                  <span className="text-lg leading-none">❌</span>
                  <div>
                    <p className="text-xs font-bold text-red-700 mb-0.5">Reason for denial:</p>
                    <p className="text-sm text-red-700">{permit.denial_reason}</p>
                  </div>
                </div>
              )}

              {/* Scope of work */}
              {permit.scope_of_work && (
                <div className="bg-[#f8f9fc] rounded-xl p-3.5 mb-4">
                  <p className="text-xs font-semibold text-navy-900/40 uppercase tracking-wider mb-1.5">Scope of Work</p>
                  <p className="text-sm text-navy-900/60 line-clamp-2">{permit.scope_of_work}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push(`/dashboard/permits/${permit.id}`)}
                  className="inline-flex items-center justify-center gap-2 border border-[#132452]/15 hover:border-[#132452]/30 text-[#132452]/70 hover:text-[#132452] font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm"
                >
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </button>
                {permit.status === 'denied' ? (
                  <button
                    onClick={() => setResubmitPermit(permit)}
                    className="inline-flex items-center justify-center gap-2 bg-[#fa8c41] hover:bg-orange-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Resubmit Application
                  </button>
                ) : (
                  <button
                    onClick={() => alert('Download feature coming soon!')}
                    className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-[#132452]/70 hover:text-[#132452] font-medium px-5 py-2.5 rounded-xl transition-all duration-200 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download Summary
                  </button>
                )}
              </div>

              <ActivityTimeline
                createdAt={permit.created_at}
                timeline={permit.admin_timeline || []}
              />
            </div>
          )
        })}
      </div>

      {resubmitPermit && (
        <NewPermitModal
          isOpen={true}
          onClose={() => setResubmitPermit(null)}
          onSuccess={handleResubmitSuccess}
          isResubmit={true}
          prefill={{
            permit_type: resubmitPermit.permit_type,
            property_address: resubmitPermit.property_address,
            city: resubmitPermit.city,
            state: resubmitPermit.state,
            zip: resubmitPermit.zip,
            scope_of_work: resubmitPermit.scope_of_work || '',
            estimated_cost: resubmitPermit.estimated_cost?.toString() || '',
            has_subs: false,
            contract_signed: resubmitPermit.contract_signed,
            upfront_paid: resubmitPermit.upfront_paid,
            resubmitted_from: resubmitPermit.id,
          }}
        />
      )}

      {toast && (
        <Toast message={toast} type="success" onClose={() => setToast(null)} />
      )}
    </>
  )
}
