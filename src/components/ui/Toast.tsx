'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
  duration?: number
}

export function Toast({ message, type = 'success', onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl max-w-sm transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${type === 'success' ? 'bg-[#132452] text-white' : 'bg-red-600 text-white'}`}
    >
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-[#fa8c41] flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-red-200 flex-shrink-0" />
      )}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
        className="ml-2 text-white/60 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
