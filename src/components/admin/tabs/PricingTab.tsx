'use client'

import { useState, useEffect } from 'react'
import { Plus, Building2, FileText, DollarSign, Clock, Table } from 'lucide-react'

interface CountyPricing {
  id: string
  county_name: string
  permit_type: string
  base_cost: number
  processing_days: number
  required_docs: string[]
}

export function PricingTab() {
  const [pricing, setPricing] = useState<CountyPricing[]>([])
  const [loading, setLoading] = useState(true)
  const [newEntry, setNewEntry] = useState({
    county_name: '',
    permit_type: '',
    base_cost: '',
    processing_days: '',
  })

  useEffect(() => {
    // TODO: Fetch pricing data from API
    setLoading(false)
  }, [])

  const handleAddEntry = async () => {
    // TODO: Call API to add new pricing entry
    console.log('Add new pricing entry:', newEntry)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-48 rounded-xl" />
        <div className="skeleton h-32 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add New Entry Card */}
      <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg">Add County Pricing</h3>
            <p className="text-white/50 text-sm">
              Set permit pricing by county for quoting and revenue tracking
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="County Name"
              value={newEntry.county_name}
              onChange={(e) =>
                setNewEntry({ ...newEntry, county_name: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:bg-white/15 focus:border-orange-400/50 transition-all"
            />
          </div>
          <div className="relative">
            <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Permit Type (Electrical, Mechanical, etc.)"
              value={newEntry.permit_type}
              onChange={(e) =>
                setNewEntry({ ...newEntry, permit_type: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:bg-white/15 focus:border-orange-400/50 transition-all"
            />
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="number"
              placeholder="Base Cost ($)"
              value={newEntry.base_cost}
              onChange={(e) =>
                setNewEntry({ ...newEntry, base_cost: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:bg-white/15 focus:border-orange-400/50 transition-all"
            />
          </div>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="number"
              placeholder="Processing Days"
              value={newEntry.processing_days}
              onChange={(e) =>
                setNewEntry({ ...newEntry, processing_days: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:bg-white/15 focus:border-orange-400/50 transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleAddEntry}
          className="inline-flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 btn-glow text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      {/* Pricing Table */}
      {pricing.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Table className="w-8 h-8 text-navy-900/20" />
          </div>
          <h3 className="font-heading text-xl font-bold text-navy-900 mb-2">No pricing data yet</h3>
          <p className="text-navy-900/40 max-w-sm mx-auto">
            Start by adding county permit pricing above to build your pricing database
          </p>
        </div>
      ) : (
        <div className="bg-white border border-navy-50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-50 bg-[#f8f9fc]">
                  <th className="px-5 py-3.5 text-left font-semibold text-navy-900/60 text-xs uppercase tracking-wider">County</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-navy-900/60 text-xs uppercase tracking-wider">Permit Type</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-navy-900/60 text-xs uppercase tracking-wider">Base Cost</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-navy-900/60 text-xs uppercase tracking-wider">Processing</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((entry) => (
                  <tr key={entry.id} className="border-b border-navy-50 hover:bg-[#f8f9fc] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-navy-900">{entry.county_name}</td>
                    <td className="px-5 py-3.5 text-navy-900/70">{entry.permit_type}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-navy-900">${entry.base_cost}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-navy-900/60">
                        <Clock className="w-3.5 h-3.5" />
                        {entry.processing_days} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
