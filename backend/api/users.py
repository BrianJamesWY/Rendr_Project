from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
import os
import shutil
import uuid

from models.user import CreatorProfile, UpdateProfile
from models.video import VideoInfo
from utils.security import get_current_user
from database.mongodb import get_db

router = APIRouter()

@router.get("/{username}", response_model=CreatorProfile)
async def get_creator_profile(
    username: str,
    db = Depends(get_db)
):
    """Get public creator profile by username"""
    # Remove @ if present
    username = username.lstrip('@')
    user = await db.users.find_one({"username": username})
    
    if not user:
        raise HTTPException(404, f"Creator @{username} not found")
    
    # Count total videos for this creator
    total_videos = await db.videos.count_documents({"username": username})
    
    return CreatorProfile(
        username=user["username"],
        display_name=user.get("display_name", username),
        bio=user.get("bio"),
        profile_picture=user.get("profile_picture"),
        banner_image=user.get("banner_image"),
        profile_shape=user.get("profile_shape", "circle"),
        profile_effect=user.get("profile_effect", "none"),
        profile_border=user.get("profile_border", "0"),
        border_color=user.get("border_color", "#667eea"),
        page_design=user.get("page_design"),
        joined_at=user.get("created_at", ""),
        total_videos=total_videos,
        showcase_settings=user.get("showcase_settings"),
        social_media_links=user.get("social_media_links", []),
        collection_label=user.get("collection_label", "Collections")
    )

@router.get("/{username}/videos", response_model=List[VideoInfo])
async def get_creator_videos(
    username: str,
    platform: str = None,
    db = Depends(get_db)
):
    """Get all videos for a creator's showcase, optionally filtered by social media platform"""
    # Remove @ if present
    username = username.lstrip('@')
    user = await db.users.find_one({"username": username})
    
    if not user:
        raise HTTPException(404, f"Creator @{username} not found")
    
    # Get the correct user_id - could be stored as user_id field or _id
    user_id = user.get("user_id") or str(user.get("_id"))
    
    # Build query filter - use user_id field from videos
    # Only show videos that are: on_showcase=True AND verified AND access_level is 'public' or not set
    query = {
        "user_id": user_id,
        "on_showcase": True,
        "verification_status": {"$in": ["verified", "fully_verified"]},
        # Only show public access level videos on the free Videos tab
        "$or": [
            {"access_level": {"$exists": False}},  # Legacy videos without access_level
            {"access_level": "public"},             # Public access level
            {"access_level": ""}                    # Empty access level
        ]
    }
    
    # If platform filter is specified, only show videos in that social folder
    if platform and platform != 'all':
        query["social_folders"] = platform
    
    # Get all videos for this creator that match the filters
    print(f"DEBUG: Showcase query for {username}: {query}")
    cursor = db.videos.find(query).sort("captured_at", -1)
    videos = await cursor.to_list(length=1000)
    print(f"DEBUG: Found {len(videos)} videos for showcase")
    
    # Get folders for this user
    folders_cursor = db.folders.find({"username": username})
    folders = await folders_cursor.to_list(length=1000)
    folder_map = {f["_id"]: f["folder_name"] for f in folders}
    
    result = []
    for video in videos:
        folder_name = None
        if video.get("folder_id"):
            folder_name = folder_map.get(video["folder_id"], "Unknown")
        
        # Use the stored thumbnail_url if available, otherwise generate from path
        thumbnail_url = video.get("thumbnail_url") or (f"/api/thumbnails/{video['_id']}.jpg" if video.get("thumbnail_path") else None)
        
        result.append(VideoInfo(
            video_id=video.get("_id") or video.get("id"),
            verification_code=video.get("verification_code", ""),
            thumbnail_url=thumbnail_url or "",
            captured_at=video.get("captured_at", ""),
            folder_name=folder_name,
            folder_id=video.get("folder_id"),
            showcase_folder_id=video.get("showcase_folder_id"),
            description=video.get("description"),
            external_link=video.get("external_link"),
            platform=video.get("platform"),
            tags=video.get("tags", ["Rendr"]),
            social_folders=video.get("social_folders", []),
            social_links=video.get("social_links", []),
            on_showcase=video.get("on_showcase", False),
            title=video.get("title"),
            access_level=video.get("access_level", "public")
        ))
    
    return result

