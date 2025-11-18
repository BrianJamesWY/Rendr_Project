from fastapi import APIRouter, Depends, HTTPException
from utils.security import get_current_user
from database.mongodb import get_db

router = APIRouter()

@router.get("/list")
async def get_notifications(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get user's notifications"""
    notifications = await db.notifications.find({
        "user_email": current_user.get('email')
    }).sort("created_at", -1).to_list(length=50)
    
    # Count unread
    unread_count = await db.notifications.count_documents({
        "user_email": current_user.get('email'),
        "read": False
    })
    
    return {
        "notifications": notifications,
        "unread_count": unread_count,
        "total": len(notifications)
    }

@router.post("/{notification_id}/mark-read")
async def mark_notification_read(
    notification_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Mark notification as read"""
    notification = await db.notifications.find_one({"_id": notification_id})
    
    if not notification:
        raise HTTPException(404, "Notification not found")
    
    if notification['user_email'] != current_user.get('email'):
        raise HTTPException(403, "Access denied")
    
    await db.notifications.update_one(
        {"_id": notification_id},
        {"$set": {"read": True}}
    )
    
    return {"success": True}

@router.get("/security-logs")
async def get_security_logs(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get security logs for user's videos"""
    # Get user's videos
    user_videos = await db.videos.find({"user_id": current_user['user_id']}).to_list(length=None)
    video_ids = [v['_id'] for v in user_videos]
    
    # Get security events related to these videos
    logs = await db.security_logs.find({
        "$or": [
            {"user_id": current_user['user_id']},
            {"metadata.original_video_id": {"$in": video_ids}}
        ]
    }).sort("timestamp", -1).to_list(length=100)
    
    return {
        "security_logs": logs,
        "total": len(logs)
    }
