'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface TimelineEntry {
  event: string
  date: string
  note?: string | null
}

interface ActivityTimelineProps {
  createdAt: string
  timeline: TimelineEntry[]
}

export function ActivityTimeline({ createdAt, timeline }: ActivityTimelineProps) {
  const [open, setOpen] = useState(false)

  const entries: TimelineEntry[] = [
    { event: 'Submitted', date: createdAt },
    ...timeline,
  ]

  const eventIcon = (event: string) => {
    if (event === 'Submitted') return '📋'
    if (event === 'Approved') return '✅'
    if (event === 'Denied') return '❌'
    if (event === 'Completed') return '🏁'
    return '🔄'
  }

  return (
    <div className="border-t border-gray-100 mt-3 pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#132452]/50 hover:text-[#fa8c41] transition-colors"
      >
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        View Activity ({entries.length})
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-sm leading-none mt-0.5">{eventIcon(entry.event)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#132452]">{entry.event}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {entry.note && (
                  <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface PermitBadgesProps {
  referenceNumber?: string | null
  priority?: string | null
  photoCount?: number | null
  aiAnalysisResult?: Record<string, unknown> | null
}

export function PermitBadges({ referenceNumber, priority, photoCount, aiAnalysisResult }: PermitBadgesProps) {
  const getRiskBadge = () => {
    if (!aiAnalysisResult) return null
    const score = (aiAnalysisResult as Record<string, unknown>).conditionScore as number | undefined
    if (score == null) return null
    if (score >= 8) return { label: '🟢 Low Risk', className: 'bg-emerald-50 text-emerald-700' }
    if (score >= 5) return { label: '🟡 Medium Risk', className: 'bg-yellow-50 text-yellow-700' }
    return { label: '🔴 High Risk', className: 'bg-red-50 text-red-700' }
  }

  const getPriorityBadge = () => {
    if (!priority) return null
    if (priority === 'high') return { label: '🔴 High Priority', className: 'bg-red-50 text-red-700' }
    if (priority === 'low') return { label: '⚪ Low Priority', className: 'bg-gray-100 text-gray-600' }
    return { label: '🟡 Standard', className: 'bg-orange-50 text-orange-600' }
  }

  const riskBadge = getRiskBadge()
  const priorityBadge = getPriorityBadge()

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {referenceNumber && (
        <span className="inline-flex items-center px-2 py-0.5 bg-[#132452]/5 text-[#132452] text-xs font-mono font-semibold rounded">
          {referenceNumber}
        </span>
      )}
      {priorityBadge && (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded ${priorityBadge.className}`}>
          {priorityBadge.label}
        </span>
      )}
      {riskBadge && (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded ${riskBadge.className}`}>
          {riskBadge.label}
        </span>
      )}
      {photoCount != null && photoCount > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
          📸 {photoCount} photo{photoCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
