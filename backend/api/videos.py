from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query, Request
from datetime import datetime, timezone, timedelta
import os
import shutil
import uuid
from utils.security import get_current_user
from database.mongodb import get_db
from services.video_processor import video_processor
from utils.watermark import watermark_processor
from services.blockchain_service import blockchain_service
from services.enhanced_video_processor import enhanced_processor
from services.notification_service import notification_service
from services.comprehensive_hash_service import comprehensive_hash_service
from services.async_video_processor import async_video_processor
from services.c2pa_service import c2pa_service
from services.resubmission_prevention import resubmission_prevention
from pydantic import BaseModel
from typing import Optional
from fastapi.responses import FileResponse, StreamingResponse

router = APIRouter()

# Public video streaming (for showcase videos) - NO AUTH REQUIRED
@router.get("/watch/{video_id}")
async def watch_video_public(
    video_id: str,
    request: Request,
    db = Depends(get_db)
):
    """Stream video file for public viewing with range request support"""
    # Find video - check both id fields
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        video = await db.videos.find_one({"_id": video_id}, {"_id": 0})
    
    if not video:
        raise HTTPException(404, "Video not found")
    
    # Must be on showcase OR is_public
    is_public = video.get("on_showcase", False) or video.get("is_public", False)
    
    if not is_public:
        raise HTTPException(403, "Video is private")
    
    # Get video path
    video_id_final = video.get("id") or video.get("_id")
    video_path = f"/app/backend/uploads/videos/{video_id_final}.mp4"
    
    if not os.path.exists(video_path):
        raise HTTPException(404, "Video file not found on disk")
    
    # Increment view count
    id_field = "id" if video.get("id") else "_id"
    await db.videos.update_one(
        {id_field: video_id},
        {"$inc": {"storage.download_count": 1}}
    )
    
    # Get file stats
    file_size = os.path.getsize(video_path)
    
    # Handle range requests
    range_header = request.headers.get("range")
    
    if range_header:
        # Parse range header
        range_match = range_header.replace("bytes=", "").split("-")
        start = int(range_match[0]) if range_match[0] else 0
        end = int(range_match[1]) if len(range_match) > 1 and range_match[1] else file_size - 1
        
        # Read the requested chunk
        def iterfile():
            with open(video_path, mode="rb") as video_file:
                video_file.seek(start)
                remaining = end - start + 1
                while remaining > 0:
                    chunk_size = min(8192, remaining)
                    data = video_file.read(chunk_size)
                    if not data:
                        break
                    remaining -= len(data)
                    yield data
        
        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(end - start + 1),
            "Content-Type": "video/mp4",
        }
        
        return StreamingResponse(iterfile(), status_code=206, headers=headers)
    
    # No range request - serve full file
    return FileResponse(
        video_path,
        media_type="video/mp4",
        headers={"Accept-Ranges": "bytes"}
    )


