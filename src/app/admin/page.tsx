'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Header } from '@/components/ui/Header'
import { AdminTabs } from '@/components/admin/AdminTabs'
import { Shield } from 'lucide-react'

export default function AdminPage() {
  const { data: session, status } = useSession()

  if (status === 'unauthenticated') {
    redirect('/')
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
          <p className="text-navy-900/40 font-medium text-sm">Loading admin panel...</p>
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
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-orange-400" />
              </div>
              <h1 className="font-heading text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-navy-900/50 mt-1.5 text-base ml-11">
              Manage permits, pricing, and team workflow
            </p>
          </div>
        </div>

        {/* Admin Content */}
        <div className="animate-fade-up-delay-1 opacity-0">
          <AdminTabs />
        </div>
      </main>
    </div>
  )
}
