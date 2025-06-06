'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Link, FileVideo } from 'lucide-react'
import { useStore } from '@/lib/store'

export default function VideoUpload() {
  const { setVideoFile, setVideoUrl } = useStore()
  const [urlInput, setUrlInput] = useState('')
  const [isUrlMode, setIsUrlMode] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
    }
  }, [setVideoFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv']
    },
    multiple: false
  })

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (urlInput.trim()) {
      setVideoUrl(urlInput.trim())
    }
  }

  if (isUrlMode) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <Link className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Add Video URL
            </h2>
            <p className="text-gray-600">
              Enter a direct link to your video file or YouTube URL
            </p>
          </div>

          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="url"
                id="videoUrl"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/video.mp4 or YouTube URL"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={!urlInput.trim()}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Load Video
              </button>
              <button
                type="button"
                onClick={() => setIsUrlMode(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Upload File
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <FileVideo className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Upload Your Video
          </h2>
          <p className="text-gray-600">
            Drag and drop your video file or click to browse
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${
            isDragActive ? 'text-blue-500' : 'text-gray-400'
          }`} />
          
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Drop your video here...</p>
          ) : (
            <div>
              <p className="text-gray-600 font-medium mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                MP4, AVI, MOV, MKV, WebM, FLV (max 500MB)
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsUrlMode(true)}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Or use a video URL instead
          </button>
        </div>
      </div>
    </div>
  )
} 