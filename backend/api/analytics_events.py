from fastapi import APIRouter, Depends, Request, HTTPException
from datetime import datetime, timezone, timedelta
from typing import Optional
from database.mongodb import get_db
from models.analytics_event import EventCreate, AnalyticsStats
from utils.security import get_current_user_optional
import uuid

router = APIRouter()

@router.post("/track")
async def track_event(
    event: EventCreate,
    request: Request,
    db = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Track an analytics event (public endpoint, no auth required)
    """
    try:
        # Create event document
        event_doc = {
            "_id": str(uuid.uuid4()),
            "event_type": event.event_type,
            "user_id": current_user.get("user_id") if current_user else None,
            "target_user_id": event.target_user_id,
            "target_username": event.target_username,
            "video_id": event.video_id,
            "metadata": event.metadata or {},
            "ip_address": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        # Insert into analytics_events collection
        await db.analytics_events.insert_one(event_doc)
        
        return {"success": True, "event_id": event_doc["_id"]}
    except Exception as e:
        print(f"Error tracking event: {e}")
        # Don't fail the request if analytics fails
        return {"success": False, "error": str(e)}

@router.get("/user/{username}")
async def get_user_analytics(
    username: str,
    days: int = 30,
    db = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Get analytics for a specific user/creator
    """
    try:
        # Calculate date range
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        # Find user
        user = await db.users.find_one({"username": username}, {"_id": 1})
        if not user:
            raise HTTPException(404, "User not found")
        
        user_id = user["_id"]
        
        # Query events for this user
        query = {
            "target_user_id": user_id,
            "timestamp": {"$gte": start_date.isoformat()}
        }
        
        # Count showcase views
        showcase_views = await db.analytics_events.count_documents({
            **query,
            "event_type": "showcase_view"
        })
        
        # Count video views
        video_views = await db.analytics_events.count_documents({
            **query,
            "event_type": "video_view"
        })
        
        # Count social clicks
        social_clicks = await db.analytics_events.count_documents({
            **query,
            "event_type": "social_click"
        })
        
        # Count downloads
        downloads = await db.analytics_events.count_documents({
            **query,
            "event_type": "video_download"
        })
        
        # Get unique visitors (by IP address)
        unique_ips = await db.analytics_events.distinct("ip_address", query)
        unique_visitors = len([ip for ip in unique_ips if ip])
        
        # Get top videos
        video_view_pipeline = [
            {"$match": {
                "target_user_id": user_id,
                "event_type": "video_view",
                "video_id": {"$ne": None},
                "timestamp": {"$gte": start_date.isoformat()}
            }},
            {"$group": {
                "_id": "$video_id",
                "views": {"$sum": 1}
            }},
            {"$sort": {"views": -1}},
            {"$limit": 10}
        ]
        
        top_videos_cursor = db.analytics_events.aggregate(video_view_pipeline)
        top_videos_raw = await top_videos_cursor.to_list(length=10)
        
        # Enrich with video details
        top_videos = []
        for item in top_videos_raw:
            video = await db.videos.find_one(
                {"$or": [{"id": item["_id"]}, {"_id": item["_id"]}]},
                {"_id": 0, "title": 1, "verification_code": 1, "thumbnail_url": 1}
            )
            if video:
                top_videos.append({
                    "video_id": item["_id"],
                    "views": item["views"],
                    "title": video.get("title", "Untitled"),
                    "verification_code": video.get("verification_code", "N/A")
                })
        
        # Get social platform breakdown
        social_pipeline = [
            {"$match": {
                "target_user_id": user_id,
                "event_type": "social_click",
                "timestamp": {"$gte": start_date.isoformat()}
            }},
            {"$group": {
                "_id": "$metadata.platform",
                "clicks": {"$sum": 1}
            }}
        ]
        
        social_cursor = db.analytics_events.aggregate(social_pipeline)
        social_breakdown_raw = await social_cursor.to_list(length=20)
        
        platform_breakdown = {
            item["_id"] or "unknown": item["clicks"] 
            for item in social_breakdown_raw
        }
        
        return {
            "username": username,
            "period_days": days,
            "total_showcase_views": showcase_views,
            "total_video_views": video_views,
            "total_social_clicks": social_clicks,
            "total_downloads": downloads,
            "unique_visitors": unique_visitors,
            "top_videos": top_videos,
            "platform_breakdown": platform_breakdown
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting user analytics: {e}")
        raise HTTPException(500, f"Failed to retrieve analytics: {str(e)}")

@router.get("/platform")
async def get_platform_analytics(
    days: int = 30,
    db = Depends(get_db)
):
    """
    Get platform-wide analytics (public endpoint)
    """
    try:
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        query = {"timestamp": {"$gte": start_date.isoformat()}}
        
        # Count all event types
        showcase_views = await db.analytics_events.count_documents({
            **query,
            "event_type": "showcase_view"
        })
        
        video_views = await db.analytics_events.count_documents({
            **query,
            "event_type": "video_view"
        })
        
        social_clicks = await db.analytics_events.count_documents({
            **query,
            "event_type": "social_click"
        })
        
        downloads = await db.analytics_events.count_documents({
            **query,
            "event_type": "video_download"
        })
        
        # Unique visitors
        unique_ips = await db.analytics_events.distinct("ip_address", query)
        unique_visitors = len([ip for ip in unique_ips if ip])
        
        return {
            "period_days": days,
            "total_showcase_views": showcase_views,
            "total_video_views": video_views,
            "total_social_clicks": social_clicks,
            "total_downloads": downloads,
            "unique_visitors": unique_visitors
        }
    except Exception as e:
        print(f"Error getting platform analytics: {e}")
        raise HTTPException(500, "Failed to retrieve platform analytics")
