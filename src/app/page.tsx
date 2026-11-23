import React from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { HeroSlider } from '@/components/anime/HeroSlider'
import { AnimeRow } from '@/components/anime/AnimeRow'
import { TopTenSection } from '@/components/anime/TopTenSection'
import { ScheduleCard } from '@/components/anime/ScheduleCard'
import { GenreTag } from '@/components/anime/GenreTag'
import { ContinueWatchingCard } from '@/components/anime/ContinueWatchingCard'
import { GENRES } from '@/lib/constants'
import { Calendar, Megaphone, Clock } from 'lucide-react'
import { getServerLocale, getServerTranslations } from '@/lib/i18n'

// Revalidate every 60 seconds
export const revalidate = 60

export default async function HomePage() {
  const session = await auth()
  const locale = await getServerLocale()
  const { t } = getServerTranslations(locale)

  // Fetch all homepage data in parallel
  const [
    spotlightAnime,
    trendingAnime,
    latestAnime,
    popularAnime,
    topAiring,
    newReleases,
    donghuaAnime,
    topTenToday,
    topTenWeek,
    topTenMonth,
    todaySchedules,
    announcements,
    continueWatching,
  ] = await Promise.all([
    // Spotlight items
    db.anime.findMany({
      where: { isSpotlight: true },
      orderBy: { spotlightOrder: 'asc' },
      take: 6,
      include: { genres: { include: { genre: true } } },
    }),

    // Trending Now
    db.anime.findMany({
      orderBy: { trending: 'desc' },
      take: 12,
      include: { genres: { include: { genre: true } } },
    }),

    // Recently Updated
    db.anime.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 12,
      include: { genres: { include: { genre: true } } },
    }),

    // Most Popular
    db.anime.findMany({
      orderBy: { popularity: 'desc' },
      take: 12,
      include: { genres: { include: { genre: true } } },
    }),

    // Top Airing
    db.anime.findMany({
      where: { status: 'AIRING' },
      orderBy: { averageScore: 'desc' },
      take: 12,
      include: { genres: { include: { genre: true } } },
    }),

    // New Releases (by year and creation)
    db.anime.findMany({
      where: { year: { gte: 2023 } },
      orderBy: { year: 'desc' },
      take: 12,
      include: { genres: { include: { genre: true } } },
    }),

    // Donghua (Chinese Animation)
    db.anime.findMany({
      where: { category: 'DONGHUA' },
      orderBy: { popularity: 'desc' },
      take: 12,
      include: { genres: { include: { genre: true } } },
    }),

    // Top 10 Today (sorted by trending)
    db.anime.findMany({
      orderBy: { trending: 'desc' },
      take: 10,
      include: { genres: { include: { genre: true } } },
    }),

    // Top 10 Week (sorted by views)
    db.anime.findMany({
      orderBy: { views: 'desc' },
      take: 10,
      include: { genres: { include: { genre: true } } },
    }),

    // Top 10 Month (sorted by average score)
    db.anime.findMany({
      orderBy: { averageScore: 'desc' },
      take: 10,
      include: { genres: { include: { genre: true } } },
    }),

    // Airing Schedules
    db.schedule.findMany({
      orderBy: { airingAt: 'asc' },
      take: 5,
      include: {
        anime: {
          select: {
            id: true,
            title: true,
            slug: true,
            poster: true,
            type: true,
          },
        },
      },
    }),

    // Active Announcements
    db.announcement.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 1,
    }),

    // Continue Watching for current logged-in user
    session?.user?.id
      ? db.watchHistory.findMany({
          where: { userId: session.user.id },
          orderBy: { updatedAt: 'desc' },
          take: 6,
          include: {
            anime: { select: { title: true, slug: true, poster: true } },
            episode: { select: { number: true, title: true } },
          },
        })
      : Promise.resolve([]),
  ])

  // Fallback spotlight if empty
  const spotlightItems = spotlightAnime.length > 0 ? spotlightAnime : popularAnime.slice(0, 5)

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0b0d] text-[#d9d9de]">
      <Header />

      <main className="flex-1 pt-16">
        <div className="flex flex-col gap-6 pb-12">
          {/* Active Announcement Bar */}
          {announcements.length > 0 && (
            <div className="bg-[#17171b] border-b border-[#26262c] py-2 px-4 text-xs flex items-center justify-center gap-2">
              <Megaphone size={14} className="text-[#a0a0b0] shrink-0" />
              <span className="font-semibold text-[#d9d9de]">{announcements[0].title}:</span>
              <span className="text-[#8b8b94]">{announcements[0].content}</span>
            </div>
          )}

          {/* Cinematic Hero Spotlight Slider */}
          {spotlightItems.length > 0 && <HeroSlider items={spotlightItems as any} />}

          {/* Main Layout Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row gap-8">
            {/* Left Column: Anime Rows & Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {/* Continue Watching (Progress Bar) */}
              {continueWatching.length > 0 && (
                <div className="flex flex-col gap-3 p-4 bg-[#111114] border border-[#26262c] rounded-[2px]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-bold font-heading uppercase tracking-wide text-[#d9d9de] flex items-center gap-2">
                      <Clock size={16} className="text-[#a0a0b0]" /> {t('home.continue_watching')}
                    </h2>
                    <span className="text-xs font-mono text-[#8b8b94]">
                      {t('home.titles_in_progress', { count: continueWatching.length })}
                    </span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {continueWatching.map((item) => (
                      <ContinueWatchingCard
                        key={item.id}
                        anime={item.anime}
                        episode={item.episode}
                        progress={item.progress}
                        duration={item.duration}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Now */}
              {trendingAnime.length > 0 && (
                <AnimeRow
                  title={t('home.trending_now')}
                  subtitle={t('home.trending_subtitle')}
                  viewAllHref="/browse?sort=trending"
                  items={trendingAnime as any}
                />
              )}

              {/* Donghua Section (Chinese Animation) - Distinct Styling */}
              {donghuaAnime.length > 0 && (
                <div className="p-4 bg-[#111114] border border-[#26262c] rounded-[2px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#a0a0b0]/5 rounded-full blur-2xl pointer-events-none" />
                  <AnimeRow
                    title={t('home.donghua_title')}
                    subtitle={t('home.donghua_subtitle')}
                    viewAllHref="/donghua"
                    items={donghuaAnime as any}
                  />
                </div>
              )}

              {/* Recently Updated */}
              {latestAnime.length > 0 && (
                <AnimeRow
                  title={t('home.recently_updated')}
                  subtitle={t('home.recently_updated_subtitle')}
                  viewAllHref="/browse?sort=updated"
                  items={latestAnime as any}
                />
              )}

              {/* New Releases */}
              {newReleases.length > 0 && (
                <AnimeRow
                  title={t('home.new_releases')}
                  subtitle={t('home.new_releases_subtitle')}
                  viewAllHref="/browse?year=2024&sort=newest"
                  items={newReleases as any}
                />
              )}

              {/* Top Airing */}
              {topAiring.length > 0 && (
                <AnimeRow
                  title={t('home.top_airing')}
                  subtitle={t('home.top_airing_subtitle')}
                  viewAllHref="/browse?status=AIRING&sort=score"
                  items={topAiring as any}
                />
              )}

              {/* All-time Most Popular */}
              {popularAnime.length > 0 && (
                <AnimeRow
                  title={t('home.most_popular')}
                  subtitle={t('home.most_popular_subtitle')}
                  viewAllHref="/browse?sort=popular"
                  items={popularAnime as any}
                />
              )}

              {/* Genre Explorer Cloud */}
              <div className="flex flex-col gap-3 p-4 bg-[#111114] border border-[#26262c] rounded-[2px]">
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[#a0a0b0] rounded-[1px] inline-block" />
                  {t('home.explore_by_genre')}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {GENRES.map((genre) => (
                    <GenreTag
                      key={genre}
                      name={genre}
                      slug={genre.toLowerCase().replace(/\s+/g, '-')}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Top 10 with Tabs & Airing Schedule */}
            <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
              {/* Top 10 Leaderboard (Today / Week / Month tabs) */}
              <TopTenSection
                todayItems={topTenToday as any}
                weekItems={topTenWeek as any}
                monthItems={topTenMonth as any}
              />

              {/* Today's Schedule Preview */}
              {todaySchedules.length > 0 && (
                <div className="flex flex-col gap-3 bg-[#111114] border border-[#26262c] rounded-[2px] p-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#26262c]">
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] flex items-center gap-1.5">
                      <Calendar size={15} className="text-[#a0a0b0]" /> {t('home.airing_today')}
                    </h3>
                    <Link href="/schedule" className="text-[11px] font-mono text-[#8b8b94] hover:text-[#a0a0b0]">
                      {t('home.full_schedule')} &rarr;
                    </Link>
                  </div>

                  <div className="flex flex-col gap-2">
                    {todaySchedules.map((schedule) => (
                      <ScheduleCard key={schedule.id} item={schedule as any} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
