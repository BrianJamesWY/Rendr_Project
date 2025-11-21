"""
NEW Enhanced Upload Endpoint with Hash-First Workflow
To be integrated into videos.py
"""

@router.post("/upload", response_model=VideoUploadResponse)
async def upload_video_enhanced(
    video_file: UploadFile = File(...),
    source: str = Form(...),
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
    """
    
    if source not in ["bodycam", "studio"]:
        raise HTTPException(400, "Invalid source. Must be 'bodycam' or 'studio'")
    
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
        print(f"🎬 NEW VIDEO UPLOAD - Hash-First Workflow")
        print(f"{'='*60}")
        print(f"   User: {user.get('username')}")
        print(f"   Tier: {tier}")
        print(f"   Quota: {active_count + 1}/{limit if limit != -1 else 'unlimited'}")
        
        # STEP 1: Calculate ORIGINAL hash (pre-watermark)
        print(f"\n🔍 STEP 1: Calculating original hash (pre-watermark)...")
        original_hashes = enhanced_processor.calculate_all_hashes(file_path, tier)
        
        print(f"   ✅ Original hash: {original_hashes['original_hash'][:32]}...")
        print(f"   ✅ Duration: {original_hashes['duration']}s")
        print(f"   ✅ Frames: {original_hashes['frame_count']}")
        
        # STEP 2: Smart Duplicate Detection
        print(f"\n🔍 STEP 2: Smart duplicate detection...")
        
        # Get all user's existing videos
        existing_videos = await db.videos.find(
            {"user_id": current_user["user_id"]},
            {"_id": 0}
        ).to_list(length=1000)
        
        is_duplicate, matching_video, confidence = enhanced_processor.smart_duplicate_detection(
            new_hashes=original_hashes,
            existing_videos=existing_videos,
            tier=tier
        )
        
        if is_duplicate:
            print(f"\n🚨 DUPLICATE DETECTED!")
            print(f"   Confidence: {confidence:.2%}")
            print(f"   Original code: {matching_video['verification_code']}")
            print(f"   Original upload: {matching_video.get('uploaded_at')}")
            
            # Delete temp file
            os.remove(file_path)
            
            # Update expiration if needed (extend storage)
            if matching_video.get('storage', {}).get('expires_at'):
                storage_durations = {"free": 24, "pro": 168, "enterprise": None}  # hours
                duration = storage_durations.get(tier)
                
                if duration:
                    new_expiration = datetime.now(timezone.utc) + timedelta(hours=duration)
                    await db.videos.update_one(
                        {"_id": matching_video['_id']},
                        {"$set": {"storage.expires_at": new_expiration}}
                    )
                    print(f"   ✅ Storage extended to: {new_expiration}")
            
            return {
                "video_id": matching_video['_id'],
                "verification_code": matching_video['verification_code'],
                "status": "duplicate",
                "message": "This video was already uploaded. Returning existing verification code.",
                "duplicate_detected": True,
                "confidence_score": confidence,
                "original_upload_date": matching_video.get('uploaded_at')
            }
        
        # STEP 3: NEW VIDEO - Generate verification code
        print(f"\n✅ NEW VIDEO DETECTED")
        print(f"\n🔐 STEP 3: Generating verification code...")
        verification_code = video_processor.generate_verification_code()
        print(f"   ✅ Code: {verification_code}")
        
        # STEP 4: Apply Watermark
        print(f"\n💧 STEP 4: Applying watermark...")
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
            print(f"   ✅ Watermark applied")
        else:
            final_video_path = file_path
            print(f"   ⚠️ Watermark failed - using original")
        
        # Rename to standard format
        final_path = f"{upload_dir}/{video_id}.mp4"
        os.rename(final_video_path, final_path)
        
        # STEP 5: Calculate watermarked hash
        print(f"\n🔐 STEP 5: Calculating watermarked hash...")
        watermarked_hashes = enhanced_processor.calculate_all_hashes(final_path, tier)
        print(f"   ✅ Watermarked hash: {watermarked_hashes['original_hash'][:32]}...")
        
        # STEP 6: Generate thumbnail
        print(f"\n📸 STEP 6: Generating thumbnail...")
        thumbnail_path = video_processor.extract_thumbnail(final_path, video_id)
        print(f"   ✅ Thumbnail saved")
        
        # STEP 7: Calculate expiration
        print(f"\n⏰ STEP 7: Setting storage expiration...")
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
        
        # STEP 8: Blockchain (optional)
        blockchain_data = None
        try:
            print(f"\n⛓️ STEP 8: Blockchain timestamping...")
            blockchain_data = blockchain_service.timestamp_video(
                video_id=video_id,
                verification_code=verification_code,
                video_hash=original_hashes['original_hash'],
                metadata={
                    "duration": original_hashes['duration'],
                    "resolution": original_hashes['resolution'],
                    "tier": tier
                }
            )
            if blockchain_data:
                print(f"   ✅ Blockchain tx: {blockchain_data.get('tx_hash', 'N/A')[:16]}...")
        except Exception as e:
            print(f"   ⚠️ Blockchain failed: {e}")
        
        # STEP 9: Save to database
        print(f"\n💾 STEP 9: Saving to database...")
        
        video_doc = {
            "_id": video_id,
            "user_id": current_user["user_id"],
            "verification_code": verification_code,
            "source": source,
            "uploaded_at": uploaded_at,
            
            # Enhanced hashes (NEW)
            "hashes": {
                "original": original_hashes['original_hash'],
                "watermarked": watermarked_hashes['original_hash'],
                "center_region": original_hashes.get('center_region_hash'),
                "audio": original_hashes.get('audio_hash'),
                "metadata": original_hashes['metadata_hash']
            },
            
            # Storage management (NEW)
            "storage": {
                "tier": tier,
                "uploaded_at": uploaded_at,
                "expires_at": expires_at,
                "warned_at": None,
                "download_count": 0
            },
            
            # Legacy fields (keep for compatibility)
            "perceptual_hash": {
                "combined_hash": original_hashes['original_hash']
            },
            "video_metadata": {
                "duration": original_hashes['duration'],
                "frame_count": original_hashes['frame_count'],
                "resolution": original_hashes['resolution']
            },
            "thumbnail_path": thumbnail_path,
            "folder_id": folder_id,
            "blockchain_signature": blockchain_data,
            "verification_status": "verified"
        }
        
        await db.videos.insert_one(video_doc)
        print(f"   ✅ Saved to database")
        
        # STEP 10: Send notification (if applicable)
        print(f"\n📧 STEP 10: Checking notification preferences...")
        
        should_notify = original_hashes['duration'] >= user.get('notify_video_length_threshold', 30)
        
        if should_notify:
            print(f"   📧 Video length ({original_hashes['duration']}s) exceeds threshold - sending notification")
            
            download_url = f"https://creator-vault-7.preview.emergentagent.com/dashboard?video={video_id}"
            
            notification_results = await notification_service.send_video_ready_notification(
                user=user,
                verification_code=verification_code,
                download_url=download_url,
                video_duration=original_hashes['duration']
            )
            
            print(f"   📧 Email sent: {notification_results.get('email', False)}")
            print(f"   📱 SMS sent: {notification_results.get('sms', False)}")
        else:
            print(f"   ℹ️ Video too short ({original_hashes['duration']}s < threshold) - skipping notification")
        
        print(f"\n{'='*60}")
        print(f"✅ UPLOAD COMPLETE")
        print(f"{'='*60}\n")
        
        return {
            "video_id": video_id,
            "verification_code": verification_code,
            "status": "success",
            "message": "Video uploaded and verified successfully",
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
