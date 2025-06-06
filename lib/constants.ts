export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB (hosting platform limit)

export const VIDEO_QUALITY_OPTIONS = {
  low: {
    label: 'Low (720p)',
    value: 'low',
    resolution: '1280x720',
    crf: 28
  },
  medium: {
    label: 'Medium (1080p)',
    value: 'medium',
    resolution: '1920x1080',
    crf: 23
  },
  high: {
    label: 'High (1440p)',
    value: 'high',
    resolution: '2560x1440',
    crf: 18
  }
} as const

export const FONT_SIZES = {
  small: {
    label: 'Small',
    value: 'small',
    size: 20
  },
  medium: {
    label: 'Medium',
    value: 'medium',
    size: 28
  },
  large: {
    label: 'Large',
    value: 'large',
    size: 36
  }
} as const

export const SUBTITLE_POSITIONS = {
  top: {
    label: 'Top',
    value: 'top',
    alignment: 2
  },
  center: {
    label: 'Center',
    value: 'center',
    alignment: 6
  },
  bottom: {
    label: 'Bottom',
    value: 'bottom',
    alignment: 10
  }
} as const

export const DEFAULT_EXPORT_SETTINGS = {
  quality: 'medium',
  fontSize: 'medium',
  fontColor: '#ffffff',
  backgroundColor: '#000000',
  position: 'bottom'
} as const

export const ACCEPTED_VIDEO_TYPES = {
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
  'video/x-matroska': ['.mkv'],
  'video/x-flv': ['.flv'],
  'video/avi': ['.avi']
} 