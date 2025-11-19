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
    "85da75de-0905-4ab6-b3c2-fd37e593b51e"  # BrianJames
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
    
    # Get video counts for each user
    result = []
    for user in users:
        video_count = await db.videos.count_documents({'user_id': user['_id']})
        result.append({
            'user_id': user['_id'],
            'username': user.get('username', ''),
            'email': user['email'],
            'display_name': user.get('display_name', ''),
            'premium_tier': user.get('premium_tier', 'free'),
            'created_at': user['created_at'],
            'video_count': video_count
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
