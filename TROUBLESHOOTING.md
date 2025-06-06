# 🛠️ Troubleshooting Guide - Video Subtitle Generator

## 🚨 Common Issues and Solutions

### 1. **Translation Failed Error**

**Error Message:** `Translation failed: Failed to translate subtitles`

**Cause:** Backend server is not running

**Solution:**
```bash
# Check if backend is running
curl http://localhost:8000/health

# If not running, start it with:
cd backend
python3 main.py
```

---

### 2. **"python: command not found"**

**Error Message:** `zsh: command not found: python`

**Cause:** On macOS, Python 3 is accessed via `python3` not `python`

**Solution:**
```bash
# Use python3 instead
python3 main.py

# Or create an alias
alias python=python3
```

---

### 3. **NumPy Version Conflict**

**Error Message:** `A module that was compiled using NumPy 1.x cannot be run in NumPy 2.0.2`

**Cause:** PyTorch and Whisper need NumPy 1.x, but NumPy 2.x was installed

**Solution:**
```bash
cd backend
pip3 install "numpy<2.0"
```

---

### 4. **Address Already in Use**

**Error Message:** `ERROR: [Errno 48] Address already in use`

**Cause:** Multiple backend servers running on port 8000

**Solution:**
```bash
# Kill existing processes
pkill -f "python3 main.py"

# Wait and restart
sleep 3
cd backend
python3 main.py
```

---

### 5. **Frontend Not Loading**

**Error Message:** Page won't load at http://localhost:3000

**Solution:**
```bash
# Check if frontend is running
curl http://localhost:3000

# If not running, start it with:
npm run dev
```

---

### 6. **Video Player Stuck on "Loading video..."**

**Cause:** Video format not supported or file too large

**Solution:**
- Use MP4, WebM, or MOV formats
- Ensure file is under 100MB
- Try a different video file
- Check browser console for errors

---

### 7. **Chunk Loading Error**

**Error Message:** `ChunkLoadError: Loading chunk reactPlayerYouTube failed`

**Solution:**
```bash
# Clear Next.js cache and restart
rm -rf .next
npm run dev
```

---

## 📋 How to View Logs

### **Backend Logs (Real-time):**
```bash
# Option 1: Start with logs visible
./scripts/start-backend-with-logs.sh

# Option 2: Manual start (shows logs)
cd backend
python3 main.py
```

### **Check Running Processes:**
```bash
# See what's running on port 8000
lsof -i :8000

# Find backend processes
ps aux | grep "python3 main.py"
```

### **Frontend Logs:**
- Open browser console (F12)
- Check terminal where `npm run dev` is running

---

## 🚀 Quick Start Commands

### Start Both Servers:
```bash
./scripts/setup-and-start.sh
```

### Manual Start:
```bash
# Terminal 1 - Backend
cd backend
python3 main.py

# Terminal 2 - Frontend  
npm run dev
```

### Test Everything:
```bash
./scripts/test-api.sh
```

---

## 🔍 Health Checks

### Backend Health:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","whisper_loaded":true}
```

### Translation Test:
```bash
curl -X POST http://localhost:8000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"subtitles":["Hello"],"source_language":"en","target_language":"es"}'
# Should return: {"translations":["Hola"]}
```

### Frontend Test:
```bash
curl http://localhost:3000
# Should return HTML content
```

---

## 📞 Still Having Issues?

1. **Check browser console** (F12) for error messages
2. **Check terminal output** for server errors
3. **Restart both servers** using the script
4. **Clear browser cache** and refresh
5. **Update dependencies** with `npm install`

---

## 💡 Tips

- **Always use `python3`** on macOS, not `python`
- **Keep both terminals open** while using the app
- **Check ports 3000 and 8000** are not used by other apps
- **Use small video files** for testing (under 50MB)
- **Supported formats**: MP4, WebM, MOV, AVI, MKV
- **NumPy 1.x required** for PyTorch compatibility 