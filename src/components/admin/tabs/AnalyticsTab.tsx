'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, FileText, AlertCircle, DollarSign, ArrowUpRight, BarChart3, Clock } from 'lucide-react'

interface AnalyticsData {
  total_processed: number
  pending_permits: number
  declined_permits: number
  revenue_total: number
}

export function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    total_processed: 0,
    pending_permits: 0,
    declined_permits: 0,
    revenue_total: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch analytics from API
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-36 rounded-xl" />
        ))}
      </div>
    )
  }

  const cards = [
    {
      label: 'Total Processed',
      value: analytics.total_processed,
      icon: TrendingUp,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Pending Permits',
      value: analytics.pending_permits,
      icon: Clock,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-400',
      trend: null,
      trendUp: false,
    },
    {
      label: 'Declined Permits',
      value: analytics.declined_permits,
      icon: AlertCircle,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      trend: '-5%',
      trendUp: true,
    },
    {
      label: 'Total Revenue',
      value: `$${analytics.revenue_total.toLocaleString()}`,
      icon: DollarSign,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      trend: '+23%',
      trendUp: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white border border-navy-50 rounded-xl p-5 card-hover"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                {card.trend && (
                  <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                    card.trendUp ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    <ArrowUpRight className={`w-3 h-3 ${!card.trendUp ? 'rotate-90' : ''}`} />
                    {card.trend}
                  </span>
                )}
              </div>
              <p className="text-sm text-navy-900/40 font-medium">{card.label}</p>
              <p className="font-heading text-2xl font-extrabold text-navy-900 mt-1">{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-navy-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-navy-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-navy-900/40" />
            </div>
            <h3 className="font-heading font-bold text-navy-900">Performance by County</h3>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-navy-900/20" />
              </div>
              <p className="text-navy-900/30 text-sm font-medium">County-level analytics coming soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-navy-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-navy-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-navy-900/40" />
            </div>
            <h3 className="font-heading font-bold text-navy-900">Avg Processing Time</h3>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-navy-900/20" />
              </div>
              <p className="text-navy-900/30 text-sm font-medium">Processing time analytics coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
