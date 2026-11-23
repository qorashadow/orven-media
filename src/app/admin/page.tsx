import React from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Users, Tv, Eye, TrendingUp, Plus, DownloadCloud, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatNumber } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [totalUsers, totalAnime, totalEpisodes, viewsSum, topViewedAnime, recentUsers, recentReports] =
    await Promise.all([
      db.user.count(),
      db.anime.count(),
      db.episode.count(),
      db.anime.aggregate({ _sum: { views: true } }),
      db.anime.findMany({
        orderBy: { views: 'desc' },
        take: 5,
        select: { id: true, title: true, views: true, type: true, category: true },
      }),
      db.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, username: true, email: true, role: true, createdAt: true },
      }),
      db.report.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { username: true } } },
      }),
    ])

  const totalViews = viewsSum._sum.views || 0

  const statsCards = [
    {
      label: 'Total Users',
      value: formatNumber(totalUsers),
      icon: <Users size={18} className="text-[#a0a0b0]" />,
    },
    {
      label: 'Titles in Catalog',
      value: totalAnime,
      icon: <Tv size={18} className="text-[#a0a0b0]" />,
    },
    {
      label: 'Total Episodes',
      value: totalEpisodes,
      icon: <TrendingUp size={18} className="text-[#3c8c5c]" />,
    },
    {
      label: 'Total Stream Views',
      value: formatNumber(totalViews),
      icon: <Eye size={18} className="text-[#b8942c]" />,
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26262c]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
            System Dashboard
          </h1>
          <p className="text-xs text-[#8b8b94] mt-0.5">
            Real-time analytics, catalog overview, and quick operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/anime/new">
            <Button variant="primary" size="sm" clipCorner icon={<Plus size={15} />}>
              Add Anime
            </Button>
          </Link>
          <Link href="/admin/anime/new?import=true">
            <Button variant="secondary" size="sm" icon={<DownloadCloud size={15} />}>
              Import from AniList
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-1"
          >
            <div className="flex items-center justify-between text-[#8b8b94]">
              <span className="text-[10px] font-mono uppercase tracking-wider">{stat.label}</span>
              {stat.icon}
            </div>
            <span className="text-2xl font-bold font-heading text-[#d9d9de]">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Two Column Section: Top Viewed & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Most Viewed */}
        <div className="p-5 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#26262c]">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de]">
              Top Viewed Anime
            </h3>
            <Link href="/admin/anime" className="text-[11px] font-mono text-[#8b8b94] hover:text-[#a0a0b0]">
              View all &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {topViewedAnime.map((anime, index) => {
              const maxViews = topViewedAnime[0]?.views || 1
              const percent = Math.round((anime.views / maxViews) * 100)

              return (
                <div key={anime.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#d9d9de] truncate max-w-xs">
                      {index + 1}. {anime.title}
                    </span>
                    <span className="font-mono text-[11px] text-[#8b8b94]">
                      {formatNumber(anime.views)} views
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#17171b] rounded-[1px] overflow-hidden">
                    <div className="h-full bg-[#a0a0b0]" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Reports / Pending issues */}
        <div className="p-5 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#26262c]">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de]">
              Recent Reports
            </h3>
            <Link href="/admin/reports" className="text-[11px] font-mono text-[#8b8b94] hover:text-[#a0a0b0]">
              View all &rarr;
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#56565e]">
              No reports submitted recently.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="p-2.5 bg-[#17171b] border border-[#26262c] rounded-[1px] flex items-center justify-between text-xs"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-[#d9d9de] truncate">{report.reason}</span>
                    <span className="text-[10px] font-mono text-[#8b8b94] truncate">
                      {report.details || 'No additional details'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-[#c43c3c]/15 text-[#c43c3c] border border-[#c43c3c]/30 px-1.5 py-0.5 rounded-[1px] shrink-0">
                    {report.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
