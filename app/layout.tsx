import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Add Satoshi font via CSS import
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Video Subtitle Generator',
  description: 'Generate, edit, and translate video subtitles with AI-powered transcription',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} font-satoshi`}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
} 