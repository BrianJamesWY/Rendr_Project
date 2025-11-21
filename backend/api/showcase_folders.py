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
    """Get all showcase folders for current user (with nested structure support)"""
    cursor = db.showcase_folders.find({"user_id": current_user["user_id"]})
    folders = await cursor.to_list(length=100)
    
    result = []
    for folder in folders:
        # Count videos in this showcase folder
        video_count = await db.videos.count_documents({
            "user_id": current_user["user_id"],
            "showcase_folder_id": folder["_id"]
        })
        
        # Count subfolders
        subfolder_count = await db.showcase_folders.count_documents({
            "user_id": current_user["user_id"],
            "parent_folder_id": folder["_id"]
        })
        
        result.append({
            "folder_id": folder["_id"],
            "folder_name": folder["folder_name"],
            "description": folder.get("description"),
            "parent_folder_id": folder.get("parent_folder_id"),
            "video_count": video_count,
            "subfolder_count": subfolder_count,
            "created_at": folder["created_at"],
            "order": folder.get("order", 0)
        })
    
    # Sort by order
    result.sort(key=lambda x: x["order"])
    
    return result

@router.post("")
async def create_showcase_folder(
    folder_data: dict,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create a new showcase folder"""
    folder_name = folder_data.get("folder_name")
    description = folder_data.get("description")
    
    if not folder_name:
        raise HTTPException(400, "folder_name is required")
    
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
    
    # Get parent folder ID if provided
    parent_folder_id = folder_data.get("parent_folder_id")
    
    # If parent folder is specified, verify it exists and belongs to user
    if parent_folder_id:
        parent_folder = await db.showcase_folders.find_one({"_id": parent_folder_id})
        if not parent_folder or parent_folder["user_id"] != current_user["user_id"]:
            raise HTTPException(400, "Invalid parent folder")
    
    # Create folder
    folder_id = str(uuid4())
    folder_doc = {
        "_id": folder_id,
        "folder_name": folder_name,
        "description": description,
        "user_id": current_user["user_id"],
        "username": current_user.get("username"),
        "parent_folder_id": parent_folder_id,
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


@router.put("/{folder_id}")
async def update_showcase_folder(
    folder_id: str,
    folder_data: dict,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update a showcase folder"""
    folder = await db.showcase_folders.find_one({"_id": folder_id})
    
    if not folder:
        raise HTTPException(404, "Folder not found")
    
    if folder["user_id"] != current_user["user_id"]:
        raise HTTPException(403, "Access denied")
    
    folder_name = folder_data.get("folder_name")
    description = folder_data.get("description")
    
    update_fields = {}
    if folder_name:
        # Check for name conflicts
        existing = await db.showcase_folders.find_one({
            "user_id": current_user["user_id"],
            "folder_name": folder_name,
            "_id": {"$ne": folder_id}
        })
        if existing:
            raise HTTPException(400, "Folder with this name already exists")
        update_fields["folder_name"] = folder_name
    
    if description is not None:
        update_fields["description"] = description
    
    if update_fields:
        await db.showcase_folders.update_one(
            {"_id": folder_id},
            {"$set": update_fields}
        )
    
    return {"message": "Folder updated successfully"}

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

@router.put("/reorder")
async def reorder_folders(
    reorder_data: dict,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Reorder folders - expects {folder_orders: [{folder_id, order}, ...]}"""
    folder_orders = reorder_data.get("folder_orders", [])
    
    if not folder_orders:
        raise HTTPException(400, "folder_orders is required")
    
    # Update each folder's order
    for item in folder_orders:
        folder_id = item.get("folder_id")
        order = item.get("order")
        
        if folder_id is None or order is None:
            continue
        
        # Verify ownership
        folder = await db.showcase_folders.find_one({"_id": folder_id})
        if folder and folder["user_id"] == current_user["user_id"]:
            await db.showcase_folders.update_one(
                {"_id": folder_id},
                {"$set": {"order": order}}
            )
    
    return {"message": "Folders reordered successfully"}

@router.put("/{folder_id}/reorder-videos")
async def reorder_videos_in_folder(
    folder_id: str,
    reorder_data: dict,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Reorder videos within a folder - expects {video_orders: [{video_id, order}, ...]}"""
    # Verify folder ownership
    folder = await db.showcase_folders.find_one({"_id": folder_id})
    if not folder:
        raise HTTPException(404, "Folder not found")
    
    if folder["user_id"] != current_user["user_id"]:
        raise HTTPException(403, "Access denied")
    
    video_orders = reorder_data.get("video_orders", [])
    
    if not video_orders:
        raise HTTPException(400, "video_orders is required")
    
    # Update each video's order
    for item in video_orders:
        video_id = item.get("video_id")
        order = item.get("order")
        
        if video_id is None or order is None:
            continue
        
        # Verify video belongs to user and is in this folder
        video = await db.videos.find_one({"video_id": video_id})
        if video and video["user_id"] == current_user["user_id"] and video.get("showcase_folder_id") == folder_id:
            await db.videos.update_one(
                {"video_id": video_id},
                {"$set": {"folder_video_order": order}}
            )
    
    return {"message": "Videos reordered successfully"}
