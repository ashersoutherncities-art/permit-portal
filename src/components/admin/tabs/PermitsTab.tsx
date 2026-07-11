'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, ChevronDown, CheckCircle, XCircle, Archive, Clock, MapPin, Calendar, FileText, AlertTriangle, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Toast } from '@/components/ui/Toast'

interface TimelineEntry {
  event: string
  date: string
  note?: string | null
}

interface AdminPermit {
  id: string
  customer_id: string
  permit_type: string
  status: string
  property_address: string
  city: string
  state: string
  zip: string
  scope_of_work: string | null
  contractor_info: string | null
  estimated_cost: number | null
  contract_signed: boolean
  upfront_paid: boolean
  denial_reason: string | null
  admin_notes: string | null
  ai_analysis_result: unknown
  created_at: string
  updated_at: string | null
  reference_number: string | null
  priority: string | null
  estimated_completion_date: string | null
  photo_count: number | null
  admin_timeline: TimelineEntry[] | null
}

const STATUS_CONFIGS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  processing: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400', label: 'Processing' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', label: 'Active' },
  completed: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', label: 'Completed' },
  denied: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'Denied' },
  declined: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'Declined' },
}

interface DenyModalProps {
  onConfirm: (reason: string) => void
  onCancel: () => void
}

function DenyModal({ onConfirm, onCancel }: DenyModalProps) {
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-[#132452] text-lg">Deny Permit</h3>
            <p className="text-sm text-gray-500">Provide a reason for the applicant</p>
          </div>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why this permit is being denied…"
          rows={4}
          className="w-full px-4 py-3 bg-[#f8f9fc] border border-gray-200 rounded-xl text-sm text-[#132452] placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-colors mb-4"
          autoFocus
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim()}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Deny Permit
          </button>
        </div>
      </div>
    </div>
  )
}

interface ApproveModalProps {
  onConfirm: (completionDate: string | null) => void
  onCancel: () => void
}

