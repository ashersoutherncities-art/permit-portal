'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Header } from '@/components/ui/Header'
import { DashboardTabs } from '@/components/dashboard/DashboardTabs'
import { NewPermitModal } from '@/components/dashboard/NewPermitModal'
import { Toast } from '@/components/ui/Toast'
import { Plus, Search, ChevronDown } from 'lucide-react'

interface Permit {
  id: string
  status: string
  estimated_cost: number | null
  permit_type: string
  property_address: string
  created_at: string
}

interface StatsBarProps {
  permits: Permit[]
  loading: boolean
}

function StatsBar({ permits, loading }: StatsBarProps) {
  const total = permits.length
  const active = permits.filter(p => p.status === 'active').length
  const processing = permits.filter(p => p.status === 'processing').length
  const pipelineValue = permits.reduce((sum, p) => sum + (p.estimated_cost || 0), 0)

  const stats = [
    { label: 'Total Permits', value: total, prefix: '', suffix: '' },
    { label: 'Active', value: active, prefix: '', suffix: '' },
    { label: 'In Processing', value: processing, prefix: '', suffix: '' },
    { label: 'Pipeline Value', value: pipelineValue, prefix: '$', suffix: '', format: 'currency' },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#132452] rounded-2xl p-5 animate-pulse">
            <div className="h-3 bg-white/10 rounded mb-3 w-2/3" />
            <div className="h-8 bg-white/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-[#132452] rounded-2xl p-5">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">{stat.label}</p>
          <p className="text-[#fa8c41] text-2xl font-bold">
            {stat.format === 'currency'
              ? `$${stat.value.toLocaleString()}`
              : stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}

const PERMIT_TYPES = [
  'Residential Renovation', 'Commercial Build-Out', 'New Construction',
  'Electrical', 'Plumbing', 'HVAC', 'Roofing', 'Addition/Expansion',
]

export interface FilterState {
  search: string
  type: string
  sort: 'newest' | 'oldest' | 'highest_cost' | 'lowest_cost'
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [permits, setPermits] = useState<Permit[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: '',
    sort: 'newest',
  })

  useEffect(() => {
    if (!session?.user?.email) return
    setStatsLoading(true)
    fetch('/api/permits')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPermits(data)
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [session, refreshKey])

  const handlePermitSuccess = () => {
    setRefreshKey(k => k + 1)
    setToast({ message: 'Permit submitted successfully! We\'ll begin processing shortly.', type: 'success' })
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#fa8c41]/30 border-t-[#fa8c41] rounded-full animate-spin" />
          <p className="text-[#132452]/60 font-medium text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fc]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#132452] mb-4">Access Restricted</h2>
          <p className="text-gray-500 mb-6">Please sign in to view your permits</p>
          <button
            onClick={() => signIn(undefined, { callbackUrl: '/dashboard' })}
            className="bg-[#fa8c41] text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-500 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#132452]">My Permits</h1>
            <p className="text-[#132452]/50 mt-1">
              Welcome back, {session.user?.name?.split(' ')[0] || 'there'} — manage your construction permits
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-[#fa8c41] hover:bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            New Permit
          </button>
        </div>

        {/* Stats Bar */}
        <StatsBar permits={permits} loading={statsLoading} />

        {/* Search / Filter Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sticky top-2 z-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by address or permit type..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fc] rounded-xl text-sm text-[#132452] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fa8c41]/30 focus:bg-white transition-colors border-0"
            />
          </div>
          <div className="relative">
            <select
              value={filters.type}
              onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
              className="appearance-none pl-4 pr-9 py-2.5 bg-[#f8f9fc] rounded-xl text-sm text-[#132452] focus:outline-none focus:ring-2 focus:ring-[#fa8c41]/30 focus:bg-white transition-colors border-0 cursor-pointer w-full sm:w-auto"
            >
              <option value="">All Types</option>
              {PERMIT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filters.sort}
              onChange={e => setFilters(f => ({ ...f, sort: e.target.value as FilterState['sort'] }))}
              className="appearance-none pl-4 pr-9 py-2.5 bg-[#f8f9fc] rounded-xl text-sm text-[#132452] focus:outline-none focus:ring-2 focus:ring-[#fa8c41]/30 focus:bg-white transition-colors border-0 cursor-pointer w-full sm:w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_cost">Highest Cost</option>
              <option value="lowest_cost">Lowest Cost</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <DashboardTabs refreshKey={refreshKey} filters={filters} />
      </main>

      <NewPermitModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handlePermitSuccess}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
