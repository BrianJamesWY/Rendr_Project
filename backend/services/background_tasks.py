"""
Background Tasks for Redis Queue
Heavy processing tasks that run in background workers
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone


def process_video_hashes(video_id: str, video_path: str, verification_code: str, user_id: str):
    """
    Background task: Calculate additional hashes (perceptual, audio, etc.)
    This runs in a separate worker process
    
    CRITICAL: This function updates the database with:
    - Perceptual hashes (compression-resistant)
    - Audio hash (audio fingerprint)
    - Updated master hash (combining all layers)
    """
    from rq import get_current_job
    from services.comprehensive_hash_service import comprehensive_hash_service
    import hashlib
    
    job = get_current_job()
    
    try:
        # Update progress
        job.meta['progress'] = 10
        job.meta['message'] = 'Starting hash calculations...'
        job.save_meta()
        
        print(f"\n{'='*60}")
        print(f"🔄 BACKGROUND PROCESSING - Video {video_id}")
        print(f"{'='*60}")
        
        # Calculate perceptual hashes (this is slow but critical for verification)
        job.meta['progress'] = 30
        job.meta['message'] = 'Calculating perceptual hashes...'
        job.save_meta()
        
        print("📊 Step 1: Calculating perceptual hashes...")
        perceptual_hashes = comprehensive_hash_service._calculate_perceptual_hashes(video_path)
        print(f"   ✅ Calculated {len(perceptual_hashes)} perceptual hashes")
        
        # Calculate audio hash
        job.meta['progress'] = 60
        job.meta['message'] = 'Calculating audio hash...'
        job.save_meta()
        
        print("📊 Step 2: Calculating audio hash...")
        audio_hash = comprehensive_hash_service._calculate_audio_perceptual_hash(video_path)
        print(f"   ✅ Audio hash: {audio_hash[:32] if audio_hash else 'N/A'}...")
        
        # Update database with ALL calculated data
        job.meta['progress'] = 80
        job.meta['message'] = 'Saving verification data to database...'
        job.save_meta()
        
        print("💾 Step 3: Updating database with all verification layers...")
        
        # Use asyncio to update MongoDB
        asyncio.run(update_video_hashes(
            video_id=video_id,
            verification_code=verification_code,
            perceptual_hashes=perceptual_hashes,
            audio_hash=audio_hash
        ))
        
        # Complete
        job.meta['progress'] = 100
        job.meta['message'] = 'All verification layers complete'
        job.save_meta()
        
        print(f"{'='*60}")
        print(f"✅ BACKGROUND PROCESSING COMPLETE - {video_id}")
        print(f"{'='*60}\n")
        
        return {
            'video_id': video_id,
            'verification_code': verification_code,
            'perceptual_hash_count': len(perceptual_hashes),
            'audio_hash': audio_hash,
            'status': 'success'
        }
        
    except Exception as e:
        print(f"\n❌ BACKGROUND PROCESSING FAILED: {e}")
        import traceback
        traceback.print_exc()
        
        job.meta['progress'] = 0
        job.meta['message'] = f'Error: {str(e)}'
        job.save_meta()
        raise


async def update_video_hashes(video_id: str, verification_code: str, perceptual_hashes: list, audio_hash: str):
    """
    Update video document with ALL verification layers
    
    CRITICAL: This persists the complete verification data to the database
    """
    import hashlib
    
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # First, get the existing video to combine hashes for master hash
        video = await db.videos.find_one({"id": video_id}, {"_id": 0})
        
        if not video:
            print(f"   ⚠️ Video {video_id} not found in database!")
            return
        
        # Get existing hashes
        existing_hashes = video.get("comprehensive_hashes", {})
        
        # Calculate updated master hash (combination of ALL layers)
        components = [
            verification_code,
            existing_hashes.get("metadata_hash", ""),
            "".join(existing_hashes.get("key_frame_hashes", [])),
            "".join(perceptual_hashes),  # New perceptual hashes
            audio_hash if audio_hash else "",  # New audio hash
            existing_hashes.get("timestamp", datetime.now(timezone.utc).isoformat())
        ]
        combined = "|".join(components)
        updated_master_hash = hashlib.sha256(combined.encode()).hexdigest()
        
        # Update the video document with ALL verification data
        result = await db.videos.update_one(
            {"id": video_id},
            {
                "$set": {
                    # Update comprehensive_hashes
                    "comprehensive_hashes.perceptual_hashes": perceptual_hashes,
                    "comprehensive_hashes.audio_hash": audio_hash,
                    "comprehensive_hashes.master_hash": updated_master_hash,
                    
                    # Also update the top-level hashes object for API response
                    "hashes.perceptual_hash_count": len(perceptual_hashes),
                    "hashes.master_hash": updated_master_hash,
                    
                    # Update perceptual_hashes object
                    "perceptual_hashes.video_phashes": perceptual_hashes,
                    "perceptual_hashes.audio_hash": audio_hash,
                    
                    # Update processing status
                    "processing_status": {
                        "stage": "complete",
                        "progress": 100,
                        "message": "All verification layers complete",
                        "verification_layers": [
                            "Original SHA-256",
                            "Watermarked SHA-256",
                            f"Key Frame Hashes ({len(existing_hashes.get('key_frame_hashes', []))})",
                            f"Perceptual Hashes ({len(perceptual_hashes)})",
                            "Audio Hash" if audio_hash and audio_hash != "no_audio" else "No Audio",
                            "Metadata Hash",
                            "C2PA Manifest",
                            "Master Hash"
                        ],
                        "completed_at": datetime.now(timezone.utc)
                    },
                    
                    # Mark as fully verified
                    "verification_status": "fully_verified"
                }
            }
        )
        
        print(f"   📊 Database update result: {result.modified_count} document(s) modified")
        print(f"   ✅ Saved {len(perceptual_hashes)} perceptual hashes")
        print(f"   ✅ Saved audio hash: {audio_hash[:16] if audio_hash else 'N/A'}...")
        print(f"   ✅ Updated master hash: {updated_master_hash[:32]}...")
        
    except Exception as e:
        print(f"   ❌ Database update failed: {e}")
        import traceback
        traceback.print_exc()
        raise
        
    finally:
        client.close()


def process_c2pa_manifest(video_id: str, video_path: str, manifest_data: dict):
    """
    Background task: Sign and embed C2PA manifest
    (Requires certificates - placeholder for now)
    """
    from rq import get_current_job
    
    job = get_current_job()
    
    try:
        job.meta['progress'] = 10
        job.meta['message'] = 'Creating C2PA manifest...'
        job.save_meta()
        
        # TODO: Implement actual C2PA signing with certificates
        # This would use c2pa-python's Builder and Signer
        
        print(f"🔏 C2PA manifest processing for video {video_id}")
        print("   ⚠️ Certificate signing not yet implemented")
        
        job.meta['progress'] = 100
        job.meta['message'] = 'Manifest created (sidecar only)'
        job.save_meta()
        
        return {
            'video_id': video_id,
            'status': 'success',
            'note': 'Sidecar manifest only - certificate signing pending'
        }
        
    except Exception as e:
        print(f"   ❌ C2PA processing failed: {e}")
        raise


def cleanup_expired_videos():
    """
    Background task: Clean up expired videos
    Run this periodically (e.g., hourly)
    """
    asyncio.run(async_cleanup_expired())


async def async_cleanup_expired():
    """Async cleanup of expired videos"""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        now = datetime.now(timezone.utc)
        
        # Find expired videos
        expired_videos = await db.videos.find({
            "storage.expires_at": {"$lte": now}
        }).to_list(None)
        
        print(f"🗑️ Found {len(expired_videos)} expired videos")
        
        for video in expired_videos:
            video_id = video['id']
            
            # Delete video file
            video_path = f"/app/backend/uploads/videos/{video_id}.mp4"
            if os.path.exists(video_path):
                os.remove(video_path)
                print(f"   🗑️ Deleted video file: {video_id}")
            
            # Delete from database
            await db.videos.delete_one({"id": video_id})
            print(f"   🗑️ Deleted from database: {video_id}")
        
        print(f"✅ Cleanup complete: {len(expired_videos)} videos removed")
        
    finally:
        client.close()
