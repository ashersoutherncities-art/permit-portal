'use client'

import { useState } from 'react'
import { ProcessingTab } from './tabs/ProcessingTab'
import { ActiveTab } from './tabs/ActiveTab'
import { DeclinedTab } from './tabs/DeclinedTab'
import { ArchivedTab } from './tabs/ArchivedTab'
import { ProjectsTab } from './tabs/ProjectsTab'
import { Clock, CheckCircle, XCircle, Archive, Building2 } from 'lucide-react'
import type { FilterState } from '@/app/dashboard/page'

type TabType = 'processing' | 'active' | 'declined' | 'archived' | 'projects'

interface DashboardTabsProps {
  refreshKey?: number
  filters?: FilterState
}

export function DashboardTabs({ refreshKey = 0, filters }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('processing')

  const defaultFilters: FilterState = filters || { search: '', type: '', sort: 'newest' }

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'processing', label: 'Processing', icon: Clock },
    { id: 'active', label: 'Active', icon: CheckCircle },
    { id: 'declined', label: 'Declined', icon: XCircle },
    { id: 'archived', label: 'Archived', icon: Archive },
    { id: 'projects', label: 'Projects', icon: Building2 },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-navy-50 px-2 sm:px-6">
        <div className="flex gap-0 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 sm:px-5 py-4 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-navy-900'
                    : 'text-navy-900/40 hover:text-navy-900/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : ''}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs">{tab.label}</span>
                
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-orange-400 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-fade-in">
          {activeTab === 'processing' && <ProcessingTab refreshKey={refreshKey} filters={defaultFilters} />}
          {activeTab === 'active' && <ActiveTab refreshKey={refreshKey} filters={defaultFilters} />}
          {activeTab === 'declined' && <DeclinedTab refreshKey={refreshKey} filters={defaultFilters} />}
          {activeTab === 'archived' && <ArchivedTab refreshKey={refreshKey} filters={defaultFilters} />}
          {activeTab === 'projects' && <ProjectsTab refreshKey={refreshKey} />}
        </div>
      </div>
    </div>
  )
}
