'use client'

import { useState, useEffect } from 'react'
import { Building2, MapPin, Calendar, ChevronDown, ChevronRight, FileText } from 'lucide-react'

interface Permit {
  id: string
  permit_type: string
  property_address: string
  city: string
  state: string
  zip: string
  status: string
  created_at: string
  scope_of_work: string | null
  estimated_cost: number | null
}

interface Project {
  normalizedAddress: string
  displayAddress: string
  city: string
  state: string
  zip: string
  permits: Permit[]
  latestDate: string
}

const STATUS_CONFIGS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  processing: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400', label: 'Processing' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', label: 'Active' },
  completed: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', label: 'Completed' },
  denied: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'Denied' },
  declined: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'Declined' },
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.processing
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 ${config.bg} ${config.text} text-xs font-semibold rounded-lg`}>
      <span className={`w-1.5 h-1.5 ${config.dot} rounded-full`} />
      {config.label}
    </span>
  )
}

function StatusSummary({ permits }: { permits: Permit[] }) {
  const counts: Record<string, number> = {}
  permits.forEach(p => {
    const key = p.status === 'declined' ? 'denied' : p.status
    counts[key] = (counts[key] || 0) + 1
  })
  const parts = Object.entries(counts).map(([status, count]) => {
    const config = STATUS_CONFIGS[status]
    if (!config) return null
    return (
      <span key={status} className={`${config.text} text-xs font-medium`}>
        {count} {config.label.toLowerCase()}
      </span>
    )
  }).filter(Boolean)

  return (
    <div className="flex flex-wrap gap-2">
      {parts}
    </div>
  )
}

interface PermitRowProps {
  permit: Permit
}

function PermitRow({ permit }: PermitRowProps) {
  const [expanded, setExpanded] = useState(false)
  const config = STATUS_CONFIGS[permit.status] || STATUS_CONFIGS.processing

  return (
    <div className="border border-navy-50 rounded-xl overflow-hidden">
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
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {new Date(permit.created_at).toLocaleDateString()}
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
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50 space-y-2 text-sm">
          <div className="sm:hidden mb-2">
            <StatusBadge status={permit.status} />
          </div>
          {permit.scope_of_work && (
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Scope of Work</p>
              <p className="text-[#132452]/70 text-sm">{permit.scope_of_work}</p>
            </div>
          )}
          {permit.estimated_cost != null && (
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Estimated Cost</p>
              <p className="text-[#132452] font-medium">${permit.estimated_cost.toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ProjectCardProps {
  project: Project
}

function ProjectCard({ project }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false)

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
              <h3 className="font-heading font-bold text-[#132452] text-lg leading-tight">
                {project.displayAddress}
              </h3>
              <span className="inline-flex items-center px-2.5 py-1 bg-[#fa8c41]/10 text-[#fa8c41] text-xs font-bold rounded-lg flex-shrink-0">
                {project.permits.length} permit{project.permits.length !== 1 ? 's' : ''}
              </span>
            </div>
            {(project.city || project.state || project.zip) && (
              <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  {[project.city, project.state, project.zip].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <StatusSummary permits={project.permits} />
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                Latest: {new Date(project.latestDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[#fa8c41] text-sm font-semibold flex-shrink-0 mt-1">
          <span className="hidden sm:inline">View</span>
          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-5 bg-gray-50/30 space-y-3">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
            All Permits — Newest First
          </p>
          {project.permits.map(permit => (
            <PermitRow key={permit.id} permit={permit} />
          ))}
        </div>
      )}
    </div>
  )
}

function groupPermitsByAddress(permits: Permit[]): Project[] {
  const map = new Map<string, Project>()

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
      })
    }

    const project = map.get(normalized)!
    project.permits.push(permit)
    if (new Date(permit.created_at) > new Date(project.latestDate)) {
      project.latestDate = permit.created_at
    }
  }

  // Sort projects by most recent, permits newest first within each
  const projects = Array.from(map.values())
  projects.sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime())
  projects.forEach(p => {
    p.permits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  })

  return projects
}

interface ProjectsTabProps {
  refreshKey?: number
}

export function ProjectsTab({ refreshKey = 0 }: ProjectsTabProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true)
      try {
        const res = await fetch('/api/permits')
        if (!res.ok) { setProjects([]); return }
        const data: Permit[] = await res.json()
        setProjects(groupPermitsByAddress(data))
      } catch (err) {
        console.error('Error fetching projects:', err)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [refreshKey])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton h-28 rounded-xl" />
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
        <h3 className="font-heading text-xl font-bold text-navy-900 mb-2">
          No projects yet
        </h3>
        <p className="text-navy-900/40 max-w-sm mx-auto">
          Submit a permit application to create your first project
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        {projects.length} project{projects.length !== 1 ? 's' : ''} &middot; grouped by property address
      </p>
      {projects.map(project => (
        <ProjectCard key={project.normalizedAddress} project={project} />
      ))}
    </div>
  )
}
