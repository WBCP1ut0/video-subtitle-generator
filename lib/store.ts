import { create } from 'zustand'

export interface Subtitle {
  id: string
  startTime: number
  endTime: number
  text: string
  originalText?: string
  language: string
}

export interface TranscriptionJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  videoFile?: File
  videoUrl?: string
  error?: string
}

export interface AppState {
  // Video state
  videoFile: File | null
  videoUrl: string | null
  videoDuration: number
  currentTime: number
  isPlaying: boolean
  
  // Subtitles state
  subtitles: Subtitle[]
  selectedSubtitleId: string | null
  originalLanguage: string
  targetLanguages: string[]
  
  // Transcription state
  transcriptionJob: TranscriptionJob | null
  isTranscribing: boolean
  
  // Editor state
  isEditing: boolean
  editingSubtitleId: string | null
  
  // Actions
  setVideoFile: (file: File | null) => void
  setVideoUrl: (url: string | null) => void
  setVideoDuration: (duration: number) => void
  setCurrentTime: (time: number) => void
  setIsPlaying: (isPlaying: boolean) => void
  setSubtitles: (subtitles: Subtitle[]) => void
  addSubtitle: (subtitle: Subtitle) => void
  updateSubtitle: (id: string, updates: Partial<Subtitle>) => void
  deleteSubtitle: (id: string) => void
  setSelectedSubtitle: (id: string | null) => void
  setOriginalLanguage: (language: string) => void
  addTargetLanguage: (language: string) => void
  removeTargetLanguage: (language: string) => void
  setTranscriptionJob: (job: TranscriptionJob | null) => void
  setIsTranscribing: (isTranscribing: boolean) => void
  setIsEditing: (isEditing: boolean) => void
  setEditingSubtitleId: (id: string | null) => void
  reset: () => void
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  videoFile: null,
  videoUrl: null,
  videoDuration: 0,
  currentTime: 0,
  isPlaying: false,
  subtitles: [],
  selectedSubtitleId: null,
  originalLanguage: 'en',
  targetLanguages: [],
  transcriptionJob: null,
  isTranscribing: false,
  isEditing: false,
  editingSubtitleId: null,
  
  // Actions
  setVideoFile: (file) => set({ videoFile: file, videoUrl: null }),
  setVideoUrl: (url) => set({ videoUrl: url, videoFile: null }),
  setVideoDuration: (duration) => set({ videoDuration: duration }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSubtitles: (subtitles) => set({ subtitles }),
  
  addSubtitle: (subtitle) => set((state) => ({
    subtitles: [...state.subtitles, subtitle].sort((a, b) => a.startTime - b.startTime)
  })),
  
  updateSubtitle: (id, updates) => set((state) => ({
    subtitles: state.subtitles.map(sub => 
      sub.id === id ? { ...sub, ...updates } : sub
    )
  })),
  
  deleteSubtitle: (id) => set((state) => ({
    subtitles: state.subtitles.filter(sub => sub.id !== id),
    selectedSubtitleId: state.selectedSubtitleId === id ? null : state.selectedSubtitleId
  })),
  
  setSelectedSubtitle: (id) => set({ selectedSubtitleId: id }),
  setOriginalLanguage: (language) => set({ originalLanguage: language }),
  
  addTargetLanguage: (language) => set((state) => ({
    targetLanguages: Array.from(new Set([...state.targetLanguages, language]))
  })),
  
  removeTargetLanguage: (language) => set((state) => ({
    targetLanguages: state.targetLanguages.filter(lang => lang !== language)
  })),
  
  setTranscriptionJob: (job) => set({ transcriptionJob: job }),
  setIsTranscribing: (isTranscribing) => set({ isTranscribing }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setEditingSubtitleId: (id) => set({ editingSubtitleId: id }),
  
  reset: () => set({
    videoFile: null,
    videoUrl: null,
    videoDuration: 0,
    currentTime: 0,
    isPlaying: false,
    subtitles: [],
    selectedSubtitleId: null,
    originalLanguage: 'en',
    targetLanguages: [],
    transcriptionJob: null,
    isTranscribing: false,
    isEditing: false,
    editingSubtitleId: null,
  }),
})) 