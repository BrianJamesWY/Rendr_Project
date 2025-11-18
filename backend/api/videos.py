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
        print(f"🎬 Processing video: {video_id}")
        frames, video_metadata = video_processor.extract_frames(file_path)
        perceptual_hash = video_processor.calculate_perceptual_hash(frames)
        
        print(f"✅ Video processed: {len(frames)} frames")
        print(f"   Hash: {perceptual_hash['combined_hash'][:32]}...")
        
        # Write signature to blockchain
        print(f"⛓️  Writing to blockchain...")
        blockchain_result = await blockchain_service.write_signature(
            video_id=video_id,
            perceptual_hash=perceptual_hash['combined_hash'],
            metadata={
                'source': source,
                'duration': video_metadata['duration_seconds']
            }
        )
        
        # Prepare video document
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
            "verification_status": "verified" if blockchain_result else "pending",
            "is_public": False,
            "captured_at": datetime.now().isoformat(),
            "uploaded_at": datetime.now().isoformat(),
            "verified_at": datetime.now().isoformat() if blockchain_result else None
        }
        
        # Add blockchain signature if successful
        if blockchain_result:
            video_doc["blockchain_signature"] = blockchain_result
            print(f"✅ Blockchain signature added")
            print(f"   TX: {blockchain_result['tx_hash']}")
        else:
            video_doc["blockchain_signature"] = None
            print(f"⚠️ Blockchain write failed - saved without blockchain proof")
        
        # Save to database
        await db.videos.insert_one(video_doc)
        print(f"💾 Saved to database")
        
        # Delete temp file
        os.remove(file_path)
        
        response_data = {
            "video_id": video_id,
            "verification_code": verification_code,
            "status": "verified" if blockchain_result else "pending",
            "message": "Video uploaded and verified successfully"
        }
        
        # Add blockchain info if available
        if blockchain_result:
            response_data["blockchain_tx"] = blockchain_result['tx_hash']
            response_data["blockchain_explorer"] = blockchain_result['explorer_url']
        
        return response_data
        
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
    
    response = {
        "video_id": video['_id'],
        "status": video['verification_status'],
        "verification_code": video['verification_code'],
        "verified_at": video.get('verified_at')
    }
    
    # Add blockchain info if available
    if video.get('blockchain_signature'):
        response['blockchain_tx'] = video['blockchain_signature'].get('tx_hash')
        response['blockchain_explorer'] = video['blockchain_signature'].get('explorer_url')
    
    return response

@router.get("/user/list")
async def get_user_videos(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get all videos for current user"""
    cursor = db.videos.find({"user_id": current_user['user_id']})
    videos = await cursor.to_list(length=100)
    
    video_list = []
    for v in videos:
        video_info = {
            "video_id": v['_id'],
            "verification_code": v['verification_code'],
            "source": v['source'],
            "captured_at": v['captured_at'],
            "status": v['verification_status'],
            "has_blockchain": bool(v.get('blockchain_signature'))
        }
        if v.get('blockchain_signature'):
            video_info['blockchain_tx'] = v['blockchain_signature'].get('tx_hash')
        video_list.append(video_info)
    
    return {
        "videos": video_list,
        "total": len(videos)
    }
