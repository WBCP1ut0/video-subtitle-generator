import os
import tempfile
import asyncio
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import whisper
import ffmpeg
import json
from pathlib import Path
import yt_dlp

# Import translation services
from services.translation import TranslationService
from services.video_processor import VideoProcessor
from models.subtitle import SubtitleSegment, TranscriptionRequest, TranslationRequest, VideoExportRequest

app = FastAPI(title="Video Subtitle Generator API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "https://www.instantsubtitles.net",  # Custom domain
        "https://vid-mv7wph6hu-muhammad-ahmads-projects-d6bd9dee.vercel.app",  # Vercel domain
        "https://*.vercel.app",  # Any Vercel subdomain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global services
whisper_model = None
translation_service = TranslationService()
video_processor = VideoProcessor()

# Create necessary directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)
os.makedirs("temp", exist_ok=True)

@app.on_event("startup")
async def startup_event():
    """Load Whisper model on startup"""
    global whisper_model
    print("Loading Whisper model...")
    whisper_model = whisper.load_model("base")  # Options: tiny, base, small, medium, large
    print("Whisper model loaded successfully!")

@app.get("/")
async def root():
    return {"message": "Video Subtitle Generator API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "whisper_loaded": whisper_model is not None}

@app.post("/api/transcribe")
async def transcribe_video(
    background_tasks: BackgroundTasks,
    video: Optional[UploadFile] = File(None),
    video_url: Optional[str] = Form(None),
    language: str = Form("en")
):
    """Transcribe video using OpenAI Whisper"""
    if not video and not video_url:
        raise HTTPException(status_code=400, detail="Either video file or video URL must be provided")
    
    if whisper_model is None:
        raise HTTPException(status_code=500, detail="Whisper model not loaded")
    
    try:
        # Handle video file or URL
        if video:
            # Save uploaded video file
            video_path = f"uploads/{video.filename}"
            with open(video_path, "wb") as buffer:
                content = await video.read()
                buffer.write(content)
        else:
            # Download video from URL
            video_path = await download_video_from_url(video_url)
        
        # Extract audio from video
        audio_path = extract_audio(video_path)
        
        # Transcribe with Whisper
        print(f"Transcribing audio: {audio_path}")
        result = whisper_model.transcribe(
            audio_path, 
            language=language if language != "auto" else None,
            task="transcribe"
        )
        
        # Convert to subtitle format
        segments = []
        for segment in result["segments"]:
            segments.append({
                "start": segment["start"],
                "end": segment["end"],
                "text": segment["text"].strip()
            })
        
        # Cleanup temporary files
        background_tasks.add_task(cleanup_file, video_path)
        background_tasks.add_task(cleanup_file, audio_path)
        
        return {
            "segments": segments,
            "language": result.get("language", language),
            "duration": result.get("duration", 0)
        }
        
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/api/translate")
async def translate_subtitles(request: TranslationRequest):
    """Translate subtitles using DeepL or Google Translate"""
    try:
        translations = await translation_service.translate_batch(
            texts=request.subtitles,
            source_lang=request.source_language,
            target_lang=request.target_language
        )
        
        return {"translations": translations}
        
    except Exception as e:
        print(f"Translation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

@app.post("/api/export-video")
async def export_video_with_subtitles(
    background_tasks: BackgroundTasks,
    video: Optional[UploadFile] = File(None),
    video_url: Optional[str] = Form(None),
    subtitles: str = Form(...),
    settings: str = Form(...),
    language: str = Form("en")
):
    """Export video with burned-in subtitles using FFmpeg"""
    if not video and not video_url:
        raise HTTPException(status_code=400, detail="Either video file or video URL must be provided")
    
    try:
        # Parse JSON data
        subtitle_data = json.loads(subtitles)
        video_settings = json.loads(settings)
        
        # Handle video file or URL
        if video:
            video_path = f"uploads/{video.filename}"
            with open(video_path, "wb") as buffer:
                content = await video.read()
                buffer.write(content)
        else:
            video_path = await download_video_from_url(video_url)
        
        # Create SRT file from subtitles
        srt_path = create_srt_file(subtitle_data, language)
        
        # Process video with subtitles
        output_path = await video_processor.burn_subtitles(
            video_path=video_path,
            subtitle_path=srt_path,
            settings=video_settings
        )
        
        # Cleanup temporary files
        background_tasks.add_task(cleanup_file, video_path)
        background_tasks.add_task(cleanup_file, srt_path)
        
        return {
            "download_url": f"/download/{os.path.basename(output_path)}",
            "filename": os.path.basename(output_path)
        }
        
    except Exception as e:
        print(f"Video export error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Video export failed: {str(e)}")

@app.get("/download/{filename}")
async def download_file(filename: str):
    """Download processed files"""
    file_path = f"outputs/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        file_path,
        filename=filename,
        media_type='application/octet-stream'
    )

# Helper functions

async def download_video_from_url(url: str) -> str:
    """Download video from URL using yt-dlp"""
    try:
        output_path = f"temp/video_{int(asyncio.get_event_loop().time())}"
        
        ydl_opts = {
            'outtmpl': f'{output_path}.%(ext)s',
            'format': 'best[height<=720]',  # Limit quality to reduce processing time
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            
        return filename
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download video: {str(e)}")

def extract_audio(video_path: str) -> str:
    """Extract audio from video using FFmpeg"""
    audio_path = video_path.rsplit('.', 1)[0] + '_audio.wav'
    
    try:
        (
            ffmpeg
            .input(video_path)
            .output(audio_path, acodec='pcm_s16le', ac=1, ar='16000')
            .overwrite_output()
            .run(quiet=True)
        )
        return audio_path
        
    except ffmpeg.Error as e:
        raise Exception(f"Audio extraction failed: {e}")

def create_srt_file(subtitles: List[dict], language: str) -> str:
    """Create SRT file from subtitle data"""
    srt_path = f"temp/subtitles_{language}_{int(asyncio.get_event_loop().time())}.srt"
    
    with open(srt_path, 'w', encoding='utf-8') as f:
        for i, sub in enumerate(subtitles, 1):
            start_time = format_srt_time(sub['startTime'])
            end_time = format_srt_time(sub['endTime'])
            
            f.write(f"{i}\n")
            f.write(f"{start_time} --> {end_time}\n")
            f.write(f"{sub['text']}\n\n")
    
    return srt_path

def format_srt_time(seconds: float) -> str:
    """Format seconds to SRT time format"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    milliseconds = int((seconds % 1) * 1000)
    
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{milliseconds:03d}"

async def cleanup_file(file_path: str):
    """Clean up temporary files"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Failed to cleanup file {file_path}: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 