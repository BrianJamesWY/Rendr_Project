from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import Optional
import uuid
import os
import shutil
from datetime import datetime

from services.video_processor import VideoProcessor
from services.blockchain_service import blockchain_service
from models.video import VideoUploadResponse, VideoStatusResponse
from utils.security import get_current_user
from database.mongodb import get_db

router = APIRouter()
video_processor = VideoProcessor()

@router.post("/upload", response_model=VideoUploadResponse)
async def upload_video(
    video_file: UploadFile = File(...),
    source: str = Form(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Upload and process video for verification"""
    
    if source not in ["bodycam", "studio"]:
        raise HTTPException(400, "Invalid source. Must be 'bodycam' or 'studio'")
    
    video_id = str(uuid.uuid4())
    verification_code = video_processor.generate_verification_code()
    
    # Save uploaded file
    upload_dir = "uploads/videos"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = f"{upload_dir}/{video_id}_{video_file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(video_file.file, buffer)
    
    try:
        # Process video
        frames, video_metadata = video_processor.extract_frames(file_path)
        perceptual_hash = video_processor.calculate_perceptual_hash(frames)
        
        # Save to database (without blockchain for now)
        video_doc = {
            "_id": video_id,
            "user_id": current_user["user_id"],
            "source": source,
            "verification_code": verification_code,
            "filename": video_file.filename,
            "duration_seconds": video_metadata['duration_seconds'],
            "fps": video_metadata['fps'],
            "total_frames": video_metadata['total_frames'],
            "file_size_bytes": os.path.getsize(file_path),
            "perceptual_hash": perceptual_hash,
            "verification_status": "verified",
            "is_public": False,
            "captured_at": datetime.now().isoformat(),
            "uploaded_at": datetime.now().isoformat(),
            "verified_at": datetime.now().isoformat()
        }
        
        await db.videos.insert_one(video_doc)
        
        # Delete temp file
        os.remove(file_path)
        
        return {
            "video_id": video_id,
            "verification_code": verification_code,
            "status": "verified",
            "message": "Video uploaded and verified successfully"
        }
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(500, f"Video processing failed: {str(e)}")

@router.get("/{video_id}/status", response_model=VideoStatusResponse)
async def get_video_status(
    video_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get video status"""
    video = await db.videos.find_one({"_id": video_id})
    
    if not video:
        raise HTTPException(404, "Video not found")
    
    if video['user_id'] != current_user['user_id']:
        raise HTTPException(403, "Access denied")
    
    return {
        "video_id": video['_id'],
        "status": video['verification_status'],
        "verification_code": video['verification_code'],
        "verified_at": video.get('verified_at')
    }

@router.get("/user/list")
async def get_user_videos(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get all videos for current user"""
    cursor = db.videos.find({"user_id": current_user['user_id']})
    videos = await cursor.to_list(length=100)
    
    return {
        "videos": [
            {
                "video_id": v['_id'],
                "verification_code": v['verification_code'],
                "source": v['source'],
                "captured_at": v['captured_at'],
                "status": v['verification_status']
            }
            for v in videos
        ],
        "total": len(videos)
    }
