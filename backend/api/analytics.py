from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from database.mongodb import get_db

from api.auth import get_current_user
from datetime import timezone

router = APIRouter()

@router.get("/public")
async def get_public_analytics(db = Depends(get_db)):
    """Get public analytics for investors (no auth required)"""
    
    # Get current date info
    now = datetime.now()
    start_of_month = datetime(now.year, now.month, 1)
    
    # Count users
    total_users = await db.users.count_documents({})
    free_users = await db.users.count_documents({'premium_tier': 'free'})
    pro_users = await db.users.count_documents({'premium_tier': 'pro'})
    enterprise_users = await db.users.count_documents({'premium_tier': 'enterprise'})
    interested_parties = await db.users.count_documents({'interested_party': True})
    
    # Users this month
    users_this_month = await db.users.count_documents({
        'created_at': {'$gte': start_of_month.isoformat()}
    })
    
    # Count videos
    total_videos = await db.videos.count_documents({})
    blockchain_verified = await db.videos.count_documents({'blockchain_signature': {'$exists': True}})
    bodycam_videos = await db.videos.count_documents({'source': 'bodycam'})
    studio_videos = await db.videos.count_documents({'source': 'studio'})
    
    # Videos this month
    videos_this_month = await db.videos.count_documents({
        'uploaded_at': {'$gte': start_of_month.isoformat()}
    })
    
    # Count verifications
    total_verifications = await db.verification_attempts.count_documents({})
    verifications_this_month = await db.verification_attempts.count_documents({
        'timestamp': {'$gte': start_of_month.isoformat()}
    })
    
    # Calculate engagement
    avg_videos_per_user = total_videos / total_users if total_users > 0 else 0
    
    # Active creators (uploaded this month)
    active_creators = len(set([
        v['user_id'] for v in await db.videos.find({
            'uploaded_at': {'$gte': start_of_month.isoformat()}
        }).to_list(length=10000)
    ]))
    
    return {
        'users': {
            'total': total_users,
            'free': free_users,
            'pro': pro_users,
            'enterprise': enterprise_users,
            'interested_parties': interested_parties
        },
        'videos': {
            'total': total_videos,
            'blockchain_verified': blockchain_verified,
            'bodycam': bodycam_videos,
            'studio': studio_videos
        },
        'verifications': {
            'total': total_verifications
        },
        'growth': {
            'users_this_month': users_this_month,
            'videos_this_month': videos_this_month,
            'verifications_this_month': verifications_this_month
        },
        'engagement': {
            'avg_videos_per_user': round(avg_videos_per_user, 2),
            'active_creators': active_creators
        }
    }

@router.post("/track/page-view")
async def track_page_view(
    username: str,
    referrer: str = None,
    db = Depends(get_db)
):
    """Track showcase page view"""
    view_doc = {
        "username": username,
        "viewed_at": datetime.now(timezone.utc).isoformat(),
        "referrer": referrer,
        "type": "page_view"
    }
    await db.analytics_events.insert_one(view_doc)
    return {"status": "tracked"}

@router.post("/track/video-view")
async def track_video_view(
    video_id: str,
    username: str,
    referrer: str = None,
    db = Depends(get_db)
):
    """Track individual video view"""
    view_doc = {
        "video_id": video_id,
        "username": username,
        "viewed_at": datetime.now(timezone.utc).isoformat(),
        "referrer": referrer,
        "type": "video_view"
    }
    await db.analytics_events.insert_one(view_doc)
    return {"status": "tracked"}

@router.post("/track/social-click")
async def track_social_click(
    username: str,
    platform: str,
    referrer: str = None,
    db = Depends(get_db)
):
    """Track social media link click"""
    click_doc = {
        "username": username,
        "platform": platform,
        "clicked_at": datetime.now(timezone.utc).isoformat(),
        "referrer": referrer,
        "type": "social_click"
    }
    await db.analytics_events.insert_one(click_doc)
    return {"status": "tracked"}

@router.get("/dashboard")
async def get_dashboard_analytics(
    days: int = 30,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get analytics summary for creator dashboard"""
    username = current_user.get("username")
    
    # Calculate date range
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Count total page views
    page_views = await db.analytics_events.count_documents({
        "username": username,
        "type": "page_view",
        "viewed_at": {"$gte": start_date.isoformat()}
    })
    
    # Count total video views
    video_views = await db.analytics_events.count_documents({
        "username": username,
        "type": "video_view",
        "viewed_at": {"$gte": start_date.isoformat()}
    })
    
    # Count total social clicks
    social_clicks = await db.analytics_events.count_documents({
        "username": username,
        "type": "social_click",
        "clicked_at": {"$gte": start_date.isoformat()}
    })
    
    # Get top videos by views
    pipeline = [
        {
            "$match": {
                "username": username,
                "type": "video_view",
                "viewed_at": {"$gte": start_date.isoformat()}
            }
        },
        {
            "$group": {
                "_id": "$video_id",
                "view_count": {"$sum": 1}
            }
        },
        {
            "$sort": {"view_count": -1}
        },
        {
            "$limit": 5
        }
    ]
    
    top_videos_cursor = db.analytics_events.aggregate(pipeline)
    top_videos_raw = await top_videos_cursor.to_list(length=5)
    
    # Enrich with video details
    top_videos = []
    for item in top_videos_raw:
        video = await db.videos.find_one({"_id": item["_id"]}, {"_id": 0, "verification_code": 1, "thumbnail_path": 1})
        if video:
            top_videos.append({
                "video_id": item["_id"],
                "verification_code": video.get("verification_code"),
                "thumbnail_path": video.get("thumbnail_path"),
                "view_count": item["view_count"]
            })
    
    # Get social click breakdown
    social_pipeline = [
        {
            "$match": {
                "username": username,
                "type": "social_click",
                "clicked_at": {"$gte": start_date.isoformat()}
            }
        },
        {
            "$group": {
                "_id": "$platform",
                "click_count": {"$sum": 1}
            }
        },
        {
            "$sort": {"click_count": -1}
        }
    ]
    
    social_cursor = db.analytics_events.aggregate(social_pipeline)
    social_breakdown = await social_cursor.to_list(length=20)
    
    social_click_breakdown = [
        {
            "platform": item["_id"],
            "click_count": item["click_count"]
        }
        for item in social_breakdown
    ]
    
    # Get recent activity (last 10 events)
    recent_cursor = db.analytics_events.find(
        {"username": username},
        {"_id": 0}
    ).sort("viewed_at", -1).limit(10)
    
    recent_activity = await recent_cursor.to_list(length=10)
    
    return {
        "total_page_views": page_views,
        "total_video_views": video_views,
        "total_social_clicks": social_clicks,
        "top_videos": top_videos,
        "social_click_breakdown": social_click_breakdown,
        "recent_activity": recent_activity,
        "date_range_days": days
    }

    }
