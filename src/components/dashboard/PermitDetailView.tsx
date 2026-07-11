'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeft, MapPin, Calendar, Clock, User, Sparkles, AlertTriangle,
  CheckCircle, XCircle, Camera, Shield, DollarSign, FileText,
  Home, Zap, TrendingUp, ChevronRight, Activity, StickyNote
} from 'lucide-react'
import type { VisionAnalysis } from '@/lib/visionAnalysis'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TimelineEntry {
  event: string
  date: string
  note?: string | null
}

export interface Permit {
  id: string
  reference_number: string | null
  permit_type: string
  status: string
  property_address: string
  city: string
  state: string
  zip: string
  county: string | null
  scope_of_work: string | null
  estimated_cost: number | null
  has_subs: boolean
  property_owned: boolean
  under_contract: boolean
  contract_signed: boolean
  estimate_signed: boolean
  upfront_paid: boolean
  ai_analysis_result: VisionAnalysis | null | Record<string, unknown>
  photo_count: number | null
  priority: string | null
  admin_timeline: TimelineEntry[] | null
  denial_reason: string | null
  admin_notes: string | null
  estimated_completion_date: string | null
  created_at: string
  updated_at: string | null
  customer_id: string
  resubmitted_from: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function daysInQueue(createdAt: string) {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000)
}

