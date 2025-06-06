'use client'

import { useState, useEffect } from 'react'
import VideoUpload from '@/components/VideoUpload'
import VideoPlayer from '@/components/VideoPlayer'
import SubtitleEditor from '@/components/SubtitleEditor'
import TranscriptionPanel from '@/components/TranscriptionPanel'
import ExportPanel from '@/components/ExportPanel'
import SuccessPopup from '@/components/SuccessPopup'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useStore } from '@/lib/store'

export default function Home() {
  const { videoFile, videoUrl, subtitles, transcriptionJob } = useStore()
  const [activeTab, setActiveTab] = useState<'transcribe' | 'edit' | 'export'>('transcribe')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [hasShownPopupForCurrentJob, setHasShownPopupForCurrentJob] = useState(false)

  // Show success popup when transcription completes
  useEffect(() => {
    console.log('🔍 Checking transcription status:', {
      status: transcriptionJob?.status,
      subtitleCount: subtitles.length,
      showSuccessPopup,
      hasShownPopupForCurrentJob,
      jobId: transcriptionJob?.id
    })
    
    // Only show popup if:
    // 1. Transcription is completed
    // 2. We have subtitles
    // 3. Popup is not already showing
    // 4. We haven't shown popup for this job yet
    if (
      transcriptionJob?.status === 'completed' && 
      subtitles.length > 0 && 
      !showSuccessPopup && 
      !hasShownPopupForCurrentJob
    ) {
      console.log('🎉 Showing success popup!')
      setShowSuccessPopup(true)
      setHasShownPopupForCurrentJob(true)
    }
  }, [transcriptionJob?.status, subtitles.length, showSuccessPopup, hasShownPopupForCurrentJob, transcriptionJob?.id])

  // Reset popup state when starting new transcription
  useEffect(() => {
    if (transcriptionJob?.status === 'processing' || transcriptionJob?.status === 'pending') {
      console.log('🔄 New transcription started, resetting popup state')
      setHasShownPopupForCurrentJob(false)
      setShowSuccessPopup(false)
    }
  }, [transcriptionJob?.status])

  const handleCloseSuccessPopup = () => {
    console.log('🔄 Handling popup close')
    setShowSuccessPopup(false)
  }

  const handleTabChange = (tab: 'transcribe' | 'edit' | 'export') => {
    setActiveTab(tab)
    // Close popup when switching tabs
    if (showSuccessPopup) {
      setShowSuccessPopup(false)
    }
  }

  const hasVideo = videoFile || videoUrl
  const hasSubtitles = subtitles.length > 0

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Video Subtitle Generator
          </h1>
          <p className="text-lg text-gray-600">
            Upload a video, generate subtitles with AI, translate, and export
          </p>
        </div>

        {/* Upload Section */}
        {!hasVideo && <VideoUpload />}

        {/* Main Content */}
        {hasVideo && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Video Player */}
            <div className="space-y-6">
              <ErrorBoundary>
                <VideoPlayer />
              </ErrorBoundary>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => handleTabChange('transcribe')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'transcribe'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Transcribe
                </button>
                <button
                  onClick={() => handleTabChange('edit')}
                  disabled={!hasSubtitles}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'edit' && hasSubtitles
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleTabChange('export')}
                  disabled={!hasSubtitles}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'export' && hasSubtitles
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  Export
                </button>
              </div>
            </div>

            {/* Right Panel - Content based on active tab */}
            <div className="space-y-6">
              {activeTab === 'transcribe' && <TranscriptionPanel />}
              {activeTab === 'edit' && hasSubtitles && <SubtitleEditor />}
              {activeTab === 'export' && hasSubtitles && <ExportPanel />}
            </div>
          </div>
        )}

        {/* Success Popup */}
        <SuccessPopup
          isVisible={showSuccessPopup}
          onClose={handleCloseSuccessPopup}
          title="Transcription Complete! 🎉"
          message="Your video has been successfully transcribed using AI technology."
          subtitleCount={subtitles.length}
        />
      </div>
    </main>
  )
} 