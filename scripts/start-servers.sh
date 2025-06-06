#!/bin/bash

echo "🚀 Starting Video Subtitle Generator Servers..."

# Check if python3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ python3 is not installed. Please install Python 3."
    exit 1
fi

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
sleep 5

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
echo "To stop servers: kill $BACKEND_PID $FRONTEND_PID"
echo "Or press Ctrl+C to stop this script and then run: pkill -f 'python3 main.py' && pkill -f 'next dev'" 