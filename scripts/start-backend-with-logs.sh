#!/bin/bash

echo "🐍 Starting Backend Server with Live Logs..."

# Kill any existing backend processes
echo "🛑 Stopping existing backend processes..."
pkill -f "python3 main.py" 2>/dev/null || true
sleep 2

# Start backend server in foreground to see logs
echo "🚀 Starting backend server..."
echo "📋 You will see live logs below:"
echo "----------------------------------------"

cd backend
python3 main.py 