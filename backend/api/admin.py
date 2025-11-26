from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
import uuid

from utils.security import get_current_user
from database.mongodb import get_db
from models.user import UserResponse

router = APIRouter()

# CEO user IDs (hardcoded for security)
CEO_USER_IDS = [
    "b9f7ba33-0672-4132-828d-4f2b01e68c75"  # BrianJames
]

def verify_ceo(current_user):
    """Verify user is CEO"""
    if current_user['user_id'] not in CEO_USER_IDS:
        raise HTTPException(403, "Access denied. CEO only.")
    return True

@router.get("/users")
async def get_all_users(
    search: Optional[str] = None,
    tier: Optional[str] = None,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get all users (CEO only)"""
    verify_ceo(current_user)
    
    # Build query
    query = {}
    if search:
        query['$or'] = [
            {'username': {'$regex': search, '$options': 'i'}},
            {'email': {'$regex': search, '$options': 'i'}},
            {'display_name': {'$regex': search, '$options': 'i'}}
        ]
    if tier:
        query['premium_tier'] = tier
    
    # Get users
    cursor = db.users.find(query).sort('created_at', -1)
    users = await cursor.to_list(length=1000)
    
    # Get video counts for each user (both public and private)
    result = []
    for user in users:
        user_id = user['_id']  # MongoDB uses _id as the user identifier
        
        # Get total video count
        total_videos = await db.videos.count_documents({'user_id': user_id})
        
        # Get public vs private breakdown
        public_videos = await db.videos.count_documents({
            'user_id': user_id,
            'visibility': 'public'
        })
        private_videos = total_videos - public_videos
        
        # Get premium folder count
        premium_folder_count = await db.premium_folders.count_documents({
            'creator_id': user_id
        })
        
        result.append({
            'user_id': user_id,
            'username': user.get('username', ''),
            'email': user['email'],
            'display_name': user.get('display_name', ''),
            'premium_tier': user.get('premium_tier', 'free'),
            'created_at': user['created_at'],
            'total_videos': total_videos,
            'public_videos': public_videos,
            'private_videos': private_videos,
            'premium_folder_count': premium_folder_count
        })
    
    return result

@router.put("/users/{user_id}/tier")
async def update_user_tier(
    user_id: str,
    tier: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update user's premium tier (CEO only)"""
    verify_ceo(current_user)
    
    if tier not in ['free', 'pro', 'enterprise']:
        raise HTTPException(400, "Invalid tier. Must be 'free', 'pro', or 'enterprise'")
    
    user = await db.users.find_one({'_id': user_id})
    if not user:
        raise HTTPException(404, "User not found")
    
    await db.users.update_one(
        {'_id': user_id},
        {'$set': {
            'premium_tier': tier,
            'updated_at': datetime.now().isoformat()
        }}
    )
    
    # Log the action
    await db.admin_logs.insert_one({
        '_id': str(uuid.uuid4()),
        'admin_id': current_user['user_id'],
        'action': 'update_tier',
        'target_user_id': user_id,
        'target_username': user.get('username'),
        'old_tier': user.get('premium_tier', 'free'),
        'new_tier': tier,
        'timestamp': datetime.now().isoformat()
    })
    
    return {'message': f"User upgraded to {tier}"}

@router.post("/impersonate/{user_id}")
async def impersonate_user(
    user_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Generate impersonation token (CEO only)"""
    verify_ceo(current_user)
    
    user = await db.users.find_one({'_id': user_id})
    if not user:
        raise HTTPException(404, "User not found")
    
    # Log impersonation
    await db.admin_logs.insert_one({
        '_id': str(uuid.uuid4()),
        'admin_id': current_user['user_id'],
        'action': 'impersonate',
        'target_user_id': user_id,
        'target_username': user.get('username'),
        'timestamp': datetime.now().isoformat()
    })
    
    from utils.security import create_access_token
    
    # Create token for target user
    token = create_access_token({
        'user_id': user['_id'],
        'email': user['email'],
        'username': user.get('username'),
        'impersonated_by': current_user['user_id']  # Track who is impersonating
    })
    
    return {
        'token': token,
        'user': {
            'user_id': user['_id'],
            'username': user.get('username'),
            'email': user['email'],
            'display_name': user.get('display_name')
        }
    }

@router.get("/stats")
async def get_platform_stats(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get platform-wide statistics (CEO only)"""
    verify_ceo(current_user)
    
    # Count users by tier
    total_users = await db.users.count_documents({})
    free_users = await db.users.count_documents({'premium_tier': 'free'})
    pro_users = await db.users.count_documents({'premium_tier': 'pro'})
    enterprise_users = await db.users.count_documents({'premium_tier': 'enterprise'})
    
    # Count videos
    total_videos = await db.videos.count_documents({})
    blockchain_verified = await db.videos.count_documents({'blockchain_signature': {'$exists': True}})
    
    # Get recent activity
    recent_videos = await db.videos.find().sort('uploaded_at', -1).limit(10).to_list(length=10)
    recent_users = await db.users.find().sort('created_at', -1).limit(10).to_list(length=10)
    
    return {
        'users': {
            'total': total_users,
            'free': free_users,
            'pro': pro_users,
            'enterprise': enterprise_users
        },
        'videos': {
            'total': total_videos,
            'blockchain_verified': blockchain_verified
        },
        'recent_activity': {
            'videos': [{
                'video_id': v['_id'],
                'username': v.get('username'),
                'verification_code': v['verification_code'],
                'uploaded_at': v['uploaded_at']
            } for v in recent_videos],
            'users': [{
                'user_id': u['_id'],
                'username': u.get('username'),
                'created_at': u['created_at']
            } for u in recent_users]
        }
    }

@router.get("/logs")
async def get_admin_logs(
    limit: int = 50,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get admin action logs (CEO only)"""
    verify_ceo(current_user)
    
    cursor = db.admin_logs.find().sort('timestamp', -1).limit(limit)
    logs = await cursor.to_list(length=limit)
    
    return logs

@router.put("/users/{user_id}/interested")
async def toggle_interested_party(
    user_id: str,
    interested: bool,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Toggle user as interested party (CEO only)"""
    verify_ceo(current_user)
    
    user = await db.users.find_one({'_id': user_id})
    if not user:
        raise HTTPException(404, "User not found")
    
    await db.users.update_one(
        {'_id': user_id},
        {'$set': {'interested_party': interested}}
    )
    
    # Log the action
    await db.admin_logs.insert_one({
        '_id': str(uuid.uuid4()),
        'admin_id': current_user['user_id'],
        'action': 'toggle_interested_party',
        'target_user_id': user_id,
        'target_username': user.get('username'),
        'interested': interested,
        'timestamp': datetime.now().isoformat()
    })
    
    return {'message': f"User {'added to' if interested else 'removed from'} interested parties"}

@router.post("/bulk-import")
async def bulk_import_users(
    emails: list[str],
    send_welcome: bool = True,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Bulk import users from RSVP list (CEO only)"""
    verify_ceo(current_user)
    
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    imported = 0
    skipped = 0
    errors = []
    
    for email in emails:
        email = email.strip().lower()
        if not email:
            continue
            
        # Check if exists
        existing = await db.users.find_one({'email': email})
        if existing:
            skipped += 1
            continue
        
        try:
            # Create user with temporary password
            user_id = str(uuid.uuid4())
            temp_password = f"Rendr{str(uuid.uuid4())[:8]}!"
            
            # Generate username from email
            username = email.split('@')[0].replace('.', '').replace('_', '')
            
            # Check username uniqueness
            counter = 1
            base_username = username
            while await db.users.find_one({'username': username}):
                username = f"{base_username}{counter}"
                counter += 1
            
            user_doc = {
                '_id': user_id,
                'email': email,
                'password_hash': pwd_context.hash(temp_password),
                'display_name': email.split('@')[0],
                'username': username,
                'premium_tier': 'free',
                'account_type': 'free',
                'interested_party': True,  # Mark as interested
                'imported_from_rsvp': True,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            await db.users.insert_one(user_doc)
            
            # Create default folder
            folder_id = str(uuid.uuid4())
            await db.folders.insert_one({
                '_id': folder_id,
                'folder_name': 'Default',
                'username': username,
                'user_id': user_id,
                'order': 1,
                'created_at': datetime.now().isoformat()
            })
            
            # TODO: Send welcome email with temp password
            # For now, just log it
            print(f"Created user: {email} with password: {temp_password}")
            
            imported += 1
            
        except Exception as e:
            errors.append(f"{email}: {str(e)}")
    
    # Log the action
    await db.admin_logs.insert_one({
        '_id': str(uuid.uuid4()),
        'admin_id': current_user['user_id'],
        'action': 'bulk_import',
        'imported_count': imported,
        'skipped_count': skipped,
        'timestamp': datetime.now().isoformat()
    })
    
    return {
        'imported': imported,
        'skipped': skipped,
        'errors': errors
    }

@router.get("/interested-parties")
async def get_interested_parties(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get all interested party users (CEO only)"""
    verify_ceo(current_user)
    
    cursor = db.users.find({'interested_party': True}).sort('created_at', -1)
    users = await cursor.to_list(length=10000)
    
    return [{
        'user_id': u['_id'],
        'username': u.get('username'),
        'email': u['email'],
        'display_name': u.get('display_name'),
        'created_at': u['created_at']
    } for u in users]


@router.get("/analytics")
async def get_platform_analytics(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get comprehensive platform analytics for investors/admins
    Accessible to CEO and Enterprise users
    """
    from datetime import timezone, timedelta
    
    # Get user info
    user = await db.users.find_one({"_id": current_user["user_id"]}, {"_id": 0})
    
    # Check if user has access (CEO or Enterprise tier)
    is_ceo = current_user['user_id'] in CEO_USER_IDS
    is_enterprise = user.get("premium_tier") == "enterprise"
    
    if not (is_ceo or is_enterprise):
        raise HTTPException(403, "Access denied. Enterprise tier or CEO access required.")
    
    # Calculate date ranges
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    seven_days_ago = now - timedelta(days=7)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # PLATFORM METRICS
    total_users = await db.users.count_documents({})
    total_videos = await db.videos.count_documents({})
    
    # Active users (uploaded in last 30 days)
    active_users_list = await db.videos.distinct("user_id", {
        "uploaded_at": {"$gte": thirty_days_ago}
    })
    active_users_30d = len(active_users_list)
    
    # USER METRICS
    users_by_tier = {
        "free": await db.users.count_documents({"$or": [{"premium_tier": "free"}, {"premium_tier": {"$exists": False}}]}),
        "pro": await db.users.count_documents({"premium_tier": "pro"}),
        "enterprise": await db.users.count_documents({"premium_tier": "enterprise"})
    }
    
    # Calculate growth rate (last 30 days vs previous 30 days)
    sixty_days_ago = now - timedelta(days=60)
    users_last_30d = await db.users.count_documents({
        "created_at": {"$gte": thirty_days_ago.isoformat()}
    })
    users_prev_30d = await db.users.count_documents({
        "created_at": {
            "$gte": sixty_days_ago.isoformat(),
            "$lt": thirty_days_ago.isoformat()
        }
    })
    growth_rate = ((users_last_30d - users_prev_30d) / users_prev_30d * 100) if users_prev_30d > 0 else 100
    
    # VIDEO METRICS
    videos_by_source = {
        "bodycam": await db.videos.count_documents({"source": "bodycam"}),
        "studio": await db.videos.count_documents({"source": "studio"})
    }
    
    blockchain_verified = await db.videos.count_documents({
        "blockchain_signature": {"$ne": None}
    })
    
    uploaded_today = await db.videos.count_documents({
        "uploaded_at": {"$gte": today_start}
    })
    
    uploaded_this_week = await db.videos.count_documents({
        "uploaded_at": {"$gte": seven_days_ago}
    })
    
    avg_videos_per_user = total_videos / total_users if total_users > 0 else 0
    
    # STORAGE METRICS
    # Calculate total storage used (estimate based on video count and average size)
    # Assuming average video size is ~50MB
    avg_video_size_mb = 50
    total_storage_gb = (total_videos * avg_video_size_mb) / 1024
    
    # ENGAGEMENT METRICS
    # For now, using placeholder data - in production, you'd track these in a separate analytics collection
    showcase_views = total_users * 15  # Estimate
    video_downloads = total_videos * 3  # Estimate
    social_media_clicks = total_users * 5  # Estimate
    
    showcase_views_growth = 25  # Placeholder percentage
    avg_downloads_per_video = video_downloads / total_videos if total_videos > 0 else 0
    avg_session_minutes = 8.5  # Placeholder
    
    return {
        "platform": {
            "total_users": total_users,
            "total_videos": total_videos,
            "active_users_30d": active_users_30d,
            "generated_at": now.isoformat()
        },
        "users": {
            "by_tier": users_by_tier,
            "growth_rate": round(growth_rate, 1),
            "new_users_30d": users_last_30d
        },
        "videos": {
            "by_source": videos_by_source,
            "blockchain_verified": blockchain_verified,
            "uploaded_today": uploaded_today,
            "uploaded_this_week": uploaded_this_week,
            "average_per_user": round(avg_videos_per_user, 2)
        },
        "storage": {
            "total_gb": round(total_storage_gb, 2),
            "avg_per_video_mb": avg_video_size_mb
        },
        "engagement": {
            "showcase_views": showcase_views,
            "showcase_views_growth": showcase_views_growth,
            "video_downloads": video_downloads,
            "avg_downloads_per_video": round(avg_downloads_per_video, 1),
            "social_media_clicks": social_media_clicks,
            "avg_session_minutes": avg_session_minutes
        }
    }

