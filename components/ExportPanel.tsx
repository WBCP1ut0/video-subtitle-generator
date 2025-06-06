'use client'

import { useState } from 'react'
import { Download, FileText, Video, Settings, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'

interface ExportJob {
  id: string
  type: 'srt' | 'vtt' | 'video'
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  downloadUrl?: string
  error?: string
}

export default function ExportPanel() {
  const { subtitles, originalLanguage, targetLanguages, videoFile, videoUrl } = useStore()
  const [selectedLanguage, setSelectedLanguage] = useState(originalLanguage)
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])
  const [videoSettings, setVideoSettings] = useState({
    quality: 'medium',
    fontSize: 'medium',
    fontColor: '#ffffff',
    backgroundColor: '#000000',
    position: 'bottom'
  })

  const availableLanguages = [originalLanguage, ...targetLanguages]
  const filteredSubtitles = subtitles.filter(sub => sub.language === selectedLanguage)

  const generateSRT = (subs: typeof subtitles): string => {
    return subs
      .map((sub, index) => {
        const startTime = formatSRTTime(sub.startTime)
        const endTime = formatSRTTime(sub.endTime)
        return `${index + 1}\n${startTime} --> ${endTime}\n${sub.text}\n`
      })
      .join('\n')
  }

  const generateVTT = (subs: typeof subtitles): string => {
    const content = subs
      .map(sub => {
        const startTime = formatVTTTime(sub.startTime)
        const endTime = formatVTTTime(sub.endTime)
        return `${startTime} --> ${endTime}\n${sub.text}\n`
      })
      .join('\n')
    return `WEBVTT\n\n${content}`
  }

  const formatSRTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms
      .toString()
      .padStart(3, '0')}`
  }

  const formatVTTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms
      .toString()
      .padStart(3, '0')}`
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportSRT = () => {
    if (filteredSubtitles.length === 0) return
    
    const content = generateSRT(filteredSubtitles)
    const filename = `subtitles_${selectedLanguage}.srt`
    downloadFile(content, filename, 'text/plain')
  }

  const handleExportVTT = () => {
    if (filteredSubtitles.length === 0) return
    
    const content = generateVTT(filteredSubtitles)
    const filename = `subtitles_${selectedLanguage}.vtt`
    downloadFile(content, filename, 'text/vtt')
  }

  const handleExportVideo = async () => {
    if (!videoFile && !videoUrl) return
    if (filteredSubtitles.length === 0) return

    const jobId = Date.now().toString()
    const newJob: ExportJob = {
      id: jobId,
      type: 'video',
      status: 'processing',
      progress: 0
    }

    setExportJobs(prev => [...prev, newJob])

    try {
      const formData = new FormData()
      
      if (videoFile) {
        formData.append('video', videoFile)
      } else if (videoUrl) {
        formData.append('video_url', videoUrl)
      }
      
      formData.append('subtitles', JSON.stringify(filteredSubtitles))
      formData.append('settings', JSON.stringify(videoSettings))
      formData.append('language', selectedLanguage)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportJobs(prev => prev.map(job => 
          job.id === jobId && job.progress < 90 
            ? { ...job, progress: job.progress + 15 }
            : job
        ))
      }, 2000)

      const response = await fetch('/api/export-video', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Video export failed')
      }

      const data = await response.json()

      setExportJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'completed', progress: 100, downloadUrl: data.download_url }
          : job
      ))
    } catch (error) {
      console.error('Video export error:', error)
      setExportJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'error', error: 'Failed to export video with subtitles' }
          : job
      ))
    }
  }

  const removeJob = (jobId: string) => {
    setExportJobs(prev => prev.filter(job => job.id !== jobId))
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Download className="w-6 h-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Export</h2>
      </div>

      {/* Language Selection */}
      {availableLanguages.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableLanguages.map(lang => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Export Options */}
      <div className="space-y-4 mb-6">
        {/* SRT Export */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">SRT Format</h3>
              <p className="text-sm text-gray-600">Standard subtitle format, works with most players</p>
            </div>
          </div>
          <button
            onClick={handleExportSRT}
            disabled={filteredSubtitles.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Download SRT
          </button>
        </div>

        {/* VTT Export */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">VTT Format</h3>
              <p className="text-sm text-gray-600">Web Video Text Tracks, ideal for web players</p>
            </div>
          </div>
          <button
            onClick={handleExportVTT}
            disabled={filteredSubtitles.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Download VTT
          </button>
        </div>

        {/* Video with Burned Subtitles */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Video className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Video with Burned Subtitles</h3>
                <p className="text-sm text-gray-600">Export video with permanently embedded subtitles</p>
              </div>
            </div>
            <button
              onClick={handleExportVideo}
              disabled={filteredSubtitles.length === 0 || (!videoFile && !videoUrl)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Export Video
            </button>
          </div>

          {/* Video Settings */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-gray-600 mb-1">Quality</label>
              <select
                value={videoSettings.quality}
                onChange={(e) => setVideoSettings(prev => ({ ...prev, quality: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="low">Low (720p)</option>
                <option value="medium">Medium (1080p)</option>
                <option value="high">High (1440p)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-600 mb-1">Font Size</label>
              <select
                value={videoSettings.fontSize}
                onChange={(e) => setVideoSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Export Jobs */}
      {exportJobs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Export Progress</h3>
          {exportJobs.map((job) => (
            <div key={job.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {job.status === 'processing' && (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-2" />
                  )}
                  <span className="font-medium capitalize">
                    {job.type} Export - {job.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {job.status === 'completed' && job.downloadUrl && (
                    <a
                      href={job.downloadUrl}
                      download
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Download
                    </a>
                  )}
                  <button
                    onClick={() => removeJob(job.id)}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
              
              {job.status === 'processing' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              )}
              
              {job.error && (
                <p className="text-red-600 text-sm mt-2">{job.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Ready to export {filteredSubtitles.length} subtitle{filteredSubtitles.length !== 1 ? 's' : ''} in {selectedLanguage.toUpperCase()}
        </p>
      </div>
    </div>
  )
} 