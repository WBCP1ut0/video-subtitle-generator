from pydantic import BaseModel
from typing import List, Optional

class SubtitleSegment(BaseModel):
    id: str
    start_time: float
    end_time: float
    text: str
    language: str
    original_text: Optional[str] = None

class TranscriptionRequest(BaseModel):
    video_url: Optional[str] = None
    language: str = "en"

class TranslationRequest(BaseModel):
    subtitles: List[str]
    source_language: str
    target_language: str

class VideoExportRequest(BaseModel):
    video_url: Optional[str] = None
    subtitles: List[SubtitleSegment]
    settings: dict
    language: str = "en"

class VideoSettings(BaseModel):
    quality: str = "medium"  # low, medium, high
    font_size: str = "medium"  # small, medium, large
    font_color: str = "#ffffff"
    background_color: str = "#000000"
    position: str = "bottom"  # top, center, bottom
    font_family: str = "Arial"
    outline: bool = True 