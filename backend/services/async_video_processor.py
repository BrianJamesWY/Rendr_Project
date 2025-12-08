"""
Asynchronous Video Processing Service
Handles time-consuming video operations in background
Returns watermarked video immediately to user
"""

import asyncio
from typing import Dict, Callable
import threading
from datetime import datetime, timezone
from database.mongodb import get_db
from services.comprehensive_hash_service import comprehensive_hash_service

class AsyncVideoProcessor:
    """
    Manages async video processing pipeline
    Allows returning watermarked video immediately while hashing continues
    """
    
    def __init__(self):
        self.processing_queue = []
        self.status_cache = {}  # {video_id: status}
    
    def queue_video_processing(
        self,
        video_id: str,
        video_path: str,
        verification_code: str,
        tier: str,
        user_id: str,
        callback: Callable = None
    ):
        """
        Queue video for comprehensive hashing in background
        
        Args:
            video_id: Video ID
            video_path: Path to watermarked video
            verification_code: Generated code
            tier: User tier
            user_id: User ID
            callback: Optional callback when complete
        """
        # Set provisional status
        self.status_cache[video_id] = {
            "status": "processing",
            "progress": 0,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "estimated_completion": None
        }
        
        # Start processing in background thread
        thread = threading.Thread(
            target=self._process_video_hashes,
            args=(video_id, video_path, verification_code, tier, user_id, callback)
        )
        thread.daemon = True
        thread.start()
        
        print(f"🚀 Queued {video_id} for async processing")
    
    def _process_video_hashes(
        self,
        video_id: str,
        video_path: str,
        verification_code: str,
        tier: str,
        user_id: str,
        callback: Callable = None
    ):
        """
        Background thread worker - calculates all hashes
        """
        try:
            print(f"\n⚙️ Background processing started for {video_id}")
            
            # Update status
            self.status_cache[video_id]["progress"] = 10
            self.status_cache[video_id]["current_step"] = "Extracting metadata"
            
            # Calculate comprehensive hashes
            hash_package = comprehensive_hash_service.calculate_all_hashes(
                video_path,
                verification_code,
                tier
            )
            
            self.status_cache[video_id]["progress"] = 80
            self.status_cache[video_id]["current_step"] = "Saving to database"
            
            # Save to database
            asyncio.run(self._save_hashes_to_db(video_id, hash_package, user_id))
            
            # Mark complete
            self.status_cache[video_id] = {
                "status": "complete",
                "progress": 100,
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "hash_package": hash_package
            }
            
            print(f"✅ Background processing complete for {video_id}")
            
            # Call callback if provided
            if callback:
                callback(video_id, hash_package)
                
        except Exception as e:
            print(f"❌ Background processing error for {video_id}: {e}")
            self.status_cache[video_id] = {
                "status": "error",
                "progress": 0,
                "error": str(e),
                "failed_at": datetime.now(timezone.utc).isoformat()
            }
    
    async def _save_hashes_to_db(self, video_id: str, hash_package: Dict, user_id: str):
        """Save comprehensive hashes to database"""
        try:
            db = get_db()
            
            # Update video document with comprehensive hashes
            await db.videos.update_one(
                {"id": video_id},
                {
                    "$set": {
                        "comprehensive_hashes": hash_package,
                        "verification_status": "verified",
                        "processed_at": datetime.now(timezone.utc)
                    }
                }
            )
            
            print(f"💾 Saved comprehensive hashes for {video_id}")
            
        except Exception as e:
            print(f"❌ Database save error: {e}")
    
    def get_processing_status(self, video_id: str) -> Dict:
        """Get current processing status for a video"""
        return self.status_cache.get(video_id, {
            "status": "unknown",
            "progress": 0
        })
    
    def is_processing(self, video_id: str) -> bool:
        """Check if video is currently being processed"""
        status = self.status_cache.get(video_id, {})
        return status.get("status") == "processing"


# Global instance
async_video_processor = AsyncVideoProcessor()
