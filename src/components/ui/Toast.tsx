'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  title?: string
  message: string
  type?: ToastType
  duration?: number
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, 'id'>) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ duration = 4000, type = 'info', ...rest }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, duration, type, ...rest }])

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration)
      }
    },
    [removeToast]
  )

  const success = (message: string, title?: string) => toast({ message, title, type: 'success' })
  const error = (message: string, title?: string) => toast({ message, title, type: 'error' })
  const warning = (message: string, title?: string) => toast({ message, title, type: 'warning' })
  const info = (message: string, title?: string) => toast({ message, title, type: 'info' })

  const icons = {
    success: <CheckCircle2 size={18} className="text-[#3c8c5c] shrink-0" />,
    error: <AlertCircle size={18} className="text-[#c43c3c] shrink-0" />,
    warning: <AlertTriangle size={18} className="text-[#b8942c] shrink-0" />,
    info: <Info size={18} className="text-[#a0a0b0] shrink-0" />,
  }

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 bg-[#17171b] border border-[#26262c] rounded-[2px] shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2',
              t.type === 'error' && 'border-l-2 border-l-[#c43c3c]',
              t.type === 'success' && 'border-l-2 border-l-[#3c8c5c]',
              t.type === 'warning' && 'border-l-2 border-l-[#b8942c]',
              t.type === 'info' && 'border-l-2 border-l-[#a0a0b0]'
            )}
          >
            {icons[t.type || 'info']}
            <div className="flex-1 min-w-0">
              {t.title && <div className="text-xs font-semibold text-[#d9d9de]">{t.title}</div>}
              <div className="text-xs text-[#8b8b94] leading-relaxed break-words">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#8b8b94] hover:text-[#d9d9de] p-0.5 rounded-[1px] transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
