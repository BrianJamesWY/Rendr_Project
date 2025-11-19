from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timezone
from uuid import uuid4
from database.mongodb import get_db
from api.auth import get_current_user

router = APIRouter(prefix="/api/showcase-folders", tags=["Showcase Folders"])

@router.get("")
async def get_showcase_folders(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get all showcase folders for current user"""
    cursor = db.showcase_folders.find({"user_id": current_user["user_id"]})
    folders = await cursor.to_list(length=100)
    
    result = []
    for folder in folders:
        # Count videos in this showcase folder
        video_count = await db.videos.count_documents({
            "user_id": current_user["user_id"],
            "showcase_folder_id": folder["_id"]
        })
        
        result.append({
            "folder_id": folder["_id"],
            "folder_name": folder["folder_name"],
            "description": folder.get("description"),
            "video_count": video_count,
            "created_at": folder["created_at"],
            "order": folder.get("order", 0)
        })
    
    # Sort by order
    result.sort(key=lambda x: x["order"])
    
    return result

@router.post("")
async def create_showcase_folder(
    folder_name: str,
    description: str = None,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create a new showcase folder"""
    from pydantic import BaseModel
    
    class FolderCreate(BaseModel):
        folder_name: str
        description: str = None
    
    # Check if folder with same name exists
    existing = await db.showcase_folders.find_one({
        "user_id": current_user["user_id"],
        "folder_name": folder_name
    })
    
    if existing:
        raise HTTPException(400, "Showcase folder with this name already exists")
    
    # Get max order
    max_folder = await db.showcase_folders.find_one(
        {"user_id": current_user["user_id"]},
        sort=[("order", -1)]
    )
    max_order = max_folder["order"] if max_folder and "order" in max_folder else -1
    
    # Create folder
    folder_id = str(uuid4())
    folder_doc = {
        "_id": folder_id,
        "folder_name": folder_name,
        "description": description,
        "user_id": current_user["user_id"],
        "username": current_user.get("username"),
        "order": max_order + 1,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.showcase_folders.insert_one(folder_doc)
    
    video_count = 0
    
    return {
        "folder_id": folder_id,
        "folder_name": folder_name,
        "description": description,
        "video_count": video_count,
        "created_at": folder_doc["created_at"],
        "order": folder_doc["order"]
    }

@router.delete("/{folder_id}")
async def delete_showcase_folder(
    folder_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Delete a showcase folder"""
    folder = await db.showcase_folders.find_one({"_id": folder_id})
    
    if not folder:
        raise HTTPException(404, "Folder not found")
    
    if folder["user_id"] != current_user["user_id"]:
        raise HTTPException(403, "Access denied")
    
    # Remove folder assignment from videos
    await db.videos.update_many(
        {"showcase_folder_id": folder_id},
        {"$unset": {"showcase_folder_id": ""}}
    )
    
    # Delete folder
    await db.showcase_folders.delete_one({"_id": folder_id})
    
    return {"message": "Showcase folder deleted successfully"}
