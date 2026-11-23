'use client'

import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { AlertTriangle } from 'lucide-react'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showClose={false}>
      <div className="flex flex-col gap-4 text-center items-center py-2">
        <div className="w-12 h-12 rounded-[2px] bg-[#c43c3c]/10 border border-[#c43c3c]/30 flex items-center justify-center text-[#c43c3c]">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#d9d9de] font-heading">{title}</h3>
          <p className="text-xs text-[#8b8b94] mt-1">{description}</p>
        </div>

        <div className="flex items-center justify-center gap-2 w-full mt-2">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading} fullWidth>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
            loading={loading}
            fullWidth
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