@router.get("/{username}/premium-videos", response_model=List[VideoInfo])
async def get_creator_premium_videos(
    username: str,
    db = Depends(get_db)
):
    """Get premium videos for a creator - videos with non-public access_level that are on_showcase"""
    # Remove @ if present
    username = username.lstrip('@')
    user = await db.users.find_one({"username": username})
    
    if not user:
        raise HTTPException(404, f"Creator @{username} not found")
    
    # Get user_id - could be stored as user_id field or _id
    user_id = user.get("user_id") or str(user.get("_id"))
    
    # Query for videos that are:
    # 1. Owned by this user
    # 2. Marked as on_showcase=True
    # 3. Have access_level that is NOT 'public' or empty (meaning it's a premium tier)
    query = {
        "user_id": user_id,
        "on_showcase": True,
        "access_level": {"$exists": True, "$nin": ["public", "", None]}
    }
    
    print(f"DEBUG: Premium videos query for {username}: {query}")
    cursor = db.videos.find(query, {"_id": 0}).sort("uploaded_at", -1)
    videos = await cursor.to_list(length=1000)
    print(f"DEBUG: Found {len(videos)} premium videos")
    
    result = []
    for video in videos:
        thumbnail_url = video.get("thumbnail_url") or (f"/api/thumbnails/{video.get('id', video.get('_id'))}.jpg" if video.get("thumbnail_path") else None)
        
        # Convert datetime to string
        captured_at = video.get("captured_at") or video.get("uploaded_at", "")
        if hasattr(captured_at, 'isoformat'):
            captured_at = captured_at.isoformat()
        
        uploaded_at = video.get("uploaded_at", "")
        if hasattr(uploaded_at, 'isoformat'):
            uploaded_at = uploaded_at.isoformat()
        
        result.append(VideoInfo(
            video_id=video.get("id") or video.get("_id"),
            verification_code=video.get("verification_code", ""),
            thumbnail_url=thumbnail_url or "",
            captured_at=str(captured_at),
            folder_name=None,
            folder_id=video.get("folder_id"),
            showcase_folder_id=video.get("showcase_folder_id"),
            description=video.get("description"),
            external_link=video.get("external_link"),
            platform=video.get("platform"),
            tags=video.get("tags", ["Rendr"]),
            social_folders=video.get("social_folders", []),
            social_links=video.get("social_links", []),
            on_showcase=video.get("on_showcase", False),
            title=video.get("title"),
            storage=video.get("storage"),
            uploaded_at=str(uploaded_at),
            access_level=video.get("access_level", "public")
        ))
    
    return result

