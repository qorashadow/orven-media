'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  FastForward,
  RotateCcw,
  SkipForward,
  SkipBack,
  Settings as SettingsIcon,
  Subtitles,
  Moon,
  Tv,
  PictureInPicture,
} from 'lucide-react'
import { usePlayer, type SubtitleTrack } from '@/hooks/usePlayer'
import { useWatchHistory } from '@/hooks/useWatchHistory'
import { formatTimestamp, cn } from '@/lib/utils'
import { PLAYER_SPEEDS } from '@/lib/constants'
import { useI18n } from '@/context/I18nContext'

export interface VideoPlayerProps {
  animeId: string
  episodeId: string
  animeSlug: string
  videoUrl?: string | null
  videoType?: 'mp4' | 'hls'
  initialTime?: number
  subtitles?: SubtitleTrack[]
  introStart?: number | null
  introEnd?: number | null
  outroStart?: number | null
  onNextEpisode?: () => void
  onPrevEpisode?: () => void
  hasNextEpisode?: boolean
  hasPrevEpisode?: boolean
  episodeNumber?: number
  animeTitle?: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  animeId,
  episodeId,
  animeSlug,
  videoUrl,
  videoType = 'mp4',
  initialTime = 0,
  subtitles = [],
  introStart,
  introEnd,
  outroStart,
  onNextEpisode,
  onPrevEpisode,
  hasNextEpisode = false,
  hasPrevEpisode = false,
  episodeNumber,
  animeTitle,
}) => {
  const { saveProgress } = useWatchHistory(animeId, episodeId)
  const { t } = useI18n()
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = useState<number>(0)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Use dummy MP4 video if videoUrl is missing or invalid for testing
  const resolvedVideoUrl =
    videoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  const {
    videoRef,
    containerRef,
    isPlaying,
    currentTime,
    duration,
    buffered,
    volume,
    isMuted,
    playbackRate,
    isFullscreen,
    isTheater,
    isPiP,
    isLightsOff,
    levels,
    currentLevel,
    activeSubtitle,
    isBuffering,
    isControlsVisible,
    isInIntro,
    isInOutro,
    togglePlay,
    seek,
    seekRelative,
    changeVolume,
    toggleMute,
    changePlaybackRate,
    changeQualityLevel,
    setActiveSubtitle,
    toggleFullscreen,
    togglePiP,
    toggleTheater,
    toggleLightsOff,
    skipIntro,
    handleMouseMove,
  } = usePlayer({
    videoUrl: resolvedVideoUrl,
    videoType,
    initialTime,
    subtitles,
    introStart,
    introEnd,
    outroStart,
    onTimeUpdate: (cur, dur) => saveProgress(cur, dur),
    onNextEpisode,
    onPrevEpisode,
    autoPlay: false,
  })

  // Handle Seekbar hover
  const handleSeekMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setHoverPosition(e.clientX - rect.left)
    setHoverTime(pos * duration)
  }

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seek(pos * duration)
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0

  return (
    <>
      {/* Lights off background overlay */}
      {isLightsOff && <div className="lights-off-overlay" onClick={toggleLightsOff} />}

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className={cn(
          'relative w-full bg-black overflow-hidden select-none group',
          isTheater ? 'aspect-[21/9] min-h-[420px]' : 'aspect-video',
          isLightsOff && 'lights-off shadow-2xl ring-1 ring-[#26262c]'
        )}
      >
        {/* HTML5 Video element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          onClick={togglePlay}
        >
          {subtitles.map((sub) => (
            <track
              key={sub.id}
              kind="subtitles"
              label={sub.label}
              srcLang={sub.language}
              src={sub.url}
              default={sub.isDefault || activeSubtitle === sub.language}
            />
          ))}
        </video>

        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <div className="w-12 h-12 border-4 border-[#a0a0b0] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Center Big Play Button (when paused) */}
        {!isPlaying && !isBuffering && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-[#a0a0b0]/90 text-[#0b0b0d] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
              <Play size={28} className="fill-[#0b0b0d] ml-1" />
            </div>
          </div>
        )}

        {/* Skip Intro Button */}
        {isInIntro && (
          <button
            onClick={skipIntro}
            className="absolute bottom-20 right-6 z-30 px-4 py-2 bg-[#17171b]/95 hover:bg-[#202026] border border-[#a0a0b0] text-[#a0a0b0] text-xs font-mono font-bold uppercase tracking-wider rounded-[1px] flex items-center gap-2 shadow-xl animate-in fade-in slide-in-from-right-4 transition-all"
          >
            <FastForward size={14} /> Skip Intro
          </button>
        )}

        {/* Skip Outro / Next Ep Button */}
        {isInOutro && hasNextEpisode && (
          <button
            onClick={onNextEpisode}
            className="absolute bottom-20 right-6 z-30 px-4 py-2 bg-[#a0a0b0] hover:bg-[#b8b8c8] text-[#0b0b0d] text-xs font-mono font-bold uppercase tracking-wider rounded-[1px] flex items-center gap-2 shadow-xl animate-in fade-in slide-in-from-right-4 transition-all"
          >
            Next Episode <SkipForward size={14} />
          </button>
        )}

        {/* Controls Overlay */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col justify-between p-3 sm:p-4 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none transition-opacity duration-200',
            isControlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Top Bar: Title & Lights off */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-xs sm:text-sm text-[#d9d9de] truncate max-w-xs sm:max-w-md">
                {animeTitle} {episodeNumber ? `• EP ${episodeNumber}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleLightsOff}
                className={cn(
                  'p-1.5 text-xs rounded-[1px] flex items-center gap-1 transition-colors',
                  isLightsOff ? 'bg-[#a0a0b0] text-[#0b0b0d]' : 'text-[#8b8b94] hover:text-[#d9d9de]'
                )}
                title="Lights off mode"
              >
                <Moon size={15} />
              </button>
            </div>
          </div>

          {/* Bottom Bar: Progress Bar & Controls */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            {/* Progress Bar Container */}
            <div
              ref={progressBarRef}
              onClick={handleSeekClick}
              onMouseMove={handleSeekMouseMove}
              onMouseLeave={() => setHoverTime(null)}
              className="relative w-full h-2.5 flex items-center cursor-pointer group/bar"
            >
              {/* Background Track */}
              <div className="w-full h-1 group-hover/bar:h-1.5 bg-[#26262c] rounded-[1px] relative overflow-hidden transition-all">
                {/* Buffered Track */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-[#3a3a44] transition-all"
                  style={{ width: `${bufferedPercent}%` }}
                />
                {/* Played Track */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-[#a0a0b0] transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Scrubber thumb */}
              <div
                className="absolute w-3 h-3 bg-[#a0a0b0] rounded-full shadow-md -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `${progressPercent}%` }}
              />

              {/* Hover Time Preview Tooltip */}
              {hoverTime !== null && (
                <div
                  className="absolute bottom-4 -translate-x-1/2 px-2 py-0.5 bg-[#17171b] border border-[#26262c] text-[10px] font-mono text-[#d9d9de] rounded-[1px] pointer-events-none shadow-lg whitespace-nowrap"
                  style={{ left: `${hoverPosition}px` }}
                >
                  {formatTimestamp(hoverTime)}
                </div>
              )}
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between text-[#d9d9de] text-xs">
              {/* Left group */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Play / Pause */}
                <button
                  onClick={togglePlay}
                  className="p-1 hover:text-[#a0a0b0] transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>

                {/* Prev / Next Episode */}
                {hasPrevEpisode && (
                  <button
                    onClick={onPrevEpisode}
                    className="p-1 hover:text-[#a0a0b0] transition-colors"
                    title="Previous episode (P)"
                  >
                    <SkipBack size={16} />
                  </button>
                )}
                {hasNextEpisode && (
                  <button
                    onClick={onNextEpisode}
                    className="p-1 hover:text-[#a0a0b0] transition-colors"
                    title="Next episode (N)"
                  >
                    <SkipForward size={16} />
                  </button>
                )}

                {/* Rewind / Fast forward 10s */}
                <button
                  onClick={() => seekRelative(-10)}
                  className="p-1 hover:text-[#a0a0b0] transition-colors hidden sm:block"
                  title="Rewind 10s (J)"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => seekRelative(10)}
                  className="p-1 hover:text-[#a0a0b0] transition-colors hidden sm:block"
                  title="Forward 10s (L)"
                >
                  <FastForward size={15} />
                </button>

                {/* Volume */}
                <div className="flex items-center gap-1.5 group/volume">
                  <button
                    onClick={toggleMute}
                    className="p-1 hover:text-[#a0a0b0] transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => changeVolume(parseFloat(e.target.value))}
                    className="w-14 sm:w-16 h-1 accent-[#a0a0b0] cursor-pointer"
                  />
                </div>

                {/* Time Display */}
                <span className="text-[11px] font-mono text-[#8b8b94] ml-1">
                  {formatTimestamp(currentTime)} / {formatTimestamp(duration)}
                </span>
              </div>

              {/* Right group */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Subtitles dropdown */}
                {subtitles.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowSubtitleMenu(!showSubtitleMenu)
                        setShowSettingsMenu(false)
                      }}
                      className={cn(
                        'p-1 transition-colors',
                        activeSubtitle !== 'off' ? 'text-[#a0a0b0]' : 'hover:text-[#a0a0b0]'
                      )}
                      title={t('watch.subtitles')}
                    >
                      <Subtitles size={17} />
                    </button>

                    {showSubtitleMenu && (
                      <div className="absolute bottom-8 right-0 bg-[#17171b] border border-[#26262c] rounded-[2px] shadow-2xl py-1 min-w-[140px] z-50">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b8b94] px-3 py-1 block border-b border-[#26262c]">
                          {t('watch.subtitles')}
                        </span>
                        <button
                          onClick={() => {
                            setActiveSubtitle('off')
                            setShowSubtitleMenu(false)
                          }}
                          className={cn(
                            'w-full px-3 py-1.5 text-xs text-left transition-colors',
                            activeSubtitle === 'off' ? 'text-[#a0a0b0] font-bold' : 'hover:bg-[#202026]'
                          )}
                        >
                          {t('watch.subtitles_off')}
                        </button>
                        {subtitles.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setActiveSubtitle(sub.language)
                              setShowSubtitleMenu(false)
                            }}
                            className={cn(
                              'w-full px-3 py-1.5 text-xs text-left transition-colors',
                              activeSubtitle === sub.language
                                ? 'text-[#a0a0b0] font-bold'
                                : 'hover:bg-[#202026]'
                            )}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings (Speed & Quality) */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSettingsMenu(!showSettingsMenu)
                      setShowSubtitleMenu(false)
                    }}
                    className="p-1 hover:text-[#a0a0b0] transition-colors"
                    title="Settings"
                  >
                    <SettingsIcon size={17} />
                  </button>

                  {showSettingsMenu && (
                    <div className="absolute bottom-8 right-0 bg-[#17171b] border border-[#26262c] rounded-[2px] shadow-2xl p-2 min-w-[160px] z-50 flex flex-col gap-2">
                      {/* Speed */}
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b8b94] block mb-1">
                          Playback Speed
                        </span>
                        <div className="grid grid-cols-4 gap-1">
                          {PLAYER_SPEEDS.map((spd) => (
                            <button
                              key={spd}
                              onClick={() => {
                                changePlaybackRate(spd)
                                setShowSettingsMenu(false)
                              }}
                              className={cn(
                                'text-[10px] font-mono py-1 rounded-[1px] transition-colors',
                                playbackRate === spd
                                  ? 'bg-[#a0a0b0] text-[#0b0b0d] font-bold'
                                  : 'bg-[#111114] text-[#8b8b94] hover:text-[#d9d9de]'
                              )}
                            >
                              {spd}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quality */}
                      {levels.length > 0 && (
                        <div className="pt-2 border-t border-[#26262c]">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b8b94] block mb-1">
                            Quality
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => {
                                changeQualityLevel(-1)
                                setShowSettingsMenu(false)
                              }}
                              className={cn(
                                'text-left text-xs py-1 px-2 rounded-[1px] transition-colors',
                                currentLevel === -1
                                  ? 'bg-[#a0a0b0]/20 text-[#a0a0b0] font-bold'
                                  : 'hover:bg-[#202026]'
                              )}
                            >
                              Auto
                            </button>
                            {levels.map((lvl, index) => (
                              <button
                                key={lvl.name}
                                onClick={() => {
                                  changeQualityLevel(index)
                                  setShowSettingsMenu(false)
                                }}
                                className={cn(
                                  'text-left text-xs py-1 px-2 rounded-[1px] transition-colors',
                                  currentLevel === index
                                    ? 'bg-[#a0a0b0]/20 text-[#a0a0b0] font-bold'
                                    : 'hover:bg-[#202026]'
                                )}
                              >
                                {lvl.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* PiP */}
                <button
                  onClick={togglePiP}
                  className="p-1 hover:text-[#a0a0b0] transition-colors hidden sm:block"
                  title="Picture in Picture (I)"
                >
                  <PictureInPicture size={17} />
                </button>

                {/* Theater mode */}
                <button
                  onClick={toggleTheater}
                  className="p-1 hover:text-[#a0a0b0] transition-colors hidden sm:block"
                  title="Theater mode (T)"
                >
                  <Tv size={17} />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1 hover:text-[#a0a0b0] transition-colors"
                  title="Fullscreen (F)"
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
