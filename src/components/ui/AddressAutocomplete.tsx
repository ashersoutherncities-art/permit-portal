'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapPin } from 'lucide-react'

interface AddressParts {
  street: string
  city: string
  state: string
  zip: string
}

interface Props {
  value: string
  onChange: (street: string) => void
  onSelect: (parts: AddressParts) => void
  placeholder?: string
  className?: string
}

declare global {
  interface Window {
    google: any
    initGoogleMaps: () => void
  }
}

let scriptLoaded = false
let scriptLoading = false
const callbacks: (() => void)[] = []

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (scriptLoaded) { resolve(); return }
    callbacks.push(resolve)
    if (scriptLoading) return
    scriptLoading = true
    window.initGoogleMaps = () => {
      scriptLoaded = true
      callbacks.forEach(cb => cb())
      callbacks.length = 0
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  })
}

export function AddressAutocomplete({ value, onChange, onSelect, placeholder, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    if (!apiKey) return
    loadGoogleMaps(apiKey).then(() => setReady(true))
  }, [apiKey])

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address'],
    })

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace()
      if (!place?.address_components) return

      let street_number = ''
      let route = ''
      let city = ''
      let state = ''
      let zip = ''

      for (const component of place.address_components) {
        const types = component.types
        if (types.includes('street_number')) street_number = component.long_name
        else if (types.includes('route')) route = component.long_name
        else if (types.includes('locality')) city = component.long_name
        else if (types.includes('administrative_area_level_1')) state = component.short_name
        else if (types.includes('postal_code')) zip = component.long_name
      }

      const street = [street_number, route].filter(Boolean).join(' ')
      onChange(street)
      onSelect({ street, city, state, zip })
    })
  }, [ready, onChange, onSelect])

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <MapPin className="w-4 h-4 text-gray-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || '123 Main St'}
        className={`w-full pl-9 pr-4 py-2.5 bg-[#f8f9fc] border border-gray-200 rounded-xl text-sm text-[#132452] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fa8c41]/30 focus:border-[#fa8c41] transition-colors ${className || ''}`}
        autoComplete="off"
      />
    </div>
  )
}
