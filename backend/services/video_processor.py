import os
import asyncio
import ffmpeg
from typing import Dict, Any
from pathlib import Path

class VideoProcessor:
    def __init__(self):
        self.output_dir = "outputs"
        os.makedirs(self.output_dir, exist_ok=True)
    
    async def burn_subtitles(self, video_path: str, subtitle_path: str, settings: Dict[str, Any]) -> str:
        """Burn subtitles into video using FFmpeg"""
        
        # Generate output filename
        video_name = Path(video_path).stem
        output_filename = f"{video_name}_with_subtitles_{int(asyncio.get_event_loop().time())}.mp4"
        output_path = os.path.join(self.output_dir, output_filename)
        
        # Map quality settings
        quality_settings = {
            "low": {"crf": 28, "preset": "fast", "scale": "1280:720"},
            "medium": {"crf": 23, "preset": "medium", "scale": "1920:1080"},
            "high": {"crf": 18, "preset": "slow", "scale": "2560:1440"}
        }
        
        # Map font size to pixel values
        font_sizes = {
            "small": 20,
            "medium": 28,
            "large": 36
        }
        
        # Get settings
        quality = settings.get("quality", "medium")
        font_size = font_sizes.get(settings.get("fontSize", "medium"), 28)
        font_color = settings.get("fontColor", "#ffffff").replace("#", "")
        position = settings.get("position", "bottom")
        
        # Map position to FFmpeg subtitles filter
        position_map = {
            "top": "Alignment=2",  # Top center
            "center": "Alignment=6",  # Middle center  
            "bottom": "Alignment=10"  # Bottom center
        }
        
        alignment = position_map.get(position, "Alignment=10")
        subtitle_filter = (
            f"subtitles={subtitle_path}:force_style="
            f"'FontSize={font_size},PrimaryColour=&H{self._hex_to_bgr(font_color)}&,"
            f"OutlineColour=&H000000&,Outline=2,{alignment}'"
        )
        
        quality_opts = quality_settings[quality]
        
        def process_video():
            """Synchronous video processing function"""
            try:
                # Build FFmpeg command
                input_stream = ffmpeg.input(video_path)
                
                # Apply subtitle filter and video settings
                output_stream = ffmpeg.output(
                    input_stream,
                    output_path,
                    vcodec='libx264',
                    acodec='aac',
                    crf=quality_opts["crf"],
                    preset=quality_opts["preset"],
                    vf=f"scale={quality_opts['scale']},{subtitle_filter}",
                    movflags='faststart'  # Optimize for web streaming
                )
                
                # Run the command
                ffmpeg.run(output_stream, overwrite_output=True, quiet=True)
                
                return output_path
                
            except ffmpeg.Error as e:
                raise Exception(f"FFmpeg processing failed: {e}")
        
        # Run video processing in thread pool
        loop = asyncio.get_event_loop()
        result_path = await loop.run_in_executor(None, process_video)
        
        return result_path
    
    def _hex_to_bgr(self, hex_color: str) -> str:
        """Convert hex color to BGR format for FFmpeg"""
        # Remove # if present
        hex_color = hex_color.lstrip('#')
        
        # Convert hex to RGB
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        
        # Return as BGR hex string
        return f"{b:02X}{g:02X}{r:02X}"
    
    async def extract_video_info(self, video_path: str) -> Dict[str, Any]:
        """Extract video information using FFprobe"""
        
        def get_info():
            try:
                probe = ffmpeg.probe(video_path)
                video_stream = next(
                    stream for stream in probe['streams'] 
                    if stream['codec_type'] == 'video'
                )
                
                return {
                    "duration": float(probe.get('format', {}).get('duration', 0)),
                    "width": int(video_stream.get('width', 0)),
                    "height": int(video_stream.get('height', 0)),
                    "fps": eval(video_stream.get('r_frame_rate', '0/1')),
                    "codec": video_stream.get('codec_name', 'unknown')
                }
                
            except Exception as e:
                raise Exception(f"Failed to extract video info: {e}")
        
        loop = asyncio.get_event_loop()
        info = await loop.run_in_executor(None, get_info)
        
        return info
    
    async def create_thumbnail(self, video_path: str, timestamp: float = 10.0) -> str:
        """Create a thumbnail from video at specified timestamp"""
        
        thumbnail_filename = f"thumb_{int(asyncio.get_event_loop().time())}.jpg"
        thumbnail_path = os.path.join(self.output_dir, thumbnail_filename)
        
        def generate_thumbnail():
            try:
                (
                    ffmpeg
                    .input(video_path, ss=timestamp)
                    .output(thumbnail_path, vframes=1, q=2)
                    .overwrite_output()
                    .run(quiet=True)
                )
                return thumbnail_path
                
            except ffmpeg.Error as e:
                raise Exception(f"Thumbnail generation failed: {e}")
        
        loop = asyncio.get_event_loop()
        result_path = await loop.run_in_executor(None, generate_thumbnail)
        
        return result_path 