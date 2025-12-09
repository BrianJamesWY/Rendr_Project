"""
Admin Analytics API
Secure analytics endpoints with role-based access control
"""

from fastapi import APIRouter, Depends, HTTPException
from database.mongodb import get_db
from utils.security import get_current_user
from datetime import datetime, timedelta, timezone
from typing import Optional

router = APIRouter()


async def get_user_roles(current_user, db):
    """Get user roles from database"""
    user_id = current_user.get("user_id")
    user = await db.users.find_one({"_id": user_id}, {"roles": 1})
    if not user:
        # Try finding by user_id field as well
        user = await db.users.find_one({"user_id": user_id}, {"roles": 1})
    return user.get("roles", []) if user else []


async def verify_investor(current_user, db):
    """Verify user has investor role"""
    roles = await get_user_roles(current_user, db)
    if "investor" not in roles and "ceo" not in roles and "admin" not in roles:
        raise HTTPException(403, "Access denied: Investor access required")
    return current_user


async def verify_ceo(current_user, db):
    """Verify user has CEO role"""
    roles = await get_user_roles(current_user, db)
    if "ceo" not in roles and "admin" not in roles:
        raise HTTPException(403, "Access denied: CEO access required")
    return current_user


@router.get("/investor/dashboard")
async def get_investor_dashboard(
    days: int = 30,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Investor Dashboard - Platform metrics and growth
    Requires: investor, ceo, or admin role
    """
    await verify_investor(current_user, db)
    
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Total users
    total_users = await db.users.count_documents({})
    new_users = await db.users.count_documents({
        "created_at": {"$gte": start_date}
    })
    
    # Total videos
    total_videos = await db.videos.count_documents({})
    new_videos = await db.videos.count_documents({
        "uploaded_at": {"$gte": start_date}
    })
    
    # Verification stats
    total_verifications = await db.verification_attempts.count_documents({})
    recent_verifications = await db.verification_attempts.count_documents({
        "timestamp": {"$gte": start_date.isoformat()}
    })
    
    # User tier distribution
    tier_pipeline = [
        {"$group": {
            "_id": "$tier",
            "count": {"$sum": 1}
        }}
    ]
    tier_distribution = {}
    async for doc in db.users.aggregate(tier_pipeline):
        tier_distribution[doc["_id"] or "free"] = doc["count"]
    
    # Daily upload trends (last 7 days)
    daily_uploads = []
    for i in range(7):
        day_start = datetime.now(timezone.utc) - timedelta(days=i+1)
        day_end = datetime.now(timezone.utc) - timedelta(days=i)
        
        count = await db.videos.count_documents({
            "uploaded_at": {
                "$gte": day_start,
                "$lt": day_end
            }
        })
        
        daily_uploads.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "uploads": count
        })
    
    daily_uploads.reverse()
    
    # Duplicate detection stats
    duplicate_attempts = await db.duplicate_attempts.count_documents({})
    
    return {
        "period_days": days,
        "users": {
            "total": total_users,
            "new": new_users,
            "growth_rate": round((new_users / total_users * 100) if total_users > 0 else 0, 2)
        },
        "videos": {
            "total": total_videos,
            "new": new_videos,
            "growth_rate": round((new_videos / total_videos * 100) if total_videos > 0 else 0, 2)
        },
        "verifications": {
            "total": total_verifications,
            "recent": recent_verifications
        },
        "tier_distribution": tier_distribution,
        "daily_upload_trend": daily_uploads,
        "security": {
            "duplicate_attempts": duplicate_attempts,
            "blocked_attempts_percentage": round((duplicate_attempts / total_videos * 100) if total_videos > 0 else 0, 2)
        }
    }


@router.get("/ceo/dashboard")
async def get_ceo_dashboard(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    CEO Dashboard - Comprehensive system stats
    Requires: CEO role only
    """
    await verify_ceo(current_user, db)
    
    # Get all data from investor dashboard
    investor_data = await get_investor_dashboard(30, current_user, db)
    
    # Additional CEO-only metrics
    
    # Strike and ban statistics
    users_with_strikes = await db.resubmission_tracking.count_documents({
        "total_strikes": {"$gt": 0}
    })
    
    temp_banned_users = await db.resubmission_tracking.count_documents({
        "ban_status": "temporary"
    })
    
    perm_banned_users = await db.resubmission_tracking.count_documents({
        "ban_status": "permanent"
    })
    
    # System health
    # Get storage usage
    videos_with_storage = await db.videos.find(
        {"storage": {"$exists": True}},
        {"storage": 1}
    ).to_list(None)
    
    expired_videos = sum(1 for v in videos_with_storage 
                        if v.get('storage', {}).get('expires_at') and 
                        datetime.fromisoformat(v['storage']['expires_at'].replace('Z', '+00:00')) < datetime.now(timezone.utc))
    
    # C2PA adoption
    c2pa_videos = await db.videos.count_documents({
        "c2pa_manifest.manifest_path": {"$exists": True, "$ne": None}
    })
    
    # Blockchain verified videos
    blockchain_videos = await db.videos.count_documents({
        "blockchain_signature": {"$exists": True, "$ne": None}
    })
    
    # Top users by video count
    top_users_pipeline = [
        {"$group": {
            "_id": "$user_id",
            "video_count": {"$sum": 1}
        }},
        {"$sort": {"video_count": -1}},
        {"$limit": 10}
    ]
    
    top_users = []
    async for doc in db.videos.aggregate(top_users_pipeline):
        user = await db.users.find_one({"user_id": doc["_id"]}, {"_id": 0, "username": 1, "tier": 1})
        if user:
            top_users.append({
                "username": user.get("username", "Unknown"),
                "tier": user.get("tier", "free"),
                "video_count": doc["video_count"]
            })
    
    return {
        **investor_data,
        "ceo_metrics": {
            "moderation": {
                "users_with_strikes": users_with_strikes,
                "temp_banned": temp_banned_users,
                "perm_banned": perm_banned_users
            },
            "system_health": {
                "expired_videos": expired_videos,
                "c2pa_adoption": {
                    "total": c2pa_videos,
                    "percentage": round((c2pa_videos / investor_data['videos']['total'] * 100) if investor_data['videos']['total'] > 0 else 0, 2)
                },
                "blockchain_adoption": {
                    "total": blockchain_videos,
                    "percentage": round((blockchain_videos / investor_data['videos']['total'] * 100) if investor_data['videos']['total'] > 0 else 0, 2)
                }
            },
            "top_creators": top_users
        }
    }


@router.get("/admin/user-strikes/{user_id}")
async def get_user_strikes(
    user_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get detailed strike information for a user (Admin/CEO only)"""
    await verify_ceo(current_user, db)
    
    from services.resubmission_prevention import resubmission_prevention
    return await resubmission_prevention.get_user_violation_history(user_id, db)
