'use client'

import { useState } from 'react'
import { ProcessingTab } from './tabs/ProcessingTab'
import { ActiveTab } from './tabs/ActiveTab'
import { DeclinedTab } from './tabs/DeclinedTab'
import { Clock, CheckCircle, XCircle } from 'lucide-react'

type TabType = 'processing' | 'active' | 'declined'

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('processing')

  const tabs: { id: TabType; label: string; icon: any; color: string }[] = [
    { id: 'processing', label: 'Processing', icon: Clock, color: 'orange' },
    { id: 'active', label: 'Active', icon: CheckCircle, color: 'emerald' },
    { id: 'declined', label: 'Declined', icon: XCircle, color: 'red' },
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
                
                {/* Active indicator */}
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
          {activeTab === 'processing' && <ProcessingTab />}
          {activeTab === 'active' && <ActiveTab />}
          {activeTab === 'declined' && <DeclinedTab />}
        </div>
      </div>
    </div>
  )
}