function getStatusConfig(status: string) {
  const map: Record<string, { bg: string; text: string; dot: string; label: string; ring: string }> = {
    processing: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400', label: 'In Progress', ring: 'ring-orange-200' },
    active:     { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active', ring: 'ring-emerald-200' },
    completed:  { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Completed', ring: 'ring-blue-200' },
    denied:     { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Denied', ring: 'ring-red-200' },
    declined:   { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Declined', ring: 'ring-red-200' },
  }
  return map[status] ?? map.processing
}

function getPriorityConfig(priority: string | null) {
  if (priority === 'high') return { label: 'High Priority', bg: 'bg-red-50', text: 'text-red-700' }
  if (priority === 'low')  return { label: 'Low Priority',  bg: 'bg-gray-100', text: 'text-gray-600' }
  return { label: 'Standard', bg: 'bg-orange-50', text: 'text-orange-600' }
}

function conditionColor(score: number) {
  if (score >= 8) return { bar: 'bg-emerald-500', text: 'text-emerald-600', label: 'Good' }
  if (score >= 5) return { bar: 'bg-yellow-400',  text: 'text-yellow-600',  label: 'Fair' }
  if (score >= 3) return { bar: 'bg-orange-500',  text: 'text-orange-600',  label: 'Poor' }
  return { bar: 'bg-red-500', text: 'text-red-600', label: 'Major Work' }
}

function severityConfig(severity: string) {
  if (severity === 'critical') return { bg: 'bg-red-600 text-white', label: 'Critical' }
  if (severity === 'high')     return { bg: 'bg-red-100 text-red-700', label: 'High' }
  if (severity === 'medium')   return { bg: 'bg-yellow-100 text-yellow-700', label: 'Medium' }
  return { bg: 'bg-green-100 text-green-700', label: 'Low' }
}

function priorityBadge(priority: string) {
  if (priority === 'required')    return 'bg-red-100 text-red-700'
  if (priority === 'recommended') return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-600'
}

function timelineIcon(event: string) {
  if (event === 'Submitted')    return '📋'
  if (event === 'Approved')     return '✅'
  if (event === 'Denied')       return '❌'
  if (event === 'Completed')    return '🏁'
  if (event === 'Status Updated') return '🔄'
  return '🔄'
}

function computeAiTotals(ai: VisionAnalysis | null | Record<string, unknown>) {
  if (!ai) return null
  const cb = (ai as VisionAnalysis).costBreakdown
  if (!cb || cb.length === 0) return null
  const totalLow  = cb.reduce((s, i) => s + i.lowEstimate,  0)
  const totalHigh = cb.reduce((s, i) => s + i.highEstimate, 0)
  return { totalLow, totalHigh }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-8 h-8 bg-[#132452]/5 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[#132452]" />
      </div>
      <h2 className="font-heading font-bold text-[#132452] text-base uppercase tracking-widest text-sm">
        {title}
      </h2>
    </div>
  )
}

function YesNoChip({ label, value, size = 'sm' }: { label: string; value: boolean; size?: 'sm' | 'xs' }) {
  const sz = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-lg ${sz} ${
      value ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
    }`}>
      {value ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </span>
  )
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  )
}

// ─── Estimate Comparison (Section 2 top) ──────────────────────────────────────

function EstimateComparison({ permit }: { permit: Permit }) {
  const clientEst = permit.estimated_cost
  const aiTotals  = computeAiTotals(permit.ai_analysis_result)

  if (!clientEst && !aiTotals) return null

  const aiMidpoint = aiTotals ? (aiTotals.totalLow + aiTotals.totalHigh) / 2 : null
  const variancePct = (clientEst && aiMidpoint && aiMidpoint > 0)
    ? Math.abs(clientEst - aiMidpoint) / aiMidpoint
    : null
  const hasVariance = variancePct !== null && variancePct > 0.20

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Client Estimate */}
        <div className="bg-[#132452] rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Client Estimate</p>
            {clientEst != null ? (
              <p className="text-[#fa8c41] text-2xl font-bold leading-none">{fmt(clientEst)}</p>
            ) : (
              <p className="text-white/40 text-sm italic">Not provided</p>
            )}
          </div>
        </div>

        {/* AI Estimate Range */}
        <div className="bg-white border-2 border-[#132452]/10 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-[#fa8c41]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-[#fa8c41]" />
          </div>
          <div>
            <p className="text-[#132452]/50 text-xs font-semibold uppercase tracking-widest mb-1">AI Estimate Range</p>
            {aiTotals ? (
              <p className="text-[#fa8c41] text-2xl font-bold leading-none">
                {fmt(aiTotals.totalLow)}&thinsp;–&thinsp;{fmt(aiTotals.totalHigh)}
              </p>
            ) : (
              <p className="text-[#132452]/30 text-sm italic">No AI analysis</p>
            )}
          </div>
        </div>
      </div>

      {/* Variance warning */}
      {hasVariance && variancePct !== null && (
        <div className="mt-3 flex items-center gap-2.5 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-yellow-700">
            ⚠️ Variance detected between client and AI estimates
            <span className="font-normal text-yellow-600 ml-1">
              ({Math.round(variancePct * 100)}% difference)
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Section 1 — Property Info ────────────────────────────────────────────────

function PropertyInfoSection({ permit }: { permit: Permit }) {
  return (
    <Section>
      <SectionHeading icon={Home} title="Property Info" />
      <div className="space-y-5">
        <div className="bg-[#f8f9fc] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#132452]/40 uppercase tracking-wider mb-1">Full Address</p>
          <p className="font-semibold text-[#132452] text-base">
            {permit.property_address}
          </p>
          <p className="text-[#132452]/60 text-sm mt-0.5">
            {[permit.city, permit.state, permit.zip].filter(Boolean).join(', ')}
            {permit.county ? ` · ${permit.county} County` : ''}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#132452]/40 uppercase tracking-wider mb-2.5">Property Status</p>
          <div className="flex flex-wrap gap-2">
            <YesNoChip label="Owned"           value={permit.property_owned} />
            <YesNoChip label="Under Contract"  value={permit.under_contract} />
            <YesNoChip label="Subs Secured"    value={permit.has_subs} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#132452]/40 uppercase tracking-wider mb-2.5">Documentation</p>
          <div className="flex flex-wrap gap-2">
            <YesNoChip label="Contract Signed"  value={permit.contract_signed} />
            <YesNoChip label="Estimate Signed"  value={permit.estimate_signed} />
            <YesNoChip label="Upfront Paid"     value={permit.upfront_paid} />
          </div>
        </div>
      </div>
    </Section>
  )
}

// ─── Section 2 — Scope & Cost ─────────────────────────────────────────────────

function ScopeAndCostSection({ permit }: { permit: Permit }) {
  const ai = permit.ai_analysis_result as VisionAnalysis | null

  return (
    <Section>
      <SectionHeading icon={DollarSign} title="Scope & Cost" />

      {/* Estimate comparison cards */}
      <EstimateComparison permit={permit} />

      {/* Scope of work */}
      {permit.scope_of_work && (
        <div className="bg-[#f8f9fc] rounded-xl p-4 mb-5">
          <p className="text-xs font-semibold text-[#132452]/40 uppercase tracking-wider mb-2">Scope of Work</p>
          <p className="text-sm text-[#132452]/80 leading-relaxed whitespace-pre-wrap">{permit.scope_of_work}</p>
        </div>
      )}

      {/* AI Analysis details */}
      {ai && ai.scopeDescription && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#132452]/5 to-[#fa8c41]/5 border border-[#132452]/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#fa8c41]" />
              <p className="text-xs font-bold text-[#132452] uppercase tracking-wider">AI Suggested Scope</p>
            </div>
            <p className="text-sm text-[#132452]/70 leading-relaxed">{ai.scopeDescription}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Overall Condition */}
            {ai.overallCondition && (
              <div className="bg-[#f8f9fc] rounded-xl p-3">
                <p className="text-xs text-[#132452]/40 font-semibold uppercase tracking-wider mb-1.5">Condition</p>
                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg ${
                  ai.overallCondition === 'good'             ? 'bg-emerald-50 text-emerald-700' :
                  ai.overallCondition === 'fair'             ? 'bg-yellow-50 text-yellow-700'  :
                  ai.overallCondition === 'poor'             ? 'bg-orange-50 text-orange-700'  :
                  'bg-red-50 text-red-700'
                }`}>
                  {ai.overallCondition.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
            )}

            {/* Condition Score */}
            {ai.conditionScore != null && (
              <div className="bg-[#f8f9fc] rounded-xl p-3">
                <p className="text-xs text-[#132452]/40 font-semibold uppercase tracking-wider mb-1.5">Score</p>
                <p className={`text-xl font-bold ${conditionColor(ai.conditionScore).text}`}>
                  {ai.conditionScore}<span className="text-xs font-normal text-[#132452]/30">/10</span>
                </p>
                <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${conditionColor(ai.conditionScore).bar}`}
                    style={{ width: `${ai.conditionScore * 10}%` }}
                  />
                </div>
              </div>
            )}

            {/* Budget Multiplier */}
            {ai.budgetMultiplier != null && (
              <div className="bg-[#f8f9fc] rounded-xl p-3">
                <p className="text-xs text-[#132452]/40 font-semibold uppercase tracking-wider mb-1.5">Multiplier</p>
                <p className="text-xl font-bold text-[#fa8c41]">{ai.budgetMultiplier}x</p>
                <p className="text-xs text-[#132452]/40 mt-0.5">
                  {ai.budgetMultiplier > 1.15 ? 'Above average' : ai.budgetMultiplier < 0.9 ? 'Below average' : 'Average scope'}
                </p>
              </div>
            )}
          </div>

          {/* Safety Flags */}
          {ai.safetyFlags && ai.safetyFlags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#132452]/40 uppercase tracking-wider mb-2">Safety Flags</p>
              <div className="flex flex-wrap gap-2">
                {ai.safetyFlags.map((flag, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100">
                    <Shield className="w-3 h-3" />
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Risk Factors */}
          {ai.riskFactors && ai.riskFactors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#132452]/40 uppercase tracking-wider mb-2">Risk Factors</p>
              <div className="flex flex-wrap gap-2">
                {ai.riskFactors.map((risk, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-lg border border-yellow-100">
                    <AlertTriangle className="w-3 h-3" />
                    {risk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  )
}

// ─── Section 3 — Cost Breakdown ───────────────────────────────────────────────

function CostBreakdownSection({ permit }: { permit: Permit }) {
  const ai = permit.ai_analysis_result as VisionAnalysis | null
  if (!ai) return null

  if (ai.costBreakdown && ai.costBreakdown.length > 0) {
    const totalLow  = ai.costBreakdown.reduce((s, i) => s + i.lowEstimate,  0)
    const totalHigh = ai.costBreakdown.reduce((s, i) => s + i.highEstimate, 0)

    return (
      <Section>
        <SectionHeading icon={TrendingUp} title="AI Cost Breakdown" />
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-[#132452]/40 uppercase tracking-wider pb-3 px-2">Trade</th>
                <th className="text-left text-xs font-semibold text-[#132452]/40 uppercase tracking-wider pb-3 px-2">Description</th>
                <th className="text-right text-xs font-semibold text-[#132452]/40 uppercase tracking-wider pb-3 px-2">Low</th>
                <th className="text-right text-xs font-semibold text-[#132452]/40 uppercase tracking-wider pb-3 px-2">High</th>
                <th className="text-center text-xs font-semibold text-[#132452]/40 uppercase tracking-wider pb-3 px-2">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ai.costBreakdown.map((row, i) => (
                <tr key={i} className="hover:bg-[#f8f9fc] transition-colors">
                  <td className="py-3 px-2 font-semibold text-[#132452]">{row.trade}</td>
                  <td className="py-3 px-2 text-[#132452]/60">{row.description}</td>
                  <td className="py-3 px-2 text-right font-medium text-[#132452]">{fmt(row.lowEstimate)}</td>
                  <td className="py-3 px-2 text-right font-medium text-[#fa8c41]">{fmt(row.highEstimate)}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded capitalize ${priorityBadge(row.priority)}`}>
                      {row.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#132452]/10 bg-[#132452]/5">
                <td className="py-3 px-2 font-bold text-[#132452]" colSpan={2}>Total Estimate</td>
                <td className="py-3 px-2 text-right font-bold text-[#132452]">{fmt(totalLow)}</td>
                <td className="py-3 px-2 text-right font-bold text-[#fa8c41]">{fmt(totalHigh)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>
    )
  }

  if (ai.recommendedScopeItems && ai.recommendedScopeItems.length > 0) {
    return (
      <Section>
        <SectionHeading icon={TrendingUp} title="Recommended Scope Items" />
        <div className="space-y-3">
          {ai.recommendedScopeItems.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-[#f8f9fc] rounded-xl">
              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded flex-shrink-0 mt-0.5 ${priorityBadge(item.priority)}`}>
                {item.priority}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#132452]">{item.item}</p>
                {item.estimatedCostRange && (
                  <p className="text-xs text-[#132452]/40 mt-0.5">{item.estimatedCostRange}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>
    )
  }

  return null
}

// ─── Section 4 — Photos & Issues ──────────────────────────────────────────────

function PhotosSection({ permit }: { permit: Permit }) {
  const ai = permit.ai_analysis_result as VisionAnalysis | null
  const photoCount = permit.photo_count ?? 0
  if (photoCount === 0 && (!ai?.identifiedIssues || ai.identifiedIssues.length === 0)) return null

  return (
    <Section>
      <SectionHeading icon={Camera} title="Photos & Identified Issues" />

      {photoCount > 0 && (
        <div className="flex items-center gap-2.5 p-4 bg-[#132452]/5 rounded-xl mb-5">
          <Camera className="w-5 h-5 text-[#132452]/40" />
          <p className="text-sm font-semibold text-[#132452]">
            📸 {photoCount} photo{photoCount !== 1 ? 's' : ''} were analyzed by AI
          </p>
        </div>
      )}

      {ai?.identifiedIssues && ai.identifiedIssues.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-[#132452]/40 uppercase tracking-wider">Issues Found</p>
          <div className="grid gap-3">
            {ai.identifiedIssues.map((issue, i) => {
              const sv = severityConfig(issue.severity)
              return (
                <div key={i} className="flex gap-3 p-4 bg-[#f8f9fc] rounded-xl border border-gray-100">
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded ${sv.bg}`}>
                      {sv.label}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 bg-[#132452]/5 text-[#132452]/60 text-xs font-semibold rounded capitalize">
                      {issue.category}
                    </span>
                  </div>
                  <p className="text-sm text-[#132452]/70 leading-relaxed flex-1">{issue.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Section>
  )
}

// ─── Section 5 — Timeline ─────────────────────────────────────────────────────

function TimelineSection({ permit }: { permit: Permit }) {
  const entries: TimelineEntry[] = [
    { event: 'Submitted', date: permit.created_at, note: null },
    ...(permit.admin_timeline ?? []),
  ]

  return (
    <Section>
      <SectionHeading icon={Activity} title="Activity Timeline" />
      <div className="relative pl-4">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100 rounded-full" />

        <div className="space-y-5">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-start gap-4 relative">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-sm flex-shrink-0 relative z-10">
                {timelineIcon(entry.event)}
              </div>
              <div className="flex-1 pb-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-semibold text-[#132452] text-sm">{entry.event}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {entry.note && (
                  <p className="text-sm text-[#132452]/50 mt-0.5 leading-relaxed">{entry.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── Section 6 — Admin Notes / Denial Reason ──────────────────────────────────

function NotesSection({ permit }: { permit: Permit }) {
  if (!permit.denial_reason && !permit.admin_notes) return null

  return (
    <div className="space-y-3">
      {permit.denial_reason && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Reason for Denial</p>
          </div>
          <p className="text-sm text-red-700 leading-relaxed">{permit.denial_reason}</p>
        </div>
      )}
      {permit.admin_notes && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <StickyNote className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Admin Notes</p>
          </div>
          <p className="text-sm text-blue-700 leading-relaxed">{permit.admin_notes}</p>
        </div>
      )}
    </div>
  )
}

// ─── Section 7 — Estimated Completion ─────────────────────────────────────────

function CompletionSection({ permit }: { permit: Permit }) {
  if (permit.status !== 'active' || !permit.estimated_completion_date) return null

  const target = new Date(permit.estimated_completion_date)
  const diffDays = Math.ceil((target.getTime() - Date.now()) / 86_400_000)
  const formatted = target.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <Section className="border-[#132452]/20">
      <SectionHeading icon={Calendar} title="Estimated Completion" />
      <div className="bg-gradient-to-br from-[#132452] to-[#1e3a7a] rounded-xl p-6 text-white text-center">
        <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Target Date</p>
        <p className="text-2xl font-bold mb-1">{formatted}</p>
        {diffDays > 0 ? (
          <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1 mt-2">
            <Clock className="w-3.5 h-3.5 text-[#fa8c41]" />
            <span className="text-[#fa8c41] text-sm font-semibold">{diffDays} days remaining</span>
          </div>
        ) : diffDays === 0 ? (
          <p className="text-[#fa8c41] font-semibold mt-1">Due today</p>
        ) : (
          <div className="inline-flex items-center gap-1.5 bg-red-500/20 rounded-lg px-3 py-1 mt-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-300" />
            <span className="text-red-300 text-sm font-semibold">{Math.abs(diffDays)} days overdue</span>
          </div>
        )}
      </div>
    </Section>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

interface PermitDetailViewProps {
  permit: Permit
  backHref: string
  backLabel?: string
}

export function PermitDetailView({ permit, backHref, backLabel = '← My Permits' }: PermitDetailViewProps) {
  const router = useRouter()
  const statusCfg   = getStatusConfig(permit.status)
  const priorityCfg = getPriorityConfig(permit.priority)
  const days        = daysInQueue(permit.created_at)

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push(backHref)}
            className="flex items-center gap-2 text-sm font-semibold text-[#132452]/60 hover:text-[#132452] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{backLabel}</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            {permit.reference_number && (
              <span className="font-mono text-xs font-bold text-[#132452]/50 bg-[#132452]/5 px-2 py-1 rounded hidden sm:inline">
                {permit.reference_number}
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg ${statusCfg.bg} ${statusCfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Page Title */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {permit.reference_number && (
                  <span className="font-mono text-sm font-bold text-[#132452]/40">{permit.reference_number}</span>
                )}
                <ChevronRight className="w-4 h-4 text-[#132452]/20" />
                <span className="font-heading font-bold text-[#132452] text-xl sm:text-2xl">{permit.permit_type}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[#132452]/50">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {permit.property_address}{permit.city ? `, ${permit.city}` : ''}{permit.state ? `, ${permit.state}` : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Submitted {new Date(permit.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {days} day{days !== 1 ? 's' : ''} in queue
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-xl ring-2 ${statusCfg.ring} ${statusCfg.bg} ${statusCfg.text}`}>
                <span className={`w-2 h-2 rounded-full ${statusCfg.dot} ${permit.status === 'processing' ? 'animate-pulse' : ''}`} />
                {statusCfg.label}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-xl ${priorityCfg.bg} ${priorityCfg.text}`}>
                {priorityCfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* Sections */}
        <PropertyInfoSection  permit={permit} />
        <ScopeAndCostSection  permit={permit} />
        <CostBreakdownSection permit={permit} />
        <PhotosSection        permit={permit} />
        <TimelineSection      permit={permit} />
        <NotesSection         permit={permit} />
        <CompletionSection    permit={permit} />
      </div>
    </div>
  )
}
