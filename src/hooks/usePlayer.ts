'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Hls from 'hls.js'
import { KEYBOARD_SHORTCUTS } from '@/lib/constants'

export interface SubtitleTrack {
  id: string
  label: string
  language: string
  url: string
  isDefault?: boolean
}

export interface VideoLevel {
  height: number
  bitrate: number
  name: string
}

export interface UsePlayerProps {
  videoUrl?: string | null
  videoType?: 'mp4' | 'hls'
  initialTime?: number
  subtitles?: SubtitleTrack[]
  introStart?: number | null
  introEnd?: number | null
  outroStart?: number | null
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onEnded?: () => void
  onNextEpisode?: () => void
  onPrevEpisode?: () => void
  autoPlay?: boolean
  autoNext?: boolean
}

export function usePlayer({
  videoUrl,
  videoType = 'mp4',
  initialTime = 0,
  subtitles = [],
  introStart,
  introEnd,
  outroStart,
  onTimeUpdate,
  onEnded,
  onNextEpisode,
  onPrevEpisode,
  autoPlay = false,
  autoNext = true,
}: UsePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isTheater, setIsTheater] = useState(false)
  const [isPiP, setIsPiP] = useState(false)
  const [isLightsOff, setIsLightsOff] = useState(false)
  const [levels, setLevels] = useState<VideoLevel[]>([])
  const [currentLevel, setCurrentLevel] = useState<number>(-1) // -1 is auto
  const [activeSubtitle, setActiveSubtitle] = useState<string>('off')
  const [isBuffering, setIsBuffering] = useState(false)
  const [isControlsVisible, setIsControlsVisible] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Video & HLS
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    const isHlsUrl = videoUrl.includes('.m3u8') || videoType === 'hls'

    if (isHlsUrl && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      })
      hlsRef.current = hls
      hls.loadSource(videoUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const qualityLevels: VideoLevel[] = data.levels.map((lvl, index) => ({
          height: lvl.height,
          bitrate: lvl.bitrate,
          name: lvl.height ? `${lvl.height}p` : `Level ${index}`,
        }))
        setLevels(qualityLevels)

        if (initialTime > 0) {
          video.currentTime = initialTime
        }
        if (autoPlay) {
          video.play().catch(() => setIsPlaying(false))
        }
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentLevel(data.level)
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError()
              break
            default:
              hls.destroy()
              break
          }
        }
      })
    } else {
      // Native MP4 or native HLS (Safari)
      video.src = videoUrl
      if (initialTime > 0) {
        video.currentTime = initialTime
      }
      if (autoPlay) {
        video.play().catch(() => setIsPlaying(false))
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [videoUrl, videoType, autoPlay, initialTime])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      onTimeUpdate?.(video.currentTime, video.duration || 0)

      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        setBuffered(bufferedEnd)
      }
    }
    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0)
    }
    const handleWaiting = () => setIsBuffering(true)
    const handlePlaying = () => setIsBuffering(false)
    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
      if (autoNext && onNextEpisode) {
        onNextEpisode()
      }
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('ended', handleEnded)
    }
  }, [onTimeUpdate, onEnded, autoNext, onNextEpisode])

  // Playback actions
  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [])

  const seek = useCallback((time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(time, video.duration || 0))
  }, [])

  const seekRelative = useCallback((seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration || 0))
  }, [])

  const changeVolume = useCallback((val: number) => {
    const video = videoRef.current
    if (!video) return
    const clamped = Math.max(0, Math.min(1, val))
    video.volume = clamped
    setVolume(clamped)
    if (clamped === 0) {
      video.muted = true
      setIsMuted(true)
    } else if (isMuted) {
      video.muted = false
      setIsMuted(false)
    }
  }, [isMuted])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }, [])

  const changePlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = rate
    setPlaybackRate(rate)
  }, [])

  const changeQualityLevel = useCallback((levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex
      setCurrentLevel(levelIndex)
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setIsFullscreen(false)
    }
  }, [])

  const togglePiP = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPiP(false)
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture()
        setIsPiP(true)
      }
    } catch {}
  }, [])

  const toggleTheater = useCallback(() => {
    setIsTheater((prev) => !prev)
  }, [])

  const toggleLightsOff = useCallback(() => {
    setIsLightsOff((prev) => !prev)
  }, [])

  const skipIntro = useCallback(() => {
    if (introEnd !== undefined && introEnd !== null) {
      seek(introEnd)
    }
  }, [introEnd, seek])

  // Mouse activity auto-hide controls
  const handleMouseMove = useCallback(() => {
    setIsControlsVisible(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setIsControlsVisible(false)
      }
    }, 3000)
  }, [isPlaying])

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return
      }

      switch (e.key) {
        case KEYBOARD_SHORTCUTS.PLAY_PAUSE:
          e.preventDefault()
          togglePlay()
          break
        case KEYBOARD_SHORTCUTS.FULLSCREEN:
        case KEYBOARD_SHORTCUTS.FULLSCREEN.toUpperCase():
          e.preventDefault()
          toggleFullscreen()
          break
        case KEYBOARD_SHORTCUTS.MUTE:
        case KEYBOARD_SHORTCUTS.MUTE.toUpperCase():
          e.preventDefault()
          toggleMute()
          break
        case KEYBOARD_SHORTCUTS.SEEK_BACK_5:
          e.preventDefault()
          seekRelative(-5)
          break
        case KEYBOARD_SHORTCUTS.SEEK_FORWARD_5:
          e.preventDefault()
          seekRelative(5)
          break
        case KEYBOARD_SHORTCUTS.SEEK_BACK_10:
        case KEYBOARD_SHORTCUTS.SEEK_BACK_10.toUpperCase():
          e.preventDefault()
          seekRelative(-10)
          break
        case KEYBOARD_SHORTCUTS.SEEK_FORWARD_10:
        case KEYBOARD_SHORTCUTS.SEEK_FORWARD_10.toUpperCase():
          e.preventDefault()
          seekRelative(10)
          break
        case KEYBOARD_SHORTCUTS.VOLUME_UP:
          e.preventDefault()
          changeVolume(volume + 0.1)
          break
        case KEYBOARD_SHORTCUTS.VOLUME_DOWN:
          e.preventDefault()
          changeVolume(volume - 0.1)
          break
        case KEYBOARD_SHORTCUTS.THEATER:
        case KEYBOARD_SHORTCUTS.THEATER.toUpperCase():
          e.preventDefault()
          toggleTheater()
          break
        case KEYBOARD_SHORTCUTS.PIP:
        case KEYBOARD_SHORTCUTS.PIP.toUpperCase():
          e.preventDefault()
          togglePiP()
          break
        case KEYBOARD_SHORTCUTS.NEXT_EPISODE:
        case KEYBOARD_SHORTCUTS.NEXT_EPISODE.toUpperCase():
          if (onNextEpisode) {
            e.preventDefault()
            onNextEpisode()
          }
          break
        case KEYBOARD_SHORTCUTS.PREV_EPISODE:
        case KEYBOARD_SHORTCUTS.PREV_EPISODE.toUpperCase():
          if (onPrevEpisode) {
            e.preventDefault()
            onPrevEpisode()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    togglePlay,
    toggleFullscreen,
    toggleMute,
    seekRelative,
    changeVolume,
    volume,
    toggleTheater,
    togglePiP,
    onNextEpisode,
    onPrevEpisode,
  ])

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // In intro/outro ranges
  const isInIntro =
    introStart !== null &&
    introStart !== undefined &&
    introEnd !== null &&
    introEnd !== undefined &&
    currentTime >= introStart &&
    currentTime < introEnd

  const isInOutro =
    outroStart !== null &&
    outroStart !== undefined &&
    currentTime >= outroStart &&
    duration > 0

  return {
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
  }
}
