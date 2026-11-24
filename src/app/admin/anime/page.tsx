import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { Plus, DownloadCloud, Edit, Trash2, Video, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'

export const dynamic = 'force-dynamic'

interface AdminAnimePageProps {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function AdminAnimePage({ searchParams }: AdminAnimePageProps) {
  const { page = '1', q = '' } = await searchParams
  const currentPage = parseInt(page)
  const limit = 20
  const skip = (currentPage - 1) * limit

  const where: any = {}
  if (q.trim()) {
    where.OR = [
      { title: { contains: q.trim(), mode: 'insensitive' } },
      { titleEnglish: { contains: q.trim(), mode: 'insensitive' } },
    ]
  }

  const [animeList, total] = await Promise.all([
    db.anime.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { episodes: true } },
      },
    }),
    db.anime.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26262c]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
            Anime & Donghua Management
          </h1>
          <p className="text-xs text-[#8b8b94] mt-0.5">
            Total {total} titles currently in database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/anime/new">
            <Button variant="primary" size="sm" clipCorner icon={<Plus size={14} />}>
              Add Anime
            </Button>
          </Link>
          <Link href="/admin/anime/new?import=true">
            <Button variant="secondary" size="sm" icon={<DownloadCloud size={14} />}>
              Import AniList
            </Button>
          </Link>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-[#111114] border border-[#26262c] rounded-[2px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#17171b] border-b border-[#26262c] text-[#8b8b94] font-mono uppercase tracking-wider text-[10px]">
                <th className="p-3">Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Episodes</th>
                <th className="p-3">Views</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26262c]">
              {animeList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#56565e] font-mono">
                    No anime titles found.
                  </td>
                </tr>
              ) : (
                animeList.map((anime) => (
                  <tr key={anime.id} className="hover:bg-[#17171b]/50 transition-colors">
                    {/* Title & Poster */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-12 bg-[#17171b] rounded-[1px] overflow-hidden shrink-0 border border-[#26262c]">
                          {anime.poster && (
                            <Image
                              src={anime.poster}
                              alt={anime.title}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <Link
                            href={`/anime/${anime.slug}`}
                            className="font-semibold text-[#d9d9de] hover:text-[#a0a0b0] truncate block"
                            target="_blank"
                          >
                            {anime.title}
                          </Link>
                          {anime.titleEnglish && (
                            <span className="text-[10px] text-[#8b8b94] truncate block">
                              {anime.titleEnglish}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Format */}
                    <td className="p-3 font-mono text-[#a0a0b0]">{anime.type}</td>

                    {/* Category */}
                    <td className="p-3">
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-[1px] border ${
                          anime.category === 'DONGHUA'
                            ? 'bg-[#b8942c]/10 text-[#b8942c] border-[#b8942c]/30'
                            : 'bg-[#17171b] text-[#d9d9de] border-[#26262c]'
                        }`}
                      >
                        {anime.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3 font-mono text-[#8b8b94]">{anime.status}</td>

                    {/* Episodes count */}
                    <td className="p-3 font-mono">
                      <Link
                        href={`/admin/anime/${anime.id}/episodes`}
                        className="text-[#a0a0b0] hover:underline flex items-center gap-1"
                      >
                        <Video size={13} />
                        <span>{anime._count.episodes} eps</span>
                      </Link>
                    </td>

                    {/* Views */}
                    <td className="p-3 font-mono text-[#8b8b94]">{anime.views}</td>

                    {/* Action buttons */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/anime/${anime.id}/episodes`}>
                          <button
                            className="p-1.5 bg-[#17171b] hover:bg-[#202026] text-[#a0a0b0] border border-[#26262c] rounded-[1px]"
                            title="Manage Episodes"
                          >
                            <Video size={14} />
                          </button>
                        </Link>
                        <Link href={`/admin/anime/${anime.id}/edit`}>
                          <button
                            className="p-1.5 bg-[#17171b] hover:bg-[#202026] text-[#d9d9de] border border-[#26262c] rounded-[1px]"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
