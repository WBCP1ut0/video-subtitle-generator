#!/bin/bash

echo "🔄 Restarting Backend Server..."

# Kill any existing backend processes
echo "🛑 Stopping existing backend processes..."
pkill -f "python3 main.py" 2>/dev/null || true
sleep 2

# Start backend server
echo "🐍 Starting Backend Server..."
cd backend
python3 main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:8000"
    
    # Test translation
    echo "🌍 Testing translation API..."
    TRANSLATION_TEST=$(curl -s -X POST http://localhost:8000/api/translate \
        -H "Content-Type: application/json" \
        -d '{"subtitles":["Hello"],"source_language":"en","target_language":"es"}')
    
    if echo "$TRANSLATION_TEST" | grep -q "Hola"; then
        echo "✅ Translation is working!"
        echo "🎬 You can now use translation in the app!"
    else
        echo "⚠️ Translation test failed, but server is running"
    fi
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "Backend PID: $BACKEND_PID"
echo "To stop: kill $BACKEND_PID" 