function ApproveModal({ onConfirm, onCancel }: ApproveModalProps) {
  const [completionDate, setCompletionDate] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-[#132452] text-lg">Approve Permit</h3>
            <p className="text-sm text-gray-500">Optionally set an estimated completion date</p>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Estimated Completion Date (optional)
          </label>
          <input
            type="date"
            value={completionDate}
            onChange={(e) => setCompletionDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-[#f8f9fc] border border-gray-200 rounded-xl text-sm text-[#132452] focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-colors"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(completionDate || null)}
            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Approve Permit
          </button>
        </div>
      </div>
    </div>
  )
}

interface AdminPermitCardProps {
  permit: AdminPermit
  onStatusChange: (id: string, status: string, denialReason?: string, extras?: Record<string, unknown>) => Promise<void>
  onPriorityChange: (id: string, priority: string) => Promise<void>
}

function AdminPermitCard({ permit, onStatusChange, onPriorityChange }: AdminPermitCardProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [showDenyModal, setShowDenyModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const config = STATUS_CONFIGS[permit.status] || STATUS_CONFIGS.processing

  const handleAction = async (status: string, denialReason?: string, extras?: Record<string, unknown>) => {
    setUpdating(true)
    try {
      await onStatusChange(permit.id, status, denialReason, extras)
    } finally {
      setUpdating(false)
    }
  }

  const handlePriorityChange = async (priority: string) => {
    setUpdating(true)
    try {
      await onPriorityChange(permit.id, priority)
    } finally {
      setUpdating(false)
    }
  }

  const getPriorityLabel = (p: string | null) => {
    if (p === 'high') return '🔴 High Priority'
    if (p === 'low') return '⚪ Low Priority'
    return '🟡 Standard'
  }

  return (
    <>
      <div className="border border-gray-100 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 bg-[#132452]/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-[#132452]/40" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-[#132452] truncate">{permit.permit_type}</h3>
                {permit.reference_number && (
                  <span className="font-mono text-xs text-[#132452]/40 bg-[#132452]/5 px-1.5 py-0.5 rounded">
                    {permit.reference_number}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {permit.property_address}{permit.city ? `, ${permit.city}` : ''}{permit.state ? `, ${permit.state}` : ''}
                </span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${config.bg} ${config.text} text-xs font-semibold rounded-lg`}>
                <span className={`w-1.5 h-1.5 ${config.dot} rounded-full`} />
                {config.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                {new Date(permit.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 ml-3 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Mobile status */}
        {!expanded && (
          <div className="sm:hidden px-5 pb-4 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${config.bg} ${config.text} text-xs font-semibold rounded-lg`}>
              <span className={`w-1.5 h-1.5 ${config.dot} rounded-full`} />
              {config.label}
            </span>
          </div>
        )}

        {expanded && (
          <div className="border-t border-gray-100 p-5 bg-gray-50/50 space-y-4">
            {/* Priority control */}
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Priority</p>
              <div className="flex gap-2 flex-wrap">
                {(['high', 'medium', 'low'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePriorityChange(p)}
                    disabled={updating}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      permit.priority === p
                        ? 'bg-[#132452] text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {getPriorityLabel(p)}
                  </button>
                ))}
              </div>
            </div>

            {/* Permit details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {permit.estimated_cost != null && (
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Estimated Cost</p>
                  <p className="text-[#132452] font-medium">${permit.estimated_cost.toLocaleString()}</p>
                </div>
              )}
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Checklist</p>
                <div className="flex gap-3 text-xs">
                  <span className={permit.contract_signed ? 'text-emerald-600' : 'text-red-500'}>
                    {permit.contract_signed ? '✓' : '✗'} Contract
                  </span>
                  <span className={permit.upfront_paid ? 'text-emerald-600' : 'text-red-500'}>
                    {permit.upfront_paid ? '✓' : '✗'} Payment
                  </span>
                  {permit.photo_count != null && (
                    <span className="text-gray-500">📸 {permit.photo_count} photos</span>
                  )}
                </div>
              </div>
            </div>

            {permit.estimated_completion_date && (
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Estimated Completion</p>
                <p className="text-sm text-[#132452] font-medium">
                  {new Date(permit.estimated_completion_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}

            {permit.scope_of_work && (
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Scope of Work</p>
                <p className="text-sm text-[#132452]/70">{permit.scope_of_work}</p>
              </div>
            )}

            {permit.denial_reason && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-xs text-red-600/70 font-semibold uppercase tracking-wider mb-1">Denial Reason</p>
                <p className="text-sm text-red-700">{permit.denial_reason}</p>
              </div>
            )}

            {/* Activity Timeline */}
            {((permit.admin_timeline && permit.admin_timeline.length > 0) || true) && (
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Activity Timeline</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm">📋</span>
                    <div className="flex-1 text-xs">
                      <span className="font-semibold text-[#132452]">Submitted</span>
                      <span className="text-gray-400 ml-2">{new Date(permit.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {(permit.admin_timeline || []).map((entry, i) => {
                    const icon = entry.event === 'Approved' ? '✅' : entry.event === 'Denied' ? '❌' : entry.event === 'Completed' ? '🏁' : '🔄'
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-sm">{icon}</span>
                        <div className="flex-1 text-xs">
                          <span className="font-semibold text-[#132452]">{entry.event}</span>
                          <span className="text-gray-400 ml-2">{new Date(entry.date).toLocaleDateString()}</span>
                          {entry.note && <p className="text-gray-500 mt-0.5">{entry.note}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Status action buttons */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {permit.status !== 'active' && permit.status !== 'completed' && permit.status !== 'denied' && (
                  <button
                    onClick={() => setShowApproveModal(true)}
                    disabled={updating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                )}
                {permit.status !== 'completed' && permit.status !== 'denied' && (
                  <button
                    onClick={() => handleAction('completed')}
                    disabled={updating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#132452] hover:bg-[#1a2f63] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Archive className="w-4 h-4" />
                    Mark Complete
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/admin/permits/${permit.id}`) }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#132452]/5 hover:bg-[#132452]/10 text-[#132452] text-sm font-semibold rounded-xl transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Detail
                </button>
                {permit.status !== 'denied' && permit.status !== 'declined' && (
                  <button
                    onClick={() => setShowDenyModal(true)}
                    disabled={updating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Deny
                  </button>
                )}
                {(permit.status === 'denied' || permit.status === 'completed') && (
                  <button
                    onClick={() => handleAction('processing')}
                    disabled={updating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Clock className="w-4 h-4" />
                    Reopen
                  </button>
                )}
              </div>
              {updating && (
                <p className="text-xs text-gray-400 mt-2">Updating…</p>
              )}
            </div>
          </div>
        )}
      </div>

      {showDenyModal && (
        <DenyModal
          onConfirm={(reason) => {
            setShowDenyModal(false)
            handleAction('denied', reason)
          }}
          onCancel={() => setShowDenyModal(false)}
        />
      )}

      {showApproveModal && (
        <ApproveModal
          onConfirm={(completionDate) => {
            setShowApproveModal(false)
            handleAction('active', undefined, completionDate ? { estimated_completion_date: completionDate } : {})
          }}
          onCancel={() => setShowApproveModal(false)}
        />
      )}
    </>
  )
}

export function PermitsTab() {
  const [permits, setPermits] = useState<AdminPermit[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchPermits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/permits')
      if (!res.ok) throw new Error('Failed to load permits')
      const data = await res.json()
      setPermits(data)
    } catch (err) {
      console.error('Error fetching admin permits:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPermits()
  }, [fetchPermits])

  const handleStatusChange = async (id: string, status: string, denialReason?: string, extras?: Record<string, unknown>) => {
    try {
      const body: Record<string, unknown> = { status, ...extras }
      if (denialReason) body.denial_reason = denialReason

      const res = await fetch(`/api/permits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Update failed')
      }

      const updated = await res.json()
      setPermits(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
      setToast({ message: `Permit status updated to "${status}"`, type: 'success' })
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Update failed', type: 'error' })
    }
  }

  const handlePriorityChange = async (id: string, priority: string) => {
    try {
      const res = await fetch(`/api/permits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Update failed')
      }

      const updated = await res.json()
      setPermits(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
      setToast({ message: 'Priority updated', type: 'success' })
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Update failed', type: 'error' })
    }
  }

  const filters = [
    { id: 'all', label: 'All Permits' },
    { id: 'processing', label: 'Processing' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'denied', label: 'Denied' },
  ]

  const filtered = permits.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter
    const matchesSearch = !search || 
      p.permit_type.toLowerCase().includes(search.toLowerCase()) ||
      p.property_address.toLowerCase().includes(search.toLowerCase()) ||
      (p.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.reference_number || '').toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <>
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
                    ? 'bg-[#132452] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                }`}
              >
                {f.label}
                {f.id !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({permits.filter(p => p.status === f.id || (f.id === 'denied' && p.status === 'declined')).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search permits, ref#..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm text-[#132452] placeholder:text-gray-400 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#fa8c41]/30 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Processing', count: permits.filter(p => p.status === 'processing').length, color: 'text-orange-500' },
            { label: 'Active', count: permits.filter(p => p.status === 'active').length, color: 'text-emerald-600' },
            { label: 'Completed', count: permits.filter(p => p.status === 'completed').length, color: 'text-blue-600' },
            { label: 'Denied', count: permits.filter(p => p.status === 'denied' || p.status === 'declined').length, color: 'text-red-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Permits list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Filter className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-[#132452] mb-2">No permits found</h3>
            <p className="text-gray-400">
              {filter === 'all' ? 'No permits in the system yet' : `No ${filter} permits found`}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((permit) => (
              <AdminPermitCard
                key={permit.id}
                permit={permit}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
              />
            ))}
          </div>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  )
}
