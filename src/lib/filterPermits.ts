import type { FilterState } from '@/app/dashboard/page'

interface BasePermit {
  permit_type: string
  property_address: string
  city?: string
  estimated_cost?: number | null
  created_at: string
}

export function applyFilters<T extends BasePermit>(permits: T[], filters: FilterState): T[] {
  let result = [...permits]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(p =>
      p.property_address.toLowerCase().includes(q) ||
      p.permit_type.toLowerCase().includes(q) ||
      (p.city || '').toLowerCase().includes(q)
    )
  }

  if (filters.type) {
    result = result.filter(p => p.permit_type === filters.type)
  }

  result.sort((a, b) => {
    switch (filters.sort) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'highest_cost':
        return (b.estimated_cost || 0) - (a.estimated_cost || 0)
      case 'lowest_cost':
        return (a.estimated_cost || 0) - (b.estimated_cost || 0)
      default: // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  return result
}
