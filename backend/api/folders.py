from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
import uuid
from datetime import datetime
import os
import shutil

from models.folder import FolderCreate, FolderUpdate, FolderResponse
from utils.security import get_current_user
from database.mongodb import get_db

router = APIRouter()

@router.post("/", response_model=FolderResponse)
async def create_folder(
    folder_data: FolderCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create a new folder for organizing videos"""
    
    # Check if folder name already exists for this user
    existing = await db.folders.find_one({
        "username": current_user.get("username"),
        "folder_name": folder_data.folder_name
    })
    
    if existing:
        raise HTTPException(400, "Folder with this name already exists")
    
    # Get max order for user's folders
    folders_cursor = db.folders.find({"username": current_user.get("username")})
    folders = await folders_cursor.to_list(length=1000)
    max_order = max([f.get("order", 0) for f in folders]) if folders else 0
    
    folder_id = str(uuid.uuid4())
    folder_doc = {
        "_id": folder_id,
        "folder_name": folder_data.folder_name,
        "description": folder_data.description,
        "username": current_user.get("username"),
        "user_id": current_user["user_id"],
        "order": max_order + 1,
        "created_at": datetime.now().isoformat(),
        "parent_id": getattr(folder_data, 'parent_id', None),
        "thumbnail_url": getattr(folder_data, 'thumbnail_url', None),
        "background": getattr(folder_data, 'background', {})
    }
    
    await db.folders.insert_one(folder_doc)
    
    # Count videos in this folder
    video_count = await db.videos.count_documents({
        "user_id": current_user["user_id"],
        "folder_id": folder_id
    })
    
    return FolderResponse(
        folder_id=folder_id,
        folder_name=folder_data.folder_name,
        username=current_user.get("username"),
        video_count=video_count,
        created_at=folder_doc["created_at"],
        order=folder_doc["order"],
        description=folder_data.description
    )

@router.get("/", response_model=List[FolderResponse])
async def get_folders(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get all folders for current user"""
    cursor = db.folders.find({"username": current_user.get("username")}).sort("order", 1)
    folders = await cursor.to_list(length=1000)
    
    result = []
    for folder in folders:
        # Count videos in folder
        video_count = await db.videos.count_documents({
            "user_id": current_user["user_id"],
            "folder_id": folder["_id"]
        })
        
        result.append(FolderResponse(
            folder_id=folder["_id"],
            folder_name=folder["folder_name"],
            username=folder["username"],
            video_count=video_count,
            created_at=folder["created_at"],
            order=folder.get("order", 0),
            description=folder.get("description")
        ))
    
    return result

@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: str,
    folder_data: FolderUpdate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update folder name"""
    folder = await db.folders.find_one({"_id": folder_id})
    
    if not folder:
        raise HTTPException(404, "Folder not found")
    
    if folder["username"] != current_user.get("username"):
        raise HTTPException(403, "Access denied")
    
    update_fields = {}
    if folder_data.folder_name:
        # Check if new name conflicts
        existing = await db.folders.find_one({
            "username": current_user.get("username"),
            "folder_name": folder_data.folder_name,
            "_id": {"$ne": folder_id}
        })
        
        if existing:
            raise HTTPException(400, "Folder with this name already exists")
        
        update_fields["folder_name"] = folder_data.folder_name
    
    if folder_data.description is not None:
        update_fields["description"] = folder_data.description
    
    if update_fields:
        await db.folders.update_one(
            {"_id": folder_id},
            {"$set": update_fields}
        )
    
    # Fetch updated folder
    folder = await db.folders.find_one({"_id": folder_id})
    
    # Count videos
    video_count = await db.videos.count_documents({
        "user_id": current_user["user_id"],
        "folder_id": folder_id
    })
    
    return FolderResponse(
        folder_id=folder_id,
        folder_name=folder["folder_name"],
        username=current_user.get("username"),
        video_count=video_count,
        created_at=folder["created_at"],
        order=folder.get("order", 0),
        description=folder.get("description")
    )

@router.delete("/{folder_id}")
async def delete_folder(
    folder_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Delete a folder (videos move to Default)"""
    folder = await db.folders.find_one({"_id": folder_id})
    
    if not folder:
        raise HTTPException(404, "Folder not found")
    
    if folder["username"] != current_user.get("username"):
        raise HTTPException(403, "Access denied")
    
    # Don't allow deleting "Default" folder
    if folder["folder_name"].lower() == "default":
        raise HTTPException(400, "Cannot delete Default folder")
    
    # Move all videos from this folder to null (uncategorized)
    await db.videos.update_many(
        {"folder_id": folder_id},
        {"$set": {"folder_id": None}}
    )
    
    # Delete the folder
    await db.folders.delete_one({"_id": folder_id})
    
    return {"message": "Folder deleted successfully"}


@router.post("/{folder_id}/thumbnail")
async def upload_folder_thumbnail(
    folder_id: str,
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Upload thumbnail for folder"""
    folder = await db.folders.find_one({"_id": folder_id})
    
    if not folder:
        raise HTTPException(404, "Folder not found")
    
    if folder["username"] != current_user.get("username"):
        raise HTTPException(403, "Access denied")
    
    # Save thumbnail
    upload_dir = "/app/backend/uploads/thumbnails"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = f"{upload_dir}/folder_{folder_id}.jpg"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    thumbnail_url = f"uploads/thumbnails/folder_{folder_id}.jpg"
    
    # Update folder
    await db.folders.update_one(
        {"_id": folder_id},
        {"$set": {"thumbnail_url": thumbnail_url}}
    )
    
    return {"thumbnail_url": thumbnail_url, "message": "Thumbnail uploaded successfully"}

@router.post("/{folder_id}/background")
async def upload_folder_background(
    folder_id: str,
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Upload background image for folder"""
    folder = await db.folders.find_one({"_id": folder_id})
    
    if not folder:
        raise HTTPException(404, "Folder not found")
    
    if folder["username"] != current_user.get("username"):
        raise HTTPException(403, "Access denied")
    
    # Save background
    upload_dir = "/app/backend/uploads/backgrounds"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = f"{upload_dir}/folder_{folder_id}.jpg"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    background_url = f"uploads/backgrounds/folder_{folder_id}.jpg"
    
    # Update folder background
    await db.folders.update_one(
        {"_id": folder_id},
        {"$set": {"background.imageUrl": background_url}}
    )
    
    return {"background_url": background_url, "message": "Background uploaded successfully"}

