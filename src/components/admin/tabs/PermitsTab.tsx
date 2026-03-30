'use client'

import { useState, useEffect } from 'react'
import { PermitCard } from '../PermitCard'
import { Search, Filter } from 'lucide-react'

interface Permit {
  id: string
  customer_name: string
  permit_type: string
  status: string
  current_stage: string
  created_at: string
  ai_analysis_result?: any
}

export function PermitsTab() {
  const [permits, setPermits] = useState<Permit[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    // TODO: Fetch permits from API
    setLoading(false)
  }, [filter])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  const filters = [
    { id: 'all', label: 'All Permits' },
    { id: 'processing', label: 'Processing' },
    { id: 'active', label: 'Active' },
    { id: 'declined', label: 'Declined' },
  ]

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                filter === f.id
                  ? 'bg-navy-900 text-white shadow-glow-navy'
                  : 'bg-navy-50 text-navy-900/50 hover:bg-navy-100 hover:text-navy-900/70'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-900/30" />
          <input
            type="text"
            placeholder="Search permits..."
            className="pl-10 pr-4 py-2.5 bg-navy-50 border-0 rounded-xl text-sm text-navy-900 placeholder:text-navy-900/30 w-full sm:w-64 transition-colors focus:bg-white focus:ring-2 focus:ring-orange-400/20"
          />
        </div>
      </div>

      {permits.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Filter className="w-8 h-8 text-navy-900/20" />
          </div>
          <h3 className="font-heading text-xl font-bold text-navy-900 mb-2">No permits found</h3>
          <p className="text-navy-900/40">
            {filter === 'all' ? 'No permits in the system yet' : `No ${filter} permits found`}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {permits.map((permit) => (
            <PermitCard key={permit.id} permit={permit} />
          ))}
        </div>
      )}
    </div>
  )
}
