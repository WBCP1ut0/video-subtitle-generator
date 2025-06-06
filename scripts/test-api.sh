#!/bin/bash

echo "🧪 Testing Video Subtitle Generator APIs..."

# Check frontend
echo "📱 Testing Frontend (Next.js)..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend is not responding"
fi

# Check backend
echo "🐍 Testing Backend (FastAPI)..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:8000"
    
    # Test health endpoint
    echo "🏥 Backend health:"
    curl -s http://localhost:8000/health | jq
    
    # Test translation
    echo "🌍 Testing translation API..."
    curl -s -X POST http://localhost:8000/api/translate \
        -H "Content-Type: application/json" \
        -d '{"subtitles":["Hello world","How are you?"],"source_language":"en","target_language":"es"}' | jq
else
    echo "❌ Backend is not responding"
fi

echo "🎬 Ready to generate subtitles!" 