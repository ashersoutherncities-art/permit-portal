'use client'

import { useState, useEffect } from 'react'
import { Clock, Upload, AlertTriangle, ChevronRight, FileText, Calendar, MapPin } from 'lucide-react'

interface ProcessingPermit {
  id: string
  permit_type: string
  submission_date: string
  current_stage: string
  missing_items: string[]
}

const WORKFLOW_STAGES = [
  'Submitted',
  'Information Retrieval',
  'Under Preparation',
  'Submitted to County',
  'Awaiting Approval',
]

function WorkflowTimeline({ currentStage }: { currentStage: string }) {
  const currentIdx = WORKFLOW_STAGES.indexOf(currentStage)

  return (
    <div className="flex items-center gap-1 mt-4">
      {WORKFLOW_STAGES.map((stage, i) => {
        const isCompleted = i < currentIdx
        const isCurrent = i === currentIdx
        const isPending = i > currentIdx

        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-orange-400'
                    : isCurrent
                    ? 'bg-orange-400 status-pulse'
                    : 'bg-navy-100'
                }`}
              />
              <span className={`text-[10px] mt-1.5 text-center leading-tight hidden lg:block max-w-[80px] ${
                isCurrent ? 'text-orange-500 font-semibold' : isCompleted ? 'text-navy-900/60' : 'text-navy-900/30'
              }`}>
                {stage}
              </span>
            </div>
            {i < WORKFLOW_STAGES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
                isCompleted ? 'bg-orange-400' : isCurrent ? 'bg-gradient-to-r from-orange-400 to-navy-100' : 'bg-navy-100'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ProcessingTab() {
  const [permits, setPermits] = useState<ProcessingPermit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch permits with status='processing' from API
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  if (permits.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Clock className="w-8 h-8 text-orange-400" />
        </div>
        <h3 className="font-heading text-xl font-bold text-navy-900 mb-2">
          No permits in processing
        </h3>
        <p className="text-navy-900/40 mb-6 max-w-sm mx-auto">
          Submit a new permit application to get started with the process
        </p>
        <button className="inline-flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 btn-glow">
          <FileText className="w-5 h-5" />
          Submit New Permit
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {permits.map((permit, idx) => (
        <div
          key={permit.id}
          className="border border-navy-50 rounded-xl p-5 card-hover bg-white group"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-heading font-bold text-navy-900 text-lg">
                  {permit.permit_type}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-500 text-xs font-semibold rounded-lg">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse-soft" />
                  In Progress
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-navy-900/40">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(permit.submission_date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {permit.current_stage}
                </span>
              </div>
            </div>
            <button className="flex items-center gap-1 text-orange-400 hover:text-orange-500 text-sm font-semibold transition-colors group-hover:gap-2">
              View Details
              <ChevronRight className="w-4 h-4 transition-transform" />
            </button>
          </div>

          <WorkflowTimeline currentStage={permit.current_stage} />

          {permit.missing_items.length > 0 && (
            <div className="mt-4 bg-red-50/50 border border-red-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm font-semibold text-red-900">Missing Information</p>
              </div>
              <ul className="text-sm text-red-800/80 space-y-1.5 ml-6">
                {permit.missing_items.map((item, idx) => (
                  <li key={idx} className="list-disc">{item}</li>
                ))}
              </ul>
              <button className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                <Upload className="w-4 h-4" />
                Upload Missing Documents
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
