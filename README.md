# 🎬 Video Subtitle Generator

AI-powered video subtitle generator with transcription, translation, and export capabilities.

## ✨ Features

- 🎥 **Video Upload**: Drag-and-drop or YouTube URL support
- 🤖 **AI Transcription**: OpenAI Whisper for accurate speech-to-text
- 🌍 **Translation**: Support for 12 languages via Google Translate
- ✏️ **Subtitle Editor**: Timeline-based editing with real-time preview
- 📤 **Export Options**: SRT, VTT formats and subtitle burning
- 🎊 **Beautiful UI**: Modern design with animations and feedback

## 🚀 Quick Start

### Option 1: Automatic Setup
```bash
./scripts/setup-and-start.sh
```

### Option 2: Manual Setup
```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd backend
pip3 install -r requirements.txt
cd ..

# 3. Start backend (Terminal 1)
cd backend
python3 main.py

# 4. Start frontend (Terminal 2)
npm run dev
```

### Open the app:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

## 🛠️ Requirements

- **Node.js** 18+ and npm
- **Python** 3.9+
- **FFmpeg** (for video processing)

### Install FFmpeg:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

## 🎯 Usage

1. **Upload Video**: Drag and drop or enter YouTube URL
2. **Select Language**: Choose original language
3. **Generate Subtitles**: Click "Generate Subtitles"
4. **Translate**: Click language buttons to translate
5. **Edit**: Use timeline editor to refine subtitles
6. **Export**: Download SRT/VTT files or burn into video

## 🌍 Supported Languages

- English, Spanish, French, German, Italian
- Portuguese, Chinese, Japanese, Korean
- Russian, Arabic, Hindi

## 📁 Project Structure

```
video-subtitle-generator/
├── app/                    # Next.js frontend
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── lib/              # Utilities and store
├── backend/               # FastAPI backend
│   ├── models/           # Data models
│   ├── services/         # Translation & video processing
│   └── main.py          # Server entry point
├── scripts/              # Helper scripts
└── docs/                # Documentation
```

## 🔧 Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

### Quick Fixes:
```bash
# Translation not working?
curl http://localhost:8000/health

# Frontend issues?
rm -rf .next && npm run dev

# Dependencies missing?
./scripts/setup-and-start.sh
```

## 🚀 Deployment

Ready for production! See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guides:

- **Vercel + Railway** (Recommended): $5-20/month
- **Render**: Free tier available
- **Self-hosted**: $5-10/month

## 🎨 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, OpenAI Whisper, Google Translate
- **UI Components**: Lucide React, Canvas Confetti
- **State Management**: Zustand
- **Video Processing**: FFmpeg, React Player

## 📝 License

MIT License - feel free to use for personal and commercial projects!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 📞 Support

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Run `./scripts/test-api.sh` to verify setup
- Open browser console (F12) for debugging

---

Made with ❤️ using AI-powered transcription technology 