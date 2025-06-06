'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface SuccessPopupProps {
  isVisible: boolean
  onClose: () => void
  title: string
  message: string
  subtitleCount: number
}

export default function SuccessPopup({ 
  isVisible, 
  onClose, 
  title, 
  message, 
  subtitleCount 
}: SuccessPopupProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    console.log('🎭 SuccessPopup visibility changed:', { isVisible, show })
    if (isVisible) {
      console.log('🎉 Opening success popup')
      setShow(true)
      // Auto close after 8 seconds
      const timer = setTimeout(() => {
        console.log('⏰ Auto-closing popup after 8 seconds')
        handleClose()
      }, 8000)
      return () => clearTimeout(timer)
    } else {
      console.log('🔄 Hiding success popup')
      setShow(false)
    }
  }, [isVisible])

  const handleClose = () => {
    console.log('🔄 handleClose called - closing success popup')
    setShow(false)
    // Call onClose immediately instead of waiting for animation
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    console.log('🖱️ Backdrop clicked')
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleCloseButtonClick = () => {
    console.log('❌ Close button clicked')
    handleClose()
  }

  const handleContinueClick = () => {
    console.log('▶️ Continue button clicked')
    handleClose()
  }

  // Don't render anything if not visible
  if (!isVisible && !show) {
    console.log('🚫 Not rendering popup - not visible and not showing')
    return null
  }

  console.log('🎭 Rendering popup with state:', { isVisible, show })

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          show ? 'opacity-50' : 'opacity-0'
        }`}
      />
      
      {/* Popup */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 ${
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleCloseButtonClick}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close popup"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h3>
          <p className="text-gray-600 mb-4">
            {message}
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-semibold">
              🎉 Generated {subtitleCount} subtitle segments
            </p>
            <p className="text-blue-600 text-sm mt-1">
              You can now translate, edit, or export your subtitles!
            </p>
          </div>
          
          <button
            onClick={handleContinueClick}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue Editing
          </button>
        </div>
      </div>
    </div>
  )
} 