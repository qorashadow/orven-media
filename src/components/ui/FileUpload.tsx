'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, File, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProgressBar } from './ProgressBar'

export interface FileUploadProps {
  label?: string
  accept?: string
  maxSize?: number // bytes
  onFileSelect?: (file: File) => void
  onUpload?: (file: File) => Promise<string | void>
  uploadProgress?: number
  disabled?: boolean
  error?: string
  className?: string
  preview?: boolean
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  maxSize = 100 * 1024 * 1024,
  onFileSelect,
  uploadProgress,
  disabled = false,
  error,
  className,
  preview = true,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setLocalError(null)
    if (file.size > maxSize) {
      setLocalError(`File size exceeds ${(maxSize / (1024 * 1024)).toFixed(0)}MB limit`)
      return
    }

    setSelectedFile(file)
    onFileSelect?.(file)

    if (preview && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setLocalError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {label && (
        <span className="text-xs font-medium uppercase tracking-wider text-[#8b8b94]">{label}</span>
      )}

      {!selectedFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            'w-full border border-dashed border-[#26262c] hover:border-[#a0a0b0]/50 bg-[#111114] rounded-[2px] p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors',
            isDragging && 'border-[#a0a0b0] bg-[#17171b]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            disabled={disabled}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0])
              }
            }}
          />
          <div className="w-10 h-10 rounded-[2px] bg-[#17171b] border border-[#26262c] flex items-center justify-center text-[#8b8b94]">
            <Upload size={18} />
          </div>
          <div className="text-xs text-[#d9d9de] font-medium text-center">
            Click or drag and drop file here
          </div>
          <div className="text-[10px] text-[#56565e]">
            Max file size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {previewUrl ? (
                <div className="w-10 h-10 relative overflow-hidden rounded-[1px] border border-[#26262c] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-[1px] bg-[#17171b] border border-[#26262c] flex items-center justify-center text-[#8b8b94] shrink-0">
                  <File size={16} />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#d9d9de] truncate">{selectedFile.name}</div>
                <div className="text-[10px] font-mono text-[#56565e]">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={removeFile}
              className="text-[#8b8b94] hover:text-[#c43c3c] p-1 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {uploadProgress !== undefined && (
            <div className="mt-1">
              <ProgressBar value={uploadProgress} showLabel size="xs" />
            </div>
          )}
        </div>
      )}

      {(error || localError) && (
        <span className="text-xs text-[#c43c3c] font-medium">{error || localError}</span>
      )}
    </div>
  )
}
