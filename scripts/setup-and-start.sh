#!/bin/bash

echo "🚀 Setting up and Starting Video Subtitle Generator..."

# Check if python3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ python3 is not installed. Please install Python 3."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm."
    exit 1
fi

echo "📦 Installing dependencies..."

# Install frontend dependencies
echo "📱 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "🐍 Installing backend dependencies..."
cd backend
pip3 install -r requirements.txt
cd ..

echo "✅ Dependencies installed successfully!"

# Start backend server
echo "🐍 Starting Backend Server..."
cd backend
python3 main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 10

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
    else
        echo "⚠️ Translation test failed, but server is running"
    fi
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend server
echo "📱 Starting Frontend Server..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 8

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend failed to start"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 All servers are running!"
echo "📱 Frontend: http://localhost:3000"
echo "🐍 Backend:  http://localhost:8000"
echo ""
echo "🎬 Ready to generate subtitles!"
echo ""
echo "To stop servers: kill $BACKEND_PID $FRONTEND_PID"
echo "Or press Ctrl+C to stop this script and then run:"
echo "pkill -f 'python3 main.py' && pkill -f 'next dev'" 