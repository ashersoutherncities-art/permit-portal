'use client'

import { useState } from 'react'
import { ChevronDown, Bot, Save, ArrowUpDown, StickyNote, User, FileText, Calendar } from 'lucide-react'

interface PermitCardProps {
  permit: {
    id: string
    customer_name: string
    permit_type: string
    status: string
    current_stage: string
    created_at: string
    ai_analysis_result?: any
  }
}

const WORKFLOW_STAGES = [
  'Submitted',
  'Information Retrieval',
  'Under Preparation',
  'Submitted to County',
  'Awaiting Approval',
  'Inspection Scheduled',
  'Inspection Passed',
  'Closed',
]

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  processing: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  declined: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  closed: { bg: 'bg-navy-50', text: 'text-navy-600', dot: 'bg-navy-500' },
}

export function PermitCard({ permit }: PermitCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState('')
  const [selectedStage, setSelectedStage] = useState(permit.current_stage)

  const handleStageUpdate = async () => {
    // TODO: Call API to update permit stage
    console.log(`Update permit ${permit.id} to stage ${selectedStage}`)
  }

  const colors = statusColors[permit.status] || statusColors.processing

  return (
    <div className={`border border-navy-50 rounded-xl overflow-hidden card-hover bg-white transition-all duration-300 ${expanded ? 'shadow-card-hover' : ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-[#f8f9fc]/50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-navy-900/40" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-navy-900">{permit.permit_type}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <User className="w-3 h-3 text-navy-900/30" />
              <p className="text-sm text-navy-900/50 truncate">{permit.customer_name}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${colors.bg} ${colors.text} text-xs font-semibold rounded-lg`}>
              <span className={`w-1.5 h-1.5 ${colors.dot} rounded-full`} />
              {permit.status}
            </span>
            <span className="text-xs text-navy-900/30 bg-navy-50 px-2.5 py-1 rounded-lg font-medium">
              {permit.current_stage}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-navy-900/30 ml-3 transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Mobile status badges */}
      {!expanded && (
        <div className="sm:hidden px-5 pb-4 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${colors.bg} ${colors.text} text-xs font-semibold rounded-lg`}>
            <span className={`w-1.5 h-1.5 ${colors.dot} rounded-full`} />
            {permit.status}
          </span>
          <span className="text-xs text-navy-900/30 bg-navy-50 px-2.5 py-1 rounded-lg font-medium">
            {permit.current_stage}
          </span>
        </div>
      )}

      {expanded && (
        <div className="border-t border-navy-50 p-5 bg-[#f8f9fc]/50 space-y-5 animate-fade-in">
          {/* AI Analysis */}
          {permit.ai_analysis_result?.missing_items && (
            <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-orange-400 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-bold text-orange-900">AI Analysis — Missing Items</p>
              </div>
              <ul className="text-sm text-orange-800/80 space-y-1.5 ml-9">
                {permit.ai_analysis_result.missing_items.map(
                  (item: string, idx: number) => (
                    <li key={idx} className="list-disc">{item}</li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* Workflow Management */}
          <div className="bg-white rounded-xl p-4 border border-navy-50">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpDown className="w-4 h-4 text-navy-900/40" />
              <label className="text-sm font-bold text-navy-900">
                Update Workflow Stage
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[#f8f9fc] border border-navy-100 rounded-xl text-sm text-navy-900 font-medium appearance-none cursor-pointer hover:border-navy-200 transition-colors"
              >
                {WORKFLOW_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStageUpdate}
                className="inline-flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 btn-glow"
              >
                <Save className="w-4 h-4" />
                Update
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl p-4 border border-navy-50">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-4 h-4 text-navy-900/40" />
              <label className="text-sm font-bold text-navy-900">
                Stage Notes
              </label>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this stage..."
              className="w-full px-4 py-3 bg-[#f8f9fc] border border-navy-100 rounded-xl text-sm text-navy-900 placeholder:text-navy-900/30 resize-none transition-colors hover:border-navy-200"
              rows={3}
            />
            <button className="mt-2 inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200">
              <Save className="w-4 h-4" />
              Save Notes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
