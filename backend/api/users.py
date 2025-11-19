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
        joined_at=user.get("created_at", ""),
        total_videos=total_videos,
        showcase_settings=user.get("showcase_settings"),
        social_media_links=user.get("social_media_links", []),
        collection_label=user.get("collection_label", "Collections")
    )

@router.get("/{username}/videos", response_model=List[VideoInfo])
async def get_creator_videos(
    username: str,
    db = Depends(get_db)
):
    """Get all videos for a creator's showcase"""
    # Remove @ if present
    username = username.lstrip('@')
    user = await db.users.find_one({"username": username})
    
    if not user:
        raise HTTPException(404, f"Creator @{username} not found")
    
    # Get all videos for this creator
    cursor = db.videos.find({"username": username}).sort("captured_at", -1)
    videos = await cursor.to_list(length=1000)
    
    # Get folders for this user
    folders_cursor = db.folders.find({"username": username})
    folders = await folders_cursor.to_list(length=1000)
    folder_map = {f["_id"]: f["folder_name"] for f in folders}
    
    result = []
    for video in videos:
        folder_name = None
        if video.get("folder_id"):
            folder_name = folder_map.get(video["folder_id"], "Unknown")
        
        thumbnail_url = f"/api/thumbnails/{video['_id']}.jpg" if video.get("thumbnail_path") else None
        
        result.append(VideoInfo(
            video_id=video["_id"],
            verification_code=video["verification_code"],
            thumbnail_url=thumbnail_url or "",
            captured_at=video["captured_at"],
            folder_name=folder_name,
            folder_id=video.get("folder_id"),
            description=video.get("description"),
            external_link=video.get("external_link"),
            platform=video.get("platform"),
            tags=video.get("tags", ["Rendr"])
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
    
    if profile_data.showcase_settings is not None:
        update_fields["showcase_settings"] = profile_data.showcase_settings
    
    if profile_data.social_media_links is not None:
        update_fields["social_media_links"] = profile_data.social_media_links
    
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

@router.post("/profile/picture")
async def upload_profile_picture(
    picture: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Upload profile picture"""
    # Create directory
    upload_dir = "uploads/profile_pictures"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file

@router.post("/@/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Upload profile picture"""
    import os
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
    picture_url = f"/api/profile-pictures/{filename}"
    await db.users.update_one(
        {"_id": current_user["user_id"]},
        {"$set": {"profile_picture": picture_url}}
    )
    
    return {"profile_picture": picture_url}

@router.post("/@/upload-banner")
async def upload_banner(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Upload showcase banner image (Pro/Enterprise only)"""
    import os
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
        {"$set": {"banner_image": banner_url}}
    )
    
    return {"banner_image": banner_url}
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(picture.file, buffer)
    
    # Update user record
    picture_url = f"/api/profile_pictures/{filename}"
    await db.users.update_one(
        {"_id": current_user["user_id"]},
        {"$set": {"profile_picture": picture_url}}
    )
    
    return {"profile_picture": picture_url}
