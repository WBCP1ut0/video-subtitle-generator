'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'
import { useStore } from '@/lib/store'
import dynamic from 'next/dynamic'

// Dynamically import ReactPlayer to avoid SSR issues and chunk loading errors
const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading video player...</div>
    </div>
  )
})

export default function VideoPlayer() {
  const {
    videoFile,
    videoUrl,
    currentTime,
    isPlaying,
    videoDuration,
    subtitles,
    setCurrentTime,
    setIsPlaying,
    setVideoDuration
  } = useStore()

  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const [playerError, setPlayerError] = useState(false)
  const playerRef = useRef<any>(null)

  const videoSrc = videoFile ? URL.createObjectURL(videoFile) : videoUrl

  useEffect(() => {
    // Reset player state when video source changes
    if (videoSrc) {
      setPlayerReady(false)
      setPlayerError(false)
    }
  }, [videoSrc])

  const handleProgress = (state: any) => {
    setCurrentTime(state.playedSeconds)
  }

  const handleDuration = (duration: number) => {
    setVideoDuration(duration)
  }

  const handleReady = () => {
    console.log('🎥 Video player ready')
    setPlayerReady(true)
    setPlayerError(false)
  }

  const handleError = (error: any) => {
    console.error('🚨 Video player error:', error)
    setPlayerError(true)
    setPlayerReady(false)
  }

  const handleSeek = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds)
      setCurrentTime(seconds)
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const skipTime = (seconds: number) => {
    const newTime = Math.max(0, Math.min(videoDuration, currentTime + seconds))
    handleSeek(newTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get current subtitle
  const currentSubtitle = subtitles.find(
    sub => currentTime >= sub.startTime && currentTime <= sub.endTime
  )

  if (!videoSrc) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-gray-500">No video selected</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Video Container */}
      <div className="relative bg-black aspect-video">
        {playerError ? (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-red-400 mb-2">❌ Failed to load video</div>
              <button 
                onClick={() => {
                  setPlayerError(false)
                  setPlayerReady(false)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            <ReactPlayer
              ref={playerRef}
              url={videoSrc}
              width="100%"
              height="100%"
              playing={isPlaying}
              volume={isMuted ? 0 : volume}
              onProgress={handleProgress}
              onDuration={handleDuration}
              onReady={handleReady}
              onError={handleError}
              config={{
                file: {
                  attributes: {
                    crossOrigin: 'anonymous',
                  },
                },
                youtube: {
                  playerVars: {
                    showinfo: 1,
                    controls: 0
                  }
                }
              }}
            />
            
            {!playerReady && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <div>Loading video...</div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Subtitle Overlay */}
        {currentSubtitle && playerReady && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg max-w-[80%] text-center">
            <p className="text-lg font-medium">{currentSubtitle.text}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(videoDuration)}</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min={0}
              max={videoDuration || 100}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              disabled={!playerReady}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => skipTime(-10)}
              disabled={!playerReady}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Skip back 10s"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              disabled={!playerReady}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>

            <button
              onClick={() => skipTime(10)}
              disabled={!playerReady}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Skip forward 10s"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              disabled={!playerReady}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              disabled={!playerReady}
              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 