@router.put("/profile")
async def update_creator_profile(
    profile_data: UpdateProfile,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update current user's profile"""
    update_fields = {}
    
    if profile_data.display_name:
        update_fields["display_name"] = profile_data.display_name
    
    if profile_data.bio is not None:
        update_fields["bio"] = profile_data.bio
    
    if profile_data.profile_picture is not None:
        update_fields["profile_picture"] = profile_data.profile_picture
    
    if profile_data.banner_image is not None:
        update_fields["banner_image"] = profile_data.banner_image
    
    if profile_data.profile_shape is not None:
        update_fields["profile_shape"] = profile_data.profile_shape
    
    if profile_data.profile_effect is not None:
        update_fields["profile_effect"] = profile_data.profile_effect
    
    if profile_data.profile_border is not None:
        update_fields["profile_border"] = profile_data.profile_border
    
    if profile_data.border_color is not None:
        update_fields["border_color"] = profile_data.border_color
    
    if profile_data.page_design is not None:
        update_fields["page_design"] = profile_data.page_design
    
    if profile_data.showcase_settings is not None:
        update_fields["showcase_settings"] = profile_data.showcase_settings
    
    if profile_data.social_media_links is not None:
        update_fields["social_media_links"] = profile_data.social_media_links
    
    if hasattr(profile_data, 'dashboard_social_links') and profile_data.dashboard_social_links is not None:
        update_fields["dashboard_social_links"] = profile_data.dashboard_social_links
    
    if profile_data.collection_label is not None:
        # Only allow Pro/Enterprise to change collection label
        user = await db.users.find_one({"_id": current_user["user_id"]})
        if user.get("premium_tier") in ["pro", "enterprise"]:
            update_fields["collection_label"] = profile_data.collection_label
    
    if update_fields:
        await db.users.update_one(
            {"_id": current_user["user_id"]},
            {"$set": update_fields}
        )
    
    return {"message": "Profile updated successfully"}

@router.post("/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Upload profile picture"""
    from pathlib import Path
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Invalid file type. Use JPG, PNG, or WebP")
    
    # Create profile pictures directory
    profile_pics_dir = Path("uploads/profile_pictures")
    profile_pics_dir.mkdir(exist_ok=True, parents=True)
    
    # Save file
    file_extension = file.filename.split('.')[-1]
    filename = f"{current_user['user_id']}.{file_extension}"
    file_path = profile_pics_dir / filename
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Update user profile
    picture_url = f"/api/profile_pictures/{filename}"
    await db.users.update_one(
        {"_id": current_user["user_id"]},
        {"$set": {
            "profile_picture_url": picture_url,
            "profile_picture": picture_url  # Also update old field for compatibility
        }}
    )
    
    return {"profile_picture": picture_url}

@router.post("/upload-banner")
async def upload_banner(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Upload showcase banner image (Pro/Enterprise only)"""
    from pathlib import Path
    
    # Check tier
    user = await db.users.find_one({"_id": current_user["user_id"]})
    if user.get("premium_tier") not in ["pro", "enterprise"]:
        raise HTTPException(403, "Banner upload is a Pro/Enterprise feature")
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Invalid file type. Use JPG, PNG, or WebP")
    
    # Create banners directory
    banners_dir = Path("uploads/banners")
    banners_dir.mkdir(exist_ok=True, parents=True)
    
    # Save file
    file_extension = file.filename.split('.')[-1]
    filename = f"{current_user['user_id']}_banner.{file_extension}"
    file_path = banners_dir / filename
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Update user profile
    banner_url = f"/api/banners/{filename}"
    await db.users.update_one(
        {"_id": current_user["user_id"]},
        {"$set": {
            "banner_image_url": banner_url,
            "banner_image": banner_url  # Also update old field for compatibility
        }}
    )
    
    return {"banner_image": banner_url}


@router.get("/{username}/showcase-folders")
async def get_creator_showcase_folders(
    username: str,
    db = Depends(get_db)
):
    """Get showcase folders for a creator's public page"""
    # Remove @ if present
    username = username.lstrip('@')
    user = await db.users.find_one({"username": username})
    
    if not user:
        raise HTTPException(404, f"Creator @{username} not found")
    
    # Get showcase folders for this user - ONLY PUBLIC ones for showcase display
    cursor = db.showcase_folders.find({
        "username": username,
        "$or": [
            {"is_public": True},
            {"is_public": {"$exists": False}}  # Default to public if field doesn't exist
        ]
    }).sort("order", 1)
    folders = await cursor.to_list(length=100)
    
    result = []
    for folder in folders:
        # Count videos in this folder
        video_count = await db.videos.count_documents({
            "user_id": user["_id"],
            "showcase_folder_id": folder["_id"]
        })
        
        result.append({
            "folder_id": folder["_id"],
            "folder_name": folder["folder_name"],
            "description": folder.get("description"),
            "video_count": video_count,
            "order": folder.get("order", 0),
            "is_public": folder.get("is_public", True)
        })
    
    return result


@router.put("/watermark-settings")
async def update_watermark_settings(
    position: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update watermark position (Pro/Enterprise only for non-left positions)"""
    from utils.watermark import WatermarkProcessor
    
    # Get user tier
    user = await db.users.find_one({"_id": current_user["user_id"]})
    tier = user.get("premium_tier", "free")
    
    watermark_processor = WatermarkProcessor()
    allowed_positions = watermark_processor.get_allowed_positions(tier)
    
    if position not in allowed_positions:
        raise HTTPException(
            403,
            f"Position '{position}' not available for {tier} tier. Allowed: {', '.join(allowed_positions)}"
        )
    
    # Update watermark position
    await db.users.update_one(
        {"_id": current_user["user_id"]},
        {"$set": {"watermark_position": position}}
    )
    
    return {
        "message": "Watermark settings updated",
        "position": position,
        "tier": tier,
        "allowed_positions": allowed_positions
    }



@router.put("/notification-settings")
async def update_notification_settings(
    settings: dict,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update user notification preferences"""
    user_id = current_user["user_id"]
    
    # Validate settings
    valid_preferences = ["email", "sms", "both", "none"]
    if settings.get("notification_preference") and settings["notification_preference"] not in valid_preferences:
        raise HTTPException(400, "Invalid notification preference")
    
    # Build update document
    update_doc = {}
    
    if "phone" in settings:
        update_doc["phone"] = settings["phone"]
    
    if "notification_preference" in settings:
        update_doc["notification_preference"] = settings["notification_preference"]
    
    if "notify_video_length_threshold" in settings:
        threshold = int(settings["notify_video_length_threshold"])
        if threshold < 0 or threshold > 600:
            raise HTTPException(400, "Threshold must be between 0 and 600 seconds")
        update_doc["notify_video_length_threshold"] = threshold
    
    if "sms_opted_in" in settings:
        update_doc["sms_opted_in"] = bool(settings["sms_opted_in"])
    
    if not update_doc:
        raise HTTPException(400, "No valid settings provided")
    
    # Update user
    result = await db.users.update_one(
        {"_id": user_id},
        {"$set": update_doc}
    )
    
    if result.modified_count == 0:
        raise HTTPException(404, "User not found or no changes made")
    
    return {"message": "Notification settings updated", "updated": update_doc}

@router.get("/quota")
async def get_user_quota(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get user's video quota and usage"""
    user_id = current_user["user_id"]
    
    # Get user from database to get current tier
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(404, "User not found")
    
    tier = user.get("premium_tier", "free")
    
    # Count active videos (including legacy videos without storage field)
    from datetime import datetime
    now = datetime.utcnow()
    
    active_videos = await db.videos.count_documents({
        "user_id": user_id,
        "$or": [
            {"storage.expires_at": {"$gt": now}},  # New videos not expired
            {"storage.expires_at": None},  # New videos with unlimited storage
            {"storage": {"$exists": False}}  # Legacy videos without storage field
        ]
    })
    
    # Define quota limits
    quota_limits = {
        "free": 5,
        "pro": 100,
        "enterprise": -1  # Unlimited
    }
    
    limit = quota_limits.get(tier, 5)
    
    return {
        "tier": tier,
        "used": active_videos,
        "limit": limit,
        "unlimited": limit == -1,
        "percentage": (active_videos / limit * 100) if limit > 0 else 0,
        "can_upload": limit == -1 or active_videos < limit
    }

