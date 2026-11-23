import React from 'react'
import { Film } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 bg-[#111114] border border-[#26262c] rounded-[2px]',
        className
      )}
    >
      <div className="w-12 h-12 rounded-[2px] bg-[#17171b] border border-[#26262c] flex items-center justify-center text-[#8b8b94] mb-3">
        {icon || <Film size={24} />}
      </div>
      <h3 className="text-sm font-semibold text-[#d9d9de] font-heading">{title}</h3>
      {description && <p className="text-xs text-[#8b8b94] max-w-sm mt-1">{description}</p>}
      {(actionLabel && (onAction || actionHref)) && (
        <div className="mt-4">
          {actionHref ? (
            <a href={actionHref}>
              <Button size="sm" variant="secondary">
                {actionLabel}
              </Button>
            </a>
          ) : (
            <Button size="sm" variant="secondary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