# Authenticated video streaming endpoint with range support
@router.get("/{video_id}/stream")
async def stream_video(
    video_id: str,
    request: Request,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Stream video file for authenticated users with range request support"""
    # Find video
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        video = await db.videos.find_one({"_id": video_id}, {"_id": 0})
    
    if not video:
        raise HTTPException(404, "Video not found")
    
    # Check access: owner or video is public
    is_owner = video.get("user_id") == current_user["user_id"]
    is_public = video.get("on_showcase", False) or video.get("is_public", False)
    
    if not is_owner and not is_public:
        raise HTTPException(403, "Access denied")
    
    # Get video path
    video_id_final = video.get("id") or video.get("_id")
    video_path = f"/app/backend/uploads/videos/{video_id_final}.mp4"
    
    if not os.path.exists(video_path):
        raise HTTPException(404, "Video file does not exist on disk")
    
    # Increment view count
    id_field = "id" if video.get("id") else "_id"
    await db.videos.update_one(
        {id_field: video_id},
        {"$inc": {"storage.download_count": 1}}
    )
    
    # Get file stats
    file_size = os.path.getsize(video_path)
    
    # Handle range requests
    range_header = request.headers.get("range")
    
    if range_header:
        # Parse range header
        range_match = range_header.replace("bytes=", "").split("-")
        start = int(range_match[0]) if range_match[0] else 0
        end = int(range_match[1]) if len(range_match) > 1 and range_match[1] else file_size - 1
        
        # Read the requested chunk
        def iterfile():
            with open(video_path, mode="rb") as video_file:
                video_file.seek(start)
                remaining = end - start + 1
                while remaining > 0:
                    chunk_size = min(8192, remaining)
                    data = video_file.read(chunk_size)
                    if not data:
                        break
                    remaining -= len(data)
                    yield data
        
        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(end - start + 1),
            "Content-Type": "video/mp4",
        }
        
        return StreamingResponse(iterfile(), status_code=206, headers=headers)
    
    # No range request - serve full file
    return FileResponse(
        video_path,
        media_type="video/mp4",
        headers={"Accept-Ranges": "bytes"}
    )


# Tier management (for testing)
@router.post("/admin/set-tier")
async def set_user_tier(
    username: str = Form(...),
    tier: str = Form(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Set user tier (for testing purposes)"""
    if tier not in ["free", "pro", "enterprise"]:
        raise HTTPException(400, "Invalid tier. Must be: free, pro, or enterprise")
    
    result = await db.users.update_one(
        {"username": username},
        {"$set": {"premium_tier": tier}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(404, "User not found")
    
    return {"message": f"User {username} tier set to {tier}", "tier": tier}



class VideoUploadResponse(BaseModel):
    video_id: str
    verification_code: str
    status: str
    message: str
    expires_at: Optional[str] = None
    storage_duration: Optional[str] = None
    tier: Optional[str] = None
    duplicate_detected: Optional[bool] = None
    confidence_score: Optional[float] = None
    original_upload_date: Optional[str] = None
    # Duplicate detection fields
    is_owner: Optional[bool] = None
    original_owner: Optional[str] = None
    creator_showcase_url: Optional[str] = None
    creator_profile_pic: Optional[str] = None
    social_media_links: Optional[list] = None
    video_title: Optional[str] = None
    video_description: Optional[str] = None
    security_alert: Optional[str] = None

class VideoUpdateData(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[list] = None
    is_public: Optional[bool] = None
    showcase_folder_id: Optional[str] = None
    folder_id: Optional[str] = None
    on_showcase: Optional[bool] = None
    social_folders: Optional[list] = None
    social_links: Optional[list] = None

@router.post("/upload", response_model=VideoUploadResponse)
async def upload_video(
    video_file: UploadFile = File(...),
    folder_id: str = Form(None),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Upload and process video with enhanced detection and storage management
    
    NEW WORKFLOW:
    1. Save temp video
    2. Calculate ORIGINAL hash (pre-watermark)
    3. Check for duplicates using smart detection
    4. If duplicate -> return existing code
    5. If new -> Generate code, watermark, calculate all hashes, store with expiration
    
    Source is auto-detected: "studio" for web uploads
    """
    
    # Auto-detect source: Web platform = "studio"
    source = "studio"
    
    # Check quota FIRST
    user = await db.users.find_one({"_id": current_user["user_id"]}, {"_id": 0})
    tier = user.get("premium_tier", "free")
    
    # Count active videos (not expired)
    active_count = await db.videos.count_documents({
        "user_id": current_user["user_id"],
        "$or": [
            {"storage.expires_at": {"$gt": datetime.now(timezone.utc)}},
            {"storage.expires_at": None}  # Unlimited (enterprise)
        ]
    })
    
    # Check quota limits
    quota_limits = {"free": 5, "pro": 100, "enterprise": -1}
    limit = quota_limits.get(tier, 5)
    
    if limit != -1 and active_count >= limit:
        raise HTTPException(
            403, 
            f"Video quota reached. You have {active_count}/{limit} videos. Delete old videos or upgrade your tier."
        )
    
    video_id = str(uuid.uuid4())
    upload_dir = "/app/backend/uploads/videos"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = f"{upload_dir}/{video_id}_{video_file.filename}"
    
    # Save uploaded file to temp
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(video_file.file, buffer)
    
    try:
        print(f"\n{'='*60}")
        print("🎬 NEW VIDEO UPLOAD - Hash-First Workflow")
        print(f"{'='*60}")
        print(f"   User: {user.get('username')}")
        print(f"   Tier: {tier}")
        print(f"   Quota: {active_count + 1}/{limit if limit != -1 else 'unlimited'}")
        
        # Check if user is banned or has strikes
        user_status = await resubmission_prevention.check_user_status(current_user["user_id"], db)
        
        if not user_status["can_upload"]:
            print(f"\n🚫 UPLOAD BLOCKED: {user_status['message']}")
            raise HTTPException(
                403,
                {
                    "error": "upload_blocked",
                    "message": user_status["message"],
                    "status": user_status["status"],
                    "strikes": user_status["strikes"],
                    "ban_expires_at": user_status["ban_expires_at"].isoformat() if user_status["ban_expires_at"] else None
                }
            )
        
        if user_status["strikes"] > 0:
            print(f"\n⚠️ USER WARNING: {user_status['strikes']} strikes - {user_status['message']}")
        
        # STEP 1: Calculate ORIGINAL SHA-256 (pre-watermark) 
        print("\n🔍 STEP 1: Calculating original SHA-256 (pre-watermark)...")
        original_sha256 = comprehensive_hash_service._calculate_file_sha256(file_path)
        print(f"   ✅ Original SHA-256: {original_sha256[:32]}...")
        
        # Also get basic metadata for quota/duplicate check
        original_hashes = enhanced_processor.calculate_all_hashes(file_path, tier)
        print(f"   ✅ Duration: {original_hashes['duration']}s")
        print(f"   ✅ Frames: {original_hashes['frame_count']}")
        
        # STEP 2: Smart Duplicate Detection
        print("\n🔍 STEP 2: Smart duplicate detection...")
        
        # Get ALL existing videos across entire platform to prevent duplicates
        existing_videos = await db.videos.find(
            {},
            {"_id": 0}
        ).to_list(length=10000)
        
        is_duplicate, matching_video, confidence = enhanced_processor.smart_duplicate_detection(
            new_hashes=original_hashes,
            existing_videos=existing_videos,
            tier=tier
        )
        
        if is_duplicate:
            print("\n🚨 DUPLICATE DETECTED!")
            print(f"   Confidence: {confidence:.2%}")
            print(f"   Original code: {matching_video['verification_code']}")
            print(f"   Original upload: {matching_video.get('uploaded_at')}")
            
            # Delete temp file
            os.remove(file_path)
            
            # Get creator info from users collection
            original_user_id = matching_video.get('user_id')
            creator_info = await db.users.find_one({"user_id": original_user_id}, {"_id": 0})
            
            # Check if current user is the owner
            is_owner = (original_user_id == current_user["user_id"])
            
            # If NOT the owner, record this as a resubmission attempt
            if not is_owner:
                print("\n⚠️ RESUBMISSION ATTEMPT DETECTED")
                print(f"   User {current_user['username']} tried to upload content owned by {creator_info.get('username', 'Unknown') if creator_info else 'Unknown'}")
                
                # Record the attempt and check for strikes
                strike_result = await resubmission_prevention.record_duplicate_attempt(
                    user_id=current_user["user_id"],
                    video_hash=original_hashes['original_hash'],
                    original_owner_id=original_user_id,
                    original_verification_code=matching_video['verification_code'],
                    db=db
                )
                
                print(f"   📋 Strike status: {strike_result.get('message')}")
                print(f"   📊 Total strikes: {strike_result.get('total_strikes', 0)}")
                
                # TODO: Send notification to original content creator
                # notification_service.notify_duplicate_attempt(
                #     owner_user_id=original_user_id,
                #     attempter_username=current_user['username'],
                #     verification_code=matching_video['verification_code']
                # )
            
            # Update expiration if owner re-uploading (extend storage)
            if is_owner and matching_video.get('storage', {}).get('expires_at'):
                storage_durations = {"free": 24, "pro": 168, "enterprise": None}  # hours
                duration = storage_durations.get(tier)
                
                if duration:
                    new_expiration = datetime.now(timezone.utc) + timedelta(hours=duration)
                    await db.videos.update_one(
                        {"id": matching_video['id']},
                        {"$set": {"storage.expires_at": new_expiration}}
                    )
                    print(f"   ✅ Storage extended to: {new_expiration}")
            
            upload_date = matching_video.get('uploaded_at')
            if isinstance(upload_date, datetime):
                upload_date = upload_date.isoformat()
            
            # Get social media links for this video (from edit video modal)
            social_links = matching_video.get('social_media_links', [])
            
            return {
                "video_id": matching_video['id'],
                "verification_code": matching_video['verification_code'],
                "status": "duplicate",
                "message": "This video was already uploaded. Returning existing verification code.",
                "duplicate_detected": True,
                "confidence_score": confidence,
                "original_upload_date": upload_date,
                "is_owner": is_owner,
                "original_owner": creator_info.get('username', 'Unknown') if creator_info else 'Unknown',
                "creator_showcase_url": f"/{creator_info.get('username', '')}" if creator_info else None,
                "creator_profile_pic": creator_info.get('profile', {}).get('profilePic') if creator_info else None,
                "social_media_links": social_links,
                "video_title": matching_video.get('title', 'Untitled Video'),
                "video_description": matching_video.get('description', ''),
                "security_alert": "Uploading someone else's verified content may violate copyright and platform terms of service."
            }
        
        # STEP 3: NEW VIDEO - Generate verification code
        print("\n✅ NEW VIDEO DETECTED")
        print("\n🔐 STEP 3: Generating verification code...")
        verification_code = video_processor.generate_verification_code()
        print(f"   ✅ Code: {verification_code}")
        
        # STEP 4: Apply Watermark
        print("\n💧 STEP 4: Applying watermark...")
        username = user.get("username", "user")
        watermark_position = user.get("watermark_position", "left")
        watermarked_path = f"{upload_dir}/{video_id}_watermarked.mp4"
        
        watermark_success = watermark_processor.apply_watermark(
            input_video_path=file_path,
            output_video_path=watermarked_path,
            username=username,
            position=watermark_position,
            tier=tier,
            verification_code=verification_code
        )
        
        if watermark_success:
            os.remove(file_path)
            final_video_path = watermarked_path
            print("   ✅ Watermark applied")
        else:
            final_video_path = file_path
            print("   ⚠️ Watermark failed - using original")
        
        # Rename to standard format
        final_path = f"{upload_dir}/{video_id}.mp4"
        os.rename(final_video_path, final_path)
        
        # STEP 5: Calculate FAST hashes only (SHA-256, key frames)
        # Slow hashes (perceptual, audio) will be done in background via Redis
        print("\n🔐 STEP 5: Calculating essential hashes (fast)...")
        
        # Calculate only the quick hashes
        original_sha256 = comprehensive_hash_service._calculate_file_sha256(file_path)
        print(f"   ✅ Original SHA-256: {original_sha256[:32]}...")
        
        watermarked_sha256 = comprehensive_hash_service._calculate_file_sha256(final_path)
        print(f"   ✅ Watermarked SHA-256: {watermarked_sha256[:32]}...")
        
        # Key frame hashes (relatively fast - 10 frames)
        key_frame_hashes = comprehensive_hash_service._calculate_key_frame_hashes(final_path)
        print(f"   ✅ Key frames: {len(key_frame_hashes)}/10")
        
        # Extract metadata
        video_metadata = comprehensive_hash_service._extract_metadata(final_path)
        metadata_hash = comprehensive_hash_service._create_metadata_hash(video_metadata)
        print(f"   ✅ Metadata hash: {metadata_hash[:32]}...")
        
        # Create partial comprehensive_hashes object (background will complete it)
        comprehensive_hashes = {
            'original_sha256': original_sha256,
            'watermarked_sha256': watermarked_sha256,
            'key_frame_hashes': key_frame_hashes,
            'perceptual_hashes': [],  # Will be calculated in background
            'audio_hash': None,        # Will be calculated in background
            'metadata_hash': metadata_hash,
            'master_hash': original_sha256,  # Temporary, will be updated
            'video_metadata': video_metadata
        }
        
        print(f"   ⏱️ Fast hashing complete! Background processing queued for perceptual & audio hashes")
        
        # STEP 6: Create C2PA Manifest
        print("\n📜 STEP 6: Creating C2PA manifest...")
        c2pa_manifest_data = c2pa_service.create_manifest(
            video_path=final_path,
            verification_code=verification_code,
            user_info={
                "username": username,
                "user_id": current_user["user_id"]
            },
            hashes=comprehensive_hashes,
            metadata={
                "title": video_file.filename,
                "device": comprehensive_hashes["video_metadata"].get("tags", {}).get("com.apple.quicktime.model", ""),
                "duration": comprehensive_hashes["video_metadata"].get("duration", 0)
            }
        )
        
        # Save C2PA manifest as sidecar file
        c2pa_manifest_path = c2pa_service.save_manifest(c2pa_manifest_data, final_path)
        print(f"   ✅ C2PA manifest saved")
        
        # STEP 7: Generate thumbnail
        print("\n📸 STEP 7: Generating thumbnail...")
        thumbnail_path = video_processor.extract_thumbnail(final_path, video_id)
        print("   ✅ Thumbnail saved")
        
        # STEP 8: Calculate expiration
        print("\n⏰ STEP 8: Setting storage expiration...")
        uploaded_at = datetime.now(timezone.utc)
        
        storage_durations = {
            "free": 24,      # 24 hours
            "pro": 168,      # 7 days
            "enterprise": None  # Unlimited
        }
        
        duration_hours = storage_durations.get(tier)
        
        if duration_hours:
            expires_at = uploaded_at + timedelta(hours=duration_hours)
            print(f"   ⏰ Tier: {tier} - Expires in {duration_hours} hours")
            print(f"   ⏰ Expiration: {expires_at}")
        else:
            expires_at = None
            print(f"   ♾️ Tier: {tier} - Unlimited storage")
        
        # STEP 9: Blockchain (optional)
        blockchain_data = None
        try:
            print("\n⛓️ STEP 9: Blockchain timestamping...")
            blockchain_data = blockchain_service.timestamp_video(
                video_id=video_id,
                verification_code=verification_code,
                video_hash=comprehensive_hashes['master_hash'],
                metadata={
                    "duration": comprehensive_hashes['video_metadata'].get('duration', 0),
                    "resolution": comprehensive_hashes['video_metadata'].get('resolution', ''),
                    "tier": tier
                }
            )
            if blockchain_data:
                print(f"   ✅ Blockchain tx: {blockchain_data.get('tx_hash', 'N/A')[:16]}...")
        except Exception as e:
            print(f"   ⚠️ Blockchain failed: {e}")
        
        # STEP 10: Save to database
        print("\n💾 STEP 10: Saving to database...")
        
        video_doc = {
            "_id": video_id,
            "id": video_id,
            "user_id": current_user["user_id"],
            "verification_code": verification_code,
            "source": source,
            "uploaded_at": uploaded_at,
            
            # Comprehensive hash package from new verification system
            "comprehensive_hashes": comprehensive_hashes,
            
            # SHA-256 Hashes (BOTH versions - NEW DUAL HASH SYSTEM)
            "hashes": {
                "original_sha256": comprehensive_hashes.get('original_sha256'),
                "watermarked_sha256": comprehensive_hashes.get('watermarked_sha256'),
                "key_frame_hashes": comprehensive_hashes.get('key_frame_hashes', []),
                "metadata_hash": comprehensive_hashes.get('metadata_hash'),
                "master_hash": comprehensive_hashes.get('master_hash')
            },
            
            # Perceptual hashes from comprehensive service
            "perceptual_hashes": {
                "video_phashes": comprehensive_hashes.get('perceptual_hashes', []),
                "audio_hash": comprehensive_hashes.get('audio_hash'),
                "center_region_hash": None  # Legacy field
            },
            
            # C2PA Manifest
            "c2pa_manifest": {
                "manifest_path": c2pa_manifest_path,
                "signature_valid": None,
                "hard_binding_valid": None,
                "issuer": "RENDR",
                "created_at": datetime.now(timezone.utc),
                "manifest_data": c2pa_manifest_data
            },
            
            # Storage management
            "storage": {
                "tier": tier,
                "uploaded_at": uploaded_at,
                "expires_at": expires_at,
                "warned_at": None,
                "download_count": 0
            },
            
            # Video metadata from comprehensive service
            "video_metadata": comprehensive_hashes.get('video_metadata', {}),
            "thumbnail_path": thumbnail_path,
            "folder_id": folder_id,
            "showcase_folder_id": folder_id,
            "blockchain_signature": blockchain_data,
            "verification_status": "verified",
            "is_public": True
        }
        
        await db.videos.insert_one(video_doc)
        print("   ✅ Saved to database")
        
        # STEP 10B: Queue background processing for slow hashes
        print("\n🚀 STEP 10B: Queueing background hash processing...")
        from services.redis_queue_service import redis_queue_service
        
        # Determine priority based on tier
        priority = 'high' if tier == 'enterprise' else 'default' if tier == 'pro' else 'low'
        
        job_id = redis_queue_service.enqueue_video_processing(
            video_id=video_id,
            video_path=final_path,
            verification_code=verification_code,
            user_id=current_user["user_id"],
            priority=priority
        )
        
        print(f"   ✅ Background job queued: {job_id}")
        print(f"   ⏱️ Priority: {priority}")
        print(f"   📊 Workers will calculate perceptual & audio hashes asynchronously")
        
        # STEP 11: Send notification (if applicable)
        print("\n📧 STEP 11: Checking notification preferences...")
        
        video_duration = comprehensive_hashes['video_metadata'].get('duration', 0)
        should_notify = video_duration >= user.get('notify_video_length_threshold', 30)
        
        if should_notify:
            print(f"   📧 Video length ({video_duration}s) exceeds threshold - sending notification")
            
            download_url = f"https://videoproof-1.preview.emergentagent.com/dashboard?video={video_id}"
            
            notification_results = await notification_service.send_video_ready_notification(
                user=user,
                verification_code=verification_code,
                download_url=download_url,
                video_duration=video_duration
            )
            
            print(f"   📧 Email sent: {notification_results.get('email', False)}")
            print(f"   📱 SMS sent: {notification_results.get('sms', False)}")
        else:
            print(f"   ℹ️ Video too short ({video_duration}s < threshold) - skipping notification")
        
        print(f"\n{'='*60}")
        print("✅ UPLOAD COMPLETE")
        print(f"{'='*60}\n")
        
        return {
            "video_id": video_id,
            "verification_code": verification_code,
            "status": "success",
            "message": "Video uploaded and verified successfully with C2PA manifest",
            "watermarked_video_url": f"/api/videos/watch/{video_id}",
            "thumbnail_url": f"/api/videos/{video_id}/thumbnail",
            "hashes": {
                "original_sha256": comprehensive_hashes.get('original_sha256', 'N/A')[:64] if comprehensive_hashes.get('original_sha256') else 'N/A',
                "watermarked_sha256": comprehensive_hashes.get('watermarked_sha256', 'N/A')[:64] if comprehensive_hashes.get('watermarked_sha256') else 'N/A',
                "key_frame_count": len(comprehensive_hashes.get('key_frame_hashes', [])),
                "perceptual_hash_count": len(comprehensive_hashes.get('perceptual_hashes', [])),
                "master_hash": comprehensive_hashes.get('master_hash', 'N/A')[:64] if comprehensive_hashes.get('master_hash') else 'N/A'
            },
            "c2pa": {
                "manifest_created": True,
                "manifest_path": c2pa_manifest_path
            },
            "processing_status": {
                "stage": "background_processing",
                "progress": 50,
                "message": "Essential hashing complete. Advanced hashes calculating in background.",
                "job_id": job_id,
                "completed_layers": [
                    "Original SHA-256",
                    "Watermarked SHA-256", 
                    "Key Frame Hashes",
                    "Metadata Hash",
                    "C2PA Manifest"
                ],
                "pending_layers": [
                    "Perceptual Hashes" if tier in ["pro", "enterprise"] else None,
                    "Audio Hash" if tier == "enterprise" else None
                ],
                "check_status_url": f"/api/videos/{video_id}/status"
            },
            "expires_at": expires_at.isoformat() if expires_at else None,
            "storage_duration": f"{duration_hours} hours" if duration_hours else "unlimited",
            "tier": tier
        }
        
    except Exception as e:
        print(f"\n❌ ERROR during upload: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Cleanup on error
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(500, f"Video processing failed: {str(e)}")


@router.get("/{video_id}/status")
async def get_video_status(
    video_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get processing status for a video - returns real-time progress from Redis queue"""
    # Find video
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(404, "Video not found")
    
    # Check ownership
    if video.get("user_id") != current_user["user_id"]:
        raise HTTPException(403, "Access denied")
    
    # Check if there's a background job running
    from services.redis_queue_service import redis_queue_service
    
    job_id = f"video_{video_id}"
    job_status = redis_queue_service.get_job_status(job_id)
    
    # If job is running or queued, return its status
    if job_status['status'] in ['queued', 'started']:
        # Map job progress to our verification layers
        progress = job_status.get('progress', 0)
        
        completed_layers = [
            "Original SHA-256",
            "Watermarked SHA-256",
            "Key Frame Hashes",
            "Metadata Hash",
            "C2PA Manifest"
        ]
        
        pending_layers = []
        if progress < 60:
            pending_layers.append("Perceptual Hashes")
        if progress < 80:
            pending_layers.append("Audio Hash")
        
        return {
            "video_id": video_id,
            "stage": "processing",
            "progress": 50 + int(progress / 2),  # 50-100 range (50% already done)
            "message": job_status.get('message', 'Processing additional hashes...'),
            "verification_layers": completed_layers,
            "pending_layers": pending_layers,
            "eta": "30-60 seconds",
            "job_status": job_status['status']
        }
    
    # If job finished, check database for complete hashes
    hashes = video.get("comprehensive_hashes", {})
    
    # Check if background processing is complete
    has_perceptual = len(hashes.get("perceptual_hashes", [])) > 0
    has_audio = hashes.get("audio_hash") is not None
    
    if has_perceptual or has_audio:
        # Background processing complete
        verification_layers = []
        
        if hashes.get("original_sha256"):
            verification_layers.append("Original SHA-256")
        if hashes.get("watermarked_sha256"):
            verification_layers.append("Watermarked SHA-256")
        if hashes.get("key_frame_hashes"):
            verification_layers.append(f"Key Frame Hashes ({len(hashes.get('key_frame_hashes', []))}/10)")
        if hashes.get("perceptual_hashes"):
            verification_layers.append(f"Perceptual Hashes ({len(hashes.get('perceptual_hashes', []))})")
        if hashes.get("audio_hash"):
            verification_layers.append("Audio Hash")
        if hashes.get("metadata_hash"):
            verification_layers.append("Metadata Hash")
        if video.get("c2pa_manifest", {}).get("manifest_path"):
            verification_layers.append("C2PA Manifest")
        
        return {
            "video_id": video_id,
            "stage": "complete",
            "progress": 100,
            "message": "All verification layers complete",
            "verification_layers": verification_layers,
            "eta": None
        }
    
    else:
        # Still waiting or just essential hashing done
        return {
            "video_id": video_id,
            "stage": "background_queued",
            "progress": 50,
            "message": "Essential hashing complete. Advanced hashes queued for background processing.",
            "verification_layers": [
                "Original SHA-256",
                "Watermarked SHA-256",
                "Key Frame Hashes",
                "Metadata Hash",
                "C2PA Manifest"
            ],
            "pending_layers": ["Perceptual Hashes", "Audio Hash"],
            "eta": "30-60 seconds"
        }


@router.get("/user/list")
async def list_user_videos(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get all videos for current user"""
    videos = await db.videos.find(
        {"user_id": current_user["user_id"]}
    ).to_list(length=1000)
    
    video_list = []
    for v in videos:
        # Get video_id, prefer 'id' field, fallback to '_id'
        video_id = v.get('id') or str(v.get('_id', ''))
        
        video_list.append({
            "video_id": video_id,
            "verification_code": v.get('verification_code'),
            "source": v.get('source'),
            "captured_at": v.get('captured_at'),
            "uploaded_at": v.get('uploaded_at'),
            "thumbnail_url": v.get('thumbnail_path'),
            "folder_id": v.get('folder_id'),
            "showcase_folder_id": v.get('showcase_folder_id'),
            "is_public": v.get('is_public', False),
            "has_blockchain": v.get('blockchain_signature') is not None,
            "verification_status": v.get('verification_status', 'pending'),
            "storage": v.get('storage'),
            "hashes": v.get('hashes'),
            "title": v.get('title'),
            "description": v.get('description'),
            "on_showcase": v.get('on_showcase', False),
            "social_folders": v.get('social_folders', []),
            "social_links": v.get('social_links', [])
        })
    
    # Sort by showcase folder, then by order
    video_list.sort(key=lambda x: (x.get('showcase_folder_id') or '', x.get('folder_video_order', 999)))
    
    return video_list


@router.put("/{video_id}")
async def update_video(
    video_id: str,
    video_data: VideoUpdateData,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update video metadata"""
    # Check both 'id' and '_id' fields for compatibility with old videos
    video = await db.videos.find_one({"$or": [{"id": video_id}, {"_id": video_id}]})
    
    if not video:
        raise HTTPException(404, "Video not found")
    
    if video['user_id'] != current_user['user_id']:
        raise HTTPException(403, "Not authorized")
    
    update_fields = {}
    
    if video_data.title is not None:
        update_fields['title'] = video_data.title
    if video_data.description is not None:
        update_fields['description'] = video_data.description
    if video_data.tags is not None:
        update_fields['tags'] = video_data.tags
    if video_data.is_public is not None:
        update_fields['is_public'] = video_data.is_public
    if video_data.showcase_folder_id is not None:
        update_fields['showcase_folder_id'] = video_data.showcase_folder_id
    if video_data.folder_id is not None:
        update_fields['folder_id'] = video_data.folder_id
        # Also update showcase_folder_id to match
        update_fields['showcase_folder_id'] = video_data.folder_id
    if video_data.on_showcase is not None:
        update_fields['on_showcase'] = video_data.on_showcase
    if video_data.social_folders is not None:
        update_fields['social_folders'] = video_data.social_folders
    if video_data.social_links is not None:
        update_fields['social_links'] = video_data.social_links
    
    if update_fields:
        # Use whichever ID field exists in the video
        id_field = "id" if video.get("id") else "_id"
        await db.videos.update_one(
            {id_field: video_id},
            {"$set": update_fields}
        )
    
    return {"message": "Video updated successfully"}


@router.put("/{video_id}/folder")
async def move_video_to_folder(
    video_id: str,
    folder_id: str = Query(None),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Move video to a folder (or remove from folder if folder_id is None)"""
    # Check both 'id' and '_id' fields for compatibility with old videos
    video = await db.videos.find_one({"$or": [{"id": video_id}, {"_id": video_id}]})
    
    if not video:
        raise HTTPException(404, "Video not found")
    
    if video['user_id'] != current_user['user_id']:
        raise HTTPException(403, "Not authorized")
    
    # Update both folder_id and showcase_folder_id
    # Use whichever ID field exists in the video
    id_field = "id" if video.get("id") else "_id"
    await db.videos.update_one(
        {id_field: video_id},
        {"$set": {
            "folder_id": folder_id,
            "showcase_folder_id": folder_id
        }}
    )
    
    return {"message": "Video moved successfully"}


@router.put("/{video_id}/metadata")
async def update_video_metadata(
    video_id: str,
    video_data: VideoUpdateData,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update video metadata (description, tags, external link, showcase folder, etc.)"""
    # Check both 'id' and '_id' fields for compatibility with old videos
    video = await db.videos.find_one({"$or": [{"id": video_id}, {"_id": video_id}]})
    
    if not video:
        raise HTTPException(404, "Video not found")
    
    if video['user_id'] != current_user['user_id']:
        raise HTTPException(403, "Not authorized")
    
    update_fields = {}
    
    if video_data.title is not None:
        update_fields['title'] = video_data.title
    if video_data.description is not None:
        update_fields['description'] = video_data.description
    if video_data.tags is not None:
        update_fields['tags'] = video_data.tags
    if video_data.is_public is not None:
        update_fields['is_public'] = video_data.is_public
    if video_data.showcase_folder_id is not None:
        update_fields['showcase_folder_id'] = video_data.showcase_folder_id
    
    if update_fields:
        # Use whichever ID field exists in the video
        id_field = "id" if video.get("id") else "_id"
        await db.videos.update_one(
            {id_field: video_id},
            {"$set": update_fields}
        )
    
    return {"message": "Video metadata updated successfully"}


@router.delete("/{video_id}")
async def delete_video(
    video_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Delete a video"""


@router.get("/{video_id}/processing-status")
async def get_processing_status(
    video_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get current processing status for a video"""
    # Verify ownership
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(404, "Video not found")
    
    if video["user_id"] != current_user["user_id"]:
        raise HTTPException(403, "Access denied")
    
    # Get status from async processor
    status = async_video_processor.get_processing_status(video_id)
    
    # If no status in cache, check database
    if status.get("status") == "unknown":
        db_status = video.get("processing_status", {})
        if db_status:
            status = db_status
    
    return status

    # Check both 'id' and '_id' fields for compatibility with old videos
    video = await db.videos.find_one({"$or": [{"id": video_id}, {"_id": video_id}]})
    
    if not video:
        raise HTTPException(404, "Video not found")
    
    if video['user_id'] != current_user['user_id']:
        raise HTTPException(403, "Not authorized")
    
    # Delete video file
    video_path = f"/app/backend/uploads/videos/{video_id}.mp4"
    if os.path.exists(video_path):
        os.remove(video_path)
    
    # Delete thumbnail
    if video.get('thumbnail_path'):
        thumb_path = f"/app/backend{video['thumbnail_path']}"
        if os.path.exists(thumb_path):
            os.remove(thumb_path)
    
    # Delete from database - use whichever ID field exists
    id_field = "id" if video.get("id") else "_id"
    await db.videos.delete_one({id_field: video_id})
    
    return {"message": "Video deleted successfully"}


@router.get("/{video_id}/download")
async def download_video(
    video_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Download video file"""
    # Check both 'id' and '_id' fields for compatibility with old videos
    video = await db.videos.find_one({"$or": [{"id": video_id}, {"_id": video_id}]})
    
    if not video:
        raise HTTPException(404, "Video not found")
    
    if video['user_id'] != current_user['user_id']:
        raise HTTPException(403, "Not authorized")
    
    video_path = f"/app/backend/uploads/videos/{video_id}.mp4"
    
    if not os.path.exists(video_path):
        raise HTTPException(404, "Video file not found")
    
    # Increment download count
    id_field = "id" if video.get("id") else "_id"
    await db.videos.update_one(
        {id_field: video_id},
        {"$inc": {"storage.download_count": 1}}
    )
    
    # Return file with proper headers
    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename=f"{video['verification_code']}.mp4"
    )


@router.post("/{video_id}/thumbnail")
async def upload_video_thumbnail(
    video_id: str,
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Upload custom thumbnail for video"""
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        video = await db.videos.find_one({"_id": video_id}, {"_id": 0})
    
    if not video:
        raise HTTPException(404, "Video not found")
    
    if video["user_id"] != current_user["user_id"]:
        raise HTTPException(403, "Access denied")
    
    # Save thumbnail
    upload_dir = "/app/backend/uploads/thumbnails"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = f"{upload_dir}/{video_id}.jpg"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    thumbnail_url = f"uploads/thumbnails/{video_id}.jpg"
    
    # Update video
    id_field = "id" if video.get("id") else "_id"
    await db.videos.update_one(
        {id_field: video_id},
        {"$set": {"thumbnail_path": thumbnail_url}}
    )
    
    return {"thumbnail_url": thumbnail_url, "message": "Thumbnail uploaded successfully"}

