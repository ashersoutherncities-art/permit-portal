'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X, RefreshCw, Camera, Upload, Trash2, ChevronLeft, ChevronRight,
  Loader2, CheckCircle, AlertTriangle, Zap, DollarSign, FileText
} from 'lucide-react'
import type { VisionAnalysis } from '@/lib/visionAnalysis'
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete'

export interface PermitFormData {
  permit_type: string
  property_address: string
  city: string
  state: string
  zip: string
  scope_of_work: string
  estimated_cost: string
  has_subs: boolean
  property_owned: boolean
  under_contract: boolean
  contract_signed: boolean
  estimate_signed: boolean
  upfront_paid: boolean
  resubmitted_from?: string
}

interface PhotoFile {
  id: string
  file: File
  preview: string
  category: 'existing' | 'damage' | 'reference'
  base64?: string
}

interface NewPermitModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  prefill?: Partial<PermitFormData> & { resubmitted_from?: string }
  isResubmit?: boolean
}

const PERMIT_TYPES = [
  'Residential Renovation', 'Commercial Build-Out', 'New Construction',
  'Electrical', 'Plumbing', 'HVAC', 'Roofing', 'Addition/Expansion',
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
]

const emptyForm: PermitFormData = {
  permit_type: '', property_address: '', city: '', state: '', zip: '',
  scope_of_work: '', estimated_cost: '',
  has_subs: false, property_owned: false, under_contract: false,
  contract_signed: false, estimate_signed: false, upfront_paid: false,
}

const PHOTO_CATEGORIES: { id: 'existing' | 'damage' | 'reference'; label: string; description: string; color: string }[] = [
  { id: 'existing', label: 'Existing Condition', description: 'Current state of property', color: 'blue' },
  { id: 'damage', label: 'Damage / Issues', description: 'Specific problems to address', color: 'red' },
  { id: 'reference', label: 'Reference / Inspiration', description: 'Desired outcome examples', color: 'green' },
]

