'use client'

import { useState, useEffect, useCallback } from 'react'
import { Building2, MapPin, Calendar, ChevronDown, ChevronRight, FileText, User, AlertTriangle, CheckCircle, XCircle, Archive, Clock } from 'lucide-react'
import { Toast } from '@/components/ui/Toast'

interface CustomerInfo {
  id: string
  email: string
  name: string | null
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
  estimated_cost: number | null
  contract_signed: boolean
  upfront_paid: boolean
  denial_reason: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string | null
  customers: CustomerInfo | null
}

interface AdminProject {
  normalizedAddress: string
  displayAddress: string
  city: string
  state: string
  zip: string
  permits: AdminPermit[]
  latestDate: string
  customers: CustomerInfo[]
}

const STATUS_CONFIGS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  processing: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400', label: 'Processing' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', label: 'Active' },
  completed: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', label: 'Completed' },
  denied: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'Denied' },
  declined: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'Declined' },
}

function groupPermitsByAddress(permits: AdminPermit[]): AdminProject[] {
  const map = new Map<string, AdminProject>()

  for (const permit of permits) {
    const normalized = (permit.property_address || '').trim().toLowerCase()
    if (!normalized) continue

    if (!map.has(normalized)) {
      map.set(normalized, {
        normalizedAddress: normalized,
        displayAddress: (permit.property_address || '').trim(),
        city: permit.city || '',
        state: permit.state || '',
        zip: permit.zip || '',
        permits: [],
        latestDate: permit.created_at,
        customers: [],
      })
    }

    const project = map.get(normalized)!
    project.permits.push(permit)

    if (new Date(permit.created_at) > new Date(project.latestDate)) {
      project.latestDate = permit.created_at
    }

    // Collect unique customers
    if (permit.customers && !project.customers.find(c => c.id === permit.customers!.id)) {
      project.customers.push(permit.customers)
    }
  }

  const projects = Array.from(map.values())
  projects.sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime())
  projects.forEach(p => {
    p.permits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  })

  return projects
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

interface AdminPermitRowProps {
  permit: AdminPermit
  onStatusChange: (id: string, status: string, denialReason?: string) => Promise<void>
}

function AdminPermitRow({ permit, onStatusChange }: AdminPermitRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [showDenyModal, setShowDenyModal] = useState(false)
  const config = STATUS_CONFIGS[permit.status] || STATUS_CONFIGS.processing

  const handleAction = async (status: string, denialReason?: string) => {
    setUpdating(true)
    try {
      await onStatusChange(permit.id, status, denialReason)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <div className="border border-gray-100 rounded-xl overflow-hidden bg-white hover:shadow-sm transition-shadow">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-[#132452]/5 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-[#132452]/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#132452] text-sm truncate">{permit.permit_type}</p>
              <div className="flex flex-wrap items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(permit.created_at).toLocaleDateString()}
                </span>
                {permit.customers && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <User className="w-3 h-3" />
                    {permit.customers.name || permit.customers.email}
                  </span>
                )}
              </div>
            </div>
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 ${config.bg} ${config.text} text-xs font-semibold rounded-lg flex-shrink-0`}>
              <span className={`w-1.5 h-1.5 ${config.dot} rounded-full`} />
              {config.label}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 ml-3 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {expanded && (
          <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-3">
            {/* Mobile status */}
            <div className="sm:hidden">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${config.bg} ${config.text} text-xs font-semibold rounded-lg`}>
                <span className={`w-1.5 h-1.5 ${config.dot} rounded-full`} />
                {config.label}
              </span>
            </div>

            {/* Customer info */}
            {permit.customers && (
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Customer</p>
                <p className="text-sm font-medium text-[#132452]">{permit.customers.name || '—'}</p>
                <p className="text-xs text-gray-400">{permit.customers.email}</p>
              </div>
            )}

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
                </div>
              </div>
            </div>

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

            {/* Status actions */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {permit.status !== 'active' && permit.status !== 'completed' && permit.status !== 'denied' && (
                  <button
                    onClick={() => handleAction('active')}
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
              {updating && <p className="text-xs text-gray-400 mt-2">Updating…</p>}
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
    </>
  )
}

interface AdminProjectCardProps {
  project: AdminProject
  onStatusChange: (id: string, status: string, denialReason?: string) => Promise<void>
}

function AdminProjectCard({ project, onStatusChange }: AdminProjectCardProps) {
  const [expanded, setExpanded] = useState(false)

  const statusCounts: Record<string, number> = {}
  project.permits.forEach(p => {
    const key = p.status === 'declined' ? 'denied' : p.status
    statusCounts[key] = (statusCounts[key] || 0) + 1
  })

  return (
    <div
      className="border border-navy-50 rounded-xl overflow-hidden bg-white"
      style={{ borderLeft: '3px solid #132452' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-start justify-between gap-4 hover:bg-gray-50/30 transition-colors text-left"
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 bg-[#132452]/5 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Building2 className="w-5 h-5 text-[#132452]/60" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h3 className="font-heading font-bold text-[#132452] text-base leading-tight">
                {project.displayAddress}
              </h3>
              <span className="inline-flex items-center px-2.5 py-1 bg-[#fa8c41]/10 text-[#fa8c41] text-xs font-bold rounded-lg flex-shrink-0">
                {project.permits.length} permit{project.permits.length !== 1 ? 's' : ''}
              </span>
            </div>

            {(project.city || project.state || project.zip) && (
              <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{[project.city, project.state, project.zip].filter(Boolean).join(', ')}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {/* Status summary */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const config = STATUS_CONFIGS[status]
                  if (!config) return null
                  return (
                    <span key={status} className={`${config.text} text-xs font-medium`}>
                      {count} {config.label.toLowerCase()}
                    </span>
                  )
                })}
              </div>
              {/* Customers */}
              <div className="flex flex-wrap gap-1">
                {project.customers.map(c => (
                  <span key={c.id} className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">
                    <User className="w-3 h-3" />
                    {c.name || c.email}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                {new Date(project.latestDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[#fa8c41] text-sm font-semibold flex-shrink-0 mt-1">
          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-5 bg-gray-50/30 space-y-3">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
            All Permits — Newest First
          </p>
          {project.permits.map(permit => (
            <AdminPermitRow
              key={permit.id}
              permit={permit}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminProjectsTab() {
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [rawPermits, setRawPermits] = useState<AdminPermit[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/projects')
      if (!res.ok) throw new Error('Failed to load projects')
      const data: AdminPermit[] = await res.json()
      setRawPermits(data)
      setProjects(groupPermitsByAddress(data))
    } catch (err) {
      console.error('Error fetching admin projects:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleStatusChange = async (id: string, status: string, denialReason?: string) => {
    try {
      const body: Record<string, unknown> = { status }
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
      // Optimistically update rawPermits then regroup
      const newPermits = rawPermits.map(p => p.id === id ? { ...p, ...updated } : p)
      setRawPermits(newPermits)
      setProjects(groupPermitsByAddress(newPermits))
      setToast({ message: `Permit status updated to "${status}"`, type: 'success' })
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Update failed', type: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 bg-[#132452]/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Building2 className="w-8 h-8 text-[#132452]/30" />
        </div>
        <h3 className="text-xl font-bold text-[#132452] mb-2">No projects yet</h3>
        <p className="text-gray-400">Projects appear here once customers submit permit applications</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {projects.length} project{projects.length !== 1 ? 's' : ''} across all customers &middot; {rawPermits.length} total permits
          </p>
        </div>
        <div className="space-y-4">
          {projects.map(project => (
            <AdminProjectCard
              key={project.normalizedAddress}
              project={project}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  )
}
