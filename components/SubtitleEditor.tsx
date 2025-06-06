'use client'

import { useState, useRef, useEffect } from 'react'
import { Edit3, Trash2, Plus, Clock, Type } from 'lucide-react'
import { useStore } from '@/lib/store'
import type { Subtitle } from '@/lib/store'

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function parseTime(timeString: string): number {
  const [minutes, seconds] = timeString.split(':').map(Number)
  return minutes * 60 + seconds
}

export default function SubtitleEditor() {
  const {
    subtitles,
    selectedSubtitleId,
    currentTime,
    editingSubtitleId,
    originalLanguage,
    targetLanguages,
    updateSubtitle,
    deleteSubtitle,
    addSubtitle,
    setSelectedSubtitle,
    setEditingSubtitleId,
    setCurrentTime
  } = useStore()

  const [newSubtitle, setNewSubtitle] = useState({ text: '', startTime: '', endTime: '' })
  const [selectedLanguage, setSelectedLanguage] = useState(originalLanguage)
  const editRef = useRef<HTMLTextAreaElement>(null)

  // Filter subtitles by selected language
  const filteredSubtitles = subtitles.filter(sub => sub.language === selectedLanguage)

  // Sort subtitles by start time
  const sortedSubtitles = [...filteredSubtitles].sort((a, b) => a.startTime - b.startTime)

  useEffect(() => {
    if (editingSubtitleId && editRef.current) {
      editRef.current.focus()
    }
  }, [editingSubtitleId])

  const handleEditStart = (subtitle: Subtitle) => {
    setEditingSubtitleId(subtitle.id)
    setSelectedSubtitle(subtitle.id)
  }

  const handleEditSave = (subtitleId: string, newText: string) => {
    updateSubtitle(subtitleId, { text: newText.trim() })
    setEditingSubtitleId(null)
  }

  const handleEditCancel = () => {
    setEditingSubtitleId(null)
  }

  const handleTimeUpdate = (subtitleId: string, field: 'startTime' | 'endTime', value: string) => {
    const time = parseTime(value)
    if (!isNaN(time) && time >= 0) {
      updateSubtitle(subtitleId, { [field]: time })
    }
  }

  const handleAddSubtitle = () => {
    const startTime = parseTime(newSubtitle.startTime)
    const endTime = parseTime(newSubtitle.endTime)
    
    if (newSubtitle.text.trim() && !isNaN(startTime) && !isNaN(endTime) && startTime < endTime) {
      const subtitle: Subtitle = {
        id: `subtitle-${Date.now()}`,
        text: newSubtitle.text.trim(),
        startTime,
        endTime,
        language: selectedLanguage
      }
      
      addSubtitle(subtitle)
      setNewSubtitle({ text: '', startTime: '', endTime: '' })
    }
  }

  const jumpToTime = (time: number) => {
    setCurrentTime(time)
  }

  const availableLanguages = [originalLanguage, ...targetLanguages]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Edit3 className="w-6 h-6 text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Subtitle Editor</h2>
        </div>
        
        {/* Language Selector */}
        {availableLanguages.length > 1 && (
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableLanguages.map(lang => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Add New Subtitle */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Plus className="w-4 h-4 mr-1" />
          Add New Subtitle
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Time (MM:SS)</label>
            <input
              type="text"
              placeholder="0:00"
              value={newSubtitle.startTime}
              onChange={(e) => setNewSubtitle(prev => ({ ...prev, startTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End Time (MM:SS)</label>
            <input
              type="text"
              placeholder="0:05"
              value={newSubtitle.endTime}
              onChange={(e) => setNewSubtitle(prev => ({ ...prev, endTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <textarea
          placeholder="Enter subtitle text..."
          value={newSubtitle.text}
          onChange={(e) => setNewSubtitle(prev => ({ ...prev, text: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
          rows={2}
        />
        <button
          onClick={handleAddSubtitle}
          disabled={!newSubtitle.text.trim() || !newSubtitle.startTime || !newSubtitle.endTime}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          Add Subtitle
        </button>
      </div>

      {/* Subtitle List */}
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {sortedSubtitles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Type className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No subtitles found for {selectedLanguage.toUpperCase()}</p>
            <p className="text-sm mt-1">Add subtitles above or transcribe your video first</p>
          </div>
        ) : (
          sortedSubtitles.map((subtitle) => (
            <div
              key={subtitle.id}
              className={`subtitle-item ${
                subtitle.id === selectedSubtitleId ? 'active' : ''
              } ${
                currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
                  ? 'ring-2 ring-blue-500'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Timing Controls */}
                  <div className="flex items-center space-x-3 mb-2">
                    <button
                      onClick={() => jumpToTime(subtitle.startTime)}
                      className="flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(subtitle.startTime)}
                    </button>
                    <span className="text-xs text-gray-400">→</span>
                    <button
                      onClick={() => jumpToTime(subtitle.endTime)}
                      className="flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(subtitle.endTime)}
                    </button>
                  </div>

                  {/* Subtitle Text */}
                  {editingSubtitleId === subtitle.id ? (
                    <div className="space-y-2">
                      <textarea
                        ref={editRef}
                        defaultValue={subtitle.text}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            handleEditSave(subtitle.id, e.currentTarget.value)
                          } else if (e.key === 'Escape') {
                            handleEditCancel()
                          }
                        }}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditSave(subtitle.id, editRef.current?.value || '')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className="text-sm text-gray-800 leading-relaxed cursor-pointer hover:bg-gray-50 p-2 rounded"
                      onClick={() => handleEditStart(subtitle)}
                    >
                      {subtitle.text}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-1 ml-3">
                  <button
                    onClick={() => handleEditStart(subtitle)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit subtitle"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSubtitle(subtitle.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete subtitle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Total subtitles: {sortedSubtitles.length} • 
          Click on text to edit • Use Ctrl+Enter to save, Esc to cancel
        </p>
      </div>
    </div>
  )
} 