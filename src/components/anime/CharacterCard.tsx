import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface CharacterCardProps {
  character: {
    id: string
    name: string
    nameNative?: string | null
    image?: string | null
  }
  role?: string
  className?: string
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, role, className }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2 bg-[#111114] border border-[#26262c] rounded-[2px]',
        className
      )}
    >
      <div className="relative w-11 h-14 bg-[#17171b] rounded-[1px] overflow-hidden shrink-0 border border-[#26262c]">
        {character.image ? (
          <Image
            src={character.image}
            alt={character.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-[#56565e]">
            {character.name.substring(0, 2)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-semibold text-[#d9d9de] truncate">{character.name}</h5>
        {character.nameNative && (
          <span className="text-[10px] text-[#56565e] truncate block font-mono">
            {character.nameNative}
          </span>
        )}
        {role && (
          <span className="text-[10px] font-mono text-[#a0a0b0] mt-0.5 block uppercase tracking-wider">
            {role}
          </span>
        )}
      </div>
    </div>
  )
}
