'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  CheckCircle, XCircle, Archive, Clock, AlertTriangle,
  ChevronDown, StickyNote, Calendar
} from 'lucide-react'
import type { Permit } from '@/components/dashboard/PermitDetailView'
import { PermitDetailView } from '@/components/dashboard/PermitDetailView'
import { Toast } from '@/components/ui/Toast'

// ─── Admin Control Panel ───────────────────────────────────────────────────────

interface AdminControlPanelProps {
  permit: Permit
  onUpdate: (updated: Permit) => void
}

function AdminControlPanel({ permit, onUpdate }: AdminControlPanelProps) {
  const [updating, setUpdating] = useState(false)
  const [showDenyModal, setShowDenyModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const patch = useCallback(async (body: Record<string, unknown>) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/permits/${permit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Update failed')
      }
      const updated = await res.json()
      onUpdate(updated)
      setToast({ message: 'Permit updated successfully', type: 'success' })
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Update failed', type: 'error' })
    } finally {
      setUpdating(false)
    }
  }, [permit.id, onUpdate])

  return (
    <>
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-[57px] z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#132452]/40 uppercase tracking-wider mr-2">Admin Controls</span>

            {/* Priority */}
            <div className="relative">
              <select
                value={permit.priority ?? 'medium'}
                onChange={(e) => patch({ priority: e.target.value })}
                disabled={updating}
                className="appearance-none pl-3 pr-8 py-1.5 bg-[#132452]/5 border border-[#132452]/10 rounded-lg text-xs font-semibold text-[#132452] focus:outline-none focus:ring-2 focus:ring-[#fa8c41]/30 disabled:opacity-50 cursor-pointer"
              >
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Standard</option>
                <option value="low">⚪ Low Priority</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#132452]/40 pointer-events-none" />
            </div>

            {/* Status actions */}
            {permit.status !== 'active' && permit.status !== 'completed' && permit.status !== 'denied' && (
              <button
                onClick={() => setShowApproveModal(true)}
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve
              </button>
            )}

            {permit.status !== 'completed' && permit.status !== 'denied' && permit.status !== 'declined' && (
              <button
                onClick={() => patch({ status: 'completed' })}
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#132452] hover:bg-[#1a2f63] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                <Archive className="w-3.5 h-3.5" />
                Complete
              </button>
            )}

            {permit.status !== 'denied' && permit.status !== 'declined' && (
              <button
                onClick={() => setShowDenyModal(true)}
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Deny
              </button>
            )}

            {(permit.status === 'denied' || permit.status === 'completed' || permit.status === 'declined') && (
              <button
                onClick={() => patch({ status: 'processing' })}
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5" />
                Reopen
              </button>
            )}

            <button
              onClick={() => setShowNotesModal(true)}
              disabled={updating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              <StickyNote className="w-3.5 h-3.5" />
              Add Note
            </button>

            {updating && (
              <span className="text-xs text-[#132452]/40 animate-pulse ml-1">Saving…</span>
            )}
          </div>
        </div>
      </div>

      {/* Deny Modal */}
      {showDenyModal && (
        <DenyModal
          onConfirm={(reason) => { setShowDenyModal(false); patch({ status: 'denied', denial_reason: reason }) }}
          onCancel={() => setShowDenyModal(false)}
        />
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <ApproveModal
          onConfirm={(date) => { setShowApproveModal(false); patch({ status: 'active', ...(date ? { estimated_completion_date: date } : {}) }) }}
          onCancel={() => setShowApproveModal(false)}
        />
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <NotesModal
          existing={permit.admin_notes ?? ''}
          onConfirm={(notes) => { setShowNotesModal(false); patch({ admin_notes: notes }) }}
          onCancel={() => setShowNotesModal(false)}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  )
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function DenyModal({ onConfirm, onCancel }: { onConfirm: (r: string) => void; onCancel: () => void }) {
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
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => onConfirm(reason)} disabled={!reason.trim()} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Deny Permit</button>
        </div>
      </div>
    </div>
  )
}

function ApproveModal({ onConfirm, onCancel }: { onConfirm: (d: string | null) => void; onCancel: () => void }) {
  const [date, setDate] = useState('')
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
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Estimated Completion Date (optional)
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-[#f8f9fc] border border-gray-200 rounded-xl text-sm text-[#132452] focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-colors"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => onConfirm(date || null)} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors">Approve</button>
        </div>
      </div>
    </div>
  )
}

function NotesModal({ existing, onConfirm, onCancel }: { existing: string; onConfirm: (n: string) => void; onCancel: () => void }) {
  const [notes, setNotes] = useState(existing)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <StickyNote className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-[#132452] text-lg">Admin Notes</h3>
            <p className="text-sm text-gray-500">Internal notes visible to admins only</p>
          </div>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add internal notes about this permit…"
          rows={5}
          className="w-full px-4 py-3 bg-[#f8f9fc] border border-gray-200 rounded-xl text-sm text-[#132452] placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors mb-4"
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => onConfirm(notes)} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">Save Notes</button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPermitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [permit, setPermit] = useState<Permit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const res = await fetch(`/api/permits/${id}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.error ?? 'Failed to load permit')
          return
        }
        setPermit(await res.json())
      } catch {
        setError('Network error — please try again')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#fa8c41] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#132452]/50 text-sm font-medium">Loading permit…</p>
        </div>
      </div>
    )
  }

  if (error || !permit) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="font-heading font-bold text-[#132452] text-xl mb-2">Permit Not Found</h2>
          <p className="text-[#132452]/50 text-sm mb-6">{error || 'This permit could not be found.'}</p>
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center gap-2 bg-[#132452] hover:bg-[#1a2f63] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            ← Admin Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AdminControlPanel permit={permit} onUpdate={setPermit} />
      <PermitDetailView permit={permit} backHref="/admin" backLabel="← Admin Dashboard" />
    </div>
  )
}
