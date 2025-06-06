'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, Loader2, CheckCircle, AlertCircle, Languages } from 'lucide-react'
import { useStore } from '@/lib/store'
import confetti from 'canvas-confetti'

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
]

export default function TranscriptionPanel() {
  const {
    videoFile,
    videoUrl,
    originalLanguage,
    targetLanguages,
    isTranscribing,
    transcriptionJob,
    subtitles,
    setOriginalLanguage,
    addTargetLanguage,
    removeTargetLanguage,
    setIsTranscribing,
    setTranscriptionJob,
    setSubtitles
  } = useStore()

  const [realProgress, setRealProgress] = useState(0)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatingLanguages, setTranslatingLanguages] = useState<Set<string>>(new Set())
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Trigger confetti when transcription completes
  useEffect(() => {
    if (transcriptionJob?.status === 'completed' && subtitles.length > 0) {
      console.log('🎉 Triggering confetti animation!')
      
      // Trigger confetti animation
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 }

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)
    }
  }, [transcriptionJob?.status, subtitles.length])

  const startTranscription = async () => {
    if (!videoFile && !videoUrl) return

    setIsTranscribing(true)
    setRealProgress(0)
    
    const newJob = {
      id: Date.now().toString(),
      status: 'processing' as const,
      progress: 0,
      videoFile: videoFile || undefined,
      videoUrl: videoUrl || undefined
    }
    
    setTranscriptionJob(newJob)

    try {
      const formData = new FormData()
      if (videoFile) {
        formData.append('video', videoFile)
      } else if (videoUrl) {
        formData.append('video_url', videoUrl)
      }
      formData.append('language', originalLanguage)

      // Realistic progress simulation
      const progressSteps = [
        { step: 10, delay: 500, message: 'Downloading video...' },
        { step: 25, delay: 1000, message: 'Extracting audio...' },
        { step: 40, delay: 1500, message: 'Loading AI model...' },
        { step: 60, delay: 2000, message: 'Transcribing speech...' },
        { step: 85, delay: 3000, message: 'Processing results...' },
        { step: 95, delay: 500, message: 'Finalizing...' }
      ]

      let currentStep = 0
      progressIntervalRef.current = setInterval(() => {
        if (currentStep < progressSteps.length) {
          const { step } = progressSteps[currentStep]
          setRealProgress(step)
          setTranscriptionJob({
            ...newJob,
            progress: step
          })
          currentStep++
        }
      }, 1000)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const data = await response.json()
      
      // Convert response to subtitle format
      const newSubtitles = data.segments.map((segment: any, index: number) => ({
        id: `subtitle-${index}`,
        startTime: segment.start,
        endTime: segment.end,
        text: segment.text.trim(),
        language: originalLanguage
      }))

      setSubtitles(newSubtitles)
      setRealProgress(100)
      setTranscriptionJob({
        ...newJob,
        status: 'completed',
        progress: 100
      })
      
    } catch (error) {
      console.error('Transcription error:', error)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      setTranscriptionJob({
        ...newJob,
        status: 'error',
        error: 'Failed to transcribe video. Please try again.'
      })
    } finally {
      setIsTranscribing(false)
    }
  }

  const translateSubtitles = async (targetLang: string) => {
    if (subtitles.length === 0 || translatingLanguages.has(targetLang)) return

    console.log(`🌍 Starting translation to ${targetLang}`)
    setTranslatingLanguages(prev => new Set(prev).add(targetLang))

    try {
      // Filter subtitles for the original language only
      const originalSubtitles = subtitles.filter(sub => sub.language === originalLanguage)
      
      if (originalSubtitles.length === 0) {
        throw new Error('No original subtitles found for translation')
      }

      console.log(`📝 Translating ${originalSubtitles.length} subtitles from ${originalLanguage} to ${targetLang}`)
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subtitles: originalSubtitles.map(sub => sub.text),
          source_language: originalLanguage,
          target_language: targetLang
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Translation successful:', data)
      
      if (!data.translations || !Array.isArray(data.translations)) {
        throw new Error('Invalid translation response format')
      }

      // Create translated subtitles
      const translatedSubtitles = originalSubtitles.map((subtitle, index) => ({
        ...subtitle,
        id: `${subtitle.id}-${targetLang}`,
        text: data.translations[index] || subtitle.text,
        originalText: subtitle.text,
        language: targetLang
      }))

      setSubtitles([...subtitles, ...translatedSubtitles])
      addTargetLanguage(targetLang)
      
      console.log(`🎉 Successfully added ${translatedSubtitles.length} translated subtitles`)
    } catch (error) {
      console.error('❌ Translation error:', error)
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Translation failed: ${errorMessage}\n\nPlease check:\n1. Backend server is running\n2. Translation API is configured\n3. Internet connection`)
    } finally {
      setTranslatingLanguages(prev => {
        const newSet = new Set(prev)
        newSet.delete(targetLang)
        return newSet
      })
    }
  }

  const hasTranscription = subtitles.length > 0
  const canTranscribe = (videoFile || videoUrl) && !isTranscribing

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Mic className="w-6 h-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Transcription</h2>
      </div>

      {/* Language Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Original Language
        </label>
        <select
          value={originalLanguage}
          onChange={(e) => setOriginalLanguage(e.target.value)}
          disabled={isTranscribing}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Transcription Status */}
      {transcriptionJob && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {transcriptionJob.status === 'processing' && (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-2" />
              )}
              {transcriptionJob.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              )}
              {transcriptionJob.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              )}
              <span className="font-medium capitalize">
                {transcriptionJob.status === 'processing' ? 'Transcribing...' : transcriptionJob.status}
              </span>
            </div>
            {transcriptionJob.status === 'processing' && (
              <span className="text-sm text-gray-600">
                {realProgress}%
              </span>
            )}
          </div>
          
          {transcriptionJob.status === 'processing' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${realProgress}%` }}
              />
            </div>
          )}
          
          {transcriptionJob.error && (
            <p className="text-red-600 text-sm mt-2">{transcriptionJob.error}</p>
          )}
        </div>
      )}

      {/* Start Transcription */}
      {!hasTranscription && (
        <button
          onClick={startTranscription}
          disabled={!canTranscribe}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
        >
          {isTranscribing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Transcribing...
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              Generate Subtitles
            </>
          )}
        </button>
      )}

      {/* Translation Options */}
      {hasTranscription && (
        <div className="space-y-4">
          <div className="flex items-center">
            <Languages className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Translation</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SUPPORTED_LANGUAGES
              .filter(lang => lang.code !== originalLanguage && !targetLanguages.includes(lang.code))
              .map(lang => (
                <button
                  key={lang.code}
                  onClick={() => translateSubtitles(lang.code)}
                  disabled={translatingLanguages.has(lang.code)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {translatingLanguages.has(lang.code) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Translating...
                    </>
                  ) : (
                    lang.name
                  )}
                </button>
              ))}
          </div>

          {targetLanguages.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Translated Languages:</p>
              <div className="flex flex-wrap gap-2">
                {targetLanguages.map(langCode => {
                  const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode)
                  return (
                    <span
                      key={langCode}
                      className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {lang?.name}
                      <button
                        onClick={() => removeTargetLanguage(langCode)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 