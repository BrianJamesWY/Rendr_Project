#!/usr/bin/env python3
"""
Automated Video Storage Cleanup Script

This script runs periodically to:
1. Find videos that have expired
2. Send warning notifications before deletion
3. Delete expired videos and their associated files
4. Clean up orphaned files

Schedule this script to run via cron:
    */30 * * * * /usr/bin/python3 /app/backend/scripts/cleanup_expired_videos.py
    (Runs every 30 minutes)
"""

import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Add backend to path for imports
sys.path.insert(0, '/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from services.notification_service import notification_service
import asyncio


class VideoCleanupService:
    def __init__(self):
        self.mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        self.db_name = "rendr"
        self.warning_hours = 2  # Warn 2 hours before deletion
        
    async def connect_db(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        print(f"✅ Connected to MongoDB: {self.db_name}")
        
    async def close_db(self):
        """Close MongoDB connection"""
        self.client.close()
        print("👋 MongoDB connection closed")
        
    async def find_videos_to_warn(self):
        """
        Find videos that will expire soon and haven't been warned yet
        """
        now = datetime.now(timezone.utc)
        warning_threshold = now + timedelta(hours=self.warning_hours)
        
        videos_to_warn = await self.db.videos.find({
            "storage.expires_at": {
                "$gt": now,
                "$lte": warning_threshold
            },
            "storage.warned_at": None
        }, {"_id": 0}).to_list(length=1000)
        
        return videos_to_warn
        
    async def find_expired_videos(self):
        """
        Find videos that have expired and should be deleted
        """
        now = datetime.now(timezone.utc)
        
        expired_videos = await self.db.videos.find({
            "storage.expires_at": {
                "$lt": now
            }
        }, {"_id": 0}).to_list(length=1000)
        
        return expired_videos
        
    async def send_warning_notification(self, video, user):
        """
        Send warning notification to user about upcoming video expiration
        """
        try:
            time_remaining = video['storage']['expires_at'] - datetime.now(timezone.utc)
            hours_remaining = int(time_remaining.total_seconds() / 3600)
            
            print(f"📧 Sending expiration warning for video {video['id']}")
            print(f"   User: {user.get('email')}")
            print(f"   Code: {video['verification_code']}")
            print(f"   Expires in: {hours_remaining} hours")
            
            # Send notification
            download_url = f"https://premium-content-46.preview.emergentagent.com/dashboard?video={video['id']}"
            await notification_service.send_expiration_warning(
                user=user,
                verification_code=video['verification_code'],
                hours_remaining=hours_remaining,
                download_url=download_url
            )
            
            # Mark as warned
            await self.db.videos.update_one(
                {"id": video['id']},
                {"$set": {"storage.warned_at": datetime.now(timezone.utc)}}
            )
            
            print("   ✅ Warning sent and recorded")
            return True
            
        except Exception as e:
            print(f"   ❌ Failed to send warning: {e}")
            return False
            
    async def delete_video(self, video):
        """
        Delete video and all associated files
        """
        try:
            video_id = video['id']
            print(f"🗑️ Deleting expired video: {video_id}")
            print(f"   Code: {video['verification_code']}")
            print(f"   Expired at: {video['storage']['expires_at']}")
            
            # Delete video file
            video_path = f"/app/backend/uploads/videos/{video_id}.mp4"
            if os.path.exists(video_path):
                os.remove(video_path)
                print("   ✅ Video file deleted")
            else:
                print(f"   ⚠️ Video file not found: {video_path}")
                
            # Delete thumbnail
            thumbnail_path = f"/app/backend/uploads/thumbnails/{video_id}.jpg"
            if os.path.exists(thumbnail_path):
                os.remove(thumbnail_path)
                print("   ✅ Thumbnail deleted")
                
            # Delete from database
            result = await self.db.videos.delete_one({"id": video_id})
            if result.deleted_count > 0:
                print("   ✅ Database record deleted")
            else:
                print("   ⚠️ Database record not found")
                
            return True
            
        except Exception as e:
            print(f"   ❌ Failed to delete video: {e}")
            return False
            
    async def cleanup_orphaned_files(self):
        """
        Find and delete orphaned video/thumbnail files that don't have database records
        """
        try:
            print("\n🧹 Checking for orphaned files...")
            
            # Get all video IDs from database
            video_ids = set()
            async for video in self.db.videos.find({}, {"id": 1, "_id": 0}):
                video_ids.add(video['id'])
                
            orphaned_count = 0
            
            # Check video files
            video_dir = Path("/app/backend/uploads/videos")
            if video_dir.exists():
                for video_file in video_dir.glob("*.mp4"):
                    file_id = video_file.stem  # Get filename without extension
                    if file_id not in video_ids:
                        print(f"   🗑️ Deleting orphaned video: {video_file.name}")
                        video_file.unlink()
                        orphaned_count += 1
                        
            # Check thumbnail files
            thumbnail_dir = Path("/app/backend/uploads/thumbnails")
            if thumbnail_dir.exists():
                for thumb_file in thumbnail_dir.glob("*.jpg"):
                    file_id = thumb_file.stem
                    if file_id not in video_ids:
                        print(f"   🗑️ Deleting orphaned thumbnail: {thumb_file.name}")
                        thumb_file.unlink()
                        orphaned_count += 1
                        
            if orphaned_count > 0:
                print(f"   ✅ Deleted {orphaned_count} orphaned files")
            else:
                print("   ✅ No orphaned files found")
                
            return orphaned_count
            
        except Exception as e:
            print(f"   ❌ Failed to cleanup orphaned files: {e}")
            return 0
            
    async def run_cleanup(self):
        """
        Main cleanup routine
        """
        print(f"\n{'='*60}")
        print(f"🧹 VIDEO STORAGE CLEANUP - {datetime.now(timezone.utc).isoformat()}")
        print(f"{'='*60}\n")
        
        await self.connect_db()
        
        try:
            # Step 1: Send warnings for videos expiring soon
            print("📧 Step 1: Checking for videos to warn...")
            videos_to_warn = await self.find_videos_to_warn()
            
            if videos_to_warn:
                print(f"   Found {len(videos_to_warn)} videos to warn")
                warned_count = 0
                
                for video in videos_to_warn:
                    # Get user info
                    user = await self.db.users.find_one(
                        {"_id": video['user_id']},
                        {"_id": 0}
                    )
                    
                    if user:
                        if await self.send_warning_notification(video, user):
                            warned_count += 1
                            
                print(f"   ✅ Sent {warned_count} warnings")
            else:
                print("   ✅ No videos need warnings")
                
            # Step 2: Delete expired videos
            print("\n🗑️ Step 2: Checking for expired videos...")
            expired_videos = await self.find_expired_videos()
            
            if expired_videos:
                print(f"   Found {len(expired_videos)} expired videos")
                deleted_count = 0
                
                for video in expired_videos:
                    if await self.delete_video(video):
                        deleted_count += 1
                        
                print(f"   ✅ Deleted {deleted_count} expired videos")
            else:
                print("   ✅ No expired videos to delete")
                
            # Step 3: Cleanup orphaned files
            print("\n🧹 Step 3: Cleaning up orphaned files...")
            orphaned_count = await self.cleanup_orphaned_files()
            
            # Summary
            print(f"\n{'='*60}")
            print("✅ CLEANUP COMPLETE")
            print(f"{'='*60}")
            print(f"   Warnings sent: {len(videos_to_warn) if videos_to_warn else 0}")
            print(f"   Videos deleted: {len(expired_videos) if expired_videos else 0}")
            print(f"   Orphaned files: {orphaned_count}")
            print(f"{'='*60}\n")
            
        except Exception as e:
            print(f"\n❌ Cleanup failed: {e}")
            import traceback
            traceback.print_exc()
            
        finally:
            await self.close_db()


async def main():
    """Main entry point"""
    cleanup_service = VideoCleanupService()
    await cleanup_service.run_cleanup()


if __name__ == "__main__":
    asyncio.run(main())
