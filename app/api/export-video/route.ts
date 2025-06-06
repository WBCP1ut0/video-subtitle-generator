import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Forward the request to the FastAPI backend
    const response = await fetch(`${BACKEND_URL}/api/export-video`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Export video API error:', error)
    return NextResponse.json(
      { error: 'Failed to export video' },
      { status: 500 }
    )
  }
} 