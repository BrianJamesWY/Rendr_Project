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
