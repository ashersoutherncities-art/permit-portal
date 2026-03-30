'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Calendar, ChevronRight, Building2, Clock, MessageSquare } from 'lucide-react'

interface ActivePermit {
  id: string
  permit_type: string
  submitted_date: string
  current_step: string
  county_response?: string
  next_steps: string
  expected_approval: string
}

const stageConfig: Record<string, { bg: string; text: string; dot: string }> = {
  'Information Retrieval': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Awaiting Governing Approval': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  'Under Review by Government': { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  'Inspection Scheduled': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  'Inspection Passed': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
}

export function ActiveTab() {
  const [permits, setPermits] = useState<ActivePermit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch permits with status='active' from API
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton h-40 rounded-xl" />
        ))}
      </div>
    )
  }

  if (permits.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="font-heading text-xl font-bold text-navy-900 mb-2">
          No active permits
        </h3>
        <p className="text-navy-900/40 max-w-sm mx-auto">
          Your permits will appear here once they&apos;ve been submitted and are being processed
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {permits.map((permit, idx) => {
        const stage = stageConfig[permit.current_step] || { bg: 'bg-navy-50', text: 'text-navy-700', dot: 'bg-navy-500' }
        
        return (
          <div
            key={permit.id}
            className="border border-navy-50 rounded-xl p-5 card-hover bg-white group"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-heading font-bold text-navy-900 text-lg">
                    {permit.permit_type}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${stage.bg} ${stage.text} text-xs font-semibold rounded-lg`}>
                    <span className={`w-1.5 h-1.5 ${stage.dot} rounded-full`} />
                    {permit.current_step}
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-sm text-navy-900/40">
                  <Calendar className="w-3.5 h-3.5" />
                  Submitted {new Date(permit.submitted_date).toLocaleDateString()}
                </span>
              </div>
              <button className="flex items-center gap-1 text-orange-400 hover:text-orange-500 text-sm font-semibold transition-colors">
                View Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-[#f8f9fc] rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-navy-900/30" />
                  <p className="text-xs font-semibold text-navy-900/40 uppercase tracking-wider">Current Step</p>
                </div>
                <p className="text-sm text-navy-900 font-medium">{permit.current_step}</p>
              </div>
              <div className="bg-[#f8f9fc] rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-navy-900/30" />
                  <p className="text-xs font-semibold text-navy-900/40 uppercase tracking-wider">Expected Approval</p>
                </div>
                <p className="text-sm text-navy-900 font-medium">
                  {new Date(permit.expected_approval).toLocaleDateString()}
                </p>
              </div>
            </div>

            {permit.county_response && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <p className="text-sm font-semibold text-blue-900">County Response</p>
                </div>
                <p className="text-sm text-blue-800/80 ml-6">{permit.county_response}</p>
              </div>
            )}

            <div className="bg-navy-50/50 rounded-xl p-4">
              <p className="text-xs font-semibold text-navy-900/40 uppercase tracking-wider mb-1.5">Next Steps</p>
              <p className="text-sm text-navy-900/70">{permit.next_steps}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
