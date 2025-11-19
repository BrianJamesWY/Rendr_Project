from fastapi import APIRouter, Depends, HTTPException
from typing import List
import uuid
from datetime import datetime

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
        "created_at": datetime.now().isoformat()
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