// Step indicators
const STEPS = ['Details', 'Photos', 'AI Analysis', 'Submit']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? 'bg-[#fa8c41] text-white' : active ? 'bg-[#132452] text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-semibold ${active ? 'text-[#132452]' : done ? 'text-[#fa8c41]' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full ${done ? 'bg-[#fa8c41]' : 'bg-gray-100'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1: Permit Details Form ────────────────────────────────────────────
function DetailsStep({
  form, setForm, onNext, onClose
}: {
  form: PermitFormData
  setForm: React.Dispatch<React.SetStateAction<PermitFormData>>
  onNext: () => void
  onClose: () => void
}) {
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!form.permit_type) { setError('Please select a permit type.'); return }
    if (!form.property_address) { setError('Property address is required.'); return }
    setError('')
    onNext()
  }

  return (
    <div className="space-y-5">
      {/* Permit Type */}
      <div>
        <label className="block text-sm font-semibold text-[#132452] mb-1.5">
          Permit Type <span className="text-red-500">*</span>
        </label>
        <select
          value={form.permit_type}
          onChange={e => setForm(f => ({ ...f, permit_type: e.target.value }))}
          className="w-full px-4 py-2.5 bg-[#f8f9fc] border border-gray-200 rounded-xl text-sm text-[#132452] focus:outline-none focus:ring-2 focus:ring-[#fa8c41]/30 focus:border-[#fa8c41] transition-colors"
        >
          <option value="">Select permit type…</option>
          {PERMIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Property Address */}
      <div>
        <label className="block text-sm font-semibold text-[#132452] mb-1.5">
          Property Address <span className="text-red-500">*</span>
        </label>
        <AddressAutocomplete
          value={form.property_address}
          onChange={val => setForm(f => ({ ...f, property_address: val }))}
          onSelect={({ street, city, state, zip }) =>
            setForm(f => ({ ...f, property_address: street, city, state, zip }))
          }
          placeholder="123 Main St"
        />
      </div>

      {/* City / State / Zip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3 sm:col-span-1">
          <label className="block text-sm font-semibold text-[#132452] mb-1.5">City</label>
          <input type="text" value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            placeholder="Charlotte"
            className="w-full px-4 py-2.5 bg-[#f8f9fc] border border-gray-200 rounded-xl text-sm text-[#132452] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fa8c41]/30 focus:border-[#fa8c41] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#132452] mb-1.5">State</label>
          <select value={form.state}
            onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
            className="w-full px-4 py-2.5 bg-[#f8f9fc] border border-gray-200 rounded-xl text-sm text-[#132452] focus:outline-none focus:ring-2 focus:ring-[#fa8c41]/30 focus:border-[#fa8c41] transition-colors"
          >
            <option value="">ST</option>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#132452] mb-1.5">Zip</label>
          <input type="text" value={form.zip} maxLength={10}
            onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
            placeholder="28201"
            className="w-full px-4 py-2.5 bg-[#f8f9fc] border border-gray-200 rounded-xl text-sm text-[#132452] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fa8c41]/30 focus:border-[#fa8c41] transition-colors"
          />
        </div>
      </div>

      {/* Scope of Work */}
      <div>
        <label className="block text-sm font-semibold text-[#132452] mb-1.5">Scope of Work</label>
        <textarea value={form.scope_of_work} rows={3}
          onChange={e => setForm(f => ({ ...f, scope_of_work: e.target.value }))}
          placeholder="Describe the work to be performed…"
          className="w-full px-4 py-2.5 bg-[#f8f9fc] border border-gray-200 rounded-xl text-sm text-[#132452] placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#fa8c41]/30 focus:border-[#fa8c41] transition-colors"
        />
      </div>

      {/* Estimated Cost */}
      <div>
        <label className="block text-sm font-semibold text-[#132452] mb-1.5">Estimated Cost ($)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input type="number" value={form.estimated_cost} min="0"
            onChange={e => setForm(f => ({ ...f, estimated_cost: e.target.value }))}
            placeholder="50000"
            className="w-full pl-8 pr-4 py-2.5 bg-[#f8f9fc] border border-gray-200 rounded-xl text-sm text-[#132452] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fa8c41]/30 focus:border-[#fa8c41] transition-colors"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-[#132452]/50 uppercase tracking-wider">Project Details</p>

        {/* Subs & Labor */}
        <div className="flex items-center justify-between bg-[#f8f9fc] rounded-xl px-4 py-3 border border-gray-200">
          <div>
            <span className="text-sm font-semibold text-[#132452]">Subs & Labor Secured?</span>
            <p className="text-xs text-gray-400 mt-0.5">Do you already have subcontractors and labor lined up?</p>
          </div>
          <button type="button" onClick={() => setForm(f => ({ ...f, has_subs: !f.has_subs }))}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ml-4 ${form.has_subs ? 'bg-[#fa8c41]' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.has_subs ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Property Owned */}
        <div className="flex items-center justify-between bg-[#f8f9fc] rounded-xl px-4 py-3 border border-gray-200">
          <div>
            <span className="text-sm font-semibold text-[#132452]">Property Owned?</span>
            <p className="text-xs text-gray-400 mt-0.5">Do you currently own this property?</p>
          </div>
          <button type="button" onClick={() => setForm(f => ({ ...f, property_owned: !f.property_owned, under_contract: false }))}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ml-4 ${form.property_owned ? 'bg-[#fa8c41]' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.property_owned ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Under Contract — only show if NOT owned */}
        {!form.property_owned && (
          <div className="flex items-center justify-between bg-[#f8f9fc] rounded-xl px-4 py-3 border border-gray-200">
            <div>
              <span className="text-sm font-semibold text-[#132452]">Under Contract?</span>
              <p className="text-xs text-gray-400 mt-0.5">Is the property currently under contract?</p>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, under_contract: !f.under_contract }))}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ml-4 ${form.under_contract ? 'bg-[#fa8c41]' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.under_contract ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        )}

        {/* Contract Signed */}
        <div className="flex items-center justify-between bg-[#f8f9fc] rounded-xl px-4 py-3 border border-gray-200">
          <div>
            <span className="text-sm font-semibold text-[#132452]">Construction Contract Signed?</span>
            <p className="text-xs text-gray-400 mt-0.5">Has the construction contract been signed?</p>
          </div>
          <button type="button" onClick={() => setForm(f => ({ ...f, contract_signed: !f.contract_signed }))}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ml-4 ${form.contract_signed ? 'bg-[#fa8c41]' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.contract_signed ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Estimate Signed */}
        <div className="flex items-center justify-between bg-[#f8f9fc] rounded-xl px-4 py-3 border border-gray-200">
          <div>
            <span className="text-sm font-semibold text-[#132452]">Estimate Signed?</span>
            <p className="text-xs text-gray-400 mt-0.5">Has the client signed off on the estimate?</p>
          </div>
          <button type="button" onClick={() => setForm(f => ({ ...f, estimate_signed: !f.estimate_signed }))}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ml-4 ${form.estimate_signed ? 'bg-[#fa8c41]' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.estimate_signed ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Upfront Payment */}
        <div className="flex items-center justify-between bg-[#f8f9fc] rounded-xl px-4 py-3 border border-gray-200">
          <div>
            <span className="text-sm font-semibold text-[#132452]">Upfront Payment Received?</span>
            <p className="text-xs text-gray-400 mt-0.5">Has the upfront/deposit payment been collected?</p>
          </div>
          <button type="button" onClick={() => setForm(f => ({ ...f, upfront_paid: !f.upfront_paid }))}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ml-4 ${form.upfront_paid ? 'bg-[#fa8c41]' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.upfront_paid ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-[#132452]/70 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button type="button" onClick={handleNext}
          className="flex-1 px-6 py-3 bg-[#132452] hover:bg-[#1a2f63] text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          Next: Add Photos
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Step 2: Photo Upload ─────────────────────────────────────────────────────
function PhotosStep({
  photos, setPhotos, onNext, onBack
}: {
  photos: PhotoFile[]
  setPhotos: React.Dispatch<React.SetStateAction<PhotoFile[]>>
  onNext: () => void
  onBack: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeCategory, setActiveCategory] = useState<'existing' | 'damage' | 'reference'>('existing')
  const [error, setError] = useState('')

  const countByCategory = (cat: 'existing' | 'damage' | 'reference') =>
    photos.filter(p => p.category === cat).length

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return
    setError('')

    const currentCatCount = countByCategory(activeCategory)
    const totalCount = photos.length

    const allowed = Math.min(files.length, 15 - currentCatCount, 45 - totalCount)
    if (allowed <= 0) {
      setError(
        currentCatCount >= 15
          ? `Maximum 15 photos per category reached.`
          : `Maximum 45 total photos reached.`
      )
      return
    }

    const newPhotos: PhotoFile[] = []
    for (let i = 0; i < allowed; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue

      const preview = URL.createObjectURL(file)
      newPhotos.push({
        id: `${Date.now()}-${i}`,
        file,
        preview,
        category: activeCategory,
      })
    }

    setPhotos(prev => [...prev, ...newPhotos])
  }, [activeCategory, photos, setPhotos])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id)
      if (photo) URL.revokeObjectURL(photo.preview)
      return prev.filter(p => p.id !== id)
    })
  }

  const categoryPhotos = photos.filter(p => p.category === activeCategory)

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <Camera className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Add Property Photos (Optional)</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Upload up to 15 photos per category (45 total). Claude AI will analyze them to generate a cost breakdown by trade.
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2">
        {PHOTO_CATEGORIES.map(cat => {
          const count = countByCategory(cat.id)
          return (
            <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                activeCategory === cat.id
                  ? 'bg-[#132452] text-white border-[#132452]'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="block truncate">{cat.label}</span>
              <span className={`text-[10px] font-bold ${activeCategory === cat.id ? 'text-[#fa8c41]' : 'text-gray-400'}`}>
                {count}/15
              </span>
            </button>
          )
        })}
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 hover:border-[#fa8c41]/50 rounded-xl p-6 text-center cursor-pointer transition-colors group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <Upload className="w-8 h-8 text-gray-300 group-hover:text-[#fa8c41]/50 mx-auto mb-2 transition-colors" />
        <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
          Click to upload or drag & drop
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {PHOTO_CATEGORIES.find(c => c.id === activeCategory)?.description} · JPEG, PNG, WebP
        </p>
      </div>

      {/* Photo grid for active category */}
      {categoryPhotos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {categoryPhotos.map(photo => (
            <div key={photo.id} className="relative group aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.preview}
                alt={photo.file.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Summary */}
      <div className="bg-[#f8f9fc] rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">Total photos uploaded</span>
        <span className="text-sm font-bold text-[#132452]">{photos.length} / 45</span>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-[#132452]/70 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 px-6 py-3 bg-[#132452] hover:bg-[#1a2f63] text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {photos.length > 0 ? (
            <><Zap className="w-4 h-4" /> Analyze with AI</>
          ) : (
            <>Skip Photos & Continue <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Step 3: AI Analysis ──────────────────────────────────────────────────────
function AnalysisStep({
  photos, analysis, setAnalysis, onNext, onBack
}: {
  photos: PhotoFile[]
  analysis: VisionAnalysis | null
  setAnalysis: React.Dispatch<React.SetStateAction<VisionAnalysis | null>>
  onNext: () => void
  onBack: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ran, setRan] = useState(false)

  // Auto-run analysis when arriving on this step if photos exist and haven't run yet
  useEffect(() => {
    if (!ran && photos.length > 0 && !analysis) {
      runAnalysis()
    }
    if (photos.length === 0) {
      setRan(true) // skip analysis if no photos
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runAnalysis = async () => {
    setLoading(true)
    setError('')
    setRan(true)
    try {
      // Compress + convert photos before sending (keeps payload under Vercel's 4.5MB limit)
      const photoInputs = await Promise.all(
        photos.map(async p => {
          const base64 = await compressImage(p.file)
          return {
            base64,
            mimeType: 'image/jpeg',
            category: p.category,
            fileName: p.file.name,
          }
        })
      )

      const res = await fetch('/api/permits/analyze-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: photoInputs }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Analysis failed')
      }

      const result: VisionAnalysis = await res.json()
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const conditionColors = {
    good: 'text-emerald-600 bg-emerald-50',
    fair: 'text-yellow-600 bg-yellow-50',
    poor: 'text-orange-600 bg-orange-50',
    major_work_needed: 'text-red-600 bg-red-50',
  }

  const priorityColors = {
    required: 'bg-red-100 text-red-700',
    recommended: 'bg-orange-100 text-orange-700',
    optional: 'bg-gray-100 text-gray-600',
  }

  if (photos.length === 0) {
    return (
      <div className="space-y-5">
        <div className="text-center py-12">
          <Camera className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No photos uploaded</p>
          <p className="text-sm text-gray-400 mt-1">AI analysis requires at least one photo. You can skip and submit now.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-[#132452]/70 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button type="button" onClick={onNext}
            className="flex-1 px-6 py-3 bg-[#fa8c41] hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" /> Submit Without Analysis
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-[#132452]/5 rounded-2xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#fa8c41] animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-bold text-[#132452]">Analyzing {photos.length} photo{photos.length !== 1 ? 's' : ''}…</p>
          <p className="text-sm text-gray-400 mt-1">Claude AI is reviewing your property photos</p>
        </div>
        <div className="flex gap-1 mt-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#fa8c41] animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-5">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="font-semibold text-red-700">Analysis Failed</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-[#132452]/70 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button type="button" onClick={runAnalysis}
            className="flex-1 px-6 py-3 bg-[#fa8c41] hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Retry Analysis
          </button>
          <button type="button" onClick={onNext}
            className="flex-1 px-6 py-3 bg-[#132452] hover:bg-[#1a2f63] text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Skip & Submit
          </button>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="space-y-5">
        <div className="text-center py-8">
          <p className="text-gray-400">Ready to analyze photos</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-[#132452]/70 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button type="button" onClick={runAnalysis}
            className="flex-1 px-6 py-3 bg-[#fa8c41] hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" /> Run Analysis
          </button>
        </div>
      </div>
    )
  }

  // Calculate totals
  const totalLow = analysis.costBreakdown?.reduce((s, t) => s + t.lowEstimate, 0) ?? 0
  const totalHigh = analysis.costBreakdown?.reduce((s, t) => s + t.highEstimate, 0) ?? 0

  return (
    <div className="space-y-5">
      {/* Summary header */}
      <div className="bg-[#132452] rounded-xl p-5 text-white">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-1">AI Assessment</p>
            <p className="font-bold text-lg leading-tight">{analysis.summary}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 ${conditionColors[analysis.overallCondition]}`}>
            {analysis.overallCondition.replace('_', ' ').toUpperCase()}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-white/70">Condition Score: <strong className="text-[#fa8c41]">{analysis.conditionScore}/10</strong></span>
          <span className="text-white/70">Budget Multiplier: <strong className="text-[#fa8c41]">{analysis.budgetMultiplier}x</strong></span>
        </div>
      </div>

      {/* Cost breakdown table */}
      {analysis.costBreakdown && analysis.costBreakdown.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-[#fa8c41]" />
            <h3 className="text-sm font-bold text-[#132452]">Cost Breakdown by Trade</h3>
          </div>
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-50">
              {analysis.costBreakdown.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-[#132452]">{item.trade}</p>
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${priorityColors[item.priority]}`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{item.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#132452]">
                      ${item.lowEstimate.toLocaleString()} – ${item.highEstimate.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Total row */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#132452] text-white">
              <p className="text-sm font-bold">Total Estimated Range</p>
              <p className="text-sm font-bold text-[#fa8c41]">
                ${totalLow.toLocaleString()} – ${totalHigh.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Safety flags */}
      {analysis.safetyFlags && analysis.safetyFlags.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-sm font-bold text-red-700">Safety Flags</p>
          </div>
          <ul className="space-y-1">
            {analysis.safetyFlags.map((flag, i) => (
              <li key={i} className="text-sm text-red-600 flex gap-2"><span>•</span>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-[#132452]/70 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 px-6 py-3 bg-[#fa8c41] hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" /> Looks Good — Submit Permit
        </button>
      </div>
    </div>
  )
}

// ─── Step 4: Final Submit ─────────────────────────────────────────────────────
function SubmitStep({
  form, photos, analysis, isResubmit, prefill, onBack, onClose, onSuccess
}: {
  form: PermitFormData
  photos: PhotoFile[]
  analysis: VisionAnalysis | null
  isResubmit: boolean
  prefill?: Partial<PermitFormData> & { resubmitted_from?: string }
  onBack: () => void
  onClose: () => void
  onSuccess: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const payload: Record<string, unknown> = {
        ...form,
        estimated_cost: form.estimated_cost ? parseFloat(form.estimated_cost) : null,
        ai_analysis_result: analysis,
        photo_count: photos.length,
      }
      if (prefill?.resubmitted_from) {
        payload.resubmitted_from = prefill.resubmitted_from
      }

      const res = await fetch('/api/permits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit permit')
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const totalLow = analysis?.costBreakdown?.reduce((s, t) => s + t.lowEstimate, 0) ?? 0
  const totalHigh = analysis?.costBreakdown?.reduce((s, t) => s + t.highEstimate, 0) ?? 0

  return (
    <div className="space-y-5">
      <div className="bg-[#f8f9fc] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-[#132452] mb-3">Submission Summary</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Permit Type</p>
            <p className="font-semibold text-[#132452] mt-0.5">{form.permit_type || '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Address</p>
            <p className="font-semibold text-[#132452] mt-0.5 truncate">
              {form.property_address}{form.city ? `, ${form.city}` : ''}{form.state ? `, ${form.state}` : ''}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Photos</p>
            <p className="font-semibold text-[#132452] mt-0.5">{photos.length} uploaded</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">AI Analysis</p>
            <p className="font-semibold text-[#132452] mt-0.5">
              {analysis ? `${analysis.overallCondition.replace('_', ' ')} condition` : 'Not run'}
            </p>
          </div>
          {form.estimated_cost && (
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Your Estimate</p>
              <p className="font-semibold text-[#132452] mt-0.5">${parseFloat(form.estimated_cost).toLocaleString()}</p>
            </div>
          )}
          {analysis && totalLow > 0 && (
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">AI Cost Range</p>
              <p className="font-semibold text-[#fa8c41] mt-0.5">${totalLow.toLocaleString()} – ${totalHigh.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-[#132452]/70 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button type="button" onClick={handleSubmit} disabled={submitting}
          className="flex-1 px-6 py-3 bg-[#fa8c41] hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
          ) : isResubmit ? (
            <><RefreshCw className="w-4 h-4" /> Resubmit Application</>
          ) : (
            <><CheckCircle className="w-4 h-4" /> Submit Permit Application</>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Compress image to max 1024px and 0.75 quality before sending to API
function compressImage(file: File, maxPx = 1024, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round(height * maxPx / width); width = maxPx }
        else { width = Math.round(width * maxPx / height); height = maxPx }
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve(dataUrl.split(',')[1])
    }
    img.onerror = reject
    img.src = url
  })
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function NewPermitModal({ isOpen, onClose, onSuccess, prefill, isResubmit = false }: NewPermitModalProps) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<PermitFormData>(emptyForm)
  const [photos, setPhotos] = useState<PhotoFile[]>([])
  const [analysis, setAnalysis] = useState<VisionAnalysis | null>(null)

  useEffect(() => {
    if (isOpen) {
      setStep(0)
      setForm(prefill ? { ...emptyForm, ...prefill } : emptyForm)
      setPhotos([])
      setAnalysis(null)
    }
  }, [isOpen, prefill])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => { photos.forEach(p => URL.revokeObjectURL(p.preview)) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isOpen) return null

  const STEP_TITLES = [
    isResubmit ? 'Resubmit Permit Application' : 'New Permit Application',
    'Upload Property Photos',
    'AI Cost Analysis',
    'Review & Submit',
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-[#132452] flex items-center gap-2">
              {isResubmit && <RefreshCw className="w-4 h-4 text-[#fa8c41]" />}
              {STEP_TITLES[step]}
            </h2>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <StepIndicator current={step} />

          {step === 0 && (
            <DetailsStep form={form} setForm={setForm} onNext={() => setStep(1)} onClose={onClose} />
          )}
          {step === 1 && (
            <PhotosStep photos={photos} setPhotos={setPhotos} onNext={() => setStep(2)} onBack={() => setStep(0)} />
          )}
          {step === 2 && (
            <AnalysisStep photos={photos} analysis={analysis} setAnalysis={setAnalysis} onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <SubmitStep
              form={form} photos={photos} analysis={analysis}
              isResubmit={isResubmit} prefill={prefill}
              onBack={() => setStep(2)} onClose={onClose} onSuccess={onSuccess}
            />
          )}
        </div>
      </div>
    </div>
  )
}
