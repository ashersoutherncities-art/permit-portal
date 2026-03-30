'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Header } from '@/components/ui/Header'
import { DashboardTabs } from '@/components/dashboard/DashboardTabs'
import { FileText, Plus } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'unauthenticated') {
    redirect('/')
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
          <p className="text-navy-900/40 font-medium text-sm">Loading your permits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <h1 className="font-heading text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight">
              My Permits
            </h1>
            <p className="text-navy-900/50 mt-1.5 text-base">
              Track and manage your construction permit applications
            </p>
          </div>
          <button className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 btn-glow text-sm sm:text-base">
            <Plus className="w-5 h-5" />
            New Permit
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="animate-fade-up-delay-1 opacity-0">
          <DashboardTabs />
        </div>
      </main>
    </div>
  )
}
