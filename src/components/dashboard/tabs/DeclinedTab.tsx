'use client'

import { useState, useEffect } from 'react'
import { XCircle, RefreshCw, MessageCircle, AlertTriangle, FileX } from 'lucide-react'

interface DeclinedPermit {
  id: string
  permit_type: string
  decline_reason: string
  decline_notes: string
}

export function DeclinedTab() {
  const [permits, setPermits] = useState<DeclinedPermit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch permits with status='declined' from API
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton h-36 rounded-xl" />
        ))}
      </div>
    )
  }

  if (permits.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckIcon className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="font-heading text-xl font-bold text-navy-900 mb-2">
          No declined permits
        </h3>
        <p className="text-navy-900/40 max-w-sm mx-auto">
          All your permits are on track — great news!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {permits.map((permit, idx) => (
        <div
          key={permit.id}
          className="border border-red-100 rounded-xl p-5 card-hover bg-white group"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileX className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-navy-900 text-lg">
                  {permit.permit_type}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg mt-1">
                  <XCircle className="w-3 h-3" />
                  Declined
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 ml-0 sm:ml-13">
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm font-semibold text-red-900">Reason for Decline</p>
              </div>
              <p className="text-sm text-red-800/80 ml-6">{permit.decline_reason}</p>
            </div>

            {permit.decline_notes && (
              <div className="bg-[#f8f9fc] rounded-xl p-4">
                <p className="text-xs font-semibold text-navy-900/40 uppercase tracking-wider mb-1.5">Additional Details</p>
                <p className="text-sm text-navy-900/60">{permit.decline_notes}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button className="inline-flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 btn-glow text-sm">
                <RefreshCw className="w-4 h-4" />
                Resubmit Application
              </button>
              <button className="inline-flex items-center justify-center gap-2 border border-navy-100 hover:border-navy-200 text-navy-900/70 hover:text-navy-900 font-medium px-5 py-2.5 rounded-xl transition-all duration-200 text-sm">
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
