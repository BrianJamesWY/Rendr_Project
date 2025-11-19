from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import Optional
import uuid
import os
import shutil
from datetime import datetime

from services.video_processor import VideoProcessor
from services.blockchain_service import blockchain_service
from services.notification_service import notification_service
from models.video import VideoUploadResponse, VideoStatusResponse, VideoUpdate
from utils.security import get_current_user
from database.mongodb import get_db

router = APIRouter()
video_processor = VideoProcessor()

@router.post("/upload", response_model=VideoUploadResponse)
async def upload_video(
    video_file: UploadFile = File(...),
    source: str = Form(...),
    folder_id: str = Form(None),
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
        
        # Extract thumbnail from first frame
        print(f"📸 Extracting thumbnail...")
        thumbnail_path = video_processor.extract_thumbnail(file_path, video_id)
        
        print(f"✅ Video processed: {len(frames)} frames")
        print(f"   Hash: {perceptual_hash['combined_hash'][:32]}...")
        
        # 🚨 DUPLICATE DETECTION
        print(f"🔍 Checking for duplicates...")
        existing_video = await db.videos.find_one({
            "perceptual_hash.combined_hash": perceptual_hash['combined_hash']
        })
        
        if existing_video:
            print(f"⚠️ DUPLICATE DETECTED!")
            print(f"   Original owner: {existing_video['user_id']}")
            print(f"   Original code: {existing_video['verification_code']}")
            print(f"   Current uploader: {current_user['user_id']}")
            
            # Check if same user
            if existing_video['user_id'] == current_user['user_id']:
                # Same user uploading again
                print(f"ℹ️ Same user re-uploading their own video")
                
                # Delete temp file
                os.remove(file_path)
                
                return {
                    "video_id": existing_video['_id'],
                    "verification_code": existing_video['verification_code'],
                    "status": "duplicate",
                    "message": "You already uploaded this video",
                    "duplicate_detected": True,
                    "is_owner": True,
                    "original_upload_date": existing_video['uploaded_at'],
                    "blockchain_tx": existing_video.get('blockchain_signature', {}).get('tx_hash') if existing_video.get('blockchain_signature') else None
                }
            
            else:
                # Different user trying to upload someone else's video
                print(f"🚨 SECURITY ALERT: Different user uploading existing video!")
                
                # Get original owner info
                original_owner = await db.users.find_one({"_id": existing_video['user_id']})
                
                # Log security event
                await notification_service.log_security_event(
                    db=db,
                    event_type="duplicate_upload_attempt",
                    user_id=current_user['user_id'],
                    description=f"User attempted to upload video that belongs to {existing_video['user_id']}",
                    metadata={
                        "original_video_id": existing_video['_id'],
                        "original_code": existing_video['verification_code'],
                        "duplicate_uploader_id": current_user['user_id'],
                        "duplicate_uploader_email": current_user.get('email')
                    }
                )
                
                # Notify original owner if we have their info
                if original_owner:
                    await notification_service.notify_duplicate_upload_attempt(
                        db=db,
                        original_owner_email=original_owner['email'],
                        original_owner_name=original_owner['display_name'],
                        duplicate_uploader_email=current_user.get('email', 'Unknown'),
                        duplicate_uploader_name=current_user.get('display_name', 'Unknown'),
                        video_code=existing_video['verification_code'],
                        video_filename=video_file.filename
                    )
                
                # Delete temp file
                os.remove(file_path)
                
                # Return duplicate warning
                return {
                    "video_id": existing_video['_id'],
                    "verification_code": existing_video['verification_code'],
                    "status": "duplicate_detected",
                    "message": "This video has already been verified by another user",
                    "duplicate_detected": True,
                    "is_owner": False,
                    "original_owner": original_owner.get('display_name', 'Another user') if original_owner else 'Another user',
                    "original_upload_date": existing_video['uploaded_at'],
                    "security_alert": "The original owner has been notified of this upload attempt"
                }
        
        print(f"✅ No duplicates found - proceeding with upload")
        
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
            "username": current_user.get("username", current_user.get("display_name")),
            "source": source,
            "verification_code": verification_code,
            "filename": video_file.filename,
            "duration_seconds": video_metadata['duration_seconds'],
            "fps": video_metadata['fps'],
            "total_frames": video_metadata['total_frames'],
            "file_size_bytes": os.path.getsize(file_path),
            "perceptual_hash": perceptual_hash,
            "thumbnail_path": thumbnail_path,
            "folder_id": folder_id if folder_id else None,
            "verification_status": "verified" if blockchain_result else "pending",
            "is_public": False,
            "tags": ["Rendr"],
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
            "message": "Video uploaded and verified successfully",
            "thumbnail_url": f"/api/thumbnails/{video_id}.jpg"
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
    
    return response

@router.put("/{video_id}/metadata")
async def update_video_metadata(
    video_id: str,
    video_data: VideoUpdate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update video description, external link, and platform"""
    video = await db.videos.find_one({"_id": video_id})
    
    if not video:
        raise HTTPException(404, "Video not found")
    
    if video['user_id'] != current_user['user_id']:
        raise HTTPException(403, "Access denied")
    
    update_fields = {}
    if video_data.description is not None:
        update_fields['description'] = video_data.description
    if video_data.external_link is not None:
        update_fields['external_link'] = video_data.external_link
    if video_data.platform is not None:
        update_fields['platform'] = video_data.platform
    if video_data.tags is not None:
        update_fields['tags'] = video_data.tags
    
    if update_fields:
        await db.videos.update_one(
            {"_id": video_id},
            {"$set": update_fields}
        )
    
    return {"message": "Video metadata updated successfully"}

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
            "has_blockchain": bool(v.get('blockchain_signature')),
            "thumbnail_url": f"/api/thumbnails/{v['_id']}.jpg" if v.get('thumbnail_path') else None,
            "folder_id": v.get('folder_id'),
            "description": v.get('description'),
            "external_link": v.get('external_link'),
            "platform": v.get('platform'),
            "tags": v.get('tags', ['Rendr'])
        }
        if v.get('blockchain_signature'):
            video_info['blockchain_tx'] = v['blockchain_signature'].get('tx_hash')
        video_list.append(video_info)
    
    return {
        "videos": video_list,
        "total": len(videos)
    }

@router.put("/{video_id}/folder")
async def move_video_to_folder(
    video_id: str,
    folder_id: str = None,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Move video to a different folder"""
    # Accept folder_id from query params or body
    from fastapi import Body
    
    video = await db.videos.find_one({"_id": video_id})
    
    if not video:
        raise HTTPException(404, "Video not found")
    
    if video['user_id'] != current_user['user_id']:
        raise HTTPException(403, "Access denied")
    
    # Verify folder exists if folder_id is provided
    if folder_id and folder_id != 'null' and folder_id != '':
        folder = await db.folders.find_one({"_id": folder_id})
        if not folder:
            raise HTTPException(404, "Folder not found")
        if folder['username'] != current_user.get('username'):
            raise HTTPException(403, "Folder access denied")
    else:
        folder_id = None
    
    await db.videos.update_one(
        {"_id": video_id},
        {"$set": {"folder_id": folder_id}}
    )
    
    return {"message": "Video moved successfully", "folder_id": folder_id}

@router.post("/{video_id}/thumbnail")
async def upload_custom_thumbnail(
    video_id: str,
    thumbnail: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Upload custom thumbnail for video"""
    video = await db.videos.find_one({"_id": video_id})
    
    if not video:
        raise HTTPException(404, "Video not found")
    
    if video['user_id'] != current_user['user_id']:
        raise HTTPException(403, "Access denied")
    
    # Create thumbnails directory
    thumbnail_dir = "uploads/thumbnails"
    os.makedirs(thumbnail_dir, exist_ok=True)
    
    # Save new thumbnail (overwrite existing)
    thumbnail_path = f"{thumbnail_dir}/{video_id}.jpg"
    
    with open(thumbnail_path, "wb") as buffer:
        shutil.copyfileobj(thumbnail.file, buffer)
    
    await db.videos.update_one(
        {"_id": video_id},
        {"$set": {"thumbnail_path": thumbnail_path}}
    )
    
    return {"message": "Thumbnail updated successfully", "thumbnail_url": f"/api/thumbnails/{video_id}.jpg"